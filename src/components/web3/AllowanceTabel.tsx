import React, { useEffect, useState } from "react";
import { useWeb3Context } from "../../hooks/useWeb3";
import { AllowanceInfo } from "../../types/web3";
import { AllowanceScanner } from "../../services/AllowanceScanner";
import { Button, Space, Spin, Table, TableColumnType } from "antd";
import { getNetworkImage, shortenAddress } from "../utils/utils";

export const AllowanceList: React.FC = () => {
  const { account, provider, signer, chainId } = useWeb3Context();
  const [loading, setLoading] = useState(false);
  const [allowances, setAllowances] = useState<AllowanceInfo[]>([]);
  const MAX_UINT256 = 2n ** 256n - 1n;

  useEffect(() => {
    if (account && provider && signer && chainId) {
      const fetchAllowances = async () => {
        setLoading(true);
        const scanner = new AllowanceScanner(provider);
        const options = {
          blockRange: 500000,
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

  const columns: TableColumnType<AllowanceInfo>[] = [
    {
      title: "Token",
      dataIndex: "token",
      key: "token",
      render: (token) => token.symbol,
    },
    {
      title: "Transaction Hash",
      dataIndex: "txHash",
      key: "txHash",
      render: (txHash, record) => (
        <a
          href={`${record.explorerLink}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortenAddress(txHash)}
        </a>
      ),
    },
    {
      title: "Spender",
      dataIndex: "spender",
      key: "spender",
      render: (spender, record) => (
        <a
          href={`${record.explorerLink}/address/${spender}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {shortenAddress(spender)}
        </a>
      ),
    },
    {
      title: "Allowance",
      dataIndex: "allowance",
      key: "allowance",
      render: (allowance, record) => {
        return allowance === MAX_UINT256.toString()
          ? `Unlimited ${record.token.symbol}`
          : `${record.formattedAllowance} ${record.token.symbol}`;
      },
    },
    {
      key: "actions",
      dataIndex: "token",
      title: () => (
        <img
          src={getNetworkImage(chainId ?? 1)}
          alt="Network Logo"
          style={{ width: 30, height: 30, alignItems: "center" }}
        />
      ),
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
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100%",
      }}
    >
      {loading && <Spin />}
      {allowances.length === 0 && !loading && <p>No allowances found</p>}
      {!loading && <Table columns={columns} dataSource={allowances}></Table>}
    </div>
  );
};
