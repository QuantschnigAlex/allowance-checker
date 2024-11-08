import { Contract, ethers, Interface, Log, Provider } from "ethers";
import { JsonRpcProvider, BrowserProvider } from "ethers";
import { AllowanceInfo, ERC20_ABI, ScanOptions } from "../types/web3";
import { CHAIN_RPC_PROVIDERS } from "./rpc";

export class AllowanceScanner {
  private walletProvider: BrowserProvider;
  private queryProviders: JsonRpcProvider[];
  private currentProviderIndex: number;
  private erc20Interface: Interface;

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

  private getNextProvider(): Provider {
    this.currentProviderIndex =
      (this.currentProviderIndex + 1) % this.queryProviders.length;
    return this.queryProviders[this.currentProviderIndex];
  }

  private async queryWithRetry<T>(
    queryFn: (provider: Provider) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | undefined;
    let attempts = 0;
    const maxAttempts = maxRetries * this.queryProviders.length;

    while (attempts < maxAttempts) {
      try {
        const provider = this.getNextProvider();
        return await queryFn(provider);
      } catch (error) {
        attempts++;
        lastError = error as Error;

        console.warn(
          `Provider error (attempt ${attempts}/${maxAttempts}):`,
          error instanceof Error ? error.message : "Unknown error",
          `\nSwitching to next provider...`
        );

        await new Promise((resolve) => setTimeout(resolve, 2000));
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

      const startBlock = options.fromBlock ?? 0;
      const endBlock = options.toBlock ?? currentBlock;

      console.log(`Scanning all blocks from ${startBlock} to ${endBlock}`);

      const approvalTopic = this.erc20Interface.getEvent("Approval")!.topicHash;

      const tokenApprovals: { [tokenAddress: string]: Set<string> } = {};

      //rpc max is 10k
      const CHUNK_SIZE = 9900;
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
          const spender = ethers.getAddress(
            ethers.dataSlice(log.topics[2], 12)
          );

          if (!tokenApprovals[tokenAddress]) {
            tokenApprovals[tokenAddress] = new Set<string>();
          }
          tokenApprovals[tokenAddress].add(spender);
        }
      }

      const results: AllowanceInfo[] = [];

      for (const [tokenAddress, spenders] of Object.entries(tokenApprovals)) {
        try {
          const provider = this.queryProviders[this.currentProviderIndex];
          const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

          // Get token information
          const [symbol, decimals] = await Promise.all([
            tokenContract.symbol().catch(() => "UNKNOWN"),
            tokenContract.decimals().catch(() => 18),
          ]);

          // Check allowance for each spender
          for (const spender of spenders) {
            try {
              const allowance = await tokenContract.allowance(
                walletAddress,
                spender
              );

              // Only include non-zero allowances
              if (allowance > 0n) {
                results.push({
                  token: {
                    address: tokenAddress,
                    symbol,
                    decimals,
                  },
                  spender,
                  allowance: allowance.toString(),
                  formattedAllowance: ethers.formatUnits(allowance, decimals),
                });
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

      return results;
    } catch (error) {
      console.error("Error scanning allowances:", error);
      throw error;
    }
  }
}
