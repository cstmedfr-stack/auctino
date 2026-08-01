"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";
import { getPublicProfile } from "@/services/publicProfile.service";
import {
  cancelTransaction,
  confirmTransaction,
  getTransactionByProductId,
  openTransactionDispute,
} from "@/lib/transactions";
import {
  createConversation,
  getConversation,
} from "@/services/chat.service";
import {
  createTransactionReview,
  getMyTransactionReview,
} from "@/lib/reviews";

import { Transaction } from "@/types/transaction";
import { Review } from "@/types/review";

import { useMessages } from "@/i18n/useMessages";

import TransactionPageHeader from "@/components/transactions/TransactionPageHeader";
import TransactionPageState from "@/components/transactions/TransactionPageState";
import TransactionProgress from "@/components/transactions/TransactionProgress";
import TransactionProductCard from "@/components/transactions/TransactionProductCard";
import TransactionStatusPanel from "@/components/transactions/TransactionStatusPanel";
import TransactionParticipantsCard from "@/components/transactions/TransactionParticipantsCard";
import TransactionReviewSection from "@/components/transactions/TransactionReviewSection";

type TransactionAction =
  | "cancel"
  | "dispute"
  | null;

type ProductDetails = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
};

type PublicProfileSummary = {
  id: string;
  full_name: string | null;
  username?: string | null;
  name?: string | null;
  avatar_url?: string | null;
};

