import { BrowserProvider, ethers } from "ethers";
import { config } from "../config";
import {
  AllowanceInfo,
  ApprovalLog,
  ScanOptions,
  TokenApproval,
  TokenApprovalInfo,
} from "../types/web3";
import { EXPLORE_URLS } from "./rpc";
import {
  APPROVAL_TOPIC,
  getContractSourceCode,
  getCurrentAllowance,
  getTokenInfo,
  shortenNumber,
} from "./utils";

export class AllowanceLogScanner {
  private walletProvider: BrowserProvider;
  private chainID: number;
  private apiKey: string;

  constructor(walletProvider: BrowserProvider, chainID: number) {
    this.walletProvider = walletProvider;
    this.chainID = chainID;
    this.apiKey = config.apiKey;
  }

  private async getLogs(
    walletAddress: string,
    startBlock: number,
    endBlock: number
  ): Promise<ApprovalLog[]> {
    if (!this.apiKey) throw new Error("API key not found");
    const approvalLogs: ApprovalLog[] = [];
    let page = 1;
    const MAX_RETRIES = 2;
    console.log("Fetching from block", startBlock, "to block", endBlock);

    while (true) {
      console.info(`Fetching transactions for page ${page}`);

      let retryCount = 0;
      let success = false;

      while (retryCount < MAX_RETRIES && !success) {
        try {
          const result = await this.fetchApprovalLogs(
            startBlock,
            endBlock,
            walletAddress,
            page
          );

          console.log(`Page ${page} fetched ${result.length} logs`);

          if (!result || result.length === 0) {
            console.log("No more logs found");
            return approvalLogs;
          }

          approvalLogs.push(...result);
          console.log("Total logs fetched:", approvalLogs.length);

          if (result.length < 1000) {
            console.log("Less than 1000 logs fetched, stopping");
            return approvalLogs;
          }
          success = true;
        } catch (error: any) {
          console.log("Error fetching logs:", error.message);

          if (error.message == "No records found") {
            return approvalLogs;
          }

          if (error.message.includes("rate limit")) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount)
            );
            continue;
          }
          retryCount++;
        }
      }
      page++;
    }
  }

  private async fetchApprovalLogs(
    startBlock: number,
    endBlock: number,
    walletAddress: string,
    page: number
  ): Promise<ApprovalLog[]> {
    const paddedAddress =
      "0x" + walletAddress.toLowerCase().replace("0x", "").padStart(64, "0");
    const url = new URL(
      `https://api.etherscan.io/v2/api?chainid=${this.chainID}`
    );
    url.searchParams.append("module", "logs");
    url.searchParams.append("action", "getLogs");
    url.searchParams.append("fromBlock", startBlock.toString());
    url.searchParams.append("toBlock", endBlock.toString());
    url.searchParams.append("topic0", APPROVAL_TOPIC);
    url.searchParams.append("topic1", paddedAddress);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("offset", "1000");
    url.searchParams.append("apikey", this.apiKey);

    const response = await fetch(url.toString());
    const json = await response.json();

    if (json.status === "0") {
      throw new Error(json.message);
    }

    return json.result.map((log: any) => ({
      blockNumber: parseInt(log.blockNumber),
      txHash: log.transactionHash,
      token: log.address,
      spender: log.topics[2],
      amount: log.data,
    }));
  }

  public async scanWalletAllowances(
    walletAddress: string,
    options: ScanOptions = {}
  ): Promise<AllowanceInfo[]> {
    try {
      const currentBlock = await this.walletProvider.getBlockNumber();
      const startBlock = options.fromBlock ? Number(options.fromBlock) : 0;
      const endBlock = options.toBlock ? Number(options.toBlock) : currentBlock;

      // Get all approvals
      const approvalLogs = await this.getLogs(
        walletAddress,
        startBlock,
        endBlock
      );

      // Build token approvals map
      const tokenApprovals: TokenApproval = {};
      approvalLogs.forEach((log) => {
        const tokenAddress = log.token.toLowerCase();

        if (!tokenApprovals[tokenAddress]) {
          tokenApprovals[tokenAddress] = new Set<TokenApprovalInfo>();
        }

        tokenApprovals[tokenAddress].add({
          spender: log.spender,
          txHash: log.txHash,
        });
      });

      // Get allowance info for each token-spender pair
      const allowanceInfos: AllowanceInfo[] = [];
      for (const [tokenAddress, spenders] of Object.entries(tokenApprovals)) {
        const tokenInfo = await getTokenInfo(tokenAddress, this.walletProvider);

        for (const spenderInfo of spenders) {
          // remove padding
          spenderInfo.spender = this.trimAddress(spenderInfo.spender);

          try {
            const allowance = await getCurrentAllowance(
              tokenAddress,
              walletAddress,
              spenderInfo.spender,
              this.walletProvider
            );

            if (allowance > 0n) {
              const contractSourceCode = await getContractSourceCode(
                spenderInfo.spender,
                Number(this.chainID)
              );
              const spenderName = contractSourceCode?.ContractName;
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
                spenderName: spenderName,
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
      return allowanceInfos.sort((a, b) =>
        a.token.symbol.localeCompare(b.token.symbol)
      );
    } catch (error) {
      console.error("Error scanning allowances:", error);
      throw error;
    }
  }
  private trimAddress(paddedAddress: string): string {
    return "0x" + paddedAddress.replace("0x", "").slice(-40).toLowerCase();
  }
}
