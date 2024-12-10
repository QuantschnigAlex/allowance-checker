import { useState } from "react";
import { Button, Dropdown, Space, message, Modal, Card, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  WalletOutlined,
  DisconnectOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { useWeb3Context } from "../../hooks/useWeb3";
import { shortenAddress } from "../utils/utils";
import { WalletType } from "../../types/web3";

const { Text } = Typography;

const WALLET_ICONS = {
  metamask: "/metamask.svg",
  rabby: "/rabby.svg",
};

export const ConnectWallet = () => {
  const isMobile = useMediaQuery({ maxWidth: 600 });
  const { account, connect, disconnect, isConnecting, activeWallet } = useWeb3Context();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      message.success("Address copied to clipboard!");
    }
  };

  const handleWalletConnect = async (walletType: WalletType) => {
    try {
      // If another wallet is active, disconnect first
      if (activeWallet && activeWallet !== walletType) {
        disconnect();
        // ensure clean state
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await connect(walletType);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      icon: <CopyOutlined />,
      label: "Copy Address",
      onClick: copyAddress,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      icon: <DisconnectOutlined />,
      label: "Disconnect",
      onClick: disconnect,
    },
  ];

  const WalletOption = ({
    name,
    type,
    icon,
  }: {
    name: string;
    type: WalletType;
    icon: string;
  }) => (
    <Card
      hoverable
      style={{
        marginBottom: 16,
        borderRadius: 8,
      }}
      onClick={() => handleWalletConnect(type)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>{name}</Text>
        <img
          src={icon}
          alt={`${name} logo`}
          style={{ height: 32, width: 32 }}
        />
      </div>
    </Card>
  );

  if (!account) {
    return (
      <>
        <Button
          type="primary"
          icon={<WalletOutlined />}
          onClick={() => setIsModalOpen(true)}
          loading={isConnecting}
        >
          {isMobile ? "Connect" : "Connect Wallet"}
        </Button>

        <Modal
          title="Connect Wallet"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={350}
        >
          <div style={{ padding: '16px 0' }}>
            <WalletOption
              name="MetaMask"
              type="metamask"
              icon={WALLET_ICONS.metamask}
            />
            <WalletOption
              name="Rabby"
              type="rabby"
              icon={WALLET_ICONS.rabby}
            />
          </div>
        </Modal>
      </>
    );
  }

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button type="default">
        <Space>
          <WalletOutlined />
          {shortenAddress(account)}
          {activeWallet && (
            <img
              src={WALLET_ICONS[activeWallet]}
              alt={activeWallet}
              style={{ height: 16, width: 16, marginLeft: 8 }}
            />
          )}
        </Space>
      </Button>
    </Dropdown>
  );
};