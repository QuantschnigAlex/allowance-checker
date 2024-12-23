import { Contract, ethers, Interface, Log, Provider } from "ethers";
import { JsonRpcProvider, BrowserProvider } from "ethers";
import {
  AllowanceInfo,
  ERC20_ABI,
  ScanOptions,
  TokenApproval,
  TokenApprovalInfo,
  TokenInfo,
} from "../types/web3";
import { CHAIN_RPC_PROVIDERS, EXPLORE_URLS } from "./rpc";

export class AllowanceScanner {
  private walletProvider: BrowserProvider;
  private queryProviders: JsonRpcProvider[];
  private currentProviderIndex: number;
  private erc20Interface: Interface;

  shortenNumber = (value: string) => {
    const num = parseFloat(value);
    if (num > 1000000) {
      return num.toExponential(2);
    }
    return num.toFixed(2);
  };

  constructor(walletProvider: BrowserProvider) {
    this.walletProvider = walletProvider;
    this.queryProviders = [];
    this.currentProviderIndex = 0;
    this.erc20Interface = new Interface(ERC20_ABI);
  }

  private async setupProviderForChain(): Promise<void> {
    try {
      const network = await this.walletProvider.getNetwork();
      const chainId = Number(network.chainId);
      console.log("Connected to chian:", chainId);

      this.queryProviders = [];

      const rpcUrls = CHAIN_RPC_PROVIDERS[chainId];

      if (!rpcUrls.length) {
        throw new Error(`No RPC providers configured for chainID ${chainId}`);
      }

      this.queryProviders = rpcUrls.map((url) => new JsonRpcProvider(url));

      console.log(
        `Set up ${this.queryProviders.length} for chainID ${chainId}`
      );
    } catch (error) {
      console.log("Error setting up providers", error);
      throw error;
    }
  }

  private getNextProvider() {
    this.currentProviderIndex =
      (this.currentProviderIndex + 1) % this.queryProviders.length;
  }

  private async queryWithRetry<T>(
    queryFn: (provider: Provider) => Promise<T>
  ): Promise<T> {
    let lastError: Error | undefined;
    let attempts = 0;
    const maxAttempts = this.queryProviders.length;

    while (attempts < maxAttempts) {
      try {
        const provider = this.queryProviders[this.currentProviderIndex];
        return await queryFn(provider);
      } catch (error) {
        console.warn(
          `Provider error (attempt ${attempts}/${maxAttempts}):`,
          error instanceof Error ? error.message : "Unknown error",
          `\nSwitching to next provider...`
        );
        try {
          return await queryFn(this.queryProviders[this.currentProviderIndex]);
        } catch (error) {
          attempts++;
          lastError = error as Error;
          console.warn(
            "Failed again with same provider:",
            error instanceof Error ? error.message : "Unknown error",
            `\nSwitching to next provider...`
          );
          this.getNextProvider();
        }
      }
    }
    throw new Error(
      `Failed after ${attempts} attempts. Last error: ${lastError?.message}`
    );
  }

  public async scanWalletAllowances(
    walletAddress: string,
    options: ScanOptions = {}
  ): Promise<AllowanceInfo[]> {
    try {
      await this.setupProviderForChain();

      const currentBlock = await this.queryWithRetry((provider) =>
        provider.getBlockNumber()
      );

      const decideStartPoint =
        options.blockRange != null
          ? currentBlock - Number(options.blockRange)
          : 0;

      const startBlock = options.fromBlock ?? decideStartPoint;
      const endBlock = options.toBlock ?? currentBlock;

      console.log(`Scanning all blocks from ${startBlock} to ${endBlock}`);

      const approvalTopic = this.erc20Interface.getEvent("Approval")!.topicHash;

      let tokenApprovals: TokenApproval = {};

      //rpc max is 5k
      const CHUNK_SIZE = 5000;
      tokenApprovals = await this.getTokenApprovals(
        startBlock,
        endBlock,
        CHUNK_SIZE,
        approvalTopic,
        walletAddress
      );

      return await this.getAllowanceInfo(tokenApprovals, walletAddress);
    } catch (error) {
      console.error("Error scanning allowances:", error);
      throw error;
    }
  }

