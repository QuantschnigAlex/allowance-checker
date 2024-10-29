export interface Window {
  ethereum?: any;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Web3Error extends Error {
  code?: number;
}
