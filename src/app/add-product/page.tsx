import ProductForm from "@/components/forms/ProductForm";

export default function AddProductPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Adaugă produs
        </h1>

        <p className="mb-8 text-gray-600">
          Completează detaliile produsului și adaugă o imagine.
        </p>

        <ProductForm mode="create" />
      </div>
    </main>
  );
}