  private async getAllowanceInfo(
    tokenApprovals: TokenApproval,
    walletAddress: string
  ): Promise<AllowanceInfo[]> {
    const allowanceInfos: AllowanceInfo[] = [];

    for (const [tokenAddress, spenders] of Object.entries(tokenApprovals)) {
      try {
        // Get token information
        const [symbol, decimals] = await Promise.all([
          this.queryWithRetry((provider) =>
            new Contract(tokenAddress, ERC20_ABI, provider)
              .symbol()
              .catch(() => "UNKNOWN")
          ),
          this.queryWithRetry((provider) =>
            new Contract(tokenAddress, ERC20_ABI, provider)
              .decimals()
              .catch(() => 18)
          ),
        ]);

        // Check allowance for each spender
        for (const spender of spenders) {
          try {
            const allowanceInfo = await this.checkAllowance(
              {
                address: tokenAddress,
                symbol: symbol,
                decimals: decimals,
              },
              walletAddress,
              spender
            );
            if (allowanceInfo != undefined) {
              allowanceInfos.push(allowanceInfo);
            }
          } catch (error) {
            console.warn(
              `Error checking allowance for spender ${spender}:`,
              error
            );
          }
        }
      } catch (error) {
        console.warn(`Error processing token ${tokenAddress}:`, error);
      }
    }
    return allowanceInfos;
  }

  private async checkAllowance(
    tokenInfo: TokenInfo,
    walletAddress: string,
    tokenApprovalInfo: TokenApprovalInfo
  ): Promise<AllowanceInfo | undefined> {
    const allowance = await this.queryWithRetry((provider) =>
      new Contract(tokenInfo.address, ERC20_ABI, provider).allowance(
        walletAddress,
        tokenApprovalInfo.spender
      )
    );
    // Only include non-zero allowances
    if (allowance > 0n) {
      const formatted = ethers.formatUnits(allowance, tokenInfo.decimals);
      const explorerLink =
        EXPLORE_URLS[Number(this.queryProviders[0]._network.chainId)];
      return {
        token: {
          address: tokenInfo.address,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
        },
        txHash: tokenApprovalInfo.txHash,
        explorerLink: explorerLink,
        spender: tokenApprovalInfo.spender,
        allowance: allowance.toString(),
        formattedAllowance: this.shortenNumber(formatted),
      };
    }
  }

  private async getTokenApprovals(
    startBlock: ethers.BlockTag,
    endBlock: ethers.BlockTag,
    CHUNK_SIZE: number,
    approvalTopic: string,
    walletAddress: string
  ): Promise<TokenApproval> {
    const tokenApprovals: TokenApproval = {};
    for (
      let chunkStart = Number(startBlock);
      chunkStart < Number(endBlock);
      chunkStart += CHUNK_SIZE
    ) {
      const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, Number(endBlock));

      console.log(`Scanning blocks ${chunkStart} to ${chunkEnd}...`);

      // Create filter for Approval events
      const filter = {
        topics: [approvalTopic, ethers.zeroPadValue(walletAddress, 32), null],
        fromBlock: chunkStart,
        toBlock: chunkEnd,
      };

      // Get logs for this chunk
      const logs = await this.queryWithRetry<Log[]>((provider) =>
        provider.getLogs(filter)
      );

      // Process the logs
      for (const log of logs) {
        const tokenAddress = log.address;
        const txHash = log.transactionHash;
        const spender = ethers.getAddress(ethers.dataSlice(log.topics[2], 12));

        if (!tokenApprovals[tokenAddress]) {
          tokenApprovals[tokenAddress] = new Set<TokenApprovalInfo>();
        }
        tokenApprovals[tokenAddress].add({
          spender: spender,
          txHash: txHash,
        });
      }
    }
    return tokenApprovals;
  }
}
