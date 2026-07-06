import { Review } from "@/types/review";

type ReviewsCardProps = {
  reviews: Review[];
  averageRating: number;
};

function RatingStars({
  rating,
  size = "text-xl",
}: {
  rating: number;
  size?: string;
}) {
  const roundedRating = Math.round(rating);

  return (
    <div
      className={`flex items-center gap-1 ${size}`}
      aria-label={`${rating} din 5 stele`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= roundedRating
              ? "text-yellow-500"
              : "text-slate-300"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

function getReviewTypeLabel(reviewType: Review["review_type"]) {
  if (reviewType === "seller") {
    return "Review primit ca vânzător";
  }

  if (reviewType === "buyer") {
    return "Review primit ca cumpărător";
  }

  return "Review de tranzacție";
}

export default function ReviewsCard({
  reviews,
  averageRating,
}: ReviewsCardProps) {
  const formattedAverage =
    reviews.length > 0 ? averageRating.toFixed(1) : "0.0";

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Reputație
          </p>

          <div className="mt-2 flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-950">
              {formattedAverage}
            </h2>

            <p className="pb-1 text-sm text-slate-500">
              din 5
            </p>
          </div>

          <div className="mt-2">
            <RatingStars
              rating={averageRating}
              size="text-2xl"
            />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {reviews.length === 1
              ? "1 review publicat"
              : `${reviews.length} review-uri publicate`}
          </p>
        </div>

        <div className="rounded-2xl bg-orange-50 px-5 py-4 text-center">
          <p className="text-sm font-semibold text-orange-700">
            Rating mediu
          </p>

          <p className="mt-1 text-2xl font-black text-orange-900">
            ⭐ {formattedAverage}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center">
            <p className="font-semibold text-slate-800">
              Acest utilizator nu are încă review-uri.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Review-urile apar după finalizarea unei tranzacții.
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
                  <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                    {getReviewTypeLabel(review.review_type)}
                  </span>

                  <div className="mt-3">
                    <RatingStars rating={review.rating} />
                  </div>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {review.rating}/5
                  </p>
                </div>

                <time className="text-sm text-slate-400">
                  {new Date(review.created_at).toLocaleDateString(
                    "ro-RO",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </time>
              </div>

              {(review.communication !== null ||
                review.accuracy !== null) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {review.communication !== null && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Comunicare
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        ⭐ {review.communication}/5
                      </p>
                    </div>
                  )}

                  {review.accuracy !== null && (
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-500">
                        Corectitudine
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        ⭐ {review.accuracy}/5
                      </p>
                    </div>
                  )}
                </div>
              )}

              {review.comment && (
                <blockquote className="mt-5 border-l-4 border-orange-300 pl-4 text-slate-700">
                  „{review.comment}”
                </blockquote>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}