"use client";

import { FormEvent } from "react";
import {
  AlertTriangle,
  Loader2,
  Send,
} from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

type ChatMessageInputProps = {
  message: string;
  sending: boolean;
  isTyping: boolean;
  error?: string;
  onMessageChange: (value: string) => void;
  onTyping: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
};

export default function ChatMessageInput({
  message,
  sending,
  isTyping,
  error,
  onMessageChange,
  onTyping,
  onSubmit,
}: ChatMessageInputProps) {
  const messages = useMessages();

  return (
    <footer className="border-t border-slate-200 p-4">
      {isTyping && (
        <p className="mb-3 text-sm italic text-slate-500">
          {messages.chat.otherTyping}
        </p>
      )}

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0"
          />
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="flex gap-3"
      >
        <input
          type="text"
          value={message}
          onChange={(event) => {
            onMessageChange(event.target.value);
            onTyping();
          }}
          className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
          placeholder={
            messages.chat.messagePlaceholder
          }
        />

        <button
          type="submit"
          disabled={
            sending ||
            message.trim().length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <Send size={18} />
          )}

          <span className="hidden sm:inline">
            {sending
              ? messages.chat.sending
              : messages.chat.send}
          </span>
        </button>
      </form>
    </footer>
  );
}