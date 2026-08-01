"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { useUserProducts } from "@/hooks/useUserProducts";
import ProductGrid from "@/components/product/ProductGrid";
import MyProductsHeader from "@/components/product/MyProductsHeader";
import MyProductsState from "@/components/product/MyProductsState";
import { useMessages } from "@/i18n/useMessages";

import {
  deleteProduct,
  relistExpiredProduct,
} from "@/services/product.service";

type PageNotice = {
  type: "success" | "error";
  message: string;
};

export default function MyProductsPage() {
  const messages = useMessages();
  const t = messages.myProducts;

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

  const [
    deleteConfirmationProductId,
    setDeleteConfirmationProductId,
  ] = useState<string | null>(null);

  const [notice, setNotice] =
    useState<PageNotice | null>(null);

  const [
    deletingProductId,
    setDeletingProductId,
  ] = useState<string | null>(null);

  const requestDeleteProduct = (
    productId: string
  ) => {
    setNotice(null);
    setDeleteConfirmationProductId(productId);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmationProductId) {
      return;
    }

    setDeletingProductId(deleteConfirmationProductId);
    setNotice(null);

    const { error: deleteError } =
      await deleteProduct(
        deleteConfirmationProductId
      );

    if (deleteError) {
      setNotice({
        type: "error",
        message:
          deleteError.message ||
          t.deleteError,
      });

      setDeletingProductId(null);
      return;
    }

    setDeleteConfirmationProductId(null);
    setDeletingProductId(null);

    setNotice({
      type: "success",
      message: t.deleteSuccess,
    });

    await refresh();
  };

  const handleRelistProduct = async (
    productId: string,
    durationDays: number
  ) => {
    setRelistingProductId(productId);
    setNotice(null);

    const { error: relistError } =
      await relistExpiredProduct(
        productId,
        durationDays
      );

    if (relistError) {
      setNotice({
        type: "error",
        message:
          relistError.message ||
          t.relistError,
      });

      setRelistingProductId(null);
      return;
    }

    await refresh();

    setRelistingProductId(null);

    setNotice({
      type: "success",
      message: t.relistSuccess.replace(
        "{days}",
        String(durationDays)
      ),
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <MyProductsHeader
          productsCount={products.length}
        />

        {notice && (
          <div
            className={`mb-6 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
              notice.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />
            )}

            {notice.message}
          </div>
        )}

        {deleteConfirmationProductId && (
          <section className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5">
            <p className="font-black text-red-950">
              {t.deleteConfirmTitle}
            </p>

            <p className="mt-2 text-sm leading-6 text-red-700">
              {t.deleteConfirmDescription}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void confirmDeleteProduct();
                }}
                disabled={deletingProductId !== null}
                className="rounded-2xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:opacity-60"
              >
                {t.confirmDelete}
              </button>

              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmationProductId(null)
                }
                disabled={deletingProductId !== null}
                className="rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              >
                {t.cancelAction}
              </button>
            </div>
          </section>
        )}

        {error && !loading ? (
          <MyProductsState
            type="error"
            message={error}
            onRetry={() => {
              void refresh();
            }}
          />
        ) : loading ? (
          <MyProductsState type="loading" />
        ) : products.length === 0 ? (
          <MyProductsState type="empty" />
        ) : (
          <ProductGrid
            products={products}
            showFavorite={false}
            mode="owner"
            onDeleteProduct={
              requestDeleteProduct
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