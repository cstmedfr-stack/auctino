"use client";

import { RefObject } from "react";
import {
  Check,
  CheckCheck,
  Inbox,
} from "lucide-react";

import { Message } from "@/types/chat";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedDateTime } from "@/i18n/format";

type ChatMessageListProps = {
  messages: Message[];
  currentUserId: string;
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

export default function ChatMessageList({
  messages: chatMessages,
  currentUserId,
  messagesEndRef,
}: ChatMessageListProps) {
  const messages = useMessages();
  const { locale } = useLocale();

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
      {chatMessages.length === 0 ? (
        <div className="flex h-full min-h-[360px] items-center justify-center">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
              <Inbox size={26} />
            </div>

            <h3 className="text-lg font-bold text-slate-950">
              {messages.chat.noMessagesTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {messages.chat.noMessagesDescription}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {chatMessages.map((chatMessage) => {
            const isMine =
              chatMessage.sender_id === currentUserId;

            return (
              <div
                key={chatMessage.id}
                className={`flex ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                    isMine
                      ? "bg-slate-950 text-white"
                      : "bg-white text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words leading-6">
                    {chatMessage.content}
                  </p>

                  <p
                    className={`mt-2 flex items-center gap-2 text-[11px] ${
                      isMine
                        ? "text-white/60"
                        : "text-slate-400"
                    }`}
                  >
                    <span>
                      {formatLocalizedDateTime(
                        chatMessage.created_at,
                        locale
                      )}
                    </span>

                    {isMine && (
                      <span className="inline-flex items-center gap-1">
                        {chatMessage.is_read ? (
                          <CheckCheck size={13} />
                        ) : (
                          <Check size={13} />
                        )}

                        {chatMessage.is_read
                          ? messages.chat.read
                          : messages.chat.sent}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}