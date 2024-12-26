import { useState } from "react";
import {
  Button,
  Dropdown,
  Space,
  message,
  Modal,
  Card,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import {
  WalletOutlined,
  DisconnectOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useMediaQuery } from "react-responsive";
import { shortenAddress } from "../utils/utils";
import { EIP6963ProviderDetail } from "../../types/web3";
import { useSyncProviders, useWeb3Context } from "../../hooks/useWeb3";

const { Text } = Typography;

export const ConnectWallet: React.FC = () => {
  const isMobile = useMediaQuery({ maxWidth: 600 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const providers = useSyncProviders();
  const { account, connect, disconnect, selectedWallet } = useWeb3Context();

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account);
      message.success("Address copied to clipboard!");
    }
  };

  const handleWalletConnect = async (providerDetail: EIP6963ProviderDetail) => {
    await connect(providerDetail);
    setIsModalOpen(false);
  };

  const handleWalletDisconnect = async () => {
    disconnect();
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
      onClick: handleWalletDisconnect,
    },
  ];

  const WalletOption = ({
    name,
    icon,
    providerDetail,
  }: {
    name: string;
    icon: string;
    providerDetail: EIP6963ProviderDetail;
  }) => (
    <Card
      hoverable
      style={{
        marginBottom: 16,
        borderRadius: 8,
      }}
      onClick={() => handleWalletConnect(providerDetail)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
          loading={false}
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
          <div>
            {providers.length > 0 ? (
              providers?.map((provider: EIP6963ProviderDetail) => (
                <WalletOption
                  name={provider.info.name}
                  providerDetail={provider}
                  icon={provider.info.icon}
                  key={provider.info.uuid}
                />
              ))
            ) : (
              <div>
                <div>No Wallets found!</div>
                <div>Install a BrowserWallet e.g MetaMask</div>
              </div>
            )}
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
          {shortenAddress(account ?? "")}
          {selectedWallet && (
            <img
              src={selectedWallet.info.icon}
              alt={selectedWallet.info.name}
              style={{ height: 16, width: 16, marginTop: 3 }}
            />
          )}
        </Space>
      </Button>
    </Dropdown>
  );
};
