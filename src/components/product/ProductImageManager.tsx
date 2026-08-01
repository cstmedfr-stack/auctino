"use client";

import {
  useEffect,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  ImageIcon,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { ProductImage } from "@/types/productImage";
import { useMessages } from "@/i18n/useMessages";

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

function getProductImageServiceErrorMessage(
  message: string,
  t: {
    invalidType: string;
    oversized: string;
    remainingSlots: string;
    maxImagesSelected: string;
    authRequired: string;
    cannotModify: string;
    notOwner: string;
    registerError: string;
    uploadError: string;
    deleteError: string;
  }
) {
  if (
    message.startsWith(
      "product_image_invalid_type|"
    )
  ) {
    const file = message.replace(
      "product_image_invalid_type|",
      ""
    );

    return formatMessage(t.invalidType, {
      file,
    });
  }

  if (
    message.startsWith(
      "product_image_oversized|"
    )
  ) {
    const file = message.replace(
      "product_image_oversized|",
      ""
    );

    return formatMessage(t.oversized, {
      file,
    });
  }

  if (
    message.startsWith(
      "product_image_remaining_slots|"
    )
  ) {
    const count = message.replace(
      "product_image_remaining_slots|",
      ""
    );

    return formatMessage(t.remainingSlots, {
      count,
    });
  }

  if (
    message ===
    "product_image_max_reached"
  ) {
    return t.maxImagesSelected;
  }

  if (
    message ===
    "product_image_auth_required"
  ) {
    return t.authRequired;
  }

  if (
    message ===
    "product_image_cannot_modify"
  ) {
    return t.cannotModify;
  }

  if (
    message ===
    "product_image_not_owner"
  ) {
    return t.notOwner;
  }

  if (
    message ===
    "product_image_register_failed"
  ) {
    return t.registerError;
  }

  return message || t.uploadError;
}

export default function ProductImageManager({
  productId,
  userId,
}: Props) {
  const messages = useMessages();
  const t = messages.productImageManager;

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
  
  const [  deleteConfirmationImageId,  setDeleteConfirmationImageId,
] = useState<string | null>(null);

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

  function resetFileInput() {
    setFiles([]);
    setInputKey(
      (currentKey) => currentKey + 1
    );
  }

  function handleFileSelection(
    event: ChangeEvent<HTMLInputElement>
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
        formatMessage(t.invalidType, {
          file: invalidTypeFile.name,
        })
      );

      resetFileInput();
      return;
    }

    const oversizedFile =
      selectedFiles.find(
        (file) =>
          file.size > MAX_FILE_SIZE
      );

    if (oversizedFile) {
      setError(
        formatMessage(t.oversized, {
          file: oversizedFile.name,
        })
      );

      resetFileInput();
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
          ? formatMessage(
              t.remainingSlots,
              {
                count: remainingSlots,
              }
            )
          : t.maxImagesSelected
      );

      resetFileInput();
      return;
    }

    setFiles(selectedFiles);
  }

  async function handleUpload() {
    if (files.length === 0) {
      return;
    }

    const uploadedCount = files.length;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      await uploadProductImages(
        productId,
        userId,
        files
      );

      resetFileInput();

      await loadImages();

      setSuccess(
        uploadedCount === 1
          ? t.uploadSingleSuccess
          : t.uploadMultipleSuccess
      );
    } catch (uploadError) {
     setError(
  uploadError instanceof Error
    ? getProductImageServiceErrorMessage(
        uploadError.message,
        t
      )
    : t.uploadError
);
    } finally {
      setUploading(false);
    }
  }

 async function handleDelete(imageId: string) {
  setDeletingImageId(imageId);
  setDeleteConfirmationImageId(null);
  setError("");
  setSuccess("");

  try {
    await deleteProductImage(imageId);
    await loadImages();

    setSuccess(t.deleteSuccess);
  } catch (deleteError) {
    setError(
      deleteError instanceof Error
        ? getProductImageServiceErrorMessage(
            deleteError.message,
            t
          )
        : t.deleteError
    );
  } finally {
    setDeletingImageId(null);
  }
}

  const remainingSlots =
    MAX_IMAGES - images.length;

  const counterText = formatMessage(
    t.counter,
    {
      current: images.length,
      max: MAX_IMAGES,
    }
  );

  const uploadLabel =
    uploading
      ? t.uploading
      : files.length === 1
        ? t.uploadOne
        : files.length > 1
          ? formatMessage(
              t.uploadWithCount,
              {
                count: files.length,
              }
            )
          : t.upload;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ImageIcon size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {t.title}
            </h2>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              {t.description}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          {counterText}
        </span>
      </div>

      {loadingImages ? (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
          <Loader2
            size={18}
            className="animate-spin"
          />
          {t.loadingImages}
        </div>
      ) : images.length === 0 ? (
        <div className="mb-5 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400">
            <FileImage size={22} />
          </div>

          {t.emptyImages}
        </div>
      ) : (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {images.map((image, index) => {
            const isDeleting =
              deletingImageId === image.id;

            return (
              <div
                key={image.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="relative h-36 bg-slate-100">
                  <Image
                    src={image.image_url}
                    alt={formatMessage(
                      t.imageAlt,
                      {
                        index: index + 1,
                      }
                    )}
                    fill
                    sizes="(max-width: 768px) 50vw, 220px"
                    className="object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-bold text-white">
                      {t.mainImage}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                 onClick={() =>
                      setDeleteConfirmationImageId(image.id)
                    }
                  disabled={
                    deletingImageId !== null ||
                    uploading
                  }
                  className="inline-flex w-full items-center justify-center gap-2 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={16} />
                  )}

                  {isDeleting
                    ? t.deleting
                    : t.delete}
                </button>
              </div>
            );
          })}
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
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white disabled:bg-slate-100 disabled:text-slate-400"
          />

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file) => (
                <div
                  key={`${file.name}-${file.size}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-3 py-2 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <FileImage
                      size={16}
                      className="shrink-0 text-slate-500"
                    />

                    <span className="truncate">
                      <span className="sr-only">
                        {t.selectedFile}
                      </span>
                      {file.name}
                    </span>
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
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <UploadCloud size={18} />
            )}

            {uploadLabel}
          </button>
        </>
      )}

      {remainingSlots === 0 && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-800">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />
          {t.limitReached}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium leading-6 text-green-700">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0"
          />
          {success}
        </div>
      )}
    </section>
  );
}