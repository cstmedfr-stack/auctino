"use client";

import {
  useEffect,
  useState,
} from "react";

import { ProductImage } from "@/types/productImage";

import {
  deleteProductImage,
  getProductImages,
  uploadProductImages,
} from "@/services/productImage.service";

type Props = {
  productId: string;
  userId: string;
};

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ProductImageManager({
  productId,
  userId,
}: Props) {
  const [images, setImages] =
    useState<ProductImage[]>([]);

  const [files, setFiles] =
    useState<File[]>([]);

  const [loadingImages, setLoadingImages] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [deletingImageId, setDeletingImageId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [inputKey, setInputKey] =
    useState(0);

  async function loadImages() {
    setLoadingImages(true);

    const { data, error: imagesError } =
      await getProductImages(productId);

    if (imagesError) {
      setError(imagesError.message);
      setImages([]);
    } else {
      setImages(
        (data ?? []) as ProductImage[]
      );
    }

    setLoadingImages(false);
  }

  useEffect(() => {
    void loadImages();
  }, [productId]);

  function handleFileSelection(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setSuccess("");

    const selectedFiles =
      event.target.files
        ? Array.from(event.target.files)
        : [];

    if (selectedFiles.length === 0) {
      setFiles([]);
      return;
    }

    const invalidTypeFile =
      selectedFiles.find(
        (file) =>
          !ALLOWED_TYPES.includes(file.type)
      );

    if (invalidTypeFile) {
      setError(
        `"${invalidTypeFile.name}" nu este într-un format acceptat. Folosește JPEG, PNG sau WebP.`
      );

      setFiles([]);
      setInputKey(
        (currentKey) => currentKey + 1
      );
      return;
    }

    const oversizedFile =
      selectedFiles.find(
        (file) =>
          file.size > MAX_FILE_SIZE
      );

    if (oversizedFile) {
      setError(
        `"${oversizedFile.name}" depășește limita de 5 MB.`
      );

      setFiles([]);
      setInputKey(
        (currentKey) => currentKey + 1
      );
      return;
    }

    if (
      images.length +
        selectedFiles.length >
      MAX_IMAGES
    ) {
      const remainingSlots =
        MAX_IMAGES - images.length;

      setError(
        remainingSlots > 0
          ? `Mai poți selecta maximum ${remainingSlots} imagini.`
          : "Produsul are deja numărul maxim de 8 imagini."
      );

      setFiles([]);
      setInputKey(
        (currentKey) => currentKey + 1
      );
      return;
    }

    setFiles(selectedFiles);
  }

  async function handleUpload() {
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await uploadProductImages(
        productId,
        userId,
        files
      );

      setFiles([]);
      setInputKey(
        (currentKey) => currentKey + 1
      );

      await loadImages();

      setSuccess(
        files.length === 1
          ? "Imaginea a fost adăugată."
          : "Imaginile au fost adăugate."
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Imaginile nu au putut fi încărcate."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(
    imageId: string
  ) {
    const confirmed = window.confirm(
      "Ești sigură că vrei să ștergi această imagine?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingImageId(imageId);
    setError("");
    setSuccess("");

    try {
      await deleteProductImage(imageId);
      await loadImages();

      setSuccess(
        "Imaginea a fost ștearsă."
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Imaginea nu a putut fi ștearsă."
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  const remainingSlots =
    MAX_IMAGES - images.length;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Imagini produs
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Maximum 8 imagini, câte 5 MB
            fiecare. Formate: JPEG, PNG sau
            WebP.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {loadingImages ? (
        <p className="mb-5 text-sm text-slate-500">
          Se încarcă imaginile...
        </p>
      ) : images.length === 0 ? (
        <div className="mb-5 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
          Produsul nu are imagini încă.
        </div>
      ) : (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-2xl border border-slate-200"
            >
              <div className="relative">
                <img
                  src={image.image_url}
                  alt={`Imaginea ${index + 1} a produsului`}
                  className="h-36 w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-white">
                    Principală
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  void handleDelete(image.id)
                }
                disabled={
                  deletingImageId !== null ||
                  uploading
                }
                className="w-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingImageId === image.id
                  ? "Se șterge..."
                  : "Șterge"}
              </button>
            </div>
          ))}
        </div>
      )}

      {remainingSlots > 0 && (
        <>
          <input
            key={inputKey}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelection}
            disabled={
              uploading ||
              deletingImageId !== null
            }
            className="w-full rounded-xl border border-gray-300 px-4 py-3 disabled:bg-slate-100"
          />

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2 text-sm"
                >
                  <span className="truncate">
                    📷 {file.name}
                  </span>

                  <span className="shrink-0 text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              void handleUpload()
            }
            disabled={
              uploading ||
              deletingImageId !== null ||
              files.length === 0
            }
            className="mt-3 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading
              ? "Se încarcă..."
              : `Adaugă ${
                  files.length > 0
                    ? files.length
                    : ""
                } ${
                  files.length === 1
                    ? "imagine"
                    : "imagini"
                }`}
          </button>
        </>
      )}

      {remainingSlots === 0 && (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Ai ajuns la limita de 8 imagini.
          Șterge una pentru a putea adăuga
          alta.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}
    </section>
  );
}