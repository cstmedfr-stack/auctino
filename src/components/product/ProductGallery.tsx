"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { ProductImage } from "@/types/productImage";
import { useMessages } from "@/i18n/useMessages";

type ProductGalleryProps = {
  images: ProductImage[];
  title: string;
};

export default function ProductGallery({
  images,
  title,
}: ProductGalleryProps) {
  const messages = useMessages();
  const t = messages.productPage;

  const validImages = useMemo(
    () =>
      images.filter(
        (image) => Boolean(image.image_url)
      ),
    [images]
  );

  const [selectedImage, setSelectedImage] =
    useState("");

  useEffect(() => {
    if (validImages.length > 0) {
      setSelectedImage(
        validImages[0].image_url
      );
      return;
    }

    setSelectedImage("");
  }, [validImages]);

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative flex h-[420px] items-center justify-center bg-slate-100 sm:h-[520px]">
          {selectedImage ? (
           <Image
              src={selectedImage}
              alt={title}
              fill
              priority
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <ImageIcon size={26} />
              </div>

              <span className="text-sm font-semibold">
                {t.noImage}
              </span>
            </div>
          )}
        </div>
      </div>

      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {validImages.map((image, index) => {
            const isSelected =
              selectedImage === image.image_url;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() =>
                  setSelectedImage(
                    image.image_url
                  )
                }
                aria-label={`${t.imageThumbnail} ${index + 1}`}
                className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 bg-slate-100 transition ${
                  isSelected
                    ? "border-indigo-600"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                <Image
                  src={image.image_url}
                  alt={`${title} ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}