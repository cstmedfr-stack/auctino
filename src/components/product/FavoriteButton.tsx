"use client";

import { Heart } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onClick: () => void;
};

export default function FavoriteButton({
  isFavorite,
  onClick,
}: FavoriteButtonProps) {
  const messages = useMessages();
  const t = messages.productCard;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      aria-label={
        isFavorite
          ? t.removeFromFavorites
          : t.addToFavorites
      }
      title={
        isFavorite
          ? t.removeFromFavorites
          : t.addToFavorites
      }
      className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur transition hover:scale-105 hover:border-rose-200 hover:text-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100"
    >
      <Heart
        size={18}
        className={
          isFavorite
            ? "fill-rose-500 text-rose-500"
            : ""
        }
      />
    </button>
  );
}