import React, { useEffect, useState } from "react";
import { useWeb3Context } from "../../hooks/useWeb3";
import { AllowanceInfo } from "../../types/web3";
// import { AllowanceScanner } from "../../services/AllowanceScanner";
import {
  Button,
  notification,
  Space,
  Spin,
  Table,
  TableColumnType,
} from "antd";
import { getNetworkImage, shortenAddress } from "../utils/utils";
import { Contract, JsonRpcSigner } from "ethers";
import { AllowanceScannerEthers } from "../../services/AllowanceScannerEthers";

export const AllowanceList: React.FC = () => {
  const { account, provider, signer, chainId } = useWeb3Context();
  const [loading, setLoading] = useState(false);
  const [allowances, setAllowances] = useState<AllowanceInfo[]>([]);
  const [revokeLoading, setRevokeLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [api, contextHolder] = notification.useNotification();
  const MAX_UINT256 = 2n ** 256n - 1n;

  async function revokeAllowance(
    allowanceInfo: AllowanceInfo,
    signer: JsonRpcSigner
  ) {
    const key = allowanceInfo.txHash;
    setRevokeLoading((prev) => ({
      ...prev,
      [key]: true,
    }));
    try {
      const tokenContract = new Contract(
        allowanceInfo.token.address,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );
      api.destroy();
      const tx = await tokenContract.approve(allowanceInfo.spender, 0);
      api.info({
        message: "Waiting for confirmation",
        description:
          "Revoking allowance for the spender! Be patient and wait for the transaction to be confirmed.",
        duration: 0,
        icon: <Spin />,
        key,
      });
      console.log("Revoke Allowance Tx Hash", tx.hash);
      await tx.wait();
      api.destroy(key);
      api.success({
        message: "Allowance Revoked",
        duration: 4.5,
        description:
          "The allowance has been successfully revoked for the spender!",
        key: "success",
      });
      console.log("Revoked Allowance Tx Hash", tx.hash);
      setAllowances((prev) =>
        prev.filter(
          (allowance) => allowance.token.symbol !== allowanceInfo.token.symbol
        )
      );
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        console.log("Transaction rejected by user");

        api.destroy(key);
        api.error({
          message: "Transaction rejected",
          description: "The transaction was rejected by the user!",
          key: "error-rejected",
        });
      } else {
        console.error("Error revoking allowance", error);
        api.error({
          message: "Error revoking allowance",
          description:
            "Something went wrong while revoking the allowance. Please try again.",
          key: "error-key",
        });
      }
      throw error;
    } finally {
      setRevokeLoading((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  }

  useEffect(() => {
    if (account && provider && signer && chainId) {
      const fetchAllowances = async () => {
        setLoading(true);
        // const scanner = new AllowanceScanner(provider);
        // const options = {
        //   blockRange: 100000,
        // };
        // const allowanceList = await scanner.scanWalletAllowances(
        //   account,
        //   options
        // );
        const scanner = new AllowanceScannerEthers(provider);
        const allowanceList = await scanner.scanWalletAllowances(account);
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
      key: "token",
      dataIndex: "token",
      title: () => (
        <img
          src={getNetworkImage(chainId ?? 1)}
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
            onClick={async () => {
              await revokeAllowance(record, signer!);
            }}
          >
            Revoke
          </Button>
        </Space>
      ),
    },
  ];

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
        {loading && <Spin />}
        {allowances.length === 0 && !loading && <p>No allowances found</p>}
        {!loading && (
          <Table
            columns={columns}
            dataSource={allowances}
            rowKey={"txHash"}
          ></Table>
        )}
      </div>
    </>
  );
};
