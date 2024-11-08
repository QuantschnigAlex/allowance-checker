import { BlockTag } from "ethers";

export interface Window {
  ethereum?: any;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type ChainId = 1 | 56 | 137 | 42161 | 8453;

export interface RPCConfig {
  [chainId: number]: string[];
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export interface AllowanceInfo {
  token: TokenInfo;
  spender: string;
  allowance: string;
  formattedAllowance: string;
}

export interface ScanOptions {
  years?: number;
  fromBlock?: BlockTag;
  toBlock?: BlockTag;
}

export const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];
