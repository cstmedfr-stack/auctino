"use client";

import {
  FormEvent,
  Dispatch,
  SetStateAction,
} from "react";
import {
  CheckCircle2,
  Loader2,
  Star,
} from "lucide-react";

import { Review } from "@/types/review";
import { useMessages } from "@/i18n/useMessages";
import { formatMessage } from "@/utils/formatMessage";

type TransactionReviewSectionProps = {
  isSeller: boolean;
  existingReview: Review | null;

  rating: number;
  communication: number;
  accuracy: number;
  comment: string;

  reviewLoading: boolean;
  reviewError: string;
  reviewSuccess: string;

  setRating: Dispatch<SetStateAction<number>>;
  setCommunication: Dispatch<SetStateAction<number>>;
  setAccuracy: Dispatch<SetStateAction<number>>;
  setComment: Dispatch<SetStateAction<string>>;

  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
};

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  readonly?: boolean;
}) {
  const messages = useMessages();
  const t = messages.reviewsTrust;

  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;

        const ariaLabel =
          star === 1
            ? t.starLabelSingular
            : formatMessage(t.starLabel, {
                count: star,
              });

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => {
              if (!readonly) {
                onChange(star);
              }
            }}
            className={`rounded-xl p-1 transition disabled:cursor-default ${
              active
                ? "text-yellow-500"
                : "text-slate-300 hover:text-yellow-400"
            }`}
            aria-label={ariaLabel}
          >
            <Star
              size={30}
              className={
                active
                  ? "fill-yellow-400"
                  : ""
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default function TransactionReviewSection({
  isSeller,
  existingReview,
  rating,
  communication,
  accuracy,
  comment,
  reviewLoading,
  reviewError,
  reviewSuccess,
  setRating,
  setCommunication,
  setAccuracy,
  setComment,
  onSubmit,
}: TransactionReviewSectionProps) {
  const messages = useMessages();
  const t =
    messages.transactionDetails.review;

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
          {t.title}
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-950">
          {t.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {isSeller
            ? t.sellerDescription
            : t.buyerDescription}
        </p>
      </div>

      {existingReview ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-2 font-bold text-emerald-800">
            <CheckCircle2 size={20} />
            {t.alreadySubmitted}
          </div>

          <div className="mt-4">
            <StarRating
              value={existingReview.rating}
              onChange={() => undefined}
              readonly
            />
          </div>

          {existingReview.comment && (
            <blockquote className="mt-4 border-l-4 border-emerald-300 pl-4 text-sm leading-6 text-emerald-950">
              “{existingReview.comment}”
            </blockquote>
          )}
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="space-y-6"
        >
          <ReviewRatingField
            label={t.generalRating}
            value={rating}
            onChange={setRating}
          />

          <ReviewRatingField
            label={t.communication}
            value={communication}
            onChange={setCommunication}
          />

          <ReviewRatingField
            label={t.accuracy}
            value={accuracy}
            onChange={setAccuracy}
          />

          <div>
            <label
              htmlFor="review-comment"
              className="font-semibold text-slate-900"
            >
              {t.comment}
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              rows={4}
              maxLength={1000}
              placeholder={t.placeholder}
              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
            />

            <p className="mt-1 text-right text-xs text-slate-500">
              {comment.length}/1000
            </p>
          </div>

          {reviewError && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {reviewError}
            </div>
          )}

          {reviewSuccess && (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
              {reviewSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={reviewLoading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reviewLoading && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}

            {reviewLoading
              ? t.submitting
              : t.submit}
          </button>
        </form>
      )}
    </section>
  );
}

function ReviewRatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div>
      <p className="mb-2 font-semibold text-slate-900">
        {label}
      </p>

      <StarRating
        value={value}
        onChange={onChange}
      />
    </div>
  );
}