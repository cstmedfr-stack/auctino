"use client";

import { MessageCircle } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

export default function ChatSelectState() {
  const messages = useMessages();

  return (
    <div className="max-w-md text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-indigo-600 shadow-sm">
        <MessageCircle size={30} />
      </div>

      <h2 className="text-3xl font-black text-slate-950">
        {messages.chat.selectTitle}
      </h2>

      <p className="mt-3 leading-6 text-slate-500">
        {messages.chat.selectDescription}
      </p>
    </div>
  );
}