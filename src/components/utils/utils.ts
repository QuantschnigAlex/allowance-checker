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
      return "/polygon.svg";
    case 42161:
      return "/arbitrum.svg";
    case 383414847825:
      return "/eth.svg";
    default:
      return "/eth.png";
  }
};
