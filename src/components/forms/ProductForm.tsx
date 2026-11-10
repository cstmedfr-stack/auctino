"use client";

import {
  useEffect,
  useState,
} from "react";
import type {
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  FileImage,
  Loader2,
  Save,
  UploadCloud,
  BadgeCheck,
Sparkles,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import {
  createProduct,
  refreshProductMainImage,
  updateProduct,
} from "@/services/product.service";
import { PRODUCT_CONDITIONS } from "@/constants/categories";
import { ROMANIA_COUNTIES } from "@/constants/locations";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";

import * as productImageService from "@/services/productImage.service";

type ProductFormProps = {
  mode: "create" | "edit";
  product?: Product;
};

type Category = {
  id: string;
  name_ro: string;
  name_fr: string | null;
  icon: string | null;
};

type Subcategory = {
  id: string;
  category_id: string;
  name_ro: string;
  name_fr: string | null;
};

const MAX_CREATE_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

function formatMessage(
  template: string,
  values: Record<string, string | number>
) {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replace(
        `{${key}}`,
        String(value)
      ),
    template
  );
}

export default function ProductForm({
  mode,
  product,
}: ProductFormProps) {
  const router = useRouter();
  const messages = useMessages();
  const t = messages.productForm;
  const { locale } = useLocale();

  function localizedName(nameRo: string, nameFr: string | null) {
    return locale === "fr" ? nameFr?.trim() || nameRo : nameRo;
  }

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

  const [
    subcategoriesLoading,
    setSubcategoriesLoading,
  ] = useState(false);

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

  const [imageInputKey, setImageInputKey] =
    useState(0);

  const [auctionDuration, setAuctionDuration] =
    useState("7");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setCategoriesLoading(true);

      const { data, error } = await supabase
        .from("categories")
        .select("id, name_ro, name_fr, icon")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (!isMounted) return;

      if (error) {
        console.error(
          t.categoriesConsoleError,
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
  }, [t.categoriesConsoleError]);

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
        .select("id, category_id, name_ro, name_fr")
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
          t.subcategoriesConsoleError,
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
  }, [
    selectedCategoryId,
    t.subcategoriesConsoleError,
  ]);

  function resetImageInput() {
    setImageFiles([]);
    setImageInputKey(
      (currentKey) => currentKey + 1
    );
  }

  function handleImageSelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const selectedFiles =
      event.target.files
        ? Array.from(event.target.files)
        : [];

    if (selectedFiles.length === 0) {
      setImageFiles([]);
      return;
    }

    if (
      selectedFiles.length >
      MAX_CREATE_IMAGES
    ) {
      setError(t.maxImages);
      resetImageInput();
      return;
    }

    const invalidTypeFile =
      selectedFiles.find(
        (file) =>
          !ALLOWED_IMAGE_TYPES.includes(
            file.type
          )
      );

    if (invalidTypeFile) {
      setError(
        formatMessage(
          t.invalidImageType,
          {
            file: invalidTypeFile.name,
          }
        )
      );

      resetImageInput();
      return;
    }

    const oversizedFile =
      selectedFiles.find(
        (file) =>
          file.size > MAX_FILE_SIZE
      );

    if (oversizedFile) {
      setError(
        formatMessage(t.imageTooLarge, {
          file: oversizedFile.name,
        })
      );

      resetImageInput();
      return;
    }

    setImageFiles(selectedFiles);
  }

  function handleCategoryChange(
    categoryId: string
  ) {
    setSelectedCategoryId(categoryId);
    setSubcategoryId("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(t.authRequired);
      setLoading(false);
      return;
    }

    const cleanTitle = title.trim();
    const cleanDescription =
      description.trim();

    if (cleanTitle.length < 3) {
      setError(t.titleMinError);
      setLoading(false);
      return;
    }

    if (cleanDescription.length < 10) {
      setError(t.descriptionMinError);
      setLoading(false);
      return;
    }

    if (!selectedCategoryId) {
      setError(t.categoryRequired);
      setLoading(false);
      return;
    }

    if (!subcategoryId) {
      setError(t.subcategoryRequired);
      setLoading(false);
      return;
    }

    if (!condition) {
      setError(t.conditionRequired);
      setLoading(false);
      return;
    }

    if (!county) {
      setError(t.countyRequired);
      setLoading(false);
      return;
    }

    const cleanCity = city.trim();

    if (!cleanCity) {
      setError(t.cityRequired);
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
      setError(t.startingPriceMinError);
      setLoading(false);
      return;
    }

    const location =
      `${county}, ${cleanCity}`;

    if (mode === "create") {
      try {
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
              t.createError
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
            } =
              await refreshProductMainImage(
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
            : t.uploadError
        );

        setLoading(false);
        return;
      }
    }

    if (mode === "edit" && product) {
      if (product.user_id !== user.id) {
        setError(t.editOtherUserError);
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
            t.productMissingError
        );

        setLoading(false);
        return;
      }

      if (
        currentProduct.user_id !== user.id
      ) {
        setError(t.editOtherUserError);
        setLoading(false);
        return;
      }

      const currentStatus =
        currentProduct.status ?? "active";

      if (currentStatus !== "active") {
        setError(t.editInactiveError);
        setLoading(false);
        return;
      }

      if (
        (currentProduct.bid_count ?? 0) > 0
      ) {
        setError(t.editWithBidError);
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
        setError(t.editExpiredError);
        setLoading(false);
        return;
      }

      const {
        data: updatedProduct,
      } = await updateProduct(
        product.id,
        {
          title: cleanTitle,
          description:
            cleanDescription,
          categoryId:
            selectedCategoryId,
          subcategoryId,
          condition,
          location,
        }
      );

      if (!updatedProduct) {
        setError(t.updateError);
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/my-products");
      router.refresh();
    }
  }

  const submitLabel =
    loading
      ? mode === "create"
        ? t.submittingCreate
        : t.submittingEdit
      : mode === "create"
        ? t.submitCreate
        : t.submitEdit;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

