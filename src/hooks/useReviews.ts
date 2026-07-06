"use client";

import { useCallback, useEffect, useState } from "react";
import { Review } from "@/types/review";
import {
  getAverageRating,
  getUserReviews,
} from "@/services/review.service";

export function useReviews(userId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
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
      const { data, error: reviewsError } =
        await getUserReviews(userId);

      if (reviewsError) {
        setReviews([]);
        setError(reviewsError.message);
      } else {
        setReviews((data ?? []) as Review[]);
      }

      const rating = await getAverageRating(userId);

      setAverageRating(
        Number.isFinite(Number(rating))
          ? Number(rating)
          : 0
      );
    } catch (loadError) {
      console.error("Eroare încărcare review-uri:", loadError);

      setReviews([]);
      setAverageRating(0);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Review-urile nu au putut fi încărcate."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadReviews();
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