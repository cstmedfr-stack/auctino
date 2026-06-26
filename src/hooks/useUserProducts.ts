"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { getUserProducts } from "@/services/product.service";

export function useUserProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUserProducts = async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data, error } = await getUserProducts(user.id);

    if (error) {
      setError(error.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUserProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refresh: fetchUserProducts,
  };
}