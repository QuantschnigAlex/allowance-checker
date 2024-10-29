import { createContext, useContext, ReactNode } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useWeb3 } from "../hooks/useWeb3";

interface Web3ContextData {
  account: string | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextData | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const web3 = useWeb3();

  return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>;
}

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3Context must be used within a Web3Provider");
  }
  return context;
}
