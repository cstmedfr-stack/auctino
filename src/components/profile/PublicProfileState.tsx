"use client";

import {
  AlertTriangle,
  Loader2,
  UserX,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type PublicProfileStateProps =
  | {
      type: "loading";
    }
  | {
      type: "not-found";
      message?: string;
    }
  | {
      type: "error";
      message: string;
    };

export default function PublicProfileState(
  props: PublicProfileStateProps
) {
  const messages = useMessages();
  const t = messages.publicProfile;

  if (props.type === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Loader2
                size={28}
                className="animate-spin"
              />
            </div>

            <h1 className="text-xl font-bold text-slate-950">
              {t.loadingTitle}
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              {t.loadingDescription}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (props.type === "error") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-700">
            <AlertTriangle size={28} />
          </div>

          <h1 className="text-xl font-bold text-red-900">
            {t.errorTitle}
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-red-700">
            {props.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <UserX size={28} />
        </div>

        <h1 className="text-xl font-bold text-slate-950">
          {t.notFoundTitle}
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {props.message ||
            t.notFoundDescription}
        </p>
      </div>
    </main>
  );
}