// import { AllowanceScanner } from "./AllowanceScanner";
// import { BrowserProvider } from "ethers";
// import { CHAIN_RPC_PROVIDERS } from "./rpc";

describe("Should do nothing", () => {
  it("should do nothing", () => {
    expect(true).toBe(true);
  });
});

// describe("AllowanceScanner", () => {
//   const TEST_WALLET = "0xA7Fa4bB0bba164F999E8C7B83C9da96A3bE44616";

//   let scanner: AllowanceScanner;

//   // Iterate over each chain ID in CHAIN_RPC_PROVIDERS
//   for (const [chainId] of Object.entries(CHAIN_RPC_PROVIDERS)) {
//     // Create a test suite for each chain ID
//     describe(`Chain ID ${chainId}`, () => {
//       it(`should scan allowances`, async () => {
//         const options = {
//           blockRange: 60000,
//         };

//         const mockProvider = {
//           getNetwork: jest.fn().mockResolvedValue({ chainId: BigInt(chainId) }),
//         } as unknown as BrowserProvider;

//         scanner = new AllowanceScanner(mockProvider);

//         const allowances = await scanner.scanWalletAllowances(
//           TEST_WALLET,
//           options
//         );

//         console.log("Found Allowances", allowances.length);
//         console.log("Sample Allowance", allowances[0]);
//         allowances.forEach((allowance) => {
//           expect(allowance).toHaveProperty("token");
//           expect(allowance).toHaveProperty("spender");
//           expect(allowance).toHaveProperty("allowance");
//           expect(allowance).toHaveProperty("formattedAllowance");

//           expect(allowance.token).toHaveProperty("address");
//           expect(allowance.token).toHaveProperty("symbol");
//           expect(allowance.token).toHaveProperty("decimals");
//         });
//         expect(allowances).toBeDefined();
//       }, 1000000);
//     });
//   }
// });
