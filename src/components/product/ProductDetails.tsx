type ProductDetailsProps = {
  description: string | null;
  category: string | null;
  condition: string | null;
  location: string | null;
  createdAt: string;
  status: string | null;
};

export default function ProductDetails({
  description,
  category,
  condition,
  location,
  createdAt,
  status,
}: ProductDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900">📝 Descriere</h2>
        <p className="leading-8 text-slate-600">
          {description || "Nu există descriere pentru acest produs."}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="mb-5 text-xl font-bold text-slate-900">📋 Detalii produs</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label="Categorie" value={category || "-"} />
          <Detail label="Stare" value={condition || "-"} />
          <Detail label="Locație" value={location || "-"} />
          <Detail label="Publicat" value={new Date(createdAt).toLocaleDateString("ro-RO")} />
          <Detail
            label="Status"
            value={status === "ended" ? "Licitație încheiată" : "Licitație activă"}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}