import React, { useEffect, useState } from "react";
import { useWeb3Context } from "../../hooks/useWeb3";
import { AllowanceInfo } from "../../types/web3";
import { AllowanceScanner } from "../../services/AllowanceScanner";
import { Button, Space, Spin, Table, TableColumnType } from "antd";

export const AllowanceList: React.FC = () => {
  const { account, provider, signer, chainId } = useWeb3Context();
  const [loading, setLoading] = useState(false);
  const [allowances, setAllowances] = useState<AllowanceInfo[]>([]);

  useEffect(() => {
    if (account && provider && signer && chainId) {
      const fetchAllowances = async () => {
        setLoading(true);
        const scanner = new AllowanceScanner(provider);
        let options = {
          blockRange: 1000000,
        };
        const allowanceList = await scanner.scanWalletAllowances(
          account,
          options
        );
        console.log("Allowances", allowanceList[0].token.symbol);
        setAllowances(allowanceList);
        setLoading(false);
      };
      fetchAllowances();
    }
  }, [account, provider, signer, chainId]);

  if (!account) return null;

  let columns: TableColumnType<AllowanceInfo>[] = [
    {
      title: "Token",
      dataIndex: "token",
      key: "token",
      render: (token) => token.symbol,
    },
    {
      title: "Spender",
      dataIndex: "spender",
      key: "spender",
    },
    {
      title: "Allowance",
      dataIndex: "formattedAllowance",
      key: "formattedAllowance",
    },
    {
      key: "actions",
      render: () => (
        <Space>
          <Button type="primary" danger>
            Revoke
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
    // style={{
    //   display: "flex",
    //   justifyContent: "center",
    //   alignItems: "center",
    //   flexDirection: "column",
    //   minHeight: "100vh",
    // }}
    >
      {loading && <Spin />}
      {allowances.length === 0 && !loading && <p>No allowances found</p>}
      <Table columns={columns} dataSource={allowances}></Table>
    </div>
  );
};
