import { useState, useEffect } from "react";
import { Card, Typography, Spin } from "antd";
import { useWeb3Context } from "../../context/Web3Context";
import { formatEther } from "ethers";

const { Text } = Typography;

export const WalletInfo: React.FC = () => {
  const { account, provider } = useWeb3Context();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (account && provider) {
        try {
          setIsLoading(true);
          const balanceWei = await provider.getBalance(account);
          setBalance(formatEther(balanceWei));
        } catch (error) {
          console.error("Error fetching balance:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBalance();
  }, [account, provider]);

  if (!account) return null;

  return (
    <Card title="Wallet Information" style={{ marginTop: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <Text type="secondary">Address: </Text>
          <Text copyable>{account}</Text>
        </div>
        <div>
          <Text type="secondary">Balance: </Text>
          {isLoading ? (
            <Spin size="small" />
          ) : (
            <Text>
              {balance ? `${Number(balance).toFixed(4)} ETH` : "0 ETH"}
            </Text>
          )}
        </div>
      </div>
    </Card>
  );
};
