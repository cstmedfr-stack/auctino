"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { placeBid } from "@/services/bid.service";
import { createNotification } from "@/services/notification.service";
import {  markProductAsEnded,  setProductWinner,} from "@/services/product.service";
import {  createConversation,  getConversation,} from "@/services/chat.service";



function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return "0 lei";
  return `${price} lei`;
}

type Product = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  condition: string | null;
  starting_price: number;
  current_price: number | null;
  location: string | null;
  image_url: string | null;
  created_at: string;
  bid_count: number | null;
  auction_end: string | null;
  status: string | null;
  winner_id: string | null;
};

type Bid = {
  id: string;
  user_id: string;
  amount: number;
  created_at: string;
};

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidLoading, setBidLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const fetchBids = async () => {
    const { data, error } = await supabase
      .from("bids")
      .select("id, user_id, amount, created_at")
      .eq("product_id", productId)
      .order("amount", { ascending: false });

    if (error) {
      console.error("Eroare bids:", error.message);
    } else {
      setBids(data || []);
    }
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Eroare produs:", error.message);
    } else {
      setProduct(data);
    }
  };

  const checkFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("product_id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsFavorite(!error && !!data);
  };

  useEffect(() => {
  const loadPageData = async () => {
    if (!productId) return;

    await fetchProduct();
    await fetchBids();
    await checkFavorite();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUserId(user?.id ?? "");

    setLoading(false);
  };

  loadPageData();
}, [productId]);

  useEffect(() => {
    if (!productId) return;

    const channel = supabase
      .channel(`bids-${productId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `product_id=eq.${productId}`,
        },
        async () => {
          await fetchBids();
          await fetchProduct();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId]);

  useEffect(() => {
    const endAuction = async () => {
      if (!product) return;

      const hasEnded =
        product.auction_end !== null &&
        new Date(product.auction_end).getTime() <= Date.now();

      if (!hasEnded) return;
      if (product.status === "ended") return;

      const highestBid = bids.length > 0 ? bids[0] : null;
      const winnerId = highestBid ? highestBid.user_id : null;

      const { error: winnerError } = await setProductWinner(
        product.id,
        winnerId
      );

      if (winnerError) {
        console.error("Eroare setare câștigător:", winnerError.message);
        return;
      }

      const { error: statusError } = await markProductAsEnded(product.id);

      if (statusError) {
        console.error("Eroare închidere licitație:", statusError.message);
        return;
      }

      if (winnerId) {
        await createNotification({
          userId: winnerId,
          productId: product.id,
          title: "Ai câștigat licitația",
          message: `Ai câștigat licitația pentru "${product.title}".`,
          type: "auction_won",
        });
      }

      await createNotification({
        userId: product.user_id,
        productId: product.id,
        title: "Licitația ta s-a încheiat",
        message: winnerId
          ? `Licitația pentru "${product.title}" s-a încheiat cu un câștigător.`
          : `Licitația pentru "${product.title}" s-a încheiat fără oferte.`,
        type: "auction_ended",
      });

      setProduct({
        ...product,
        status: "ended",
        winner_id: winnerId,
      });
    };

    endAuction();
  }, [product, bids]);

  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Trebuie să fii logat ca să salvezi produsul la favorite.");
      setFavoriteLoading(false);
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("product_id", productId)
        .eq("user_id", user.id);

      if (!error) {
        setIsFavorite(false);
      }
    } else {
      const { error } = await supabase.from("favorites").insert({
        product_id: productId,
        user_id: user.id,
      });

      if (!error) {
        setIsFavorite(true);
      }
    }

    setFavoriteLoading(false);
  };
const handleContactSeller = async () => {
  if (!product) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Trebuie să fii logat ca să contactezi vânzătorul.");
    return;
  }

  if (user.id === product.user_id) {
    alert("Nu poți începe chat cu tine însuți.");
    return;
  }

  const { data: existingConversation } = await getConversation(
    product.id,
    product.user_id,
    user.id
  );

  let conversationId = existingConversation?.id;

  if (!conversationId) {
    const { data: newConversation, error } = await createConversation(
      product.id,
      product.user_id,
      user.id
    );

    if (error || !newConversation) {
      alert("Nu am putut crea conversația.");
      return;
    }

    conversationId = newConversation.id;
  }

  router.push(`/chat?conversation=${conversationId}`);
};
  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();

    setBidError("");
    setBidLoading(true);

    if (!product) {
      setBidError("Produsul nu există.");
      setBidLoading(false);
      return;
    }

    const amount = Number(bidAmount);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setBidError("Trebuie să fii logat ca să licitezi.");
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
        current_price: updatedProduct.current_price,
        bid_count: updatedProduct.bid_count,
      });

      setBidAmount("");
      await fetchBids();
    } catch (error) {
      if (error instanceof Error) {
        setBidError(error.message);
      } else {
        setBidError("A apărut o eroare la trimiterea ofertei.");
      }
    }

    setBidLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <p className="text-gray-600">Se încarcă produsul...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Produsul nu a fost găsit
          </h1>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Înapoi la dashboard
          </Link>
        </div>
      </main>
    );
  }

  const currentPrice = product.current_price ?? product.starting_price;

  const auctionEnded =
    product.auction_end !== null &&
    new Date(product.auction_end).getTime() <= Date.now();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Înapoi la dashboard
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="flex h-96 items-center justify-center bg-gray-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-gray-400">Fără imagine</span>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {product.category || "Fără categorie"}
              </span>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {product.condition || "Stare nespecificată"}
              </span>
            </div>

            <div className="mb-4 flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold text-gray-900">
                {product.title}
              </h1>

              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className="rounded-full border border-gray-200 px-4 py-3 text-xl hover:bg-gray-50 disabled:opacity-60"
              >
                {isFavorite ? "❤️" : "🤍"}
              </button>
            </div>

            <p className="mb-6 text-gray-600">
              {product.description || "Nu există descriere pentru acest produs."}
            </p>

            <div className="mb-6 rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">Preț curent</p>

              <p className="text-4xl font-bold text-gray-900">
                {formatPrice(currentPrice)}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Preț de pornire: {formatPrice(product.starting_price)}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500">Locație</p>
              <p className="font-semibold text-gray-900">
                {product.location || "Nespecificată"}
              </p>
            </div>

            {auctionEnded || product.status === "ended" ? (
              <div className="rounded-2xl bg-red-50 p-5 text-red-600">
                <p className="font-semibold">Licitație încheiată</p>
                <p className="mt-1 text-sm">
                  Nu se mai pot trimite oferte pentru acest produs.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBid} className="space-y-3">
                <input
                  type="number"
                  min={currentPrice + 1}
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  placeholder={`Minim ${formatPrice(currentPrice + 1)}`}
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
                  {bidLoading ? "Se trimite oferta..." : "Licitează"}
                </button>
              </form>
            )}
            <button
          onClick={handleContactSeller}
           className="mt-4 w-full rounded-xl border border-slate-200 px-5 py-4 font-semibold text-slate-700 hover:bg-slate-50">
  💬        Contactează vânzătorul
          </button>
          </section>

        </div>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Oferte primite
          </h2>

          {bids.length === 0 ? (
            <p className="text-gray-600">Nu există oferte încă.</p>
          ) : (
            <div className="space-y-3">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                >
                  <span className="font-semibold text-gray-900">
                    {formatPrice(bid.amount)}
                  </span>

                  <span className="text-sm text-gray-500">
                    {new Date(bid.created_at).toLocaleString("ro-RO")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}