"use client";

type FilterSidebarProps = {
  children: React.ReactNode;
};

export default function FilterSidebar({
  children,
}: FilterSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-bold text-gray-900">
          Filtre
        </h3>

        <div className="space-y-4">
          {children}
        </div>
      </div>
    </aside>
  );
}