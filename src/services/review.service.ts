import { supabase } from "@/lib/supabase";
import { Review } from "@/types/review";

export async function getUserReviews(
  userId: string
) {
  return await supabase
    .from("reviews")
    .select("*")
    .eq("reviewed_user_id", userId)
    .eq("is_published", true)
    .order("created_at", {
      ascending: false,
    });
}

export async function createReview(
  review: Omit<
    Review,
    "id" | "created_at"
  >
) {
  if (!review.transaction_id) {
    return {
      data: null,
      error: new Error(
        "missing_transaction"
      ),
    };
  }

  return await supabase.rpc(
    "create_transaction_review",
    {
      p_transaction_id:
        review.transaction_id,
      p_rating: review.rating,
      p_communication:
        review.communication ?? null,
      p_accuracy:
        review.accuracy ?? null,
      p_comment:
        review.comment ?? null,
    }
  );
}

export async function getAverageRating(
  userId: string
) {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewed_user_id", userId)
    .eq("is_published", true);

  if (
    error ||
    !data ||
    data.length === 0
  ) {
    return 0;
  }

  const average =
    data.reduce(
      (sum, review) =>
        sum + Number(review.rating),
      0
    ) / data.length;

  return Number(average.toFixed(1));
}

export async function getReviewBetweenUsers(
  productId: string,
  reviewerId: string
) {
  return await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();
}

export async function canReviewProduct(
  productId: string,
  currentUserId: string
) {
  void currentUserId;

  const { data, error } = await supabase.rpc(
    "can_review_product",
    {
      p_product_id: productId,
    }
  );

  if (error) {
    return false;
  }

  return data === true;
}

export async function hasAlreadyReviewed(
  productId: string,
  reviewerId: string
) {
  return await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("reviewer_id", reviewerId)
    .maybeSingle();
}

export async function publishReview(
  reviewId: string
) {
  return await supabase.rpc(
    "publish_own_review",
    {
      p_review_id: reviewId,
    }
  );
}