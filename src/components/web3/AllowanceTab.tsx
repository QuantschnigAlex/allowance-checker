import React, { useEffect, useState } from "react";
import { useWeb3Context } from "../../hooks/useWeb3";
import { AllowanceInfo } from "../../types/web3";
import { AllowanceScanner } from "../../services/AllowanceScanner";
import { Spin } from "antd";
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
          blockRange: 60000,
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
    <div>
      {loading && <Spin />}
      {allowances.length === 0 && !loading && <p>No allowances found</p>}
      {!loading &&
        allowances.map((allowance) => (
          <AllowanceTile key={allowance.spender} {...allowance} />
        ))}
    </div>
  );
};
