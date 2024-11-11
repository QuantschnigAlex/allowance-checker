import { Button, Card } from "antd";
import { AllowanceInfo } from "../../types/web3";

export const AllowanceTile: React.FC<AllowanceInfo> = ({
  token,
  spender,
  formattedAllowance,
}) => {
  return (
    <Card
      actions={[
        <Button
          type="primary"
          onClick={() => window.open(`https://etherscan.io/address/${spender}`)}
        >
          View on Explorer
        </Button>,
        <Button type="primary" danger>
          Revoke
        </Button>,
      ]}
    >
      <p>Token: {token.symbol}</p>
      <p>Spender: {spender}</p>
      <p>Allowance: {formattedAllowance}</p>
    </Card>
  );
};
