import { EXPLORERConfig, RPCConfig } from "../types/web3";

export const CHAIN_RPC_PROVIDERS: RPCConfig = {
  // Ethereum Mainnet (Chain ID: 1)
  1: [
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
    "https://go.getblock.io/aefd01aa907c4805ba3c00a9e5b48c6b",
    "https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7",
    "https://ethereum-rpc.publicnode.com",
    "https://1rpc.io/eth",
    "https://rpc.builder0x69.io/",
    "https://rpc.mevblocker.io",
    "https://rpc.flashbots.net/",
    "https://virginia.rpc.blxrbdn.com/",
    "https://uk.rpc.blxrbdn.com/",
    "https://singapore.rpc.blxrbdn.com/",
    "https://eth.rpc.blxrbdn.com/",
    "https://cloudflare-eth.com/",
    "https://eth-mainnet.public.blastapi.io",
    "https://api.securerpc.com/v1",
    "https://eth-pokt.nodies.app",
    "https://eth-mainnet-public.unifra.io",
    "https://ethereum.blockpi.network/v1/rpc/public",
    "https://rpc.payload.de",
    "https://api.zmok.io/mainnet/oaen6dy8ff6hju9k",
    "https://eth.api.onfinality.io/public",
  ],
  // BSC (Chain ID: 56)
  56: [
    "https://bsc-pokt.nodies.app",
    "https://bscrpc.com",
    "https://binance.llamarpc.com",
    "https://bsc-dataseed1.ninicoin.io",
    "https://bsc-dataseed2.defibit.io",
    "https://bsc-dataseed.bnbchain.org",
  ],
  // Polygon (Chain ID: 137)
  137: [
    "https://polygon.llamarpc.com",
    "https://polygon.drpc.org",
    "https://polygon.api.onfinality.io/public",
    "https://1rpc.io/matic",
    "https://polygon.meowrpc.com",
  ],
  // Arbitrum (Chain ID: 42161)
  42161: [
    "https://arbitrum.llamarpc.com",
    "https://api.zan.top/arb-one",
    "https://arbitrum.drpc.org",
    "https://arbitrum.meowrpc.com",
    "https://arb-pokt.nodies.app",
  ],

  //Zeniq Smart Chain
  383414847825: ["https://api.zeniq.network"],

  // Base (Chain ID: 8453) at the moment not working for base
  // 8453: [
  //   "https://base.llamarpc.com",
  //   "https://base-rpc.publicnode.com",
  //   "https://base.meowrpc.com",
  //   "https://endpoints.omniatech.io/v1/base/mainnet/public",
  //   "https://base-pokt.nodies.app",
  // ],
};

export const EXPLORE_URLS: EXPLORERConfig = {
  // Ethereum Mainnet (Chain ID: 1)
  1: "https://etherscan.io",
  // BSC (Chain ID: 56)
  56: "https://bscscan.com",
  // Polygon (Chain ID: 137)
  137: "https://polygonscan.com",
  // Arbitrum (Chain ID: 42161)
  42161: "https://arbiscan.io",
  //Zeniq Smart Chain
  383414847825: "https://smart.zeniq.net",
};

export const SUPORTED_CHAINS = [
  1, 11155111, 17000, 56, 97, 137, 80002, 1101, 2442, 8453, 84532, 42161, 42170,
  421614, 59144, 59141, 250, 4002, 81457, 168587773, 10, 11155420, 43114, 43113,
  199, 1028, 42220, 44787, 25, 252, 2522, 100, 255, 2358, 5000, 5003, 1284,
  1285, 1287, 204, 5611, 534352, 534351, 167000, 167009, 1111, 1112, 324, 300,
  660279, 37714555429,
];
