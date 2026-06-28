import { TrustScoreBreakdownItem, TrustScoreLevel } from "@/utils/trustScore";

type TrustScoreCardProps = {
  score: number;
  level: TrustScoreLevel;
  breakdown: TrustScoreBreakdownItem[];
};

export default function TrustScoreCard({
  score,
  level,
  breakdown,
}: TrustScoreCardProps) {
  const progress = Math.min(score, 100);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Trust Score
          </p>

          <h2 className="mt-1 text-4xl font-bold">
            {score}
            <span className="text-xl text-slate-400"> /100</span>
          </h2>

          <p className="mt-1 font-semibold text-emerald-600">
            {level}
          </p>
        </div>

        <div className="text-5xl">
            🛡️
        </div>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-6 space-y-3">
        {breakdown.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span>
              {item.achieved ? "✅" : "⭕"} {item.label}
            </span>

            <span className="font-semibold">
              +{item.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}