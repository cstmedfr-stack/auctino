"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

import ProductForm from "@/components/forms/ProductForm";
import ProductImageManager from "@/components/product/ProductImageManager";
import ProductFormPageHeader from "@/components/forms/ProductFormPageHeader";
import ProductFormPageState from "@/components/forms/ProductFormPageState";

import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { getProductById } from "@/services/product.service";
import { useMessages } from "@/i18n/useMessages";

export default function EditProductPage() {
  const messages = useMessages();
  const t = messages.productFormPage;

  const params = useParams();
  const router = useRouter();

  const productId =
    typeof params.id === "string" ? params.id : "";

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

const [pageError, setPageError] =
  useState<string>("");

  const [errorTitle, setErrorTitle] =
  useState<string>(    t.cannotEditDefaultTitle
  );
  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      if (!productId) {
        if (isMounted) {
          setErrorTitle(t.notFoundTitle);
          setPageError(
            t.invalidProductAddress
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
          t.editConsoleError,
          error?.message
        );

        setProduct(null);
        setErrorTitle(t.notFoundTitle);
        setPageError(
          t.requestedProductUnavailable
        );
        setLoading(false);
        return;
      }

      const loadedProduct = data as Product;

      if (loadedProduct.user_id !== user.id) {
        setProduct(null);
        setErrorTitle(t.accessDeniedTitle);
        setPageError(
          t.otherUserProduct
        );
        setLoading(false);
        return;
      }

      const status =
        loadedProduct.status ?? "active";

      if (status === "removed") {
        setProduct(null);
        setErrorTitle(t.removedTitle);
        setPageError(
          loadedProduct.removal_reason
            ? t.removedWithReason.replace(
                "{reason}",
                loadedProduct.removal_reason
              )
            : t.removedNoEdit
        );
        setLoading(false);
        return;
      }

      if (status === "sold") {
        setProduct(null);
        setErrorTitle(t.soldTitle);
        setPageError(t.soldNoEdit);
        setLoading(false);
        return;
      }

      if (status === "transaction_pending") {
        setProduct(null);
        setErrorTitle(
          t.transactionPendingTitle
        );
        setPageError(
          t.transactionPendingNoEdit
        );
        setLoading(false);
        return;
      }

      if (
        status === "ended" ||
        status === "expired"
      ) {
        setProduct(null);
        setErrorTitle(
          t.auctionEndedTitle
        );
        setPageError(t.endedNoEdit);
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
        setErrorTitle(
          t.auctionEndedTitle
        );
        setPageError(
          t.auctionExpiredNoEdit
        );
        setLoading(false);
        return;
      }

      if ((loadedProduct.bid_count ?? 0) > 0) {
        setProduct(null);
        setErrorTitle(
          t.productWithBidsTitle
        );
        setPageError(
          t.productWithBidsNoEdit
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
  }, [productId, router, t]);

  if (loading) {
    return <ProductFormPageState type="loading" />;
  }

  if (!product) {
    return (
      <ProductFormPageState
        type="error"
        title={errorTitle}
        message={pageError}
        productId={productId || undefined}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <ProductFormPageHeader mode="edit" />

        <div className="mb-8">
          <ProductImageManager
            productId={product.id}
            userId={product.user_id}
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ProductForm
            mode="edit"
            product={product}
          />
        </section>
      </div>
    </main>
  );
}