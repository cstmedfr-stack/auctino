"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getPublicUserProducts } from "@/services/product.service";

export function usePublicUserProducts(userId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (!userId) {
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError("");

      const { data, error: productsError } =
        await getPublicUserProducts(userId);

      if (!isMounted) return;

      if (productsError) {
        setProducts([]);
        setError(productsError.message);
        setLoading(false);
        return;
      }

      setProducts((data ?? []) as Product[]);
      setLoading(false);
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return {
    products,
    loading,
    error,
  };
}