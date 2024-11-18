import { BrowserProvider, Contract } from "ethers";
import { ERC20_ABI, TokenInfo } from "../types/web3";
import { config } from "../config";
import { ContractSourceCache } from "./ContractSourceCache";

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

export const APPROVAL_TOPIC =
  "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";

export const shortenNumber = (value: string) => {
  const num = parseFloat(value);
  if (num > 1000000) {
    return num.toExponential(2);
  }
  return num.toFixed(2);
};
export interface EtherscanContractSource {
  ContractName: string;
}

export async function getContractSourceCode(
  contractAddress: string,
  chainid: number
): Promise<EtherscanContractSource | null> {
  const cache = ContractSourceCache.getInstance();

  const cached = cache.get(contractAddress, chainid);
  if (cached) {
    console.log("Cache hit for:", contractAddress);
    return cached;
  }

  try {
    console.log("Fetching contract source for:", contractAddress);
    const apiKey = config.apiKey;
    const url = new URL(`https://api.etherscan.io/v2/api?chainid=${chainid}`);
    url.searchParams.append("module", "contract");
    url.searchParams.append("action", "getsourcecode");
    url.searchParams.append("address", contractAddress);
    url.searchParams.append("apikey", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === "0" || !data.result?.[0]) {
      console.warn(
        `No contract source found for ${contractAddress}:`,
        data.message
      );
      return null;
    }
    cache.set(contractAddress, chainid, data.result[0]);
    return data.result[0];
  } catch (error) {
    console.error(
      `Error fetching contract source for ${contractAddress}:`,
      error
    );
    return null;
  }
}
