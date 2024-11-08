import { AllowanceScanner } from "./AllowanceScanner";
import { BrowserProvider, JsonRpcProvider } from "ethers";

describe("AllowanceScanner", () => {
  const TEST_WALLET = "0xA7Fa4bB0bba164F999E8C7B83C9da96A3bE44616";
  // Ethereum mainnet
  const TEST_CHAIN_ID = BigInt(1);

  let scanner: AllowanceScanner;

  it("should scan allowances for a known wallet in specific block range", async () => {
    const rpcUrl = "https://eth.llamarpc.com";
    const provider = new JsonRpcProvider(rpcUrl);

    const currentBlock = await provider.getBlockNumber();
    console.log("current block number", currentBlock);

    const options = {
      fromBlock: currentBlock - 10000,
      toBlock: currentBlock,
    };

    const mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: TEST_CHAIN_ID }),
    } as unknown as BrowserProvider;

    scanner = new AllowanceScanner(mockProvider);

    const allowances = await scanner.scanWalletAllowances(TEST_WALLET, options);

    expect(Array.isArray(allowances)).toBe(true);

    console.log(`Found ${allowances.length} allowances`);

    if (allowances.length > 0) {
      console.log("Sample allowance:", allowances[0]);
    }

    allowances.forEach((allowance) => {
      expect(allowance).toHaveProperty("token");
      expect(allowance).toHaveProperty("spender");
      expect(allowance).toHaveProperty("allowance");
      expect(allowance).toHaveProperty("formattedAllowance");

      expect(allowance.token).toHaveProperty("address");
      expect(allowance.token).toHaveProperty("symbol");
      expect(allowance.token).toHaveProperty("decimals");
    });
  }, 60000);
});
