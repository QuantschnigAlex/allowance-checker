import {
  BlockTag,
  BrowserProvider,
  Eip1193Provider,
  JsonRpcSigner,
} from "ethers";

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: Eip1193Provider;
}

export type EIP6963AnnounceProviderEvent = {
  detail: {
    info: EIP6963ProviderInfo;
    provider: Eip1193Provider;
  };
};
export interface EIP6963RequestProviderEvent extends Event {
  type: "eip6963:requestProvider";
}

export type ChainId = 1 | 56 | 137 | 42161 | 8453;

export interface RPCConfig {
  [chainId: number]: string[];
}

export interface EXPLORERConfig {
  [chainId: number]: string;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

export interface AllowanceInfo {
  token: TokenInfo;
  spender: string;
  explorerLink: string;
  allowance: string;
  txHash: string;
  formattedAllowance: string;
  spenderName?: string;
}

export interface ScanOptions {
  fromBlock?: BlockTag;
  toBlock?: BlockTag;
  blockRange?: BlockTag;
}

export const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];
export interface Web3ContextData {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: number | null;
  selectedWallet: EIP6963ProviderDetail | null;
  connect: (providerDetail: EIP6963ProviderDetail) => Promise<void>;
  disconnect: () => void;
}

export type TokenApproval = {
  [tokenAddress: string]: Set<TokenApprovalInfo>;
};

export interface TokenApprovalInfo {
  spender: string;
  txHash: string;
}

export enum WalletError {
  UserRejected = "User rejected the connection request",
  UnsupportedChain = "This network is not supported",
  AlreadyProcessing = "Request already processing. Check your wallet!",
  Unauthorized = "Wallet connection unauthorized",
  Disconnected = "Wallet disconnected",
  ChainDisconnected = "Chain disconnected",
}

export interface EtherscanTx {
  hash: string;
  input: string;
  to: string;
  timeStamp: string;
  from: string;
  blockNumber: string;
  functionName: string;
}

export interface EtherscanLogResponse {
  status: string;
  message: string;
  result: EtherscanLog[];
}
export interface EtherscanLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  logIndex: string;
  transactionHash: string;
  transactionIndex: string;
}

export interface ApprovalLog {
  token: string;
  owner: string;
  spender: string;
  amount: string;
  blockNumber: number;
  txHash: string;
}
