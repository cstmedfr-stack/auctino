import { supabase } from "@/lib/supabase";

type CreateTransactionReviewInput = {
  transactionId: string;
  rating: number;
  communication: number | null;
  accuracy: number | null;
  comment: string;
};

export async function createTransactionReview(
  review: CreateTransactionReviewInput
) {
  return await supabase.rpc("create_transaction_review", {
    p_transaction_id: review.transactionId,
    p_rating: review.rating,
    p_communication: review.communication,
    p_accuracy: review.accuracy,
    p_comment: review.comment,
  });
}

export async function getMyTransactionReview(
  transactionId: string,
  reviewerId: string
) {
  return await supabase
    .from("reviews")
    .select("*")
    .eq("transaction_id", transactionId)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();
}

export async function getUserReviews(userId: string) {
  return await supabase
    .from("reviews")
    .select("*")
    .eq("reviewed_user_id", userId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
}

export async function getAverageRating(userId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewed_user_id", userId)
    .eq("is_published", true);

  if (error) {
    return {
      data: null,
      error,
    };
  }

  if (!data || data.length === 0) {
    return {
      data: 0,
      error: null,
    };
  }

  const total = data.reduce(
    (sum, review) => sum + Number(review.rating),
    0
  );

  return {
    data: total / data.length,
    error: null,
  };
}