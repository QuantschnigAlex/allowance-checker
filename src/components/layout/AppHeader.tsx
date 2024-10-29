import { Layout, Space, Typography } from "antd";
import { ConnectWallet } from "../web3/ConnectWallet";
import { ThemeToggle } from "../ThemeToggle";
const { Header } = Layout;
const { Title } = Typography;

export const AppHeader = () => {
  return (
    <Header>
      <div
        style={{
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
        }}
      >
        {" "}
        <Title
          level={3}
          style={{
            margin: 0,
          }}
        >
          Allowance Checker
        </Title>
        <Space size={"large"}>
          <ThemeToggle />
          <ConnectWallet />
        </Space>
      </div>
    </Header>
  );
};
