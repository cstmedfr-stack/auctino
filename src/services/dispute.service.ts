import {
  getAdminDisputes,
  resolveTransactionDispute,
} from "@/lib/transactions";

export async function getDisputesForAdmin() {
  return await getAdminDisputes();
}

export async function resolveAdminDispute({
  transactionId,
  decision,
  reason,
}: {
  transactionId: string;
  decision: "completed" | "cancelled";
  reason: string;
}) {
  return await resolveTransactionDispute({
    transactionId,
    decision,
    reason,
  });
}