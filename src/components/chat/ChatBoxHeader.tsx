"use client";

import Link from "next/link";
import {
  ExternalLink,
  MessageCircle,
  Package,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type ChatBoxHeaderProps = {
  productId: string;
  productTitle?: string | null;
  productImageUrl?: string | null;
};

export default function ChatBoxHeader({
  productId,
  productTitle,
  productImageUrl,
}: ChatBoxHeaderProps) {
  const messages = useMessages();

  const title =
    productTitle || messages.chat.productFallback;

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-50 text-indigo-600">
          {productImageUrl ? (
            <img
              src={productImageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <Package size={24} />
          )}
        </div>

        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
            <MessageCircle size={14} />
            {messages.chat.chatTitle}
          </p>

          <h2 className="mt-1 line-clamp-1 text-xl font-black text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {messages.chat.chatDescription}
          </p>
        </div>
      </div>

      <Link
        href={`/products/${productId}`}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        {messages.chat.viewProduct}
        <ExternalLink size={15} />
      </Link>
    </header>
  );
}