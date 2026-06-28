"use client";

import { useEffect, useState } from "react";
import { Review } from "@/types/review";
import { getUserReviews } from "@/services/review.service";

export function useReviews(userId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadReviews = async () => {
      setLoading(true);

      const { data, error } = await getUserReviews(userId);

      if (error) {
        console.error(error.message);
      } else {
        setReviews(data || []);
      }

      setLoading(false);
    };

    loadReviews();
  }, [userId]);

  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

  return {
    reviews,
    averageRating,
    reviewsCount: reviews.length,
    loading,
  };
}