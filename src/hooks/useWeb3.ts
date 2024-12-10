import { useState, useCallback, useEffect, useContext } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { message } from "antd";
import { Web3Context } from "../context/context";
import { WalletType } from "../types/web3";



export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeWallet, setActiveWallet] = useState<WalletType | null>(null);

  const getProvider = (walletType: WalletType) => {
    // Check for mutli-provider case
    const providers = (window.ethereum as any).providers;

    if (providers) {
      return providers.find((provider: any) => {
        if (walletType === 'metamask' && provider.isMetaMask) return true;
        if (walletType === 'rabby' && provider.isRabby) return true;
        return false;
      });
    } else {
      // Single provider case
      if (walletType === 'metamask' && window.ethereum?.isMetaMask) return window.ethereum;
      if (walletType === 'rabby' && window.ethereum?.isRabby) return window.ethereum;
    }

    return null;
  };

  const connect = useCallback(async (walletType: WalletType) => {
    const walletProvider = getProvider(walletType);

    if (!walletProvider) {
      message.error(`${walletType === 'metamask' ? 'MetaMask' : 'Rabby'} not found! Please install it first.`);
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new BrowserProvider(walletProvider, "any");
      const accounts = await walletProvider.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setActiveWallet(walletType);
    } catch (error: any) {
      console.log("Connect error:", error);
      if (error.error?.code === -32002) {
        message.info("Please check your wallet and complete the pending connection.");
      } else {
        message.error("Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setActiveWallet(null);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [account, disconnect]);

  return {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    activeWallet,
    connect,
    disconnect,
  };
}

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3Context must be used within a Web3Provider");
  }
  return context;
}