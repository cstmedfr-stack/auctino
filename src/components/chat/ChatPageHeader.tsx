"use client";

import { MessageCircle } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

export default function ChatPageHeader() {
  const messages = useMessages();

  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
        <MessageCircle size={17} />
        {messages.chat.eyebrow}
      </p>

      <h1 className="mt-2 text-3xl font-black text-slate-950">
        {messages.chat.title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {messages.chat.description}
      </p>
    </section>
  );
}