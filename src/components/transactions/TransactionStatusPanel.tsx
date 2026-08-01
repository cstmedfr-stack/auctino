"use client";

import { FormEvent } from "react";
import {
  Loader2,
  MessageCircle,
} from "lucide-react";

import { Transaction } from "@/types/transaction";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedDateTime } from "@/i18n/format";

type TransactionAction =
  | "cancel"
  | "dispute"
  | null;

type TransactionStatusPanelProps = {
  transaction: Transaction;

  confirming: boolean;
  actionMode: TransactionAction;
  actionReason: string;
  actionLoading: boolean;
  actionError: string;

  isParticipant: boolean;
  canConfirm: boolean;
  currentUserAlreadyConfirmed: boolean;
  canCancel: boolean;
  canDispute: boolean;

  onConfirm: () => void;
  onOpenAction: (
    mode: "cancel" | "dispute"
  ) => void;
  onCloseAction: () => void;
  onActionReasonChange: (
    value: string
  ) => void;
  onSubmitAction: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  onContact: () => void;
};

export default function TransactionStatusPanel({
  transaction,
  confirming,
  actionMode,
  actionReason,
  actionLoading,
  actionError,
  isParticipant,
  canConfirm,
  currentUserAlreadyConfirmed,
  canCancel,
  canDispute,
  onConfirm,
  onOpenAction,
  onCloseAction,
  onActionReasonChange,
  onSubmitAction,
  onContact,
}: TransactionStatusPanelProps) {
  const messages = useMessages();
  const { locale } = useLocale();

  function getStatusLabel(
    status: Transaction["status"]
  ) {
    switch (status) {
      case "pending_confirmation":
        return messages.transaction.status
          .pending_confirmation;

      case "completed":
        return messages.transaction.status.completed;

      case "cancelled":
        return messages.transaction.status.cancelled;

      case "disputed":
        return messages.transaction.status.disputed;

      default:
        return status;
    }
  }

  function getStatusStyle(
    status: Transaction["status"]
  ) {
    if (status === "completed") {
      return "bg-emerald-600";
    }

    if (status === "cancelled") {
      return "bg-red-600";
    }

    if (status === "disputed") {
      return "bg-amber-500";
    }

    return "bg-slate-950";
  }

  function getActorLabel(
    userId: string | null | undefined
  ) {
    if (!userId) {
      return messages.transactionDetails.actor.user;
    }

    if (userId === transaction.seller_id) {
      return messages.transactionDetails.actor.seller;
    }

    if (userId === transaction.buyer_id) {
      return messages.transactionDetails.actor.buyer;
    }

    return messages.transactionDetails.actor.user;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">
        {messages.transactionDetails.statusTitle}
      </h2>

      <div
        className={`mt-4 rounded-2xl p-5 text-white ${getStatusStyle(
          transaction.status
        )}`}
      >
        <p className="text-sm font-semibold text-white/70">
          {messages.transactionDetails.status}
        </p>

        <p className="mt-1 text-2xl font-black">
          {getStatusLabel(transaction.status)}
        </p>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="font-semibold text-slate-500">
            {messages.transactionDetails.createdAt}
          </p>

          <p className="mt-1 text-slate-900">
            {formatLocalizedDateTime(
              transaction.created_at,
              locale
            )}
          </p>
        </div>

        {transaction.completed_at && (
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-700">
              {messages.transactionDetails.completedAt}
            </p>

            <p className="mt-1 text-emerald-900">
              {formatLocalizedDateTime(
                transaction.completed_at,
                locale
              )}
            </p>
          </div>
        )}

        {transaction.status === "cancelled" && (
          <div className="rounded-2xl bg-red-50 p-4">
            <p className="font-bold text-red-800">
              {
                messages.transactionDetails.stateDetails
                  .cancelledTitle
              }
            </p>

            <p className="mt-1 text-red-700">
              {
                messages.transactionDetails.stateDetails
                  .cancelledBy
              }
              :{" "}
              {getActorLabel(
                transaction.cancelled_by
              )}
            </p>

            {transaction.cancelled_at && (
              <p className="mt-1 text-red-700">
                {
                  messages.transactionDetails
                    .stateDetails.date
                }
                :{" "}
                {formatLocalizedDateTime(
                  transaction.cancelled_at,
                  locale
                )}
              </p>
            )}

            {transaction.cancellation_reason && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-red-900">
                {
                  messages.transactionDetails
                    .stateDetails.reason
                }
                : {transaction.cancellation_reason}
              </p>
            )}
          </div>
        )}

        {transaction.status === "disputed" && (
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="font-bold text-amber-900">
              {
                messages.transactionDetails.stateDetails
                  .disputedTitle
              }
            </p>

            <p className="mt-1 text-amber-800">
              {
                messages.transactionDetails.stateDetails
                  .disputedBy
              }
              :{" "}
              {getActorLabel(
                transaction.disputed_by
              )}
            </p>

            {transaction.disputed_at && (
              <p className="mt-1 text-amber-800">
                {
                  messages.transactionDetails
                    .stateDetails.date
                }
                :{" "}
                {formatLocalizedDateTime(
                  transaction.disputed_at,
                  locale
                )}
              </p>
            )}

            {transaction.dispute_reason && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-amber-950">
                {
                  messages.transactionDetails
                    .stateDetails.reason
                }
                : {transaction.dispute_reason}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {canConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={
              confirming || actionLoading
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirming && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}

            {confirming
              ? messages.transactionDetails.actions
                  .confirming
              : messages.transactionDetails.actions
                  .confirm}
          </button>
        )}

        {currentUserAlreadyConfirmed &&
          transaction.status ===
            "pending_confirmation" && (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
              {
                messages.transactionDetails.messages
                  .alreadyConfirmed
              }
            </div>
          )}

        {!isParticipant && (
          <div className="rounded-2xl bg-yellow-50 p-4 text-sm font-medium text-yellow-800">
            {
              messages.transactionDetails.messages
                .participantOnly
            }
          </div>
        )}

        {transaction.status === "completed" && (
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {
              messages.transactionDetails.messages
                .completed
            }
          </div>
        )}

        {transaction.status === "cancelled" && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {
              messages.transactionDetails.messages
                .cancelled
            }
          </div>
        )}

        {transaction.status === "disputed" && (
          <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
            {
              messages.transactionDetails.messages
                .disputed
            }
          </div>
        )}

        {canCancel && !actionMode && (
          <button
            type="button"
            onClick={() =>
              onOpenAction("cancel")
            }
            className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 transition hover:bg-red-100"
          >
            {
              messages.transactionDetails.actions
                .cancel
            }
          </button>
        )}

        {canDispute && !actionMode && (
          <button
            type="button"
            onClick={() =>
              onOpenAction("dispute")
            }
            className="w-full rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 font-bold text-amber-900 transition hover:bg-amber-100"
          >
            {
              messages.transactionDetails.actions
                .dispute
            }
          </button>
        )}

        {actionMode && (
          <form
            onSubmit={onSubmitAction}
            className={`rounded-2xl border p-4 ${
              actionMode === "cancel"
                ? "border-red-200 bg-red-50"
                : "border-amber-300 bg-amber-50"
            }`}
          >
            <label
              htmlFor="transaction-action-reason"
              className="font-bold text-slate-900"
            >
              {actionMode === "cancel"
                ? messages.transactionDetails
                    .actionForm.cancelReason
                : messages.transactionDetails
                    .actionForm.disputeReason}
            </label>

            <textarea
              id="transaction-action-reason"
              value={actionReason}
              onChange={(event) =>
                onActionReasonChange(
                  event.target.value
                )
              }
              rows={4}
              minLength={5}
              maxLength={1000}
              required
              placeholder={
                actionMode === "cancel"
                  ? messages.transactionDetails
                      .actionForm.cancelPlaceholder
                  : messages.transactionDetails
                      .actionForm.disputePlaceholder
              }
              className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
            />

            <p className="mt-1 text-right text-xs text-slate-500">
              {actionReason.length}/1000
            </p>

            {actionError && (
              <div className="mt-3 rounded-xl bg-white p-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={actionLoading}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  actionMode === "cancel"
                    ? "bg-red-600"
                    : "bg-amber-600"
                }`}
              >
                {actionLoading && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                {actionLoading
                  ? messages.transactionDetails
                      .actionForm.processing
                  : actionMode === "cancel"
                    ? messages.transactionDetails
                        .actionForm
                        .confirmCancellation
                    : messages.transactionDetails
                        .actionForm.openDispute}
              </button>

              <button
                type="button"
                onClick={onCloseAction}
                disabled={actionLoading}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {
                  messages.transactionDetails.actionForm
                    .close
                }
              </button>
            </div>
          </form>
        )}

        {isParticipant && (
          <button
            type="button"
            onClick={onContact}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-50"
          >
            <MessageCircle size={18} />
            {
              messages.transactionDetails.actions
                .contact
            }
          </button>
        )}
      </div>
    </section>
  );
}