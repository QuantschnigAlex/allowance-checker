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
    default:
      return "/eth.png";
  }
};

export const MAX_UINT256 = 2n ** 256n - 1n;

export const APPROVAL_TOPIC =
  "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";

export const shortenNumber = (value: string) => {
  const num = parseFloat(value);
  if (num > 1000000) {
    return num.toExponential(2);
  }
  return num.toFixed(2);
};
