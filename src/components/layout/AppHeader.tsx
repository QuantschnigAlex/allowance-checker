import { Header } from "antd/es/layout/layout";
import { ConnectWallet } from "../web3/ConnectWallet";

export const AppHeader: React.FC = () => {
  return (
    <Header>
      <div
        style={{
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <ConnectWallet></ConnectWallet>
      </div>
    </Header>
  );
};
