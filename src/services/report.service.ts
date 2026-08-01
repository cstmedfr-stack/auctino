import {
  dismissProductReport,
  getAdminProductReports,
  removeReportedProduct,
} from "@/lib/admin";

export async function getProductReportsForAdmin() {
  return await getAdminProductReports();
}

export async function dismissReport({
  reportId,
  reason,
}: {
  reportId: string;
  reason: string;
}) {
  return await dismissProductReport({
    reportId,
    reason,
  });
}

export async function removeProductFromReport({
  reportId,
  reason,
}: {
  reportId: string;
  reason: string;
}) {
  return await removeReportedProduct({
    reportId,
    reason,
  });
}