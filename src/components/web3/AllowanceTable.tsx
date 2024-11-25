import React from "react";
import { Button, Space, Table, TableColumnType } from "antd";
import { AllowanceInfo } from "../../types/web3";
import { getNetworkImage, MAX_UINT256, shortenAddress } from "../utils/utils";

interface AllowanceTableProps {
  allowances: AllowanceInfo[];
  revokeLoading: { [key: string]: boolean };
  onRevokeAllowance: (allowanceInfo: AllowanceInfo) => Promise<void>;
  chainId: number;
}

export const AllowanceTable: React.FC<AllowanceTableProps> = ({
  allowances,
  revokeLoading,
  onRevokeAllowance,
  chainId,
}) => {
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
          {record.spenderName || shortenAddress(spender)}
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
      key: "token",
      dataIndex: "token",
      title: () => (
        <img
          src={getNetworkImage(chainId)}
          alt="Network Logo"
          style={{ width: 30, height: 30, alignItems: "center" }}
        />
      ),
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            danger
            loading={revokeLoading[record.txHash] || false}
            onClick={() => onRevokeAllowance(record)}
          >
            Revoke
          </Button>
        </Space>
      ),
    },
  ];
  return <Table columns={columns} dataSource={allowances} rowKey="txHash" />;
};
