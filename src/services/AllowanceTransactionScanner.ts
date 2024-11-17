import { BrowserProvider, ethers } from "ethers";
import {
  AllowanceInfo,
  EtherscanTx,
  ScanOptions,
  TokenApproval,
  TokenApprovalInfo,
} from "../types/web3";
import { EXPLORE_URLS } from "./rpc";
import { config } from "../config";
import { shortenNumber } from "../components/utils/utils";
import { getCurrentAllowance, getTokenInfo } from "./utils";

export class AllowanceTransactionScanner {
  private walletProvider: BrowserProvider;
  private apiKey: string;

  constructor(walletProvider: BrowserProvider) {
    this.walletProvider = walletProvider;
    this.apiKey = config.apiKey;
  }

  private isApprovalTx(tx: EtherscanTx): boolean {
    return tx.functionName.startsWith("approve(");
  }

  private async getTxs(
    walletAddress: string,
    startBlock: number,
    endBlock: number
  ): Promise<EtherscanTx[]> {
    if (!this.apiKey) throw new Error("API key not found");
    const txs: EtherscanTx[] = [];
    let page = 1;
    const MAX_RETRIES = 2;

    while (true) {
      console.info(`Fetching transactions for page ${page}`);

      let retryCount = 0;
      let success = false;

      while (retryCount < MAX_RETRIES && !success) {
        try {
          const result = await this.fetchTransactiosn(
            startBlock,
            endBlock,
            walletAddress,
            page
          );

          if (!result || result.length === 0) {
            return txs;
          }

          txs.push(...result);

          if (result.length < 2000) {
            return txs;
          }
          success = true;
        } catch (error: any) {
          if (error.message.includes("rate limit")) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount)
            );
            continue;
          }
          if (
            error.message.includes("window is too large") ||
            retryCount === MAX_RETRIES
          ) {
            console.error("Error fetching transactions:", error);
            return txs;
          }
        }
      }
      page++;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  private async fetchTransactiosn(
    startBlock: number,
    endBlock: number,
    walletAddress: string,
    page: number
  ): Promise<EtherscanTx[]> {
    try {
      const network = await this.walletProvider.getNetwork();
      const baseUrl = `https://api.etherscan.io/v2/api?chainid=${network.chainId}&module=account&action=txlist&address=${walletAddress}&startblock=${startBlock}&endblock=${endBlock}&page=${page}&offset=2000&sort=desc&apikey=${this.apiKey}`;

      const response = await fetch(baseUrl);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      if (data.status === "0") {
        if (data.message === "No transactions found") {
          return [];
        }
        throw new Error(data.message || "Unknown error occurred");
      }
      return data.result;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
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
        const tokenInfo = await getTokenInfo(tokenAddress, this.walletProvider);

        for (const spenderInfo of spenders) {
          try {
            const allowance = await getCurrentAllowance(
              tokenAddress,
              walletAddress,
              spenderInfo.spender,
              this.walletProvider
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
                formattedAllowance: shortenNumber(formatted),
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
