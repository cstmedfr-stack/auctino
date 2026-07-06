"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {  addFavorite,  removeFavorite,  isFavorite as checkIsFavorite,} from "@/services/favorite.service";
import { supabase } from "@/lib/supabase";
import { finalizeAuctionAndCreateTransaction } from "@/lib/transactions";
import { reportProduct } from "@/lib/product-reports";
import { formatPrice } from "@/utils/formatPrice";
import { placeBid } from "@/services/bid.service";
import {  createConversation,  getConversation,} from "@/services/chat.service";
import {  getPublicProfile,} from "@/services/publicProfile.service";
import ProductGallery from "@/components/product/ProductGallery";
import { useProductImages } from "@/hooks/useProductImages";
import { Profile } from "@/types/profile";
import { getUserBadges } from "@/utils/badges";
import { calculateTrustScore } from "@/utils/trustScore";
import ProductGrid from "@/components/product/ProductGrid";
import { useFavorites } from "@/hooks/useFavorites";
import {  getMarketplaceProducts,} from "@/services/product.service";
import {  Product as MarketplaceProduct,} from "@/types/product";

type Product = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  starting_price: number;
  current_price: number | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
  bid_count: number | null;
  auction_end: string | null;
  status: string | null;
  winner_id: string | null;
category: string | null;
category_id: string | null;
subcategory_id: string | null;
condition: string | null;
  removed_by: string | null;
  removal_reason: string | null;
  removed_at: string | null;
};

