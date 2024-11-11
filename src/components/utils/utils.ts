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
    case 383414847825:
      return "/zeniq.png";
    default:
      return "/eth.png";
  }
};
