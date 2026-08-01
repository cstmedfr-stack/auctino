"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
} from "lucide-react";

type LegalSection = {
  readonly title: string;
  readonly body: readonly string[];
};

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
  backLabel: string;
};

export default function LegalPageShell({
  eyebrow,
  title,
  description,
  lastUpdatedLabel,
  lastUpdated,
  sections,
  backLabel,
}: LegalPageShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-indigo-700"
        >
          <ArrowLeft size={17} />
          {backLabel}
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-br from-slate-950 to-indigo-950 p-7 text-white sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-indigo-100">
              <ShieldCheck size={16} />
              {eyebrow}
            </div>

            <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
              {description}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-100">
              <FileText size={17} />
              {lastUpdatedLabel}: {lastUpdated}
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-7 lg:p-10">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2 className="text-xl font-black text-slate-950">
                  {section.title}
                </h2>

                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-slate-600"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}