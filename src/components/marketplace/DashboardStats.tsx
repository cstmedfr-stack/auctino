type DashboardStatsProps = {
  totalProducts: number;
};

export default function DashboardStats({
  totalProducts,
}: DashboardStatsProps) {
  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Produse active</p>

        <p className="mt-2 text-3xl font-bold text-slate-900">
          {totalProducts}
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Marketplace</p>

        <p className="mt-2 text-3xl font-bold text-orange-500">
          LIVE
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Licitații în desfășurare
        </p>

        <p className="mt-2 text-3xl font-bold text-green-600">
          {totalProducts}
        </p>
      </div>
    </div>
  );
}