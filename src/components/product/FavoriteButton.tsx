"use client";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onClick: () => void;
};

export default function FavoriteButton({
  isFavorite,
  onClick,
}: FavoriteButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold hover:bg-gray-50"
    >
      {isFavorite ? "❤️" : "🤍"}
    </button>
  );
}