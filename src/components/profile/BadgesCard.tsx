import { Badge } from "@/types/badge";

type BadgesCardProps = {
  badges: Badge[];
};

export default function BadgesCard({
  badges,
}: BadgesCardProps) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-2xl font-bold text-slate-900">
        Badge-uri
      </h2>

      {badges.length === 0 ? (
        <p className="text-sm text-slate-500">
          Acest utilizator nu are încă badge-uri.
        </p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-2xl px-4 py-3 ${badge.color}`}
            >
              <div className="text-2xl">
                {badge.icon}
              </div>

              <div className="mt-2 font-semibold">
                {badge.title}
              </div>

              <div className="text-sm opacity-80">
                {badge.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}