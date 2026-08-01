"use client";

import type { ReactNode } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type AuthPageShellProps = {
  children: ReactNode;
};

export default function AuthPageShell({
  children,
}: AuthPageShellProps) {
  const messages = useMessages();
  const t = messages.auth.shell;

  const benefits = [
    t.benefitOne,
    t.benefitTwo,
    t.benefitThree,
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[78vh] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section className="hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm lg:block">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-indigo-200">
            <ShieldCheck size={28} />
          </div>

          <p className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-200">
            <Sparkles size={16} />
            Auctino
          </p>

          <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight">
            {t.trustTitle}
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            {t.trustDescription}
          </p>

          <div className="mt-8 space-y-3">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100"
              >
                <CheckCircle2
                  size={18}
                  className="shrink-0 text-indigo-200"
                />
                {benefit}
              </div>
            ))}
          </div>
        </section>

        <section className="flex justify-center">
          {children}
        </section>
      </div>
    </main>
  );
}