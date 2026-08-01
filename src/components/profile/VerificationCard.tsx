"use client";

import {
  CheckCircle2,
  IdCard,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type VerificationCardProps = {
  phoneVerified: boolean;
  identityVerified: boolean;
};

export default function VerificationCard({
  phoneVerified,
  identityVerified,
}: VerificationCardProps) {
  const messages = useMessages();
  const t = messages.publicProfile;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <ShieldCheck size={22} />
        </div>

        <h2 className="text-xl font-bold text-slate-950">
          {t.verificationsTitle}
        </h2>
      </div>

      <div className="space-y-3">
        <VerificationRow
          icon={<Phone size={18} />}
          label={t.phone}
          verified={phoneVerified}
          verifiedLabel={t.verified}
          notVerifiedLabel={t.notVerified}
        />

        <VerificationRow
          icon={<IdCard size={18} />}
          label={t.identity}
          verified={identityVerified}
          verifiedLabel={t.verifiedFemale}
          notVerifiedLabel={t.notVerifiedFemale}
        />
      </div>
    </section>
  );
}

function VerificationRow({
  icon,
  label,
  verified,
  verifiedLabel,
  notVerifiedLabel,
}: {
  icon: React.ReactNode;
  label: string;
  verified: boolean;
  verifiedLabel: string;
  notVerifiedLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="inline-flex items-center gap-2 font-medium text-slate-700">
        <span className="text-slate-500">
          {icon}
        </span>
        {label}
      </span>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
          verified
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {verified ? (
          <CheckCircle2 size={14} />
        ) : (
          <XCircle size={14} />
        )}

        {verified
          ? verifiedLabel
          : notVerifiedLabel}
      </span>
    </div>
  );
}