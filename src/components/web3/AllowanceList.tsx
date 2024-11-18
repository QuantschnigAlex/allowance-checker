import React, { useEffect, useState } from "react";
import { useWeb3Context } from "../../hooks/useWeb3";
import { AllowanceInfo } from "../../types/web3";
import { Input, List, notification, Spin } from "antd";
import { SUPORTED_CHAINS } from "../../services/rpc";
import { useMediaQuery } from "react-responsive";
import { AllowanceCard } from "./AllowanceCard";
import { AllowanceTable } from "./AllowanceTable";
import { AllowanceService } from "./AllowanceService";
import { AllowanceLogScanner } from "../../services/AllowanceLogScanner";
// import { allowanceInfos } from "./sampleLogs";

export const AllowanceList: React.FC = () => {
  const { account, provider, signer, chainId } = useWeb3Context();
  const [loading, setLoading] = useState(false);
  const [allowances, setAllowances] = useState<AllowanceInfo[]>([]);
  const isMobile = useMediaQuery({ maxWidth: 600 });
  const [filteredAllowances, setFilteredAllowances] = useState<AllowanceInfo[]>(
    []
  );
  const [revokeLoading, setRevokeLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [api, contextHolder] = notification.useNotification();

  const allowanceService = new AllowanceService(api);

  const handleRevokeAllowance = async (allowanceInfo: AllowanceInfo) => {
    const key = allowanceInfo.txHash;
    setRevokeLoading((prev) => ({ ...prev, [key]: true }));

    try {
      await allowanceService.revokeAllowance(allowanceInfo, signer!);
      const updatedAllowances = allowances.filter(
        (allowance) => allowance.token.symbol !== allowanceInfo.token.symbol
      );
      setAllowances(updatedAllowances);
      setFilteredAllowances(updatedAllowances);
    } finally {
      setRevokeLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  function filterAllowancesByName(allowances: AllowanceInfo[], name: string) {
    const allowancesByName = allowances.filter((allowance) =>
      allowance.token.symbol.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredAllowances(allowancesByName);
  }

  useEffect(() => {
    if (account && provider && signer && chainId) {
      const fetchAllowances = async () => {
        setLoading(true);
        const scanner = new AllowanceLogScanner(provider);
        const allowanceList = await scanner.scanWalletAllowances(account);
        // const allowanceList = allowanceInfos;
        setAllowances(allowanceList);
        setFilteredAllowances(allowanceList);
        setLoading(false);
      };
      fetchAllowances();
    }
  }, [account, provider, signer, chainId]);

  if (!account) return null;

  if (!SUPORTED_CHAINS.includes(chainId!)) {
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
        <h1>Unsupported Network</h1>
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          minHeight: "100%",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Spin size="large" />
          </div>
        )}
        {allowances.length === 0 && !loading && (
          <div
            style={{
              padding: "1rem 0",
            }}
          >
            <h1>No allowances found!</h1>
          </div>
        )}
        {!loading && !isMobile && (
          <div>
            <Input.Search
              style={{ marginBottom: "1rem" }}
              placeholder="Search by token name"
              allowClear
              enterButton="Search"
              size="large"
              onClear={() => setFilteredAllowances(allowances)}
              onSearch={(value) => filterAllowancesByName(allowances, value)}
            />
            <AllowanceTable
              allowances={filteredAllowances}
              chainId={chainId!}
              revokeLoading={revokeLoading}
              onRevokeAllowance={handleRevokeAllowance}
            />
          </div>
        )}
        {!loading && isMobile && (
          <div style={{ width: "100%" }}>
            <Input.Search
              style={{ marginBottom: "1rem" }}
              placeholder="input search text"
              allowClear
              enterButton="Search"
              size="large"
              onClear={() => setFilteredAllowances(allowances)}
              onSearch={(value) => filterAllowancesByName(allowances, value)}
            />
            <List
              style={{ width: "100%" }}
              dataSource={filteredAllowances}
              renderItem={(allowanceInfo: AllowanceInfo) => (
                <List.Item>
                  <AllowanceCard
                    allowanceInfo={allowanceInfo}
                    onRevokeAllowance={handleRevokeAllowance}
                    revokeLoading={revokeLoading}
                  />
                </List.Item>
              )}
            ></List>
          </div>
        )}
      </div>
    </>
  );
};
