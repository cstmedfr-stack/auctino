"use client";

import {
  CheckCircle2,
  Circle,
  ShieldCheck,
} from "lucide-react";
import {
  TrustScoreBreakdownItem,
  TrustScoreLevel,
} from "@/utils/trustScore";
import { useMessages } from "@/i18n/useMessages";

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
  const messages = useMessages();
  const t = messages.publicProfile;

  const progress = Math.min(
    Math.max(score, 0),
    100
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.trustScore}
          </p>

          <h2 className="mt-1 text-4xl font-bold text-slate-950">
            {score}
            <span className="text-xl text-slate-400">
              {" "}
              {t.scoreOutOf}
            </span>
          </h2>

          <p className="mt-1 font-semibold text-emerald-600">
            {level}
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShieldCheck size={28} />
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
            className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm"
          >
            <span className="inline-flex items-center gap-2 text-slate-700">
              {item.achieved ? (
                <CheckCircle2
                  size={17}
                  className="text-emerald-600"
                />
              ) : (
                <Circle
                  size={17}
                  className="text-slate-400"
                />
              )}

              {item.label}
            </span>

            <span className="font-semibold text-slate-950">
              +{item.points}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}