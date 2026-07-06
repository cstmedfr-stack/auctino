"use client";

import { useState } from "react";
import Link from "next/link";

import { useUserProducts } from "@/hooks/useUserProducts";
import ProductGrid from "@/components/product/ProductGrid";

import {
  deleteProduct,
  relistExpiredProduct,
} from "@/services/product.service";

export default function MyProductsPage() {
  const {
    products,
    loading,
    error,
    refresh,
  } = useUserProducts();

  const [
    relistingProductId,
    setRelistingProductId,
  ] = useState<string | null>(null);

  const handleDeleteProduct = async (
    productId: string
  ) => {
    const confirmed = window.confirm(
      "Ești sigură că vrei să ștergi acest produs? Această acțiune nu poate fi anulată."
    );

    if (!confirmed) return;

    const { error: deleteError } =
      await deleteProduct(productId);

    if (deleteError) {
      alert(
        deleteError.message ||
          "A apărut o eroare la ștergerea produsului."
      );

      return;
    }

    await refresh();
  };

  const handleRelistProduct = async (
    productId: string,
    durationDays: number
  ) => {
    setRelistingProductId(productId);

    const { error: relistError } =
      await relistExpiredProduct(
        productId,
        durationDays
      );

    if (relistError) {
      alert(
        relistError.message ||
          "Produsul nu a putut fi relistat."
      );

      setRelistingProductId(null);
      return;
    }

    await refresh();

    setRelistingProductId(null);

    alert(
      `Produsul a fost relistat pentru ${durationDays} zile.`
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Produsele mele
            </h1>

            <p className="mt-2 text-gray-600">
              Aici vezi toate produsele pe care
              le-ai adăugat.
            </p>
          </div>

          <Link
            href="/add-product"
            className="rounded-xl bg-black px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
          >
            Adaugă produs
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">
            Se încarcă produsele tale...
          </p>
        ) : products.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Nu ai adăugat produse încă
            </h2>

            <p className="mb-6 text-gray-600">
              Adaugă primul produs pentru a începe
              să vinzi.
            </p>

            <Link
              href="/add-product"
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              Adaugă primul produs
            </Link>
          </div>
        ) : (
          <ProductGrid
            products={products}
            showFavorite={false}
            mode="owner"
            onDeleteProduct={
              handleDeleteProduct
            }
            onRelistProduct={
              handleRelistProduct
            }
            relistingProductId={
              relistingProductId
            }
          />
        )}
      </div>
    </main>
  );
}