"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Review } from "@/types/review";
import {
  getAverageRating,
  getUserReviews,
} from "@/services/review.service";
import { useMessages } from "@/i18n/useMessages";

export function useReviews(userId: string) {
  const messages = useMessages();
  const t = messages.reviewsTrust;

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [
    averageRating,
    setAverageRating,
  ] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadReviews = useCallback(
    async () => {
      if (!userId) {
        setReviews([]);
        setAverageRating(0);
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const {
          data,
          error: reviewsError,
        } = await getUserReviews(userId);

        if (reviewsError) {
          console.error(
            t.loadError,
            reviewsError.message
          );

          setReviews([]);
          setError(t.loadError);
        } else {
          setReviews(
            (data ?? []) as Review[]
          );
        }

        const rating =
          await getAverageRating(userId);

        setAverageRating(
          Number.isFinite(Number(rating))
            ? Number(rating)
            : 0
        );
      } catch (loadError) {
        console.error(t.loadError, loadError);

        setReviews([]);
        setAverageRating(0);
        setError(t.loadError);
      } finally {
        setLoading(false);
      }
    },
    [userId, t.loadError]
  );

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  return {
    reviews,
    averageRating,
    reviewsCount: reviews.length,
    loading,
    error,
    refreshReviews: loadReviews,
  };
}