"use client";

import Link from "next/link";
import {  FormEvent,  useEffect,  useState,} from "react";
import {  useParams,  useRouter,} from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {  addFavorite,  removeFavorite,  isFavorite as checkIsFavorite,} from "@/services/favorite.service";
import { supabase } from "@/lib/supabase";
import { reportProduct } from "@/lib/product-reports";
import { formatPrice } from "@/utils/formatPrice";
import { placeBid } from "@/services/bid.service";
import {  createConversation,  getConversation,} from "@/services/chat.service";
import { getPublicProfile } from "@/services/publicProfile.service";
import { getMarketplaceProducts } from "@/services/product.service";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetails from "@/components/product/ProductDetails";
import ProductSummaryPanel from "@/components/product/ProductSummaryPanel";
import ProductSellerCard from "@/components/product/ProductSellerCard";
import ProductReportBox from "@/components/product/ProductReportBox";
import ProductPageState from "@/components/product/ProductPageState";
import RemovedProductNotice from "@/components/product/RemovedProductNotice";
import SimilarProductsSection from "@/components/product/SimilarProductsSection";
import ProductBidPanel from "@/components/auction/ProductBidPanel";
import BidHistory from "@/components/auction/BidHistory";
import { useProductImages } from "@/hooks/useProductImages";
import { useFavorites } from "@/hooks/useFavorites";
import { Profile } from "@/types/profile";
import { Product as MarketplaceProduct } from "@/types/product";
import { getUserBadges } from "@/utils/badges";
import { calculateTrustScore } from "@/utils/trustScore";
import { currentMarket } from "@/config/market";
import { useMessages } from "@/i18n/useMessages";

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
  market_code: "RO" | "FR";
};

type Bid = {
  id: string;
  amount: number;
  created_at: string;
  is_my_bid: boolean;
};

type ProductPageNotice = {
  type: "success" | "error" | "info";
  message: string;
};

export default function ProductPage() {
  const messages = useMessages();
  const params = useParams();
  const router = useRouter();
  const productId =
    typeof params.id === "string"
      ? params.id
      : "";
  const { images } =
    useProductImages(productId);
  const [product, setProduct] =
    useState<Product | null>(null);
  const [
    sellerProfile,
    setSellerProfile,
  ] = useState<Profile | null>(null);
  const [bids, setBids] =
    useState<Bid[]>([]);
  const [isFavorite, setIsFavorite] =
    useState(false);
  const [
    currentUserId,
    setCurrentUserId,
  ] = useState("");
  const [
    isAdminViewer,
    setIsAdminViewer,
  ] = useState(false);
  const [loading, setLoading] =
    useState(true);
  const [currentTime, setCurrentTime] =
    useState(() => Date.now());
  const [productError, setProductError] =
    useState("");
  const [
    productUnavailable,
    setProductUnavailable,
  ] = useState(false);
  const [bidAmount, setBidAmount] =
    useState("");
  const [bidError, setBidError] =
    useState("");
  const [bidLoading, setBidLoading] =
    useState(false);
  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);
  const [
    showReportForm,
    setShowReportForm,
  ] = useState(false);
  const [reportReason, setReportReason] =
    useState("");
  const [
    reportLoading,
    setReportLoading,
  ] = useState(false);
  const [reportError, setReportError] =
    useState("");
  const [
    reportSuccess,
    setReportSuccess,
  ] = useState("");

  const [pageNotice, setPageNotice] =
  useState<ProductPageNotice | null>(null);

  const [
    similarProducts,
    setSimilarProducts,
  ] = useState<MarketplaceProduct[]>([]);
  const [
    similarProductsLoading,
    setSimilarProductsLoading,
  ] = useState(false);
  const {
    favoriteIds: similarFavoriteIds,
    toggleFavorite: toggleSimilarFavorite,
  } = useFavorites();

