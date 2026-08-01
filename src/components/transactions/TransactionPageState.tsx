"use client";

import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  SearchX,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type TransactionPageStateProps =
  | {
      type: "loading";
    }
  | {
      type: "error";
      message: string;
    }
  | {
      type: "not-found";
    };

export default function TransactionPageState(
  props: TransactionPageStateProps
) {
  const router = useRouter();
  const messages = useMessages();

  if (props.type === "loading") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Loader2
                size={28}
                className="animate-spin"
              />
            </div>

            <h1 className="text-xl font-bold text-slate-950">
              {
                messages.transactionDetails
                  .loading
              }
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (props.type === "error") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            {
              messages.transactionDetails
                .navigation.back
            }
          </button>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-700">
              <AlertTriangle size={24} />
            </div>

            <p className="text-sm leading-6 text-red-700">
              {props.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <SearchX size={28} />
        </div>

        <h1 className="text-xl font-bold text-slate-950">
          {
            messages.transactionDetails
              .notFound
          }
        </h1>
      </div>
    </main>
  );
}