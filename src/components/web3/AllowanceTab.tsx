import React, { useEffect, useState } from "react";
import { useWeb3Context } from "../../hooks/useWeb3";
import { AllowanceInfo } from "../../types/web3";
import { AllowanceScanner } from "../../services/AllowanceScanner";
import { Space, Spin } from "antd";
import { AllowanceTile } from "./AllowanceTile";

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
        setAllowances(allowanceList);
        setLoading(false);
      };
      fetchAllowances();
    }
  }, [account, provider, signer, chainId]);

  if (!account) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {loading && <Spin />}
      {allowances.length === 0 && !loading && <p>No allowances found</p>}
      <Space direction="vertical" size="large">
        {!loading &&
          allowances.map((allowance) => (
            <AllowanceTile key={allowance.spender} {...allowance} />
          ))}
      </Space>
    </div>
  );
};
