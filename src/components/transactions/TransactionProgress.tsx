"use client";

import {
  Check,
  X,
} from "lucide-react";

import { Transaction } from "@/types/transaction";
import { useMessages } from "@/i18n/useMessages";

type ProgressState =
  | "complete"
  | "current"
  | "pending"
  | "blocked";

type ProgressStep = {
  title: string;
  description: string;
  state: ProgressState;
};

type TransactionProgressProps = {
  transaction: Transaction;
};

export default function TransactionProgress({
  transaction,
}: TransactionProgressProps) {
  const messages = useMessages();

  const sellerConfirmed = Boolean(
    transaction.seller_confirmed
  );

  const buyerConfirmed = Boolean(
    transaction.buyer_confirmed
  );

  const somebodyConfirmed =
    sellerConfirmed || buyerConfirmed;

  const bothConfirmed =
    sellerConfirmed && buyerConfirmed;

  const isCompleted =
    transaction.status === "completed";

  const isCancelled =
    transaction.status === "cancelled";

  const isDisputed =
    transaction.status === "disputed";

  const isBlocked =
    isCancelled || isDisputed;

  const steps: ProgressStep[] = [
    {
      title:
        messages.transactionDetails.steps.auctionWon.title,
      description:
        messages.transactionDetails.steps.auctionWon.completed,
      state: "complete",
    },
    {
      title:
        messages.transactionDetails.steps.deliveryPayment.title,
      description: isCompleted
        ? messages.transactionDetails.steps.deliveryPayment.completed
        : somebodyConfirmed
          ? messages.transactionDetails.steps.deliveryPayment.partiallyConfirmed
          : messages.transactionDetails.steps.deliveryPayment.pending,
      state:
        isCompleted || somebodyConfirmed
          ? "complete"
          : isBlocked
            ? "blocked"
            : "current",
    },
    {
      title:
        messages.transactionDetails.steps.confirmations.title,
      description:
        isCompleted || bothConfirmed
          ? messages.transactionDetails.steps.confirmations.completed
          : somebodyConfirmed
            ? messages.transactionDetails.steps.confirmations.waitingOther
            : messages.transactionDetails.steps.confirmations.pending,
      state:
        isCompleted || bothConfirmed
          ? "complete"
          : isBlocked
            ? "blocked"
            : somebodyConfirmed
              ? "current"
              : "pending",
    },
    {
      title:
        messages.transactionDetails.steps.finished.title,
      description: isCompleted
        ? messages.transactionDetails.steps.finished.completed
        : isDisputed
          ? messages.transactionDetails.steps.finished.disputed
          : isCancelled
            ? messages.transactionDetails.steps.finished.cancelled
            : messages.transactionDetails.steps.finished.pending,
      state: isCompleted
        ? "complete"
        : isBlocked
          ? "blocked"
          : bothConfirmed
            ? "current"
            : "pending",
    },
  ];

  function getStepClasses(
    state: ProgressState
  ) {
    if (state === "complete") {
      return {
        card:
          "border-emerald-200 bg-emerald-50",
        circle:
          "bg-emerald-600 text-white",
        title:
          "text-emerald-950",
        description:
          "text-emerald-700",
      };
    }

    if (state === "current") {
      return {
        card:
          "border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100",
        circle:
          "bg-indigo-600 text-white",
        title:
          "text-indigo-950",
        description:
          "text-indigo-700",
      };
    }

    if (state === "blocked") {
      return {
        card:
          "border-red-200 bg-red-50",
        circle:
          "bg-red-600 text-white",
        title:
          "text-red-950",
        description:
          "text-red-700",
      };
    }

    return {
      card:
        "border-slate-200 bg-white",
      circle:
        "bg-slate-200 text-slate-500",
      title:
        "text-slate-700",
      description:
        "text-slate-500",
    };
  }

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          {messages.transactionDetails.progressLabel}
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-950">
          {messages.transactionDetails.progressTitle}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {messages.transactionDetails.progressDescription}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => {
          const classes =
            getStepClasses(step.state);

          return (
            <article
              key={step.title}
              className={`rounded-2xl border p-4 ${classes.card}`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${classes.circle}`}
              >
                {step.state === "complete" ? (
                  <Check size={18} />
                ) : step.state === "blocked" ? (
                  <X size={18} />
                ) : (
                  index + 1
                )}
              </div>

              <h3
                className={`mt-4 font-black ${classes.title}`}
              >
                {step.title}
              </h3>

              <p
                className={`mt-2 text-sm leading-5 ${classes.description}`}
              >
                {step.description}
              </p>

              {step.state === "current" && (
                <span className="mt-3 inline-flex rounded-full bg-indigo-200 px-3 py-1 text-xs font-bold text-indigo-800">
                  {messages.transactionDetails.currentStep}
                </span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}