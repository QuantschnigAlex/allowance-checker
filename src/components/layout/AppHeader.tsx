import { Layout, Space, Typography } from "antd";
import { ConnectWallet } from "../web3/ConnectWallet";
import { ThemeToggle } from "../ThemeToggle";
import { useMediaQuery } from "react-responsive";
const { Header } = Layout;
const { Title } = Typography;
export const AppHeader = () => {
  const isMobile = useMediaQuery({ maxWidth: 600 });
  return (
    <Header
      style={{
        padding: isMobile ? "0 1rem " : "0 2rem",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Title
          level={3}
          style={{
            margin: 0,
          }}
        >
          Allowance Checker
        </Title>
        <Space size={isMobile ? "small" : "large"}>
          <ThemeToggle />
          <ConnectWallet />
        </Space>
      </div>
    </Header>
  );
};
