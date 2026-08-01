import type {
  AccountStatus,
  AdminUser,
} from "@/types/admin-user";

export type AdminUserFilter =
  | "all"
  | "active"
  | "suspended"
  | "admin";

export function filterAdminUsers({
  users,
  search,
  filter,
}: {
  users: AdminUser[];
  search: string;
  filter: AdminUserFilter;
}) {
  const normalizedSearch =
    search.trim().toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      user.full_name
        ?.toLowerCase()
        .includes(normalizedSearch) ||
      user.email
        ?.toLowerCase()
        .includes(normalizedSearch);

    if (!matchesSearch) {
      return false;
    }

    if (filter === "active") {
      return user.account_status === "active";
    }

    if (filter === "suspended") {
      return user.account_status === "suspended";
    }

    if (filter === "admin") {
      return user.role === "admin";
    }

    return true;
  });
}

export function getAdminUserStats(
  users: AdminUser[]
) {
  return {
    total: users.length,
    suspended: users.filter(
      (user) =>
        user.account_status === "suspended"
    ).length,
    admins: users.filter(
      (user) => user.role === "admin"
    ).length,
  };
}

export function getAdminUserStatusLabel(
  status: AccountStatus,
  labels: {
    active: string;
    suspended: string;
  }
) {
  return status === "active"
    ? labels.active
    : labels.suspended;
}

export function formatAdminRating(
  rating: number | string | null,
  fallback: string
) {
  if (
    rating === null ||
    rating === undefined
  ) {
    return fallback;
  }

  return `${Number(rating).toFixed(1)} / 5`;
}

export function getAdminUserDisplayName(
  user: AdminUser,
  fallback: string
) {
  return (
    user.full_name ||
    user.email ||
    fallback
  );
}