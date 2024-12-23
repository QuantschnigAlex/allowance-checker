// Helper to shorten the address
export const shortenAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getNetworkImage = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "/eth.svg";
    case 56:
      return "/bnb.svg";
    case 137:
      return "/polygon.png";
    case 42161:
      return "/arb.svg";
    case 43114:
      return "avax.png";
    case 8453:
      return "base.png";
    case 1284:
      return "moonbeam.png";
    case 10:
      return "optimism.png";
    case 324:
      return "zksync.png";
    default:
      return "/eth.png";
  }
};

export const MAX_UINT256 = 2n ** 256n - 1n;
