import { useState } from "react";
import { Button, Dropdown, Space, message } from "antd";
import type { MenuProps } from "antd";
import {
  WalletOutlined,
  DisconnectOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { useWeb3Context } from "../../hooks/useWeb3";
import { shortenAddress } from "../utils/utils";

export const ConnectWallet = () => {
  const isMobile = useMediaQuery({ maxWidth: 600 });

  const { account, connect, disconnect, isConnecting } = useWeb3Context();
  const [copied, setCopied] = useState(false);



  // Copy address to clipboard
  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      console.log(copied);
      message.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Dropdown menu items when connected
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

  // If not connected, show connect button
  if (!account) {
    return (
      <Button
        type="primary"
        icon={<WalletOutlined />}
        onClick={connect}
        loading={isConnecting}
      >
        {isMobile ? "Connect" : "Connect Wallet"}
      </Button>
    );
  }
  // If connected, show dropdown with address
  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button type="default">
        <Space>
          <WalletOutlined />
          {shortenAddress(account)}
        </Space>
      </Button>
    </Dropdown>
  );
};
