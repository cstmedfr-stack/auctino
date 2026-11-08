"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

const CONTACT_EMAIL = "contact@vandivo.ro";

export default function ContactPage() {
  const messages = useMessages();
  const t = messages.contactPage;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-indigo-700"
        >
          <ArrowLeft size={17} />
          {t.backHome}
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-slate-950 to-indigo-950 p-7 text-white sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-indigo-100">
              <MessageCircle size={16} />
              {t.eyebrow}
            </div>

            <h1 className="mt-6 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              {t.title}
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
              {t.description}
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-2 lg:p-10">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                <Mail size={23} />
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-950">
                {t.emailTitle}
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {t.emailDescription}
              </p>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
              >
                <Mail size={17} />
                {CONTACT_EMAIL}
              </a>
            </article>

            <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700">
                <ShieldAlert size={23} />
              </div>

              <h2 className="mt-5 text-xl font-black text-amber-950">
                {t.reportTitle}
              </h2>

              <p className="mt-2 text-sm leading-7 text-amber-800">
                {t.reportDescription}
              </p>

              <Link
                href="/safety"
                className="mt-5 inline-flex items-center justify-center rounded-2xl border border-amber-300 bg-white px-5 py-3 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
              >
                {t.safetyLink}
              </Link>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}