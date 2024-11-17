import { BrowserProvider, Contract } from "ethers";
import { ERC20_ABI, TokenInfo } from "../types/web3";

export async function getTokenInfo(
  tokenAddress: string,
  walletProvider: BrowserProvider
): Promise<TokenInfo> {
  const contract = new Contract(tokenAddress, ERC20_ABI, walletProvider);
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

export async function getCurrentAllowance(
  tokenAddress: string,
  walletAddress: string,
  spender: string,
  walletProvider: BrowserProvider
): Promise<bigint> {
  try {
    const contract = new Contract(tokenAddress, ERC20_ABI, walletProvider);
    return await contract.allowance(walletAddress, spender);
  } catch (error) {
    console.error(
      `Error getting allowance for ${spender} and wallet ${walletAddress}:`,
      error
    );

    throw error;
  }
}
