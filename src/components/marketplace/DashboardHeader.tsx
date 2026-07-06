type DashboardHeaderProps = {
  totalResults: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
};

export default function DashboardHeader({
  totalResults,
  hasActiveFilters,
  onResetFilters,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Marketplace
        </p>

        <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
          Toate licitațiile
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          {totalResults} rezultate găsite
        </p>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onResetFilters}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Resetează filtrele
        </button>
      )}
    </div>
  );
}