export default function TransactionPage() {
  const params = useParams();
  const router = useRouter();
  const messages = useMessages();

  const productId =
    typeof params.productId === "string"
      ? params.productId
      : "";

  const [transaction, setTransaction] =
    useState<Transaction | null>(null);

  const [product, setProduct] =
    useState<ProductDetails | null>(null);

  const [seller, setSeller] =
    useState<PublicProfileSummary | null>(null);

  const [buyer, setBuyer] =
    useState<PublicProfileSummary | null>(null);

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [confirming, setConfirming] =
    useState(false);

  const [error, setError] =
    useState("");

  const [actionMode, setActionMode] =
    useState<TransactionAction>(null);

  const [actionReason, setActionReason] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [actionSuccess, setActionSuccess] =
    useState("");

  const [
    existingReview,
    setExistingReview,
  ] = useState<Review | null>(null);

  const [rating, setRating] =
    useState(0);

  const [
    communication,
    setCommunication,
  ] = useState(0);

  const [accuracy, setAccuracy] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [
    reviewLoading,
    setReviewLoading,
  ] = useState(false);

  const [reviewError, setReviewError] =
    useState("");

  const [
    reviewSuccess,
    setReviewSuccess,
  ] = useState("");

  useEffect(() => {
    void loadTransaction();
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      return;
    }

    const channel = supabase
      .channel(`transaction-${productId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `product_id=eq.${productId}`,
        },
        (payload) => {
          setTransaction(
            payload.new as Transaction
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [productId]);

  async function loadTransaction() {
    if (!productId) {
      setError(
        messages.transactionDetails.invalidProduct
      );

      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError(
        messages.transactionDetails.authRequired
      );

      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const {
      data: transactionData,
      error: transactionError,
    } = await getTransactionByProductId(
      productId
    );

    if (
      transactionError ||
      !transactionData
    ) {
      setError(
        messages.transactionDetails
          .transactionNotFound
      );

      setLoading(false);
      return;
    }

    const loadedTransaction =
      transactionData as Transaction;

    setTransaction(loadedTransaction);

    const {
      data: reviewData,
      error: reviewLoadError,
    } = await getMyTransactionReview(
      loadedTransaction.id,
      user.id
    );

    if (reviewLoadError) {
      console.error(
        reviewLoadError.message
      );
    } else {
      setExistingReview(
        (reviewData as Review | null) ??
          null
      );
    }

    const [
      productResult,
      sellerResult,
      buyerResult,
    ] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, title, description, image_url"
        )
        .eq("id", productId)
        .maybeSingle(),

      getPublicProfile(
        loadedTransaction.seller_id
      ),

      getPublicProfile(
        loadedTransaction.buyer_id
      ),
    ]);

    if (productResult.error) {
      console.error(
        messages.productPage
          .productLoadConsoleError,
        productResult.error.message
      );
    }

    if (sellerResult.error) {
      console.error(
        messages.productPage
          .sellerProfileConsoleError,
        sellerResult.error.message
      );
    }

    if (buyerResult.error) {
      console.error(
        buyerResult.error.message
      );
    }

    setProduct(
      (productResult.data as
        | ProductDetails
        | null) ?? null
    );

    setSeller(
      (sellerResult.data as
        | PublicProfileSummary
        | null) ?? null
    );

    setBuyer(
      (buyerResult.data as
        | PublicProfileSummary
        | null) ?? null
    );

    setLoading(false);
  }

  async function handleContactOtherUser() {
    if (
      !transaction ||
      !currentUserId
    ) {
      return;
    }

    const {
      data: existingConversation,
      error: conversationError,
    } = await getConversation(
      transaction.product_id,
      transaction.seller_id,
      transaction.buyer_id
    );

    if (conversationError) {
      console.error(
        messages.productPage
          .conversationSearchConsoleError,
        conversationError.message
      );
    }

    let conversationId =
      existingConversation?.id;

    if (!conversationId) {
      const {
        data: newConversation,
        error: createError,
      } = await createConversation(
        transaction.product_id,
        transaction.seller_id,
        transaction.buyer_id
      );

      if (
        createError ||
        !newConversation
      ) {
        setError(
          createError?.message ||
            messages.transactionDetails
              .feedback.conversationError
        );

        return;
      }

      conversationId =
        newConversation.id;
    }

    router.push(
      `/chat?conversation=${conversationId}`
    );
  }

  async function handleConfirmTransaction() {
    if (!transaction) {
      return;
    }

    setConfirming(true);
    setError("");
    setActionSuccess("");

    const {
      data,
      error: confirmError,
    } = await confirmTransaction(
      transaction.id
    );

    if (confirmError) {
      setError(confirmError.message);
      setConfirming(false);
      return;
    }

    if (data) {
      setTransaction(
        data as Transaction
      );
    }

    setConfirming(false);
  }

  async function handleTransactionAction(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !transaction ||
      !actionMode
    ) {
      return;
    }

    const cleanReason =
      actionReason.trim();

    setActionError("");
    setActionSuccess("");

    if (cleanReason.length < 5) {
      setActionError(
        messages.transactionDetails
          .feedback.reasonTooShort
      );

      return;
    }

    if (cleanReason.length > 1000) {
      setActionError(
        messages.transactionDetails
          .feedback.reasonTooLong
      );

      return;
    }

    setActionLoading(true);

    const result =
      actionMode === "cancel"
        ? await cancelTransaction(
            transaction.id,
            cleanReason
          )
        : await openTransactionDispute(
            transaction.id,
            cleanReason
          );

    if (result.error) {
      setActionError(
        result.error.message
      );

      setActionLoading(false);
      return;
    }

    if (!result.data) {
      setActionError(
        messages.transactionDetails
          .feedback.updateError
      );

      setActionLoading(false);
      return;
    }

    setTransaction(
      result.data as Transaction
    );

    setActionSuccess(
      actionMode === "cancel"
        ? messages.transactionDetails
            .feedback.cancelledSuccess
        : messages.transactionDetails
            .feedback.disputedSuccess
    );

    setActionReason("");
    setActionMode(null);
    setActionLoading(false);
  }

  async function handleSubmitReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!transaction) {
      return;
    }

    setReviewError("");
    setReviewSuccess("");

    if (
      rating < 1 ||
      rating > 5
    ) {
      setReviewError(
        messages.transactionDetails
          .feedback.ratingError
      );

      return;
    }

    setReviewLoading(true);

    const {
      data,
      error: createReviewError,
    } = await createTransactionReview({
      transactionId: transaction.id,
      rating,
      communication:
        communication > 0
          ? communication
          : null,
      accuracy:
        accuracy > 0 ? accuracy : null,
      comment,
    });

    if (createReviewError) {
      setReviewError(
        createReviewError.message
      );

      setReviewLoading(false);
      return;
    }

    const createdReview =
      Array.isArray(data)
        ? data[0]
        : data;

    setExistingReview(
      createdReview as Review
    );

    setReviewSuccess(
      messages.transactionDetails.feedback
        .reviewPublished
    );

    setReviewLoading(false);
  }

  function openAction(
    mode: "cancel" | "dispute"
  ) {
    setActionMode(mode);
    setActionReason("");
    setActionError("");
    setActionSuccess("");
  }

  function closeAction() {
    if (actionLoading) {
      return;
    }

    setActionMode(null);
    setActionReason("");
    setActionError("");
  }

  const isSeller =
    currentUserId ===
    transaction?.seller_id;

  const isBuyer =
    currentUserId ===
    transaction?.buyer_id;

  const isParticipant =
    isSeller || isBuyer;

  const currentUserAlreadyConfirmed =
    Boolean(
      (isSeller &&
        transaction?.seller_confirmed) ||
        (isBuyer &&
          transaction?.buyer_confirmed)
    );

  const nobodyConfirmed =
    Boolean(
      transaction &&
        !transaction.seller_confirmed &&
        !transaction.buyer_confirmed
    );

  const somebodyConfirmed =
    Boolean(
      transaction &&
        (transaction.seller_confirmed ||
          transaction.buyer_confirmed)
    );

  const canConfirm =
    Boolean(
      transaction &&
        transaction.status ===
          "pending_confirmation" &&
        isParticipant &&
        !currentUserAlreadyConfirmed
    );

  const canCancel =
    Boolean(
      transaction &&
        transaction.status ===
          "pending_confirmation" &&
        isParticipant &&
        nobodyConfirmed
    );

  const canDispute =
    Boolean(
      transaction &&
        isParticipant &&
        (transaction.status ===
          "completed" ||
          (transaction.status ===
            "pending_confirmation" &&
            somebodyConfirmed))
    );

  if (loading) {
    return (
      <TransactionPageState type="loading" />
    );
  }

  if (
    error &&
    !transaction
  ) {
    return (
      <TransactionPageState
        type="error"
        message={error}
      />
    );
  }

  if (!transaction) {
    return (
      <TransactionPageState type="not-found" />
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <TransactionPageHeader
        productId={productId}
      />

      <TransactionProgress
        transaction={transaction}
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {actionSuccess}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <TransactionProductCard
          product={product}
          finalPrice={Number(
            transaction.final_price ?? 0
          )}
        />

        <TransactionStatusPanel
          transaction={transaction}
          confirming={confirming}
          actionMode={actionMode}
          actionReason={actionReason}
          actionLoading={actionLoading}
          actionError={actionError}
          isParticipant={isParticipant}
          canConfirm={canConfirm}
          currentUserAlreadyConfirmed={
            currentUserAlreadyConfirmed
          }
          canCancel={canCancel}
          canDispute={canDispute}
          onConfirm={
            handleConfirmTransaction
          }
          onOpenAction={openAction}
          onCloseAction={closeAction}
          onActionReasonChange={
            setActionReason
          }
          onSubmitAction={
            handleTransactionAction
          }
          onContact={() => {
            void handleContactOtherUser();
          }}
        />
      </div>

      <TransactionParticipantsCard
        transaction={transaction}
        seller={seller}
        buyer={buyer}
      />

      {transaction.status ===
        "completed" &&
        isParticipant && (
          <TransactionReviewSection
            isSeller={isSeller}
            existingReview={existingReview}
            rating={rating}
            communication={communication}
            accuracy={accuracy}
            comment={comment}
            reviewLoading={reviewLoading}
            reviewError={reviewError}
            reviewSuccess={reviewSuccess}
            setRating={setRating}
            setCommunication={
              setCommunication
            }
            setAccuracy={setAccuracy}
            setComment={setComment}
            onSubmit={handleSubmitReview}
          />
        )}
    </main>
  );
}