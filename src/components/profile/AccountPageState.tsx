"use client";

import {
  AlertTriangle,
  Loader2,
  UserRound,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type AccountPageStateProps =
  | {
      type: "loading";
      mode?: "overview" | "edit";
    }
  | {
      type: "error";
      message: string;
      onRetry: () => void;
    }
  | {
      type: "notFound";
    };

export default function AccountPageState(
  props: AccountPageStateProps
) {
  const messages = useMessages();
  const overview =
    messages.accountProfile.overview;
  const edit = messages.accountProfile.edit;

  if (props.type === "loading") {
    const title =
      props.mode === "edit"
        ? edit.loadingTitle
        : overview.loadingTitle;

    const description =
      props.mode === "edit"
        ? edit.loadingDescription
        : overview.loadingDescription;

    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Loader2
            size={28}
            className="animate-spin"
          />
        </div>

        <h2 className="text-xl font-bold text-slate-950">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </section>
    );
  }

  if (props.type === "error") {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-10 shadow-sm">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-700">
          <AlertTriangle size={28} />
        </div>

        <h2 className="text-xl font-bold text-red-950">
          {overview.errorTitle}
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-700">
          {props.message}
        </p>

        <button
          type="button"
          onClick={props.onRetry}
          className="mt-5 rounded-2xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800"
        >
          {overview.retry}
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        <UserRound size={28} />
      </div>

      <h2 className="text-xl font-bold text-slate-950">
        {overview.notFoundTitle}
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {overview.notFoundDescription}
      </p>
    </section>
  );
}