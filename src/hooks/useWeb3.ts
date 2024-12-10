import { useState, useCallback, useEffect, useContext } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { message } from "antd";
import { Web3Context } from "../context/context";
import { EIP6963ProviderDetail, WalletType } from "../types/web3";

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeWallet, setActiveWallet] = useState<WalletType | null>(null);
  const [walletProviders, setWalletProviders] = useState<Map<string, EIP6963ProviderDetail>>(new Map());

  useEffect(() => {
    const providers = new Map<string, EIP6963ProviderDetail>();

    const handleAnnouncement = (event: any) => {
      const { detail } = event;
      providers.set(detail.info.rdns, detail);
      setWalletProviders(new Map(providers));
    };

    window.addEventListener('eip6963:announceProvider', handleAnnouncement);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnouncement);
    };
  }, []);

  const getWalletProvider = (walletType: WalletType) => {
    const rdns = walletType === 'metamask' ? 'io.metamask' : 'io.rabby';
    return walletProviders.get(rdns)?.provider;
  };

  const connect = useCallback(async (walletType: WalletType) => {
    try {
      setIsConnecting(true);

      const walletProvider = getWalletProvider(walletType);

      if (!walletProvider) {
        throw new Error(`${walletType} wallet not found! Please make sure it's installed.`);
      }

      const browserProvider = new BrowserProvider(walletProvider, "any");
      const accounts = await walletProvider.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const signer = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setActiveWallet(walletType);

      message.success(`Connected to ${walletType === 'metamask' ? 'MetaMask' : 'Rabby'}`);
    } catch (error: any) {
      console.error("Connect error:", error);
      if (error.error?.code === -32002) {
        message.info("Please check your wallet and complete the pending connection.");
      } else {
        message.error(error.message || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [walletProviders]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setActiveWallet(null);
    message.success("Wallet disconnected");
  }, []);

  useEffect(() => {
    if (!provider?.provider || !activeWallet) return;

    const rawProvider = provider.provider;

    async function handleAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        try {
          const newSigner = await provider!.getSigner();
          setSigner(newSigner);
        } catch (error) {
          console.error('Error updating signer:', error);
        }
      }
    }

    async function handleChainChanged(newChainId: string) {
      console.log('Chain changed to:', newChainId);

      try {
        // Get updated provider and network information
        const network = await provider!.getNetwork();
        const newSigner = await provider!.getSigner();

        // Update state with new chain info
        setChainId(Number(network.chainId));
        setSigner(newSigner);
      } catch (error) {
        console.error('Error handling chain change:', error);
        message.error('Error updating network connection');
      }
    }

    function handleDisconnect() {
      console.log('Wallet disconnected');
      disconnect();
    }

    try {
      // Set up event listeners
      rawProvider.on('accountsChanged', handleAccountsChanged);
      rawProvider.on('chainChanged', handleChainChanged);
      rawProvider.on('disconnect', handleDisconnect);

      // Get initial chain ID
      provider.getNetwork().then(network => {
        setChainId(Number(network.chainId));
      }).catch(console.error);

    } catch (error) {
      console.warn('Error setting up event listeners:', error);
    }

    // Check connection status periodically
    const intervalId = setInterval(async () => {
      if (!provider) return;

      try {
        // Check accounts
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length === 0 && account !== null) {
          disconnect();
          return;
        }

        // Check chain ID
        const network = await provider.getNetwork();
        const currentChainId = Number(network.chainId);
        if (currentChainId !== chainId) {
          setChainId(currentChainId);
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
        }
      } catch (error) {
        console.warn('Error checking connection status:', error);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
      try {
        // Clean up event listeners
        rawProvider.removeListener('accountsChanged', handleAccountsChanged);
        rawProvider.removeListener('chainChanged', handleChainChanged);
        rawProvider.removeListener('disconnect', handleDisconnect);
      } catch (error) {
        console.warn('Error cleaning up event listeners:', error);
      }
    };
  }, [provider, account, activeWallet, disconnect, chainId]);

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