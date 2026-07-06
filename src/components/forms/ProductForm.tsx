"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import {  createProduct,  refreshProductMainImage,  updateProduct,} from "@/services/product.service";
import { PRODUCT_CONDITIONS } from "@/constants/categories";
import { ROMANIA_COUNTIES } from "@/constants/locations";

import * as productImageService from "@/services/productImage.service";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
};

type Category = {
  id: string;
  name_ro: string;
  icon: string | null;
};

type Subcategory = {
  id: string;
  category_id: string;
  name_ro: string;
};

function parseLocation(
  location: string | null | undefined
) {
  if (!location) {
    return {
      county: "",
      city: "",
    };
  }

  const [countyPart, ...cityParts] =
    location.split(",");

  return {
    county: countyPart?.trim() ?? "",
    city: cityParts.join(",").trim(),
  };
}

export default function ProductForm({
  mode,
  product,
}: ProductFormProps) {
  const router = useRouter();

  const initialLocation = parseLocation(
    product?.location
  );

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [subcategories, setSubcategories] =
    useState<Subcategory[]>([]);

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState(product?.category_id ?? "");

  const [subcategoryId, setSubcategoryId] =
    useState(product?.subcategory_id ?? "");

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(true);

  const [subcategoriesLoading, setSubcategoriesLoading] =
    useState(false);

  const [title, setTitle] = useState(
    product?.title ?? ""
  );

  const [description, setDescription] =
    useState(product?.description ?? "");

  const [condition, setCondition] =
    useState(product?.condition ?? "");

  const [startingPrice, setStartingPrice] =
    useState(
      product?.starting_price !== undefined
        ? String(product.starting_price)
        : ""
    );

  const [county, setCounty] = useState(
    initialLocation.county
  );

  const [city, setCity] = useState(
    initialLocation.city
  );

  const [imageFiles, setImageFiles] =
    useState<File[]>([]);

  const [auctionDuration, setAuctionDuration] =
    useState("7");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setCategoriesLoading(true);

      const { data, error } = await supabase
        .from("categories")
        .select("id, name_ro, icon")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (!isMounted) return;

      if (error) {
        console.error(
          "Eroare categorii:",
          error.message
        );

        setCategories([]);
      } else {
        setCategories(
          (data ?? []) as Category[]
        );
      }

      setCategoriesLoading(false);
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSubcategories() {
      if (!selectedCategoryId) {
        setSubcategories([]);
        setSubcategoriesLoading(false);
        return;
      }

      setSubcategoriesLoading(true);

      const { data, error } = await supabase
        .from("subcategories")
        .select("id, category_id, name_ro")
        .eq(
          "category_id",
          selectedCategoryId
        )
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (!isMounted) return;

      if (error) {
        console.error(
          "Eroare subcategorii:",
          error.message
        );

        setSubcategories([]);
      } else {
        setSubcategories(
          (data ?? []) as Subcategory[]
        );
      }

      setSubcategoriesLoading(false);
    }

    void loadSubcategories();

    return () => {
      isMounted = false;
    };
  }, [selectedCategoryId]);

  function handleCategoryChange(
    categoryId: string
  ) {
    setSelectedCategoryId(categoryId);
    setSubcategoryId("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(
        "Trebuie să fii autentificat pentru a adăuga sau edita un produs."
      );
      setLoading(false);
      return;
    }

    const cleanTitle = title.trim();
    const cleanDescription =
      description.trim();

    if (cleanTitle.length < 3) {
      setError(
        "Titlul trebuie să conțină minimum 3 caractere."
      );
      setLoading(false);
      return;
    }

    if (cleanDescription.length < 10) {
      setError(
        "Descrierea trebuie să conțină minimum 10 caractere."
      );
      setLoading(false);
      return;
    }

    if (!selectedCategoryId) {
      setError("Alege o categorie.");
      setLoading(false);
      return;
    }

    if (!subcategoryId) {
      setError("Alege o subcategorie.");
      setLoading(false);
      return;
    }

    if (!condition) {
      setError("Alege starea produsului.");
      setLoading(false);
      return;
    }

    if (!county) {
      setError("Alege județul.");
      setLoading(false);
      return;
    }

    const cleanCity = city.trim();

    if (!cleanCity) {
      setError("Scrie orașul.");
      setLoading(false);
      return;
    }

    const numericStartingPrice =
      Number(startingPrice);

    if (
      !Number.isFinite(
        numericStartingPrice
      ) ||
      numericStartingPrice < 1
    ) {
      setError(
        "Prețul de pornire trebuie să fie de minimum 1 leu."
      );
      setLoading(false);
      return;
    }

    const selectedCategory =
      categories.find(
        (category) =>
          category.id ===
          selectedCategoryId
      );

    const selectedSubcategory =
      subcategories.find(
        (subcategory) =>
          subcategory.id ===
          subcategoryId
      );

    const categoryLabel =
      selectedCategory &&
      selectedSubcategory
        ? `${selectedCategory.name_ro} > ${selectedSubcategory.name_ro}`
        : product?.category ??
          selectedCategory?.name_ro ??
          "";

    const location =
      `${county}, ${cleanCity}`;

    if (mode === "create") {
      try {
        const auctionEnd = new Date();

        auctionEnd.setDate(
          auctionEnd.getDate() +
            Number(auctionDuration)
        );

        const {
  data: createdProduct,
  error: createError,
} = await createProduct({
  title: cleanTitle,
  description: cleanDescription,
  categoryId: selectedCategoryId,
  subcategoryId,
  condition,
  startingPrice:
    numericStartingPrice,
  location,
  durationDays:
    Number(auctionDuration),
});

if (
  createError ||
  !createdProduct
) {
  setError(
    createError?.message ??
      "Produsul nu a putut fi creat."
  );

  setLoading(false);
  return;
}
        if (imageFiles.length > 0) {
          const uploadedImages =
            await productImageService.uploadProductImages(
              createdProduct.id,
              user.id,
              imageFiles
            );

          if (uploadedImages.length > 0) {
            const {
  error: imageUpdateError,
} = await refreshProductMainImage(
  createdProduct.id
);

            if (imageUpdateError) {
              setError(
                imageUpdateError.message
              );

              setLoading(false);
              return;
            }
          }
        }

        setLoading(false);
        router.push("/dashboard");
        router.refresh();
        return;
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Imaginile produsului nu au putut fi încărcate."
        );

        setLoading(false);
        return;
      }
    }

    if (mode === "edit" && product) {
      if (product.user_id !== user.id) {
        setError(
          "Nu poți edita produsul altui utilizator."
        );
        setLoading(false);
        return;
      }

      const {
        data: currentProduct,
        error: currentProductError,
      } = await supabase
        .from("products")
        .select(
          "id, user_id, status, bid_count, auction_end"
        )
        .eq("id", product.id)
        .maybeSingle();

      if (
        currentProductError ||
        !currentProduct
      ) {
        setError(
          currentProductError?.message ??
            "Produsul nu mai există."
        );

        setLoading(false);
        return;
      }

      if (
        currentProduct.user_id !== user.id
      ) {
        setError(
          "Nu poți edita produsul altui utilizator."
        );
        setLoading(false);
        return;
      }

      const currentStatus =
        currentProduct.status ?? "active";

      if (currentStatus !== "active") {
        setError(
          "Produsul nu mai poate fi editat deoarece licitația nu mai este activă."
        );
        setLoading(false);
        return;
      }

      if (
        (currentProduct.bid_count ?? 0) > 0
      ) {
        setError(
          "Produsul nu mai poate fi editat deoarece a primit deja o ofertă."
        );
        setLoading(false);
        return;
      }

      const auctionEnded =
        currentProduct.auction_end
          ? new Date(
              currentProduct.auction_end
            ).getTime() <= Date.now()
          : false;

      if (auctionEnded) {
        setError(
          "Perioada licitației a expirat. Produsul nu mai poate fi editat."
        );
        setLoading(false);
        return;
      }

      const {
  data: updatedProduct,
  error: updateError,
} = await updateProduct(
  product.id,
  {
    title: cleanTitle,
    description: cleanDescription,
    categoryId:
      selectedCategoryId,
    subcategoryId,
    condition,
    location,
  }
);

      if (!updatedProduct) {
        setError(
          "Produsul nu a putut fi modificat. Este posibil să fi primit între timp o ofertă sau să nu mai fie activ."
        );
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/my-products");
      router.refresh();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {mode === "create" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Imagini produs
          </label>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(event) =>
              setImageFiles(
                event.target.files
                  ? Array.from(
                      event.target.files
                    )
                  : []
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />

          {imageFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imageFiles.map(
                (file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-sm"
                  >
                    📷 {file.name}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Titlu produs
        </label>

        <input
          type="text"
          required
          minLength={3}
          maxLength={150}
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
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
          minLength={10}
          maxLength={5000}
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value
            )
          }
          className="min-h-32 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Scrie câteva detalii despre produs..."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Categorie
          </label>

          <select
            required
            value={selectedCategoryId}
            onChange={(event) =>
              handleCategoryChange(
                event.target.value
              )
            }
            disabled={categoriesLoading}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">
              {categoriesLoading
                ? "Se încarcă..."
                : "Alege categoria"}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.icon}{" "}
                {category.name_ro}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Subcategorie
          </label>

          <select
            required
            value={subcategoryId}
            onChange={(event) =>
              setSubcategoryId(
                event.target.value
              )
            }
            disabled={
              !selectedCategoryId ||
              subcategoriesLoading
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">
              {!selectedCategoryId
                ? "Alege întâi categoria"
                : subcategoriesLoading
                  ? "Se încarcă..."
                  : "Alege subcategoria"}
            </option>

            {subcategories.map(
              (subcategory) => (
                <option
                  key={subcategory.id}
                  value={subcategory.id}
                >
                  {subcategory.name_ro}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Stare produs
        </label>

        <select
          required
          value={condition}
          onChange={(event) =>
            setCondition(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
        >
          <option value="">
            Alege starea
          </option>

          {PRODUCT_CONDITIONS.map(
            (item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            )
          )}
        </select>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Județ
          </label>

          <select
            required
            value={county}
            onChange={(event) =>
              setCounty(event.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          >
            <option value="">
              Alege județul
            </option>

            {ROMANIA_COUNTIES.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Oraș
          </label>

          <input
            type="text"
            required
            value={city}
            onChange={(event) =>
              setCity(event.target.value)
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Timișoara"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Preț de pornire
        </label>

        <input
          type="number"
          required
          min="1"
          step="0.01"
          value={startingPrice}
          disabled={mode === "edit"}
          onChange={(event) =>
            setStartingPrice(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="100"
        />

        {mode === "edit" && (
          <p className="mt-2 text-xs text-gray-500">
            Prețul de pornire nu poate fi
            modificat după publicare.
          </p>
        )}
      </div>

      {mode === "create" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Durata licitației
          </label>

          <select
            value={auctionDuration}
            onChange={(event) =>
              setAuctionDuration(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          >
            <option value="1">1 zi</option>
            <option value="3">3 zile</option>
            <option value="5">5 zile</option>
            <option value="7">7 zile</option>
            <option value="10">
              10 zile
            </option>
          </select>
        </div>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={
          loading ||
          categoriesLoading ||
          subcategoriesLoading
        }
        className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
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