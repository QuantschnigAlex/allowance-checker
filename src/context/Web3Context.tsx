import { ReactNode } from "react";
import { useWeb3 } from "../hooks/useWeb3";
import { Web3Context } from "./context";

export function Web3Provider({ children }: { children: ReactNode }) {
  const web3 = useWeb3();

  return <Web3Context.Provider value={web3}>{children}</Web3Context.Provider>;
}
