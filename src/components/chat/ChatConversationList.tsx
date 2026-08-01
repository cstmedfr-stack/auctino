"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  Inbox,
  Package,
  Search,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedDateTime } from "@/i18n/format";
import type { ConversationListItem } from "@/types/chat";

type ChatConversationListProps = {
  conversations: ConversationListItem[];
  selectedConversationId: string | null;
  currentUserId: string;
  loading: boolean;
  error?: string;
  onRetry?: () => void;
};

export default function ChatConversationList({
  conversations,
  selectedConversationId,
  currentUserId,
  loading,
  error,
  onRetry,
}: ChatConversationListProps) {
  const messages = useMessages();
  const { locale } = useLocale();

  const [searchQuery, setSearchQuery] =
    useState("");

  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (first, second) => {
        const firstMessage =
          getLatestMessage(first);

        const secondMessage =
          getLatestMessage(second);

        const firstDate =
          firstMessage?.created_at ??
          first.created_at ??
          "";

        const secondDate =
          secondMessage?.created_at ??
          second.created_at ??
          "";

        return (
          new Date(secondDate).getTime() -
          new Date(firstDate).getTime()
        );
      }
    );
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const normalizedQuery =
      searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedConversations;
    }

    return sortedConversations.filter(
      (conversation) => {
        const latestMessage =
          getLatestMessage(conversation);

        const productTitle =
          conversation.products?.title ?? "";

        const latestContent =
          latestMessage?.content ?? "";

        return (
          productTitle
            .toLowerCase()
            .includes(normalizedQuery) ||
          latestContent
            .toLowerCase()
            .includes(normalizedQuery)
        );
      }
    );
  }, [sortedConversations, searchQuery]);

  function getLatestMessage(
    conversation: ConversationListItem
  ) {
    const conversationMessages =
      conversation.messages ?? [];

    return [...conversationMessages].sort(
      (first, second) =>
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
    )[0];
  }

  function hasUnreadMessages(
    conversation: ConversationListItem
  ) {
    return Boolean(
      conversation.messages?.some(
        (message) =>
          !message.is_read &&
          message.sender_id !== currentUserId
      )
    );
  }

  return (
    <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-black text-slate-950">
          {messages.chat.title}
        </h2>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50">
          <Search
            size={17}
            className="shrink-0 text-slate-400"
          />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
            placeholder={
              messages.chat.searchPlaceholder
            }
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="max-h-[660px] space-y-2 overflow-y-auto p-4">
        {loading ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-500">
            {messages.chat.loadingConversations}
          </p>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-5 text-red-700">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-700">
              <AlertTriangle size={24} />
            </div>

            <p className="font-bold">
              {error}
            </p>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-2xl bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800"
              >
                {messages.chat.retry}
              </button>
            )}
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600">
              <Inbox size={24} />
            </div>

            <p className="font-bold text-slate-950">
              {messages.chat.emptyTitle}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {messages.chat.emptyDescription}
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600">
              <Search size={24} />
            </div>

            <p className="font-bold text-slate-950">
              {messages.chat.noSearchResultsTitle}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {messages.chat.noSearchResultsDescription}
            </p>
          </div>
        ) : (
          filteredConversations.map(
            (conversation) => {
              const isSelected =
                conversation.id ===
                selectedConversationId;

              const latestMessage =
                getLatestMessage(conversation);

              const productTitle =
                conversation.products?.title ||
                messages.chat.productFallback;

              const unread =
                hasUnreadMessages(conversation);

              return (
                <Link
                  key={conversation.id}
                  href={`/chat?conversation=${conversation.id}`}
                  aria-current={
                    isSelected
                      ? "page"
                      : undefined
                  }
                  className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                    isSelected
                      ? "bg-slate-950 text-white"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${
                      isSelected
                        ? "bg-white/10"
                        : "bg-slate-100"
                    }`}
                  >
                    {conversation.products
                      ?.image_url ? (
                      <img
                        src={
                          conversation.products
                            .image_url
                        }
                        alt={productTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package
                        size={24}
                        className={
                          isSelected
                            ? "text-white/70"
                            : "text-slate-400"
                        }
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`line-clamp-1 font-bold ${
                          isSelected
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        {productTitle}
                      </p>

                      {unread && (
                        <span
                          aria-label={
                            messages.chat.unreadLabel
                          }
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500"
                        />
                      )}
                    </div>

                    <p
                      className={`mt-1 line-clamp-1 text-xs ${
                        isSelected
                          ? "text-white/70"
                          : "text-slate-500"
                      }`}
                    >
                      {latestMessage
                        ? `${
                            latestMessage.sender_id ===
                            currentUserId
                              ? messages.chat.youPrefix
                              : ""
                          }${latestMessage.content}`
                        : messages.chat.noMessagesPreview}
                    </p>

                    <p
                      className={`mt-1 text-[11px] ${
                        isSelected
                          ? "text-white/50"
                          : "text-slate-400"
                      }`}
                    >
                      {latestMessage
                        ? formatLocalizedDateTime(
                            latestMessage.created_at,
                            locale
                          )
                        : ""}
                    </p>
                  </div>
                </Link>
              );
            }
          )
        )}
      </div>
    </aside>
  );
}