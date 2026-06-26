"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
};

export default function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product?.category || "");
  const [condition, setCondition] = useState(product?.condition || "");
  const [startingPrice, setStartingPrice] = useState(
    product?.starting_price ? String(product.starting_price) : ""
  );
  const [location, setLocation] = useState(product?.location || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [auctionDuration, setAuctionDuration] = useState("7");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Trebuie să fii logat ca să adaugi sau să editezi un produs.");
      setLoading(false);
      return;
    }

    let imageUrl = "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    if (mode === "create") {
      const auctionEnd = new Date();
      auctionEnd.setDate(auctionEnd.getDate() + Number(auctionDuration));

      const { error } = await supabase.from("products").insert({
        user_id: user.id,
        title,
        description,
        category,
        condition,
        starting_price: Number(startingPrice),
        current_price: Number(startingPrice),
        location,
        image_url: imageUrl,
        status: "active",
        auction_end: auctionEnd.toISOString(),
        bid_count: 0,
        winner_id: null,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/dashboard");
      return;
    }

    if (mode === "edit" && product) {
      const { error } = await supabase
        .from("products")
        .update({
          title,
          description,
          category,
          condition,
          location,
          image_url: imageUrl || product.image_url,
        })
        .eq("id", product.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/my-products");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Imagine produs
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Titlu produs
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Ex: iPhone 14 Pro Max"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Descriere
        </label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-32 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Scrie câteva detalii despre produs..."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Categorie
          </label>
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Electronice"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Stare produs
          </label>
          <select
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          >
            <option value="">Alege starea</option>
            <option value="new">Nou</option>
            <option value="used">Folosit</option>
            <option value="very_good">Foarte bună</option>
            <option value="damaged">Defect / pentru piese</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Preț de pornire
          </label>
          <input
            type="number"
            required
            min="1"
            value={startingPrice}
            disabled={mode === "edit"}
            onChange={(e) => setStartingPrice(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="100"
          />
          {mode === "edit" && (
            <p className="mt-2 text-xs text-gray-500">
              Prețul de pornire nu poate fi modificat după publicare.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Locație
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Timișoara"
          />
        </div>
      </div>

      {mode === "create" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Durata licitației
          </label>

          <select
            value={auctionDuration}
            onChange={(e) => setAuctionDuration(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          >
            <option value="1">1 zi</option>
            <option value="3">3 zile</option>
            <option value="5">5 zile</option>
            <option value="7">7 zile</option>
            <option value="10">10 zile</option>
          </select>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
      >
        {loading
          ? mode === "create"
            ? "Se adaugă..."
            : "Se salvează..."
          : mode === "create"
            ? "Adaugă produs"
            : "Salvează modificările"}
      </button>
    </form>
  );
}