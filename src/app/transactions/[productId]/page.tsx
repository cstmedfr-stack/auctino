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

import {
  getPublicProfile,
} from "@/services/publicProfile.service";

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

type ProgressState =
  | "complete"
  | "current"
  | "pending"
  | "blocked";

type ProgressStep = {
  title: string;
  description: string;
  state: ProgressState;
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <button
            key={star}
            type="button"
            onClick={() =>
              onChange(star)
            }
            className={`text-3xl transition ${
              star <= value
                ? "text-yellow-500"
                : "text-slate-300 hover:text-yellow-400"
            }`}
            aria-label={`${star} stele`}
          >
            ★
          </button>
        )
      )}
    </div>
  );
}

function getTransactionSteps(
  transaction: Transaction
): ProgressStep[] {
  const sellerConfirmed = Boolean(
    transaction.seller_confirmed
  );

  const buyerConfirmed = Boolean(
    transaction.buyer_confirmed
  );

  const somebodyConfirmed =
    sellerConfirmed ||
    buyerConfirmed;

  const bothConfirmed =
    sellerConfirmed &&
    buyerConfirmed;

  const isCompleted =
    transaction.status ===
    "completed";

  const isCancelled =
    transaction.status ===
    "cancelled";

  const isDisputed =
    transaction.status ===
    "disputed";

  const isBlocked =
    isCancelled || isDisputed;

  return [
    {
      title:
        "Licitație câștigată",

      description:
        "Câștigătorul și prețul final au fost stabilite.",

      state: "complete",
    },

    {
      title:
        "Predare și plată",

      description: isCompleted
        ? "Produsul și plata au fost confirmate."
        : somebodyConfirmed
          ? "Cel puțin una dintre părți a confirmat tranzacția."
          : "Coordonați predarea produsului și plata prin mesaje.",

      state: isCompleted ||
        somebodyConfirmed
        ? "complete"
        : isBlocked
          ? "blocked"
          : "current",
    },

    {
      title:
        "Confirmarea ambelor părți",

      description: isCompleted ||
        bothConfirmed
        ? "Vânzătorul și cumpărătorul au confirmat."
        : somebodyConfirmed
          ? "Se așteaptă confirmarea celeilalte părți."
          : "Nicio parte nu a confirmat încă.",

      state: isCompleted ||
        bothConfirmed
        ? "complete"
        : isBlocked
          ? "blocked"
          : somebodyConfirmed
            ? "current"
            : "pending",
    },

    {
      title: "Finalizată",

      description: isCompleted
        ? "Tranzacția a fost finalizată cu succes."
        : isDisputed
          ? "Tranzacția este blocată de o dispută."
          : isCancelled
            ? "Tranzacția a fost anulată."
            : "Se finalizează după confirmarea ambelor părți.",

      state: isCompleted
        ? "complete"
        : isBlocked
          ? "blocked"
          : bothConfirmed
            ? "current"
            : "pending",
    },
  ];
}

