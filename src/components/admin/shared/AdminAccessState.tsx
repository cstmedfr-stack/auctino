"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Loader2,
  ShieldAlert,
} from "lucide-react";

type AdminAccessStateProps =
  | {
      type: "loading";
      title: string;
      description: string;
    }
  | {
      type: "accessDenied";
      eyebrow: string;
      title: string;
      description: string;
      backHome: string;
    }
  | {
      type: "error";
      title: string;
      message: string;
      retry: string;
      onRetry: () => void;
    };

export default function AdminAccessState(
  props: AdminAccessStateProps
) {
  if (props.type === "loading") {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Loader2
            size={28}
            className="animate-spin"
          />
        </div>

        <h1 className="text-xl font-bold text-slate-950">
          {props.title}
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {props.description}
        </p>
      </section>
    );
  }

  if (props.type === "accessDenied") {
    return (
      <section className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
        <p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-red-600">
          <ShieldAlert size={17} />
          {props.eyebrow}
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          {props.title}
        </h1>

        <p className="mt-3 text-slate-600">
          {props.description}
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
        >
          {props.backHome}
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-700">
        <AlertTriangle size={28} />
      </div>

      <h1 className="text-xl font-bold text-red-950">
        {props.title}
      </h1>

      <p className="mt-2 text-sm leading-6 text-red-700">
        {props.message}
      </p>

      <button
        type="button"
        onClick={props.onRetry}
        className="mt-5 rounded-2xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
      >
        {props.retry}
      </button>
    </section>
  );
}