type Bid = {
  id: string;
  amount: number;
  created_at: string;
  is_my_bid: boolean;
};
function formatRemainingTime(
  milliseconds: number
) {
  const totalSeconds = Math.max(
    Math.floor(milliseconds / 1000),
    0
  );

  const days = Math.floor(
    totalSeconds / 86400
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const seconds =
    totalSeconds % 60;

  if (days > 0) {
    return `${days}z ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}


export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId =    typeof params.id === "string" ? params.id : "";
  const { images } = useProductImages(productId);
  const [product, setProduct] =    useState<Product | null>(null);
  const [sellerProfile, setSellerProfile] =    useState<Profile | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUserId, setCurrentUserId] =    useState("");
  const [isAdminViewer, setIsAdminViewer] =    useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] =  useState(() => Date.now());
  const [productError, setProductError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] =    useState(false);
 
  
  const [showReportForm, setShowReportForm] =    useState(false);
  const [reportReason, setReportReason] =    useState("");
  const [reportLoading, setReportLoading] =    useState(false);
  const [reportError, setReportError] =    useState("");
  const [reportSuccess, setReportSuccess] =    useState("");
  const [  similarProducts,  setSimilarProducts,] = useState<MarketplaceProduct[]>([]);
  const [  similarProductsLoading,  setSimilarProductsLoading,] = useState(false);
  const {  favoriteIds: similarFavoriteIds,  toggleFavorite:    toggleSimilarFavorite,} = useFavorites();
  const fetchProduct = async (): Promise<boolean> => {
        if (!productId) {
      return false;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error || !data) {
      console.error("Eroare produs:", error);

      setProduct(null);
      setSellerProfile(null);

      setProductError(
        error?.message ||
          "Produsul nu a putut fi încărcat."
      );

      return false;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let viewerIsAdmin = false;

    if (user) {
      const {
        data: viewerProfile,
        error: viewerProfileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (viewerProfileError) {
        console.error(
          "Eroare verificare rol:",
          viewerProfileError.message
        );
      }

      viewerIsAdmin =
        viewerProfile?.role === "admin";
    }

    setIsAdminViewer(viewerIsAdmin);

    const viewerIsOwner =
      user?.id === data.user_id;

    if (
      data.status === "removed" &&
      !viewerIsOwner &&
      !viewerIsAdmin
    ) {
      setProduct(null);
      setSellerProfile(null);

      setProductError(
        "Acest produs a fost eliminat și nu mai este disponibil."
      );

      return false;
    }

    setProduct(data as Product);
    setProductError("");

    const {
  data: profileData,
  error: profileError,
} = await getPublicProfile(
  data.user_id
);

    if (profileError) {
      console.error(
        "Eroare profil vânzător:",
        profileError.message
      );

      setSellerProfile(null);
      return true;
    }

    setSellerProfile(
      (profileData as Profile | null) ?? null
    );

    return true;
  };

  const fetchBids = async () => {
  if (!productId) {
    return;
  }

  const { data, error } = await supabase.rpc(
    "get_public_product_bids",
    {
      p_product_id: productId,
    }
  );

  if (error) {
    console.error(
      "Eroare încărcare oferte:",
      error.message
    );

    setBids([]);
    return;
  }

  setBids((data ?? []) as Bid[]);
};

  const checkFavorite = async (
  userId: string | null
) => {
  if (!userId || !productId) {
    setIsFavorite(false);
    return;
  }

  const { data, error } =
    await checkIsFavorite(
      userId,
      productId
    );

  if (error) {
    console.error(
      "Eroare verificare favorite:",
      error.message
    );

    setIsFavorite(false);
    return;
  }

  setIsFavorite(data === true);
};

  useEffect(() => {
  let isMounted = true;

  const loadPageData = async () => {
    if (!productId) {
      if (isMounted) {
        setLoading(false);
      }

      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? "";

    if (isMounted) {
      setCurrentUserId(userId);
    }

    const canViewProduct =
      await fetchProduct();

    if (canViewProduct) {
      await Promise.all([
        fetchBids(),
        checkFavorite(
          userId || null
        ),
      ]);
    } else {
      setBids([]);
      setIsFavorite(false);
    }

    if (isMounted) {
      setLoading(false);
    }
  };

  void loadPageData();

  return () => {
    isMounted = false;
  };
}, [productId]);

useEffect(() => {
  setCurrentTime(Date.now());

  if (!product?.auction_end) {
    return;
  }

  const intervalId =
    window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

  return () => {
    window.clearInterval(
      intervalId
    );
  };
}, [product?.auction_end]);

useEffect(() => {
  if (!productId) {
    return;
  }

  const channelName = [
    "product-page",
    productId,
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "products",
        filter:
          `id=eq.${productId}`,
      },
      async () => {
        await Promise.all([
          fetchProduct(),
          fetchBids(),
        ]);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(
      channel
    );
  };
}, [productId]);

  useEffect(() => {
    setCurrentTime(Date.now());

    if (!product?.auction_end) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [product?.auction_end]);

  useEffect(() => {
  if (!productId) {
    return;
  }

  const channelName = [
    "product-page",
    productId,
    Math.random().toString(36).slice(2),
  ].join("-");

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "products",
        filter: `id=eq.${productId}`,
      },
      async () => {
        await Promise.all([
          fetchProduct(),
          fetchBids(),
        ]);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}, [productId]);

useEffect(() => {
  let cancelled = false;

  async function loadSimilarProducts() {
    if (
      !product ||
      product.status === "removed" ||
      !product.category_id
    ) {
      setSimilarProducts([]);
      setSimilarProductsLoading(false);
      return;
    }

    setSimilarProductsLoading(true);

    const {
      data: primaryData,
      error: primaryError,
    } = await getMarketplaceProducts(
      {
        categoryId:
          product.category_id,

        subcategoryId:
          product.subcategory_id ?? undefined,

        sort: "ending",
      },
      1,
      8
    );

    if (cancelled) {
      return;
    }

    if (primaryError) {
      console.error(
        "Eroare produse similare:",
        primaryError.message
      );

      setSimilarProducts([]);
      setSimilarProductsLoading(false);
      return;
    }

    let candidates =
      (primaryData?.items ?? []).filter(
        (candidate) =>
          candidate.id !== product.id
      );

    /*
     * Dacă subcategoria nu are suficiente
     * produse, completăm din categoria principală.
     */
    if (
      candidates.length < 4 &&
      product.subcategory_id
    ) {
      const {
        data: categoryData,
        error: categoryError,
      } = await getMarketplaceProducts(
        {
          categoryId:
            product.category_id,

          sort: "ending",
        },
        1,
        12
      );

      if (cancelled) {
        return;
      }

      if (!categoryError) {
        const existingIds =
          new Set(
            candidates.map(
              (candidate) =>
                candidate.id
            )
          );

        const fallbackProducts =
          (
            categoryData?.items ?? []
          ).filter(
            (candidate) =>
              candidate.id !==
                product.id &&
              !existingIds.has(
                candidate.id
              )
          );

        candidates = [
          ...candidates,
          ...fallbackProducts,
        ];
      }
    }

    setSimilarProducts(
      candidates.slice(0, 4)
    );

    setSimilarProductsLoading(false);
  }

  void loadSimilarProducts();

  return () => {
    cancelled = true;
  };
}, [
  product?.id,
  product?.category_id,
  product?.subcategory_id,
  product?.status,
]);

  const handleToggleFavorite = async () => {
  if (
    !product ||
    product.status === "removed"
  ) {
    return;
  }

  setFavoriteLoading(true);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert(
        "Trebuie să fii logat ca să salvezi produsul la favorite."
      );

      return;
    }

    if (isFavorite) {
      const { data, error } =
        await removeFavorite(
          user.id,
          productId
        );

      if (error) {
        console.error(
          "Eroare ștergere favorit:",
          error.message
        );

        alert(
          error.message ||
            "Produsul nu a putut fi eliminat din favorite."
        );

        return;
      }

      setIsFavorite(data === true);
    } else {
      const { data, error } =
        await addFavorite(
          user.id,
          productId
        );

      if (error) {
        console.error(
          "Eroare adăugare favorit:",
          error.message
        );

        alert(
          error.message ||
            "Produsul nu a putut fi adăugat la favorite."
        );

        return;
      }

      setIsFavorite(data === true);
    }
  } finally {
    setFavoriteLoading(false);
  }
};

  const handleContactSeller = async () => {
    if (!product) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(
        "Trebuie să fii logat ca să contactezi vânzătorul."
      );

      return;
    }

    if (user.id === product.user_id) {
      alert(
        "Nu poți începe chat cu tine însuți."
      );

      return;
    }

    const {
      data: existingConversation,
      error: conversationError,
    } = await getConversation(
      product.id,
      product.user_id,
      user.id
    );

    if (conversationError) {
      console.error(
        "Eroare căutare conversație:",
        conversationError
      );
    }

    let conversationId =
      existingConversation?.id;

    if (!conversationId) {
      const {
        data: newConversation,
        error,
      } = await createConversation(
        product.id,
        product.user_id,
        user.id
      );

      if (error || !newConversation) {
        alert(
          "Nu am putut crea conversația."
        );

        return;
      }

      conversationId = newConversation.id;
    }

    router.push(
      `/chat?conversation=${conversationId}`
    );
  };

  const handleBid = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setBidError("");
    setBidLoading(true);

    if (!product) {
      setBidError("Produsul nu există.");
      setBidLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBidError(
        "Trebuie să fii logat ca să licitezi."
      );

      setBidLoading(false);
      return;
    }

    if (user.id === product.user_id) {
      setBidError(
        "Nu poți licita la propriul produs."
      );

      setBidLoading(false);
      return;
    }

    const auctionEndTimestamp =
  product.auction_end
    ? new Date(
        product.auction_end
      ).getTime()
    : null;

const remainingMilliseconds =
  auctionEndTimestamp === null
    ? null
    : Math.max(
        auctionEndTimestamp -
          currentTime,
        0
      );

const endedByDate =
  auctionEndTimestamp !== null &&
  remainingMilliseconds === 0;

    const closedStatuses = [
      "ended",
      "transaction_pending",
      "sold",
      "expired",
      "removed",
    ];

    if (
      endedByDate ||
      closedStatuses.includes(
        product.status ?? ""
      )
    ) {
      setBidError(
        "Licitația s-a încheiat."
      );

      setBidLoading(false);
      return;
    }

    const amount = Number(bidAmount);

    const minimumAmount =
      (product.current_price ??
        product.starting_price) + 1;

    if (
      !Number.isFinite(amount) ||
      amount < minimumAmount
    ) {
      setBidError(
        `Oferta minimă este ${formatPrice(
          minimumAmount
        )}.`
      );

      setBidLoading(false);
      return;
    }

    try {
      const updatedProduct = await placeBid({
        product,
        bidderId: user.id,
        amount,
      });

      setProduct({
  ...product,
  current_price:
    updatedProduct.current_price,
  bid_count:
    updatedProduct.bid_count,
  auction_end:
    updatedProduct.auction_end,
});
if (updatedProduct.auction_extended) {
  alert(
    "Oferta a fost acceptată. Licitația a fost prelungită automat cu 2 minute."
  );
}

      setBidAmount("");
      await fetchBids();
    } catch (error) {
      setBidError(
        error instanceof Error
          ? error.message
          : "A apărut o eroare la trimiterea ofertei."
      );
    } finally {
      setBidLoading(false);
    }
  };

  

  const handleReportProduct = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!product) {
      return;
    }

    setReportError("");
    setReportSuccess("");

    const cleanReason = reportReason.trim();

    if (cleanReason.length < 5) {
      setReportError(
        "Motivul raportării trebuie să conțină minimum 5 caractere."
      );

      return;
    }

    if (cleanReason.length > 1000) {
      setReportError(
        "Motivul raportării nu poate depăși 1000 de caractere."
      );

      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setReportError(
        "Trebuie să fii autentificat pentru a raporta produsul."
      );

      return;
    }

    if (user.id === product.user_id) {
      setReportError(
        "Nu poți raporta propriul produs."
      );

      return;
    }

    setReportLoading(true);

    const { error } = await reportProduct({
      productId: product.id,
      reason: cleanReason,
    });

    if (error) {
      setReportError(error.message);
      setReportLoading(false);
      return;
    }

    setReportReason("");
    setShowReportForm(false);

    setReportSuccess(
      "Raportarea a fost trimisă administratorilor pentru verificare."
    );

    setReportLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <p className="text-gray-600">
          Se încarcă produsul...
        </p>
      </main>
    );
  }

  if (!product) {
    const productWasRemoved =
      productError
        .toLowerCase()
        .includes("eliminat");

    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            {productWasRemoved
              ? "Produs indisponibil"
              : "Produsul nu a fost găsit"}
          </h1>

          {productError && (
            <p className="mt-3 text-sm text-red-600">
              {productError}
            </p>
          )}

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            ← Înapoi la toate licitațiile
          </Link>
        </div>
      </main>
    );
  }

  const currentPrice =
    product.current_price ??
    product.starting_price;

  const sellerTrust = sellerProfile
    ? calculateTrustScore(sellerProfile)
    : null;

  const sellerBadges = sellerProfile
    ? getUserBadges(sellerProfile)
    : [];

  const isSeller =
    Boolean(currentUserId) &&
    currentUserId === product.user_id;

  const isWinner =
    Boolean(currentUserId) &&
    currentUserId === product.winner_id;
const auctionEndTimestamp =
  product.auction_end
    ? new Date(
        product.auction_end
      ).getTime()
    : null;

const remainingMilliseconds =
  auctionEndTimestamp === null
    ? null
    : Math.max(
        auctionEndTimestamp -
          currentTime,
        0
      );

const endedByDate =
  auctionEndTimestamp !== null &&
  remainingMilliseconds === 0;

  const closedStatuses = [
    "ended",
    "transaction_pending",
    "sold",
    "expired",
    "removed",
  ];

  const auctionClosed =
    endedByDate ||
    closedStatuses.includes(
      product.status ?? ""
    );

  const isLive =
    !auctionClosed &&
    (product.status === "active" ||
      !product.status);

  const hasBids = bids.length > 0;

  const awaitingAutomaticProcessing =
  endedByDate &&
  (
    product.status === "active" ||
    !product.status
  );

  const canViewTransaction =
    (product.status ===
      "transaction_pending" ||
      product.status === "sold") &&
    (isSeller || isWinner);

  const highestBid =
    bids.length > 0 ? bids[0] : null;

  const highestBidAmount =
    highestBid?.amount ?? currentPrice;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Înapoi la toate licitațiile
        </Link>

        {product.status === "removed" &&
          (isSeller || isAdminViewer) && (
            <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-bold uppercase text-red-600">
                Produs eliminat
              </p>

              <h2 className="mt-2 text-xl font-black text-red-900">
                Acest produs nu mai este
                vizibil public
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-red-800">
                Motiv:{" "}
                {product.removal_reason ||
                  "Motivul eliminării nu este disponibil."}
              </p>

              {product.removed_at && (
                <p className="mt-3 text-sm text-red-700">
                  Eliminat la:{" "}
                  {new Date(
                    product.removed_at
                  ).toLocaleString("ro-RO", {
                    timeZone:
                      "Europe/Bucharest",
                  })}
                </p>
              )}
            </div>
          )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <ProductGallery
              images={
                images.length > 0
                  ? images
                  : product.image_url
                    ? [
                        {
                          id: "main-image",
                          product_id:
                            product.id,
                          image_url:
                            product.image_url,
                          display_order: 0,
                          created_at:
                            product.created_at,
                        },
                      ]
                    : []
              }
              title={product.title}
            />
          </div>

          <section className="rounded-3xl bg-white p-8 shadow-sm lg:sticky lg:top-28 lg:self-start">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                {product.category ||
                  "Fără categorie"}
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {product.condition ||
                  "Stare nespecificată"}
              </span>

              {isLive && (
                <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                  LIVE
                </span>
              )}

              {product.status ===
                "transaction_pending" && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                  TRANZACȚIE ÎN CURS
                </span>
              )}

              {product.status === "sold" && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  VÂNDUT
                </span>
              )}

              {product.status ===
                "expired" && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                  EXPIRAT
                </span>
              )}

              {product.status ===
                "removed" && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                  ELIMINAT
                </span>
              )}
            </div>

            <div className="mb-6 flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold text-gray-900">
                {product.title}
              </h1>

              {product.status !== "removed" && (
                <button
                  type="button"
                  onClick={
                    handleToggleFavorite
                  }
                  disabled={favoriteLoading}
                  className="rounded-full border border-gray-200 px-4 py-3 text-xl hover:bg-gray-50 disabled:opacity-60"
                >
                  {isFavorite ? "❤️" : "🤍"}
                </button>
              )}
            </div>

            <div className="space-y-6">
  <div className="rounded-3xl bg-slate-950 p-6 text-white">
    <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
      Oferta actuală
    </p>

    <p className="mt-2 text-5xl font-extrabold">
      {formatPrice(currentPrice)}
    </p>

    <div className="mt-5 grid grid-cols-2 gap-4">
      <div className="rounded-2xl bg-white/10 p-4">
        <p className="text-xs text-slate-400">
          Preț de pornire
        </p>

        <p className="mt-1 font-bold">
          {formatPrice(
            product.starting_price
          )}
        </p>
      </div>

      <div className="rounded-2xl bg-white/10 p-4">
        <p className="text-xs text-slate-400">
          Oferte
        </p>

        <p className="mt-1 font-bold">
          🔥{" "}
          {product.bid_count ??
            bids.length}
        </p>
      </div>
    </div>

    {product.auction_end && (
      <div
        className={`mt-4 rounded-2xl p-4 ${
          auctionClosed
            ? "bg-red-500/20"
            : remainingMilliseconds !==
                  null &&
                remainingMilliseconds <=
                  10 * 60 * 1000
              ? "bg-red-500/25"
              : "bg-white/10"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {auctionClosed
                ? "Licitație terminată"
                : "Timp rămas"}
            </p>

            <p
              className={`mt-1 text-2xl font-black ${
                !auctionClosed &&
                remainingMilliseconds !==
                  null &&
                remainingMilliseconds <=
                  10 * 60 * 1000
                  ? "text-red-300"
                  : "text-white"
              }`}
            >
              {auctionClosed ||
              remainingMilliseconds ===
                null
                ? "00m 00s"
                : formatRemainingTime(
                    remainingMilliseconds
                  )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">
              Se încheie la
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              {new Date(
                product.auction_end
              ).toLocaleString(
                "ro-RO",
                {
                  timeZone:
                    "Europe/Bucharest",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </p>
          </div>
        </div>

        {!auctionClosed &&
          remainingMilliseconds !==
            null &&
          remainingMilliseconds <=
            10 * 60 * 1000 && (
            <p className="mt-3 text-sm font-semibold text-red-200">
              ⚠️ Licitația se termină în curând.
            </p>
          )}
      </div>
    )}
  </div>
</div>

            {sellerProfile && (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Vândut de
                  </p>

                  <Link
                    href={`/users/${sellerProfile.id}`}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Vezi profil →
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-lg font-bold text-orange-600">
                  {sellerProfile.avatar_url ? (
                    <img
                      src={sellerProfile.avatar_url}
                      alt={
                        sellerProfile.full_name ||
                        "Imagine vânzător"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    sellerProfile.full_name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "U"
                  )}
                </div>

                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {sellerProfile.full_name ||
                        "Utilizator Vendora"}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        🛡 Trust{" "}
                        {sellerTrust?.score ??
                          0}
                        /100
                      </span>

                      <span className="rounded-full bg-yellow-50 px-3 py-1 text-yellow-700">
                        ⭐{" "}
                        {sellerProfile.rating ??
                          0}
                      </span>
                    </div>
                  </div>
                </div>

                {sellerBadges.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {sellerBadges[0].icon}{" "}
                    {sellerBadges[0].title}
                  </div>
                )}

                {isSeller ? (
                  <button
                    type="button"
                    disabled
                    className="mt-4 w-full cursor-not-allowed rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-400 opacity-60"
                  >
                    💬 Acesta este produsul
                    tău
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      handleContactSeller
                    }
                    className="mt-4 w-full rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    💬 Contactează vânzătorul
                  </button>
                )}
              </div>
            )}

            {!isSeller &&
              product.status !== "removed" && (
                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/50 p-4">
                  {reportSuccess ? (
                    <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                      {reportSuccess}
                    </div>
                  ) : !showReportForm ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowReportForm(
                          true
                        );

                        setReportError("");
                        setReportSuccess("");
                      }}
                      className="w-full rounded-xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-700 hover:bg-red-50"
                    >
                      🚩 Raportează produsul
                    </button>
                  ) : (
                    <form
                      onSubmit={
                        handleReportProduct
                      }
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="report-reason"
                          className="font-bold text-slate-900"
                        >
                          Motivul raportării
                        </label>

                        <p className="mt-1 text-sm text-slate-600">
                          Explică de ce produsul
                          sau anunțul ar trebui
                          verificat.
                        </p>

                        <textarea
                          id="report-reason"
                          value={reportReason}
                          onChange={(event) =>
                            setReportReason(
                              event.target
                                .value
                            )
                          }
                          rows={4}
                          minLength={5}
                          maxLength={1000}
                          required
                          placeholder="De exemplu: produs contrafăcut, descriere înșelătoare, conținut interzis..."
                          className="mt-3 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-red-500"
                        />

                        <p className="mt-1 text-right text-xs text-slate-500">
                          {reportReason.length}
                          /1000
                        </p>
                      </div>

                      {reportError && (
                        <div className="rounded-xl bg-red-100 p-3 text-sm text-red-700">
                          {reportError}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={
                            reportLoading
                          }
                          className="rounded-xl bg-red-700 px-5 py-3 font-bold text-white hover:bg-red-800 disabled:opacity-60"
                        >
                          {reportLoading
                            ? "Se trimite..."
                            : "Trimite raportarea"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowReportForm(
                              false
                            );

                            setReportReason("");
                            setReportError("");
                          }}
                          disabled={
                            reportLoading
                          }
                          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 disabled:opacity-60"
                        >
                          Renunță
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            <div className="mt-6">
              {product.status === "removed" ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="text-lg font-bold text-red-800">
                    ⛔ Produs eliminat
                  </p>

                  <p className="mt-2 text-sm text-red-700">
                    Acest produs nu mai poate
                    primi oferte și nu poate fi
                    finalizat.
                  </p>
                </div>
              ) : (
                <>
                  {isSeller &&
                    !auctionClosed && (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <p className="text-lg font-bold text-blue-700">
                          Acesta este produsul
                          tău
                        </p>

                        <p className="mt-2 text-sm text-blue-700">
                          Nu poți licita la
                          propria licitație.
                        </p>
                      </div>
                    )}

                  {auctionClosed ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <p className="text-lg font-bold text-emerald-700">
                        ✅ Licitație încheiată
                      </p>

                      {bids.length > 0 && (
                        <p className="mt-3 font-semibold text-slate-900">
                          Oferta cea mai mare:
                          <span className="ml-2 text-emerald-700">
                            {formatPrice(
                              highestBidAmount
                            )}
                          </span>
                        </p>
                      )}

                      {bids.length === 0 && (
                        <p className="mt-3 text-sm text-slate-700">
                          Licitația nu are
                          oferte.
                        </p>
                      )}

                      {awaitingAutomaticProcessing && (
  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
    <p className="font-bold text-amber-800">
      ⏳ Rezultatul licitației este procesat
    </p>

    <p className="mt-2 text-sm text-amber-700">
      Licitația s-a încheiat. Câștigătorul și tranzacția vor fi stabilite automat în maximum un minut.
    </p>
  </div>
)}

                      {canViewTransaction && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/transactions/${product.id}`
                            )
                          }
                          className="mt-4 w-full rounded-xl border bg-white px-5 py-3 font-semibold hover:bg-gray-50"
                        >
                          Vezi tranzacția
                        </button>
                      )}

                      {product.status ===
                        "sold" && (
                        <div className="mt-4 rounded-xl bg-green-100 p-4 text-sm font-medium text-green-700">
                          Produsul a fost
                          vândut.
                        </div>
                      )}

                      {product.status ===
                        "transaction_pending" &&
                        !canViewTransaction && (
                          <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
                            Tranzacția este în
                            curs între vânzător
                            și câștigător.
                          </div>
                        )}
                    </div>
                  ) : !isSeller ? (
                    <form
                      onSubmit={handleBid}
                      className="space-y-3"
                    >
                      <input
                        type="number"
                        min={currentPrice + 1}
                        required
                        value={bidAmount}
                        onChange={(event) =>
                          setBidAmount(
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                        placeholder={`Minim ${formatPrice(
                          currentPrice + 1
                        )}`}
                      />

                      {bidError && (
                        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                          {bidError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={bidLoading}
                        className="w-full rounded-xl bg-black px-5 py-4 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                      >
                        {bidLoading
                          ? "Se trimite oferta..."
                          : "Licitează"}
                      </button>
                    </form>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                Istoric licitație
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Oferte primite
              </h2>
            </div>

            <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
              🔥 {bids.length} oferte
            </span>
          </div>

          {bids.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-center">
              <p className="font-semibold text-slate-800">
                Nu există oferte încă.
              </p>

              {!auctionClosed && (
                <p className="mt-2 text-sm text-slate-500">
                  Fii primul care licitează
                  pentru acest produs.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid, index) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
                          bid.is_my_bid
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
  {bid.is_my_bid ? "TU" : `#${index + 1}`}
</div>

                    <div>
                      <p className="font-bold text-slate-900">
                        {formatPrice(
                          bid.amount
                        )}
                      </p>

                     <p className="text-sm text-slate-500">
                      {bid.is_my_bid
                        ? "Oferta ta"
                        : "Ofertă anonimă"}
                    </p>
                    </div>
                  </div>

                  <span className="text-sm text-slate-500">
                    {new Date(
                      bid.created_at
                    ).toLocaleString(
                      "ro-RO",
                      {
                        timeZone:
                          "Europe/Bucharest",
                      }
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
                {product.status !== "removed" && (
          <section className="mt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-orange-500">
                  Descoperă și alte produse
                </p>

                <h2 className="mt-1 text-3xl font-black text-slate-900">
                  Produse similare
                </h2>

                <p className="mt-2 text-slate-600">
                  Alte licitații din aceeași categorie.
                </p>
              </div>

              {product.category_id && (
                <Link
                  href={`/dashboard?category=${product.category_id}`}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:border-black hover:text-black"
                >
                  Vezi toată categoria →
                </Link>
              )}
            </div>

            {similarProductsLoading ? (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-black" />

                <p className="text-slate-600">
                  Se încarcă produsele similare...
                </p>
              </div>
            ) : similarProducts.length > 0 ? (
              <ProductGrid
                products={similarProducts}
                favoriteIds={
                  similarFavoriteIds
                }
                onToggleFavorite={
                  toggleSimilarFavorite
                }
                mode="marketplace"
              />
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="font-semibold text-slate-800">
                  Momentan nu există alte produse similare.
                </p>

                <Link
                  href="/dashboard"
                  className="mt-4 inline-block rounded-xl bg-black px-5 py-3 font-bold text-white hover:bg-slate-800"
                >
                  Explorează toate licitațiile
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}