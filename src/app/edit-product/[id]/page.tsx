"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ProductForm from "@/components/forms/ProductForm";
import ProductImageManager from "@/components/product/ProductImageManager";

import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { getProductById } from "@/services/product.service";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params.id === "string" ? params.id : "";

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [errorTitle, setErrorTitle] = useState(
    "Produsul nu poate fi editat"
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      if (!productId) {
        if (isMounted) {
          setErrorTitle("Produsul nu a fost găsit");
          setPageError(
            "Adresa produsului nu este validă."
          );
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setPageError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } =
        await getProductById(productId);

      if (!isMounted) return;

      if (error || !data) {
        console.error(
          "Eroare editare produs:",
          error?.message
        );

        setProduct(null);
        setErrorTitle("Produsul nu a fost găsit");
        setPageError(
          "Produsul solicitat nu există sau nu mai este disponibil."
        );
        setLoading(false);
        return;
      }

      const loadedProduct = data as Product;

      if (loadedProduct.user_id !== user.id) {
        setProduct(null);
        setErrorTitle("Acces interzis");
        setPageError(
          "Nu poți edita un produs publicat de alt utilizator."
        );
        setLoading(false);
        return;
      }

      const status =
        loadedProduct.status ?? "active";

      if (status === "removed") {
        setProduct(null);
        setErrorTitle("Produs eliminat");
        setPageError(
          loadedProduct.removal_reason
            ? `Produsul a fost eliminat de administrator. Motiv: ${loadedProduct.removal_reason}`
            : "Produsul a fost eliminat de administrator și nu mai poate fi editat."
        );
        setLoading(false);
        return;
      }

      if (status === "sold") {
        setProduct(null);
        setErrorTitle("Produs vândut");
        setPageError(
          "Un produs vândut nu mai poate fi modificat."
        );
        setLoading(false);
        return;
      }

      if (status === "transaction_pending") {
        setProduct(null);
        setErrorTitle("Tranzacție în curs");
        setPageError(
          "Produsul nu poate fi modificat cât timp tranzacția este în curs."
        );
        setLoading(false);
        return;
      }

      if (
        status === "ended" ||
        status === "expired"
      ) {
        setProduct(null);
        setErrorTitle("Licitație încheiată");
        setPageError(
          "Un produs cu licitația încheiată nu mai poate fi modificat."
        );
        setLoading(false);
        return;
      }

      const auctionEndedByDate =
        loadedProduct.auction_end
          ? new Date(
              loadedProduct.auction_end
            ).getTime() <= Date.now()
          : false;

      if (auctionEndedByDate) {
        setProduct(null);
        setErrorTitle("Licitație încheiată");
        setPageError(
          "Perioada licitației a expirat, iar produsul nu mai poate fi modificat."
        );
        setLoading(false);
        return;
      }

      if ((loadedProduct.bid_count ?? 0) > 0) {
        setProduct(null);
        setErrorTitle("Produs cu oferte");
        setPageError(
          "Produsul nu mai poate fi modificat deoarece a primit deja cel puțin o ofertă."
        );
        setLoading(false);
        return;
      }

      setProduct(loadedProduct);
      setLoading(false);
    }

    void fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-black" />

          <p className="text-center font-semibold text-gray-600">
            Se verifică produsul...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
            ⛔
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            {errorTitle}
          </h1>

          {pageError && (
            <p className="mt-3 leading-7 text-gray-600">
              {pageError}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/my-products"
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              ← Înapoi la produsele mele
            </Link>

            <Link
              href={`/products/${productId}`}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Vezi produsul
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <Link
          href="/my-products"
          className="mb-6 inline-block text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Înapoi la produsele mele
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Editează produs
        </h1>

        <p className="mb-8 text-gray-600">
          Poți modifica produsul doar înainte să
          primească prima ofertă.
        </p>

        <div className="mb-8">
          <ProductImageManager
            productId={product.id}
            userId={product.user_id}
          />
        </div>

        <ProductForm
          mode="edit"
          product={product}
        />
      </div>
    </main>
  );
}