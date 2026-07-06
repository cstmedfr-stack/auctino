"use client";

import { useState, useEffect } from "react";
import { ProductImage } from "@/types/productImage";

type ProductGalleryProps = {
  images: ProductImage[];
  title: string;
};

export default function ProductGallery({
  images,
  title,
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0].image_url);
    }
  }, [images]);
console.log("Gallery images:", images);
console.log("Selected:", selectedImage);

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="flex h-[500px] items-center justify-center bg-gray-100">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-400">Fără imagine</span>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image.image_url)}
              className={`overflow-hidden rounded-2xl border-2 transition ${
                selectedImage === image.image_url
                  ? "border-orange-500"
                  : "border-transparent"
              }`}
            >
              <img
                src={image.image_url}
                alt={title}
                className="h-24 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}