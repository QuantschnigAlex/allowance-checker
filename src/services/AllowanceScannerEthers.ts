import { Contract, BrowserProvider, ethers } from "ethers";
import {
  AllowanceInfo,
  ERC20_ABI,
  ScanOptions,
  TokenApproval,
  TokenApprovalInfo,
  TokenInfo,
} from "../types/web3";
import { EXPLORE_URLS } from "./rpc";
import { config } from "../config";

interface EtherscanTx {
  hash: string;
  input: string;
  to: string;
  timeStamp: string;
  from: string;
  blockNumber: string;
  functionName: string;
}

export class AllowanceScannerEthers {
  private walletProvider: BrowserProvider;
  private apiKey: string;

  constructor(walletProvider: BrowserProvider) {
    this.walletProvider = walletProvider;
    this.apiKey = config.apiKey;
  }

  shortenNumber = (value: string) => {
    const num = parseFloat(value);
    if (num > 1000000) {
      return num.toExponential(2);
    }
    return num.toFixed(2);
  };

  private isApprovalTx(tx: EtherscanTx): boolean {
    return tx.functionName.startsWith("approve(");
  }

  private async getTxs(
    walletAddress: string,
    startBlock: number,
    endBlock: number
  ): Promise<EtherscanTx[]> {
    if (!this.apiKey) throw new Error("API key not found");

    try {
      const network = await this.walletProvider.getNetwork();
      const baseUrl = `https://api.etherscan.io/v2/api?chainid=${network.chainId}&module=account&action=txlist&address=${walletAddress}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=10000&sort=desc&apikey=${this.apiKey}`;

      const response = await fetch(baseUrl);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      if (data.status !== "1") throw new Error(data.message);

      return data.result;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  private async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.walletProvider);
    try {
      const [symbol, decimals] = await Promise.all([
        contract.symbol().catch(() => "UNKNOWN"),
        contract.decimals().catch(() => 18),
      ]);

      return {
        address: tokenAddress,
        symbol,
        decimals,
      };
    } catch (error) {
      console.error(`Error getting token info for ${tokenAddress}:`, error);
      return {
        address: tokenAddress,
        symbol: "UNKNOWN",
        decimals: 18,
      };
    }
  }

  private async getCurrentAllowance(
    tokenAddress: string,
    walletAddress: string,
    spender: string
  ): Promise<bigint> {
    const contract = new Contract(tokenAddress, ERC20_ABI, this.walletProvider);
    return await contract.allowance(walletAddress, spender);
  }

  public async scanWalletAllowances(
    walletAddress: string,
    options: ScanOptions = {}
  ): Promise<AllowanceInfo[]> {
    try {
      const currentBlock = await this.walletProvider.getBlockNumber();
      const startBlock = options.fromBlock ? Number(options.fromBlock) : 0;
      const endBlock = options.toBlock ? Number(options.toBlock) : currentBlock;

      // Get all transactions
      const txs = await this.getTxs(walletAddress, startBlock, endBlock);

      // Build token approvals map
      const tokenApprovals: TokenApproval = {};
      txs
        .filter((tx) => this.isApprovalTx(tx))
        .forEach((tx) => {
          const spender = "0x" + tx.input.slice(34, 74);
          if (!tokenApprovals[tx.to]) {
            tokenApprovals[tx.to] = new Set<TokenApprovalInfo>();
          }
          tokenApprovals[tx.to].add({
            spender,
            txHash: tx.hash,
          });
        });

      // Get allowance info for each token-spender pair
      const allowanceInfos: AllowanceInfo[] = [];
      for (const [tokenAddress, spenders] of Object.entries(tokenApprovals)) {
        const tokenInfo = await this.getTokenInfo(tokenAddress);

        for (const spenderInfo of spenders) {
          try {
            const allowance = await this.getCurrentAllowance(
              tokenAddress,
              walletAddress,
              spenderInfo.spender
            );

            if (allowance > 0n) {
              const formatted = ethers.formatUnits(
                allowance,
                tokenInfo.decimals
              );
              const network = await this.walletProvider.getNetwork();
              const explorerLink = EXPLORE_URLS[Number(network.chainId)];

              allowanceInfos.push({
                token: tokenInfo,
                spender: spenderInfo.spender,
                txHash: spenderInfo.txHash,
                explorerLink,
                allowance: allowance.toString(),
                formattedAllowance: this.shortenNumber(formatted),
              });
            }
          } catch (error) {
            console.warn(
              `Error checking allowance for ${spenderInfo.spender}:`,
              error
            );
          }
        }
      }

      return allowanceInfos;
    } catch (error) {
      console.error("Error scanning allowances:", error);
      throw error;
    }
  }
}
