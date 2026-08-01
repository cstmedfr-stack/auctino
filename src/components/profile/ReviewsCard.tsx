"use client";

import {  MessageSquareText,  Star,} from "lucide-react";
import { Review } from "@/types/review";
import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";
import { formatDateTime } from "@/utils/formatDateTime";
import { formatMessage } from "@/utils/formatMessage";

type ReviewsCardProps = {
  reviews: Review[];
  averageRating: number;
};



function RatingStars({
  rating,
  size = "default",
}: {
  rating: number;
  size?: "default" | "large";
}) {
  const roundedRating = Math.round(rating);

  const starSize =
    size === "large" ? 22 : 18;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={starSize}
          className={
            star <= roundedRating
              ? "fill-yellow-400 text-yellow-400"
              : "text-slate-300"
          }
        />
      ))}
    </div>
  );
}

function getReviewTypeLabel(
  reviewType: Review["review_type"],
  t: {
    reviewAsSeller: string;
    reviewAsBuyer: string;
    transactionReview: string;
  }
) {
  if (reviewType === "seller") {
    return t.reviewAsSeller;
  }

  if (reviewType === "buyer") {
    return t.reviewAsBuyer;
  }

  return t.transactionReview;
}

export default function ReviewsCard({
  reviews,
  averageRating,
}: ReviewsCardProps) {
  const messages = useMessages();
  const t = messages.publicProfile;
  const { locale } = useLocale();

  const formattedAverage =
    reviews.length > 0
      ? averageRating.toFixed(1)
      : "0.0";

  const reviewsCountText =
    reviews.length === 1
      ? t.reviewsSingular
      : formatMessage(t.reviewsPlural, {
          count: reviews.length,
        });

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-indigo-600">
            <MessageSquareText size={16} />
            {t.reputation}
          </p>

          <div className="mt-2 flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-950">
              {formattedAverage}
            </h2>

            <p className="pb-1 text-sm text-slate-500">
              {t.outOfFive}
            </p>
          </div>

          <div className="mt-2">
            <RatingStars
              rating={averageRating}
              size="large"
            />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {reviewsCountText}
          </p>
        </div>

        <div className="rounded-2xl bg-yellow-50 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-yellow-700">
            {t.averageRating}
          </p>

          <p className="mt-1 flex items-center justify-center gap-2 text-2xl font-black text-yellow-900">
            <Star
              size={22}
              className="fill-yellow-400 text-yellow-400"
            />
            {formattedAverage}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center">
            <p className="font-semibold text-slate-800">
              {t.noReviewsTitle}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {t.noReviewsDescription}
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                    {getReviewTypeLabel(
                      review.review_type,
                      t
                    )}
                  </span>

                  <div className="mt-3">
                    <RatingStars
                      rating={review.rating}
                    />
                  </div>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatMessage(
                      t.ratingOutOfFive,
                      {
                        rating: review.rating,
                      }
                    )}
                  </p>
                </div>

                <time className="text-sm text-slate-400">
                  {formatDateTime(
                    review.created_at,
                    locale
                  )}
                </time>
              </div>

              {(review.communication !== null ||
                review.accuracy !== null) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {review.communication !== null && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        {t.communication}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-900">
                        <Star
                          size={16}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        {formatMessage(
                          t.ratingOutOfFive,
                          {
                            rating:
                              review.communication,
                          }
                        )}
                      </p>
                    </div>
                  )}

                  {review.accuracy !== null && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        {t.accuracy}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 font-bold text-slate-900">
                        <Star
                          size={16}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        {formatMessage(
                          t.ratingOutOfFive,
                          {
                            rating:
                              review.accuracy,
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {review.comment && (
                <blockquote className="mt-5 border-l-4 border-indigo-300 pl-4 text-slate-700">
                  “{review.comment}”
                </blockquote>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}