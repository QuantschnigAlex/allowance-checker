import { BrowserProvider } from "ethers";
import { AllowanceScannerEthers } from "./AllowanceScannerEthers";

// Mock the Contract
jest.mock("ethers", () => ({
  ...jest.requireActual("ethers"),
  Contract: jest.fn().mockImplementation(() => ({
    symbol: jest.fn().mockResolvedValue("TEST"),
    decimals: jest.fn().mockResolvedValue(18),
    allowance: jest.fn().mockResolvedValue(BigInt("1000000000000000000")),
  })),
}));

// Mock the config
jest.mock("../config", () => ({
  config: {
    apiKey: "test",
  },
}));

describe("AllowanceScannerEthers", () => {
  const TEST_WALLET = "0xA7Fa4bB0bba164F999E8C7B83C9da96A3bE44616";
  const TEST_SPENDER = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d";
  let scanner: AllowanceScannerEthers;

  beforeEach(() => {
    // Mock fetch for Etherscan API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "1",
        message: "OK",
        result: [
          {
            hash: "0xabc123",
            input: `0x095ea7b3${TEST_SPENDER.slice(2).padStart(
              64,
              "0"
            )}${"f".repeat(64)}`,
            to: "0x1234567890123456789012345678901234567890",
            from: TEST_WALLET,
            timeStamp: "1700000000",
            blockNumber: "1000000",
            functionName: "approve(address spender, uint256 amount)",
          },
        ],
      }),
    });
  });

  it(`should get approvals`, async () => {
    const mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(1) }),
      getBlockNumber: jest.fn().mockResolvedValue(BigInt(999999999)),
    } as unknown as BrowserProvider;

    scanner = new AllowanceScannerEthers(mockProvider);
    const allowances = await scanner.scanWalletAllowances(TEST_WALLET);

    expect(allowances).toBeDefined();
    expect(allowances.length).toBeGreaterThan(0);
    expect(allowances[0]).toMatchObject({
      token: {
        symbol: "TEST",
        decimals: 18,
      },
      spender: TEST_SPENDER.toLowerCase(),
      allowance: "1000000000000000000",
    });
  });
});