function getBidServiceErrorMessage(
  error: unknown,
  minimumAmount: number
) {
  const code =
    error instanceof Error
      ? error.message
      : "";

  if (code === "bid_auth_required") {
    return messages.productPage.bidLoginRequired;
  }

  if (code === "bid_invalid_identity") {
    return messages.productPage.bidIdentityInvalid;
  }

  if (code === "bid_own_product") {
    return messages.productPage.bidOwnProductBlocked;
  }

  if (code === "bid_foreign_market") {
    return messages.productPage.bidForeignMarket;
  }

  if (code === "bid_amount_too_low") {
    return messages.productPage.minimumBidError.replace(
      "{amount}",
      formatPrice(minimumAmount)
    );
  }

  if (code === "bid_auction_ended") {
    return messages.productPage.bidAuctionEnded;
  }

  if (code === "bid_invalid_response") {
    return messages.productPage.bidInvalidResponse;
  }

  return error instanceof Error
    ? error.message
    : messages.productPage.bidGenericError;
}

  const fetchProduct =
    async (): Promise<boolean> => {
      if (!productId) {
        return false;
      }

      setProductUnavailable(false);

      const { data, error } =
        await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .eq(
            "market_code",
            currentMarket.code
          )
          .maybeSingle();

      if (error || !data) {
        console.error(
          messages.productPage
            .productLoadConsoleError,
          error
        );

        setProduct(null);
        setSellerProfile(null);

        setProductError(
          error?.message ||
            messages.productPage
              .productLoadError
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
            messages.productPage
              .viewerRoleConsoleError,
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
        setProductUnavailable(true);

        setProductError(
          messages.productPage
            .removedUnavailableError
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
          messages.productPage
            .sellerProfileConsoleError,
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

    const { data, error } =
      await supabase.rpc(
        "get_public_product_bids",
        {
          p_product_id: productId,
        }
      );

    if (error) {
      console.error(
        messages.productPage
          .bidsLoadConsoleError,
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
        messages.productPage
          .favoriteCheckConsoleError,
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
          checkFavorite(userId || null),
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
      window.clearInterval(intervalId);
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
            product.subcategory_id ??
            undefined,
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
          messages.productPage
            .similarProductsConsoleError,
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

  const handleToggleFavorite =
    async () => {
      if (
        !product ||
        product.status === "removed"
      ) {
        return;
      }
      setFavoriteLoading(true)

      setFavoriteLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
         setPageNotice({
            type: "error",
            message:
              messages.productPage.favoriteLoginRequired,
          });

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
              messages.productPage
                .favoriteRemoveConsoleError,
              error.message
            );

          setPageNotice({
              type: "error",
              message:
                error.message ||
                messages.productPage.favoriteRemoveError,
            });

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
              messages.productPage
                .favoriteAddConsoleError,
              error.message
            );

           setPageNotice({
            type: "error",
            message:
              error.message ||
              messages.productPage.favoriteAddError,
          });

            return;
          }

          setIsFavorite(data === true);
        }
      } finally {
        setFavoriteLoading(false);
      }
    };

  const handleContactSeller =
    async () => {
      setPageNotice(null);
      if (!product) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
      setPageNotice({
        type: "error",
        message:
          messages.productPage.contactLoginRequired,
      });

        return;
      }

      if (user.id === product.user_id) {
       setPageNotice({
        type: "error",
        message:
          messages.productPage.contactOwnProductBlocked,
      });

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
          messages.productPage
            .conversationSearchConsoleError,
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
         setPageNotice({
              type: "error",
              message:
                messages.productPage.conversationCreateError,
            });

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
      setBidError(
        messages.productPage
          .bidProductMissing
      );

      setBidLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBidError(
        messages.productPage
          .bidLoginRequired
      );

      setBidLoading(false);
      return;
    }

    if (user.id === product.user_id) {
      setBidError(
        messages.productPage
          .bidOwnProductBlocked
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
        messages.productPage
          .bidAuctionEnded
      );

      setBidLoading(false);
      return;
    }

    const amount = Number(bidAmount);

    const minimumAmount =
  (product.bid_count ?? 0) > 0
    ? (product.current_price ?? product.starting_price) + 1
    : product.starting_price;

    if (
      !Number.isFinite(amount) ||
      amount < minimumAmount
    ) {
      setBidError(
        messages.productPage.minimumBidError.replace(
          "{amount}",
          formatPrice(minimumAmount)
        )
      );

      setBidLoading(false);
      return;
    }

    try {
      const updatedProduct =
        await placeBid({
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
          setPageNotice({
            type: "info",
            message: messages.productPage.bidExtended,
          });
        }

      setBidAmount("");
      await fetchBids();
    } catch (error) {
     setBidError(
  getBidServiceErrorMessage(
    error,
    minimumAmount
  )
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

    const cleanReason =
      reportReason.trim();

    if (cleanReason.length < 5) {
      setReportError(
        messages.productPage
          .reportReasonTooShort
      );

      return;
    }

    if (cleanReason.length > 1000) {
      setReportError(
        messages.productPage
          .reportReasonTooLong
      );

      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setReportError(
        messages.productPage
          .reportLoginRequired
      );

      return;
    }

    if (user.id === product.user_id) {
      setReportError(
        messages.productPage
          .reportOwnProductBlocked
      );

      return;
    }

    setReportLoading(true);

    const { error } =
      await reportProduct({
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
      messages.productPage.reportSubmitted
    );

    setReportLoading(false);
  };

  if (loading) {
    return (
      <ProductPageState type="loading" />
    );
  }

  if (!product) {
    return (
      <ProductPageState
        type="not-found"
        title={
          productUnavailable
            ? messages.productPage
                .productUnavailableTitle
            : messages.productPage
                .productNotFoundTitle
        }
        description={productError}
      />
    );
  }

  const currentPrice =
    product.current_price ??
    product.starting_price;

  const sellerTrust = sellerProfile
  ? calculateTrustScore(
      sellerProfile,
      messages.publicProfile.trustScoreLabels
    )
  : null;

const sellerBadges = sellerProfile
  ? getUserBadges(
      sellerProfile,
      messages.publicProfile.badgeLabels,
      messages.publicProfile.trustScoreLabels
    )
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

  const awaitingAutomaticProcessing =
    endedByDate &&
    (product.status === "active" ||
      !product.status);

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
    <main className="min-h-screen w-full min-w-0 overflow-x-clip bg-slate-50 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full min-w-0 max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft size={17} />
          {messages.productPage.backToAuctions}
        </Link>

        {product.status === "removed" &&
          (isSeller || isAdminViewer) && (
            <RemovedProductNotice
              reason={
                product.removal_reason
              }
              removedAt={
                product.removed_at
              }
            />
          )}
{pageNotice && (
  <div
    className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${
      pageNotice.type === "success"
        ? "border-green-200 bg-green-50 text-green-700"
        : pageNotice.type === "info"
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-red-200 bg-red-50 text-red-700"
    }`}
  >
    {pageNotice.message}
  </div>
)}
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:gap-8">
  <div className="min-w-0 space-y-8">
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

          <section className="min-w-0 w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8 xl:sticky xl:top-28 xl:self-start">
            <ProductSummaryPanel
              product={product}
              currentPrice={currentPrice}
              isFavorite={isFavorite}
              favoriteLoading={
                favoriteLoading
              }
              isLive={isLive}
              auctionClosed={
                auctionClosed
              }
              remainingMilliseconds={
                remainingMilliseconds
              }
              onToggleFavorite={
                handleToggleFavorite
              }
            />

            {sellerProfile && (
              <ProductSellerCard
                seller={sellerProfile}
                trustScore={
                  sellerTrust?.score ?? 0
                }
                badges={sellerBadges}
                isSeller={isSeller}
                onContactSeller={
                  handleContactSeller
                }
              />
            )}

            {!isSeller &&
              product.status !== "removed" && (
                <ProductReportBox
                  showReportForm={
                    showReportForm
                  }
                  reportReason={
                    reportReason
                  }
                  reportLoading={
                    reportLoading
                  }
                  reportError={
                    reportError
                  }
                  reportSuccess={
                    reportSuccess
                  }
                  onOpen={() => {
                    setShowReportForm(true);
                    setReportError("");
                    setReportSuccess("");
                  }}
                  onClose={() => {
                    setShowReportForm(false);
                    setReportReason("");
                    setReportError("");
                  }}
                  onReasonChange={
                    setReportReason
                  }
                  onSubmit={
                    handleReportProduct
                  }
                />
              )}

            <ProductBidPanel
              productStatus={
                product.status
              }
              isSeller={isSeller}
              auctionClosed={
                auctionClosed
              }
              bidsCount={product.bid_count ?? 0}
              highestBidAmount={
                highestBidAmount
              }
              awaitingAutomaticProcessing={
                awaitingAutomaticProcessing
              }
              canViewTransaction={
                canViewTransaction
              }
              currentPrice={
                currentPrice
              }
              bidAmount={bidAmount}
              bidError={bidError}
              bidLoading={bidLoading}
              onBidAmountChange={
                setBidAmount
              }
              onBidSubmit={handleBid}
              onViewTransaction={() =>
                router.push(
                  `/transactions/${product.id}`
                )
              }
            />
          </section>
        </div>

        <section className="mt-8">
          <ProductDetails
            description={
              product.description
            }
            category={product.category}
            condition={product.condition}
            location={product.location}
            createdAt={
              product.created_at
            }
            status={product.status}
          />
        </section>

        <BidHistory
          bids={bids}
          auctionClosed={
            auctionClosed
          }
        />

        {product.status !== "removed" && (
          <SimilarProductsSection
            products={similarProducts}
            favoriteIds={
              similarFavoriteIds
            }
            loading={
              similarProductsLoading
            }
            categoryId={
              product.category_id
            }
            onToggleFavorite={
              toggleSimilarFavorite
            }
          />
        )}
      </div>
    </main>
  );
}