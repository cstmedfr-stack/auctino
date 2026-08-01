"use client";

import ProductForm from "@/components/forms/ProductForm";
import ProductFormPageHeader from "@/components/forms/ProductFormPageHeader";

export default function AddProductPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <ProductFormPageHeader mode="create" />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ProductForm mode="create" />
        </section>
      </div>
    </main>
  );
}