import { supabase } from "@/lib/supabase";

export async function getAdminUsers() {
  const { data, error } = await supabase.rpc(
    "get_admin_users"
  );

  return {
    data,
    error,
  };
}

export async function setUserAccountStatus({
  userId,
  status,
  reason,
}: {
  userId: string;
  status: "active" | "suspended";
  reason?: string;
}) {
  const { data, error } = await supabase.rpc(
    "set_user_account_status",
    {
      p_user_id: userId,
      p_status: status,
      p_reason: reason ?? null,
    }
  );

  return {
    data: Array.isArray(data)
      ? data[0] ?? null
      : data,
    error,
  };
}
export async function getAdminProductReports() {
  const { data, error } = await supabase.rpc(
    "get_admin_product_reports"
  );

  return {
    data,
    error,
  };
}

export async function dismissProductReport({
  reportId,
  reason,
}: {
  reportId: string;
  reason: string;
}) {
  const { data, error } = await supabase.rpc(
    "dismiss_product_report",
    {
      p_report_id: reportId,
      p_reason: reason,
    }
  );

  return {
    data: Array.isArray(data)
      ? data[0] ?? null
      : data,
    error,
  };
}

export async function removeReportedProduct({
  reportId,
  reason,
}: {
  reportId: string;
  reason: string;
}) {
  const { data, error } = await supabase.rpc(
    "remove_reported_product",
    {
      p_report_id: reportId,
      p_reason: reason,
    }
  );

  return {
    data: Array.isArray(data)
      ? data[0] ?? null
      : data,
    error,
  };
}