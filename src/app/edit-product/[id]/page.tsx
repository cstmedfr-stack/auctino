"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/forms/ProductForm";
import { Product } from "@/types/product";
import { getProductById } from "@/services/product.service";

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await getProductById(productId);

      if (error) {
        console.error("Eroare editare produs:", error.message);
      } else {
        setProduct(data);
      }

      setLoading(false);
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

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
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Produsul nu a fost găsit
          </h1>

          <Link
            href="/my-products"
            className="mt-6 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Înapoi la produsele mele
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
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
          Modifică detaliile produsului tău.
        </p>

        <ProductForm mode="edit" product={product} />
      </div>
    </main>
  );
}