import { Header } from "antd/es/layout/layout";
import { ConnectWallet } from "../web3/ConnectWallet";

export const AppHeader: React.FC = () => {
  return (
    <Header title="Allowance Checker ERC20">
      <ConnectWallet></ConnectWallet>
    </Header>
  );
};