{/* Mesaj gratuitate - RO / FR */}
<div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
  <div className="flex items-center gap-3">
    <BadgeCheck
      size={24}
      className="shrink-0 text-emerald-600"
    />

    <div>
      <p className="text-base font-bold text-emerald-900">
        {locale === "fr"
          ? "La mise en vente est gratuite !"
          : "Publicarea produselor este gratuită!"}
      </p>

      <p className="mt-1 text-sm leading-6 text-emerald-800">
        {locale === "fr"
          ? "Publiez votre article et lancez votre enchère sans frais de mise en vente."
          : "Adaugă produsul și pornește licitația fără taxă de publicare."}
      </p>
    </div>
  </div>
</div>
{/* Sfarsit mesaj gratuitate */}

      <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
  <p className="inline-flex items-center gap-2 text-base font-black text-indigo-900">
    <Sparkles size={18} />
    {t.conversionTipsTitle}
  </p>

  <p className="mt-2 text-sm leading-6 text-indigo-700">
    {t.conversionTipsDescription}
  </p>

  <div className="mt-4 grid gap-3 md:grid-cols-3">
    <ProductFormTip>
      {t.conversionTipImages}
    </ProductFormTip>

    <ProductFormTip>
      {t.conversionTipTitle}
    </ProductFormTip>

    <ProductFormTip>
      {t.conversionTipPrice}
    </ProductFormTip>
  </div>
