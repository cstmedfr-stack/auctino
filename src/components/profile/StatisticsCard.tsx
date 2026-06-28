import StatCard from "../ui/StatCard";

type StatisticsCardProps = {
  activeProducts: number;
  soldProducts: number;
  wonAuctions: number;
  rating: number;
};

export default function StatisticsCard({
  activeProducts,
  soldProducts,
  wonAuctions,
  rating,
}: StatisticsCardProps) {
  return (
    <div>
      <h2 className="mb-5 text-2xl font-bold text-slate-900">
        Statistici
      </h2>

      <div className="grid grid-cols-2 gap-5">
        <StatCard
          icon="📦"
          value={activeProducts}
          label="Produse active"
        />

        <StatCard
          icon="🏆"
          value={soldProducts}
          label="Produse vândute"
        />

        <StatCard
          icon="💰"
          value={wonAuctions}
          label="Licitații câștigate"
        />

        <StatCard
          icon="⭐"
          value={(rating ?? 0).toFixed(1)}
          label="Rating"
          color="text-amber-500"
        />
      </div>
    </div>
  );
}