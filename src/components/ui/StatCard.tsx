type StatCardProps = {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
};

export default function StatCard({
  icon,
  value,
  label,
  color = "text-slate-900",
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="text-4xl">
        {icon}
      </div>

      <p className={`mt-6 text-4xl font-bold ${color}`}>
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}