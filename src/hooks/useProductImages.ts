"use client";

import { useEffect, useState } from "react";
import { ProductImage } from "@/types/productImage";
import { getProductImages } from "@/services/productImage.service";

export function useProductImages(productId: string) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      if (!productId) return;

      setLoading(true);

      const { data, error } = await getProductImages(productId);

           setImages(data || []);
      setLoading(false);
    }

    loadImages();
  }, [productId]);

  return {
    images,
    loading,
  };
}