</div>

      {mode === "create" && (
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            {t.imagesLabel}
          </label>

          <p className="mb-3 text-sm leading-6 text-slate-500">
            {t.imagesDescription}
          </p>
          <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
  <UploadCloud size={15} />
  {formatMessage(t.selectedImagesCount, {
    count: imageFiles.length,
  })}
</div>
          <input
            key={imageInputKey}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelection}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
          />

          {imageFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {imageFiles.map(
                (file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="inline-flex max-w-full items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700"
                  >
                    <FileImage
                      size={16}
                      className="shrink-0 text-slate-500"
                    />
                    <span className="sr-only">
                      {t.selectedFile}
                    </span>
                    <span className="truncate">
                      {file.name}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      <FormField label={t.titleLabel}>
        <input
          type="text"
          required
          minLength={3}
          maxLength={150}
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          className={inputClassName}
          placeholder={t.titlePlaceholder}
        />
      </FormField>

      <FormField label={t.descriptionLabel}>
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
          className={`${inputClassName} min-h-36 resize-y`}
          placeholder={
            t.descriptionPlaceholder
          }
        />
      </FormField>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label={t.categoryLabel}>
          <select
            required
            value={selectedCategoryId}
            onChange={(event) =>
              handleCategoryChange(
                event.target.value
              )
            }
            disabled={categoriesLoading}
            className={inputClassName}
          >
            <option value="">
              {categoriesLoading
                ? t.loading
                : t.chooseCategory}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.icon
                  ? `${category.icon} `
                  : ""}
                {localizedName(category.name_ro, category.name_fr)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t.subcategoryLabel}>
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
            className={inputClassName}
          >
            <option value="">
              {!selectedCategoryId
                ? t.chooseCategoryFirst
                : subcategoriesLoading
                  ? t.loading
                  : t.chooseSubcategory}
            </option>

            {subcategories.map(
              (subcategory) => (
                <option
                  key={subcategory.id}
                  value={subcategory.id}
                >
                  {localizedName(subcategory.name_ro, subcategory.name_fr)}
                </option>
              )
            )}
          </select>
        </FormField>
      </div>

      <FormField label={t.conditionLabel}>
        <select
          required
          value={condition}
          onChange={(event) =>
            setCondition(
              event.target.value
            )
          }
          className={inputClassName}
        >
          <option value="">
            {t.chooseCondition}
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
      </FormField>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label={t.countyLabel}>
          <select
            required
            value={county}
            onChange={(event) =>
              setCounty(event.target.value)
            }
            className={inputClassName}
          >
            <option value="">
              {t.chooseCounty}
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
        </FormField>

        <FormField label={t.cityLabel}>
          <input
            type="text"
            required
            value={city}
            onChange={(event) =>
              setCity(event.target.value)
            }
            className={inputClassName}
            placeholder={t.cityPlaceholder}
          />
        </FormField>
      </div>

      <FormField label={t.startingPriceLabel}>
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
          className={inputClassName}
          placeholder={
            t.startingPricePlaceholder
          }
        />

        {mode === "edit" && (
          <p className="mt-2 text-xs text-slate-500">
            {t.startingPriceEditHint}
          </p>
        )}
      </FormField>

      {mode === "create" && (
        <FormField
          label={t.auctionDurationLabel}
        >
          <select
            value={auctionDuration}
            onChange={(event) =>
              setAuctionDuration(
                event.target.value
              )
            }
            className={inputClassName}
          >
            <option value="1">
              {t.durationOneDay}
            </option>
            <option value="3">
              {t.durationThreeDays}
            </option>
            <option value="5">
              {t.durationFiveDays}
            </option>
            <option value="7">
              {t.durationSevenDays}
            </option>
            <option value="10">
              {t.durationTenDays}
            </option>
          </select>
        </FormField>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={
          loading ||
          categoriesLoading ||
          subcategoriesLoading
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2
            size={18}
            className="animate-spin"
          />
        ) : (
          <Save size={18} />
        )}

        {submitLabel}
      </button>
    </form>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50 disabled:text-slate-400";

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}
function ProductFormTip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-2xl bg-white/80 p-3 text-sm font-semibold leading-6 text-indigo-800">
      <BadgeCheck
        size={16}
        className="mt-1 shrink-0"
      />
      <span>{children}</span>
    </div>
  );
}