function TransactionProgress({
  transaction,
}: {
  transaction: Transaction;
}) {
  const steps =
    getTransactionSteps(
      transaction
    );

  function getStepClasses(
    state: ProgressState
  ) {
    if (state === "complete") {
      return {
        card:
          "border-emerald-200 bg-emerald-50",

        circle:
          "bg-emerald-600 text-white",

        title:
          "text-emerald-950",

        description:
          "text-emerald-700",
      };
    }

    if (state === "current") {
      return {
        card:
          "border-orange-300 bg-orange-50 ring-2 ring-orange-100",

        circle:
          "bg-orange-500 text-white",

        title:
          "text-orange-950",

        description:
          "text-orange-700",
      };
    }

    if (state === "blocked") {
      return {
        card:
          "border-red-200 bg-red-50",

        circle:
          "bg-red-600 text-white",

        title:
          "text-red-950",

        description:
          "text-red-700",
      };
    }

    return {
      card:
        "border-slate-200 bg-white",

      circle:
        "bg-slate-200 text-slate-500",

      title:
        "text-slate-700",

      description:
        "text-slate-500",
    };
  }

  return (
    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
          Progresul tranzacției
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-950">
          Etapele tranzacției
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Predarea și plata se coordonează direct între vânzător și cumpărător.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {steps.map(
          (step, index) => {
            const classes =
              getStepClasses(
                step.state
              );

            return (
              <article
                key={step.title}
                className={`rounded-2xl border p-4 ${classes.card}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${classes.circle}`}
                >
                  {step.state ===
                  "complete"
                    ? "✓"
                    : step.state ===
                        "blocked"
                      ? "!"
                      : index + 1}
                </div>

                <h3
                  className={`mt-4 font-black ${classes.title}`}
                >
                  {step.title}
                </h3>

                <p
                  className={`mt-2 text-sm leading-5 ${classes.description}`}
                >
                  {step.description}
                </p>

                {step.state ===
                  "current" && (
                  <span className="mt-3 inline-flex rounded-full bg-orange-200 px-3 py-1 text-xs font-bold text-orange-800">
                    Etapa curentă
                  </span>
                )}
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}

export default function TransactionPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params.productId ===
    "string"
      ? params.productId
      : "";

  const [
    transaction,
    setTransaction,
  ] =
    useState<Transaction | null>(
      null
    );

  const [product, setProduct] =
    useState<ProductDetails | null>(
      null
    );

  const [seller, setSeller] =
    useState<PublicProfileSummary | null>(
      null
    );

  const [buyer, setBuyer] =
    useState<PublicProfileSummary | null>(
      null
    );

  const [
    currentUserId,
    setCurrentUserId,
  ] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [confirming, setConfirming] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    actionMode,
    setActionMode,
  ] =
    useState<TransactionAction>(null);

  const [
    actionReason,
    setActionReason,
  ] = useState("");

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    actionSuccess,
    setActionSuccess,
  ] = useState("");

  const [
    existingReview,
    setExistingReview,
  ] =
    useState<Review | null>(null);

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

  const [
    reviewError,
    setReviewError,
  ] = useState("");

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
        "Produsul nu este valid."
      );

      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (authError || !user) {
      setError(
        "Trebuie să fii autentificat pentru a vedea tranzacția."
      );

      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const {
      data: transactionData,
      error: transactionError,
    } =
      await getTransactionByProductId(
        productId
      );

    if (
      transactionError ||
      !transactionData
    ) {
      setError(
        "Nu am găsit tranzacția pentru acest produs."
      );

      setLoading(false);
      return;
    }

    const loadedTransaction =
      transactionData as Transaction;

    setTransaction(
      loadedTransaction
    );

    const {
      data: reviewData,
      error: reviewLoadError,
    } =
      await getMyTransactionReview(
        loadedTransaction.id,
        user.id
      );

    if (reviewLoadError) {
      console.error(
        "Eroare încărcare review:",
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
        "Eroare produs tranzacție:",
        productResult.error.message
      );
    }

    if (sellerResult.error) {
      console.error(
        "Eroare profil vânzător:",
        sellerResult.error.message
      );
    }

    if (buyerResult.error) {
      console.error(
        "Eroare profil cumpărător:",
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
        "Eroare verificare conversație:",
        conversationError.message
      );
    }

    let conversationId =
      existingConversation?.id;

    if (!conversationId) {
      const {
        data: newConversation,
        error: createError,
      } =
        await createConversation(
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
            "Conversația nu a putut fi creată."
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
    } =
      await confirmTransaction(
        transaction.id
      );

    if (confirmError) {
      setError(
        confirmError.message
      );

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
        "Motivul trebuie să conțină minimum 5 caractere."
      );

      return;
    }

    if (cleanReason.length > 1000) {
      setActionError(
        "Motivul nu poate depăși 1000 de caractere."
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
        "Tranzacția nu a putut fi actualizată."
      );

      setActionLoading(false);
      return;
    }

    setTransaction(
      result.data as Transaction
    );

    setActionSuccess(
      actionMode === "cancel"
        ? "Tranzacția a fost anulată."
        : "Disputa a fost deschisă."
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
        "Alege un rating între 1 și 5 stele."
      );

      return;
    }

    setReviewLoading(true);

    const {
      data,
      error: createReviewError,
    } =
      await createTransactionReview({
        transactionId:
          transaction.id,

        rating,

        communication:
          communication > 0
            ? communication
            : null,

        accuracy:
          accuracy > 0
            ? accuracy
            : null,

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
      "Review-ul a fost publicat."
    );

    setReviewLoading(false);
  }

  function openAction(
    mode: TransactionAction
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

  function getUserName(
    profile:
      | PublicProfileSummary
      | null
  ) {
    return (
      profile?.full_name ||
      profile?.username ||
      profile?.name ||
      "Utilizator"
    );
  }

  function formatPrice(
    price:
      | number
      | string
      | null
      | undefined
  ) {
    if (
      price === null ||
      price === undefined
    ) {
      return "-";
    }

    return `${Number(
      price
    ).toFixed(0)} lei`;
  }

  function formatDate(
    date:
      | string
      | null
      | undefined
  ) {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleString(
      "ro-RO",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function getStatusLabel(
    status: Transaction["status"]
  ) {
    if (
      status ===
      "pending_confirmation"
    ) {
      return "În așteptarea confirmării";
    }

    if (status === "completed") {
      return "Finalizată";
    }

    if (status === "cancelled") {
      return "Anulată";
    }

    if (status === "disputed") {
      return "În dispută";
    }

    return status;
  }

  function getStatusStyle(
    status: Transaction["status"]
  ) {
    if (status === "completed") {
      return "bg-green-600";
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
    userId:
      | string
      | null
      | undefined
  ) {
    if (
      !transaction ||
      !userId
    ) {
      return "Utilizator";
    }

    if (
      userId ===
      transaction.seller_id
    ) {
      return "Vânzătorul";
    }

    if (
      userId ===
      transaction.buyer_id
    ) {
      return "Cumpărătorul";
    }

    return "Utilizator";
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
        (
          transaction.status ===
            "completed" ||
          (
            transaction.status ===
              "pending_confirmation" &&
            somebodyConfirmed
          )
        )
    );

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p>
          Se încarcă tranzacția...
        </p>
      </main>
    );
  }

  if (
    error &&
    !transaction
  ) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="mb-6 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Înapoi
        </button>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-red-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p>
          Tranzacția nu există.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <button
        type="button"
        onClick={() =>
          router.push(
            `/products/${productId}`
          )
        }
        className="mb-6 text-sm text-slate-600 hover:text-slate-900"
      >
        ← Înapoi la produs
      </button>

      <div className="mb-8 rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-bold uppercase text-orange-600">
          Tranzacție
        </p>

        <h1 className="mt-2 text-3xl font-black text-slate-950">
          Detalii tranzacție
        </h1>

        <p className="mt-2 text-slate-600">
          Confirmă tranzacția, comunică cu cealaltă persoană sau raportează o problemă.
        </p>
      </div>

      <TransactionProgress
        transaction={transaction}
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {actionSuccess && (
        <div className="mb-6 rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-700">
          {actionSuccess}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Produs
          </h2>

          {product?.image_url ? (
            <img
              src={product.image_url}
              alt={
                product.title ||
                "Produs"
              }
              className="mt-4 h-80 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="mt-4 flex h-80 items-center justify-center rounded-2xl bg-slate-100 text-6xl">
              📦
            </div>
          )}

          <h3 className="mt-5 text-2xl font-black text-slate-950">
            {product?.title ||
              "Produs fără titlu"}
          </h3>

          {product?.description && (
            <p className="mt-3 text-slate-600">
              {product.description}
            </p>
          )}

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-500">
              Preț final
            </p>

            <p className="mt-1 text-4xl font-black text-slate-950">
              {formatPrice(
                transaction.final_price
              )}
            </p>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Status tranzacție
          </h2>

          <div
            className={`mt-4 rounded-2xl p-5 text-white ${getStatusStyle(
              transaction.status
            )}`}
          >
            <p className="text-sm font-semibold text-white/70">
              Status
            </p>

            <p className="mt-1 text-2xl font-black">
              {getStatusLabel(
                transaction.status
              )}
            </p>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-500">
                Creată la
              </p>

              <p className="mt-1 text-slate-900">
                {formatDate(
                  transaction.created_at
                )}
              </p>
            </div>

            {transaction.completed_at && (
              <div className="rounded-2xl bg-green-50 p-4">
                <p className="font-semibold text-green-700">
                  Finalizată la
                </p>

                <p className="mt-1 text-green-900">
                  {formatDate(
                    transaction.completed_at
                  )}
                </p>
              </div>
            )}

            {transaction.status ===
              "cancelled" && (
              <div className="rounded-2xl bg-red-50 p-4">
                <p className="font-bold text-red-800">
                  Tranzacție anulată
                </p>

                <p className="mt-1 text-red-700">
                  Anulată de:{" "}
                  {getActorLabel(
                    transaction.cancelled_by
                  )}
                </p>

                <p className="mt-1 text-red-700">
                  Data:{" "}
                  {formatDate(
                    transaction.cancelled_at
                  )}
                </p>

                {transaction.cancellation_reason && (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-red-900">
                    Motiv:{" "}
                    {
                      transaction.cancellation_reason
                    }
                  </p>
                )}
              </div>
            )}

            {transaction.status ===
              "disputed" && (
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="font-bold text-amber-900">
                  Dispută deschisă
                </p>

                <p className="mt-1 text-amber-800">
                  Deschisă de:{" "}
                  {getActorLabel(
                    transaction.disputed_by
                  )}
                </p>

                <p className="mt-1 text-amber-800">
                  Data:{" "}
                  {formatDate(
                    transaction.disputed_at
                  )}
                </p>

                {transaction.dispute_reason && (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/70 p-3 text-amber-950">
                    Motiv:{" "}
                    {
                      transaction.dispute_reason
                    }
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            {canConfirm && (
              <button
                type="button"
                onClick={
                  handleConfirmTransaction
                }
                disabled={
                  confirming ||
                  actionLoading
                }
                className="w-full rounded-2xl bg-black px-5 py-3 font-bold text-white disabled:opacity-60"
              >
                {confirming
                  ? "Se confirmă..."
                  : "Confirm tranzacția"}
              </button>
            )}

            {currentUserAlreadyConfirmed &&
              transaction.status ===
                "pending_confirmation" && (
                <div className="rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-700">
                  Ai confirmat tranzacția. Așteptăm confirmarea celeilalte părți.
                </div>
              )}

            {!isParticipant && (
              <div className="rounded-2xl bg-yellow-50 p-4 text-sm font-medium text-yellow-800">
                Doar vânzătorul și cumpărătorul pot modifica această tranzacție.
              </div>
            )}

            {transaction.status ===
              "completed" && (
              <div className="rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-700">
                Tranzacția este finalizată. Poți lăsa un review sau poți raporta o problemă.
              </div>
            )}

            {transaction.status ===
              "cancelled" && (
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
                Această tranzacție a fost anulată și nu mai poate fi confirmată.
              </div>
            )}

            {transaction.status ===
              "disputed" && (
              <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
                Tranzacția este blocată până la soluționarea disputei.
              </div>
            )}

            {canCancel &&
              !actionMode && (
                <button
                  type="button"
                  onClick={() =>
                    openAction(
                      "cancel"
                    )
                  }
                  className="w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-700 hover:bg-red-100"
                >
                  Anulează tranzacția
                </button>
              )}

            {canDispute &&
              !actionMode && (
                <button
                  type="button"
                  onClick={() =>
                    openAction(
                      "dispute"
                    )
                  }
                  className="w-full rounded-2xl border border-amber-300 bg-amber-50 px-5 py-3 font-bold text-amber-900 hover:bg-amber-100"
                >
                  Deschide o dispută
                </button>
              )}

            {actionMode && (
              <form
                onSubmit={
                  handleTransactionAction
                }
                className={`rounded-2xl border p-4 ${
                  actionMode ===
                  "cancel"
                    ? "border-red-200 bg-red-50"
                    : "border-amber-300 bg-amber-50"
                }`}
              >
                <label
                  htmlFor="transaction-action-reason"
                  className="font-bold text-slate-900"
                >
                  {actionMode ===
                  "cancel"
                    ? "Motivul anulării"
                    : "Motivul disputei"}
                </label>

                <textarea
                  id="transaction-action-reason"
                  value={
                    actionReason
                  }
                  onChange={(event) =>
                    setActionReason(
                      event.target
                        .value
                    )
                  }
                  rows={4}
                  minLength={5}
                  maxLength={1000}
                  required
                  placeholder={
                    actionMode ===
                    "cancel"
                      ? "Explică de ce anulezi tranzacția..."
                      : "Descrie problema întâmpinată..."
                  }
                  className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {
                    actionReason.length
                  }
                  /1000
                </p>

                {actionError && (
                  <div className="mt-3 rounded-xl bg-white p-3 text-sm text-red-700">
                    {actionError}
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    type="submit"
                    disabled={
                      actionLoading
                    }
                    className={`flex-1 rounded-xl px-4 py-3 font-bold text-white disabled:opacity-60 ${
                      actionMode ===
                      "cancel"
                        ? "bg-red-600"
                        : "bg-amber-600"
                    }`}
                  >
                    {actionLoading
                      ? "Se procesează..."
                      : actionMode ===
                          "cancel"
                        ? "Confirmă anularea"
                        : "Deschide disputa"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      closeAction
                    }
                    disabled={
                      actionLoading
                    }
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 disabled:opacity-60"
                  >
                    Renunță
                  </button>
                </div>
              </form>
            )}

            {isParticipant && (
              <button
                type="button"
                onClick={() =>
                  void handleContactOtherUser()
                }
                className="w-full rounded-2xl border px-5 py-3 font-bold hover:bg-slate-50"
              >
                💬 Contactează cealaltă persoană
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Vânzător
          </h2>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {getUserName(seller)}
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">
              Confirmare vânzător
            </p>

            <p className="mt-1 font-bold">
              {transaction.seller_confirmed
                ? "Confirmat"
                : "Neconfirmat"}
            </p>

            {transaction.seller_confirmed_at && (
              <p className="mt-1 text-sm text-slate-500">
                {formatDate(
                  transaction.seller_confirmed_at
                )}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Cumpărător
          </h2>

          <p className="mt-2 text-lg font-semibold text-slate-900">
            {getUserName(buyer)}
          </p>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">
              Confirmare cumpărător
            </p>

            <p className="mt-1 font-bold">
              {transaction.buyer_confirmed
                ? "Confirmat"
                : "Neconfirmat"}
            </p>

            {transaction.buyer_confirmed_at && (
              <p className="mt-1 text-sm text-slate-500">
                {formatDate(
                  transaction.buyer_confirmed_at
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {transaction.status ===
        "completed" &&
        isParticipant && (
          <section className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">
              Review
            </h2>

            <p className="mt-2 text-slate-600">
              {isSeller
                ? "Evaluează cumpărătorul acestei tranzacții."
                : "Evaluează vânzătorul acestei tranzacții."}
            </p>

            {existingReview ? (
              <div className="mt-5 rounded-2xl bg-green-50 p-5">
                <p className="font-bold text-green-800">
                  Ai lăsat deja un review
                </p>

                <p className="mt-2 text-2xl text-yellow-500">
                  {"★".repeat(
                    existingReview.rating
                  )}

                  <span className="text-slate-300">
                    {"★".repeat(
                      5 -
                        existingReview.rating
                    )}
                  </span>
                </p>

                {existingReview.comment && (
                  <p className="mt-3 text-slate-700">
                    {
                      existingReview.comment
                    }
                  </p>
                )}
              </div>
            ) : (
              <form
                onSubmit={
                  handleSubmitReview
                }
                className="mt-6 space-y-6"
              >
                <div>
                  <p className="mb-2 font-semibold text-slate-900">
                    Rating general *
                  </p>

                  <StarRating
                    value={rating}
                    onChange={
                      setRating
                    }
                  />
                </div>

                <div>
                  <p className="mb-2 font-semibold text-slate-900">
                    Comunicare
                  </p>

                  <StarRating
                    value={
                      communication
                    }
                    onChange={
                      setCommunication
                    }
                  />
                </div>

                <div>
                  <p className="mb-2 font-semibold text-slate-900">
                    Corectitudine
                  </p>

                  <StarRating
                    value={accuracy}
                    onChange={
                      setAccuracy
                    }
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-comment"
                    className="font-semibold text-slate-900"
                  >
                    Comentariu
                  </label>

                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(event) =>
                      setComment(
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    maxLength={1000}
                    placeholder="Cum a decurs tranzacția?"
                    className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                {reviewError && (
                  <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                    {reviewError}
                  </div>
                )}

                {reviewSuccess && (
                  <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                    {reviewSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    reviewLoading
                  }
                  className="rounded-2xl bg-black px-6 py-3 font-bold text-white disabled:opacity-60"
                >
                  {reviewLoading
                    ? "Se publică..."
                    : "Publică review-ul"}
                </button>
              </form>
            )}
          </section>
        )}
    </main>
  );
}