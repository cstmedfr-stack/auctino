"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";

type ChatBoxProps = {
  conversationId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  currentUserId: string;
};

export default function ChatBox({
  conversationId,
  productId,
  sellerId,
  buyerId,
  currentUserId,
}: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
    loading,
    isTyping,
    sendTypingEvent,
    sendChatMessage,
  } = useChat({
    conversationId,
    productId,
    sellerId,
    buyerId,
    currentUserId,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    await sendChatMessage(currentUserId, message.trim());
    setMessage("");
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-gray-600">Se încarcă chat-ul...</p>
      </div>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Chat cu vânzătorul
      </h2>

      <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-gray-50 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nu există mesaje încă. Trimite primul mesaj.
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                    isMine
                      ? "bg-black text-white"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <p>{msg.content}</p>

                  <p
  className={`mt-1 text-[10px] ${
    isMine ? "text-gray-300" : "text-gray-400"
  }`}
>
  {new Date(msg.created_at).toLocaleString("ro-RO")}

  {isMine && (
    <span className="ml-2">
      {msg.is_read ? "✓✓ citit" : "✓ trimis"}
    </span>
  )}
</p>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <p className="mb-3 text-sm italic text-slate-500">
          Celălalt utilizator scrie...
        </p>
      )}

      <form onSubmit={handleSendMessage} className="flex gap-3">
        <input
          type="text"
          value={message}
         onChange={(e) => {
  setMessage(e.target.value);
  sendTypingEvent?.();
}}
          className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          placeholder="Scrie un mesaj..."
        />

        <button
          type="submit"
          className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Trimite
        </button>
      </form>
    </section>
  );
}