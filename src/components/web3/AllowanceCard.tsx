import { Button, Card } from "antd";
import { AllowanceInfo } from "../../types/web3";
import { MAX_UINT256, shortenAddress } from "../utils/utils";
import React, { ReactNode } from "react";

const ListItem: React.FC<{ title: string; value: ReactNode }> = ({
  title,
  value,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      gap: "8px",
    }}
  >
    <span>{title}</span>
    <span
      style={{
        flex: 1,
        borderBottom: "1px dotted #ccc",
        margin: "0 8px",
      }}
    />
    <span>{value}</span>
  </div>
);

interface AllowanceCardProps {
  allowanceInfo: AllowanceInfo;
  revokeLoading: { [key: string]: boolean };
  onRevokeAllowance: (allowanceInfo: AllowanceInfo) => Promise<void>;
}

export const AllowanceCard: React.FC<AllowanceCardProps> = ({
  allowanceInfo,
  revokeLoading,
  onRevokeAllowance,
}) => {
  const { token, spender, txHash, explorerLink, formattedAllowance } =
    allowanceInfo;

  return (
    <Card
      style={{ width: "100%" }}
      actions={[
        <Button
          type="primary"
          onClick={() => window.open(`${explorerLink}/tx/${txHash}`)}
        >
          View on Explorer
        </Button>,
        <Button
          type="primary"
          danger
          loading={revokeLoading[txHash] || false}
          onClick={() => onRevokeAllowance(allowanceInfo)}
        >
          Revoke
        </Button>,
      ]}
    >
      <ListItem title="Token" value={token.symbol} />
      <ListItem
        title="Spender"
        value={
          <a
            href={`${explorerLink}/address/${spender}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {shortenAddress(spender)}{" "}
          </a>
        }
      />
      <ListItem
        title="Allowance"
        value={
          <p>
            {MAX_UINT256.toString()
              ? `Unlimited ${token.symbol}`
              : `${formattedAllowance} ${token.symbol}`}
          </p>
        }
      ></ListItem>
    </Card>
  );
};
