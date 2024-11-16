import { Contract, JsonRpcSigner } from "ethers";
import { NotificationInstance } from "antd/es/notification/interface";
import { AllowanceInfo } from "../../types/web3";
import { Spin } from "antd";

export class AllowanceService {
  constructor(private readonly api: NotificationInstance) {}

  async revokeAllowance(
    allowanceInfo: AllowanceInfo,
    signer: JsonRpcSigner
  ): Promise<string> {
    const key = allowanceInfo.txHash;

    try {
      const tokenContract = new Contract(
        allowanceInfo.token.address,
        ["function approve(address spender, uint256 amount) returns (bool)"],
        signer
      );

      this.api.destroy();
      const tx = await tokenContract.approve(allowanceInfo.spender, 0);

      this.api.info({
        message: "Waiting for confirmation",
        description:
          "Revoking allowance for the spender! Be patient and wait for the transaction to be confirmed.",
        duration: 0,
        icon: <Spin />,
        key,
      });

      await tx.wait();

      this.api.destroy(key);
      this.api.success({
        message: "Allowance Revoked",
        duration: 4.5,
        description:
          "The allowance has been successfully revoked for the spender!",
        key: "success",
      });

      return tx.hash;
    } catch (error: any) {
      if (error.code === "ACTION_REJECTED") {
        this.api.destroy(key);
        this.api.error({
          message: "Transaction rejected",
          description: "The transaction was rejected by the user!",
          key: "error-rejected",
        });
      } else {
        this.api.error({
          message: "Error revoking allowance",
          description:
            "Something went wrong while revoking the allowance. Please try again.",
          key: "error-key",
        });
      }
      throw error;
    }
  }
}
