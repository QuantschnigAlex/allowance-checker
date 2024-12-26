import { useContext, useEffect, useState, useSyncExternalStore } from "react";
import { Web3Context } from "../context/context";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
  WalletError,
} from "../types/web3";
import { message } from "antd";

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent;
  }
}

let providers: EIP6963ProviderDetail[] = [];
export const store = {
  value: () => providers,
  subscribe: (callback: () => void) => {
    function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
      if (providers.map((p) => p.info.uuid).includes(event.detail.info.uuid))
        return;
      providers = [...providers, event.detail];
      callback();
    }
    window.addEventListener("eip6963:announceProvider", onAnnouncement);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () =>
      window.removeEventListener("eip6963:announceProvider", onAnnouncement);
  },
};

export const useSyncProviders = () =>
  useSyncExternalStore(store.subscribe, store.value, store.value);

export function useWeb3() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [selectedWallet, setSelectedWallet] =
    useState<EIP6963ProviderDetail | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (connectionError) {
      message.error(connectionError);
    }
  }, [connectionError]);

  useEffect(() => {
    if (selectedWallet?.provider) {
      let mounted = true;

      const checkNetwork = async () => {
        try {
          const chainIdHex = (await selectedWallet.provider.request({
            method: "eth_chainId",
          })) as string;

          if (mounted && Number(chainIdHex) !== chainId) {
            const provider = new BrowserProvider(selectedWallet.provider);
            const signer = await provider.getSigner();

            setProvider(provider);
            setChainId(Number(chainIdHex));
            setSigner(signer);
          }
        } catch (error) {
          console.error("Error checking network:", error);
        }
      };

      // Check every second
      const interval = setInterval(checkNetwork, 1000);

      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
  }, [selectedWallet, chainId]);

  const connect = async (providerDetail: EIP6963ProviderDetail) => {
    setConnectionError(null);
    try {
      const accounts = await providerDetail.provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts?.[0]) {
        const provider = new BrowserProvider(providerDetail.provider);
        const network = await provider.getNetwork();
        const signer = await provider.getSigner();

        setSelectedWallet(providerDetail);
        setAccount(accounts[0]);
        setProvider(provider);
        setChainId(Number(network.chainId));
        setSigner(signer);
      }
    } catch (error: any) {
      const errorMessage = walletError(error.code);
      setConnectionError(errorMessage);
      console.error("Connection error:", error.code);
      disconnect();
    }
  };

  const walletError = (error: any) => {
    switch (error) {
      case 4001:
        return WalletError.UserRejected;
      case 4902:
        return WalletError.UnsupportedChain;
      case -32002:
        return WalletError.AlreadyProcessing;
      case 4100:
        return WalletError.Unauthorized;
      case 4900:
        return WalletError.Disconnected;
      case 4901:
        return WalletError.ChainDisconnected;
      default:
        return error.message || "Unknown error occurred";
    }
  };

  const disconnect = () => {
    setSigner(null);
    setChainId(null);
    setProvider(null);
    setAccount("");
    setSelectedWallet(null);
  };

  return {
    account,
    provider,
    signer,
    chainId,
    selectedWallet,
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
