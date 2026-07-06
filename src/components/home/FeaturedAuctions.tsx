"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Container } from "../layout/Container";

type FeaturedProduct = {
  id: string;
  title: string;
  category: string | null;
  current_price: number | null;
  starting_price: number;
  bid_count: number | null;
  auction_end: string | null;
  image_url: string | null;
};

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return "0 lei";
  return `${price} lei`;
}

export function FeaturedAuctions() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, title, category, current_price, starting_price, bid_count, auction_end, image_url"
        )
        .eq("status", "active")
        .order("bid_count", { ascending: false })
        .limit(4);

      if (!error) {
        setProducts(data || []);
      }
    };

    loadProducts();
  }, []);

  return (
    <section className="bg-white py-24">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-500">
              Licitații populare
            </p>

            <h2 className="max-w-2xl text-4xl font-extrabold text-slate-900">
              Produse urmărite și licitate chiar acum.
            </h2>
          </div>

          <Link href="/dashboard">
            <Button variant="outline">Vezi toate licitațiile</Button>
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-10 text-center">
            <h3 className="text-xl font-bold text-slate-900">
              Nu există licitații active încă
            </h3>

            <p className="mt-2 text-slate-500">
              Adaugă primul produs și începe prima licitație pe Vendora.
            </p>

            <Link href="/add-product" className="mt-6 inline-block">
              <Button>Vinde un produs</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden p-4">
                <div className="mb-5 flex h-56 items-center justify-center overflow-hidden rounded-[24px] bg-slate-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">Fără imagine</span>
                  )}
                </div>

                <div className="px-2 pb-2">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Badge variant="outline">
                      {product.category || "Fără categorie"}
                    </Badge>

                    <Badge variant="accent">
                      🔥 {product.bid_count ?? 0} oferte
                    </Badge>
                  </div>

                  <h3 className="mb-4 line-clamp-1 text-xl font-bold text-slate-900">
                    {product.title}
                  </h3>

                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Oferta actuală</p>
                      <p className="mt-1 text-2xl font-extrabold text-slate-900">
                        {formatPrice(
                          product.current_price ?? product.starting_price
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock3 className="h-4 w-4" />
                        Final
                      </p>

                      <p className="mt-1 text-sm font-bold text-orange-500">
                        {product.auction_end
                          ? new Date(product.auction_end).toLocaleDateString(
                              "ro-RO"
                            )
                          : "Nespecificat"}
                      </p>
                    </div>
                  </div>

                  <Link href={`/products/${product.id}`}>
                    <Button className="w-full">Vezi licitația</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}