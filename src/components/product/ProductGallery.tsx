
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Maximize2,
  X,
} from "lucide-react";
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
    () => images.filter((image) => Boolean(image.image_url)),
    [images]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  const imageCount = validImages.length;

  const safeIndex =
    imageCount > 0
      ? Math.min(selectedIndex, imageCount - 1)
      : 0;

  const selectedImage =
    validImages[safeIndex]?.image_url ?? "";

  const showPrevious = () => {
    setSelectedIndex((index) =>
      (index - 1 + imageCount) % imageCount
    );
  };

  const showNext = () => {
    setSelectedIndex((index) =>
      (index + 1) % imageCount
    );
  };

  const closeZoom = () => {
    setIsZoomOpen(false);
  };

  // Inchidere cu Escape si navigare cu sagetile tastaturii.
  useEffect(() => {
    if (!isZoomOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsZoomOpen(false);
      }

      if (imageCount > 1) {
        if (event.key === "ArrowLeft") {
          setSelectedIndex((index) =>
            (index - 1 + imageCount) % imageCount
          );
        }

        if (event.key === "ArrowRight") {
          setSelectedIndex((index) =>
            (index + 1) % imageCount
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      openButtonRef.current?.focus();
    };
  }, [isZoomOpen, imageCount]);

  // Inchidem fereastra daca produsul nu mai are imagini.
  useEffect(() => {
    if (imageCount === 0) {
      setIsZoomOpen(false);
      setSelectedIndex(0);
    }
  }, [imageCount]);

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (touchStartX.current === null || imageCount < 2) {
      return;
    }

    const endX =
      event.changedTouches[0]?.clientX ??
      touchStartX.current;

    const difference = endX - touchStartX.current;

    if (Math.abs(difference) > 50) {
      if (difference > 0) {
        showPrevious();
      } else {
        showNext();
      }
    }

    touchStartX.current = null;
  };

  return (
    <section className="w-full min-w-0 space-y-4">
      {/* Fotografia principala */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative flex h-[320px] items-center justify-center bg-slate-100 sm:h-[520px]">
          {selectedImage ? (
            <button
              ref={openButtonRef}
              type="button"
              onClick={() => setIsZoomOpen(true)}
              aria-label={
                "Mărește fotografia / Agrandir la photo"
              }
              className="group relative h-full w-full cursor-zoom-in overflow-hidden"
            >
              <Image
                src={selectedImage}
                alt={title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />

              <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white shadow-lg">
                <Maximize2 size={15} />
                <span>Mărește / Agrandir</span>
              </span>
            </button>
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

      {/* Miniaturile fotografiilor */}
      {imageCount > 1 && (
        <div className="flex max-w-full gap-3 overflow-x-auto pb-2">
          {validImages.map((image, index) => {
            const isSelected = safeIndex === index;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`${t.imageThumbnail} ${index + 1}`}
                aria-pressed={isSelected}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-slate-100 transition sm:h-24 sm:w-24 ${
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

      {/* Fereastra de marire */}
      {isZoomOpen && selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
          onClick={closeZoom}
        >
          {/* Inchidere */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeZoom}
            aria-label="Închide / Fermer"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
          >
            <X size={25} />
          </button>

          {/* Fotografie marita */}
          <div
            className="relative h-[85dvh] w-full max-w-6xl touch-pan-y px-3 sm:px-14"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={selectedImage}
              alt={`${title} - ${safeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Navigare intre fotografii */}
          {imageCount > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Fotografia anterioară / Photo précédente"
                className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35 sm:left-5"
              >
                <ChevronLeft size={27} />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Fotografia următoare / Photo suivante"
                className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35 sm:right-5"
              >
                <ChevronRight size={27} />
              </button>

              <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                {safeIndex + 1} / {imageCount}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
