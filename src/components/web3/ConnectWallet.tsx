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
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      console.log("Copy address to clipboard:", copied);
      message.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWalletConnect = async (walletType: WalletType) => {
    try {
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
    disabled
  }: {
    name: string;
    type: WalletType;
    icon: string;
    disabled?: boolean;
  }) => (
    <Card
      hoverable={!disabled}
      style={{
        marginBottom: 16,
        borderRadius: 8,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      onClick={() => !disabled && handleWalletConnect(type)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>{name}</Text>
        <img
          src={icon}
          alt={`${name} logo`}
          style={{ height: 32, width: 32 }}
        />
      </div>
      {disabled && (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          Currently connected
        </Text>
      )}
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
          width={400}
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
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({activeWallet === 'metamask' ? 'MetaMask' : 'Rabby'})
            </Text>
          )}
        </Space>
      </Button>
    </Dropdown>
  );
};