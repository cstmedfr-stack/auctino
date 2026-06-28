"use client";

import { useSearchParams } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import ChatBox from "@/components/chat/ChatBox";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { formatChatTime } from "@/utils/date";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get("conversation");

  const { conversations, loading, refresh } = useConversations();
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? "");
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) return;

    const timeout = setTimeout(() => {
      refresh();
    }, 500);

    return () => clearTimeout(timeout);
  }, [selectedConversationId, refresh]);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId
  );

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto flex h-[85vh] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-lg">
        <aside className="w-80 border-r border-slate-200">
          <div className="border-b border-slate-200 p-6">
            <h1 className="text-2xl font-bold">Mesajele mele</h1>
          </div>

          <div className="space-y-2 p-4">
            {loading ? (
              <p className="text-sm text-slate-500">
                Se încarcă conversațiile...
              </p>
            ) : conversations.length === 0 ? (
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="font-semibold">Nicio conversație încă</p>
                <p className="mt-1 text-sm text-slate-500">
                  Când vei începe un chat, va apărea aici.
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isSelected = conversation.id === selectedConversationId;

                const hasUnread = conversation.messages.some(
                  (message) =>
                    !message.is_read && message.sender_id !== currentUserId
                );

                return (
                  <a
                    key={conversation.id}
                    href={`/chat?conversation=${conversation.id}`}
                    className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      isSelected ? "bg-slate-200" : "hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                      {conversation.products?.image_url ? (
                        <img
                          src={conversation.products.image_url}
                          alt={conversation.products.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">IMG</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="line-clamp-1 font-semibold text-slate-900">
                          {conversation.products?.title || "Produs"}
                        </p>

                        {hasUnread && (
                          <span className="h-3 w-3 shrink-0 rounded-full bg-blue-500"></span>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                     {conversation.messages[0]
                      ? `${
                     conversation.messages[0].sender_id === currentUserId
                        ? "Tu: "
                          : ""
                      }${conversation.messages[0].content}`
                     : "Nicio conversație încă"}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        {conversation.messages[0]
                         ? formatChatTime(conversation.messages[0].created_at)
                         : ""}
                      </p>
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex flex-1 items-center justify-center p-6">
          {!selectedConversation || !currentUserId ? (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-700">
                Chat Vendora
              </h2>

              <p className="mt-3 text-slate-500">
                Selectează o conversație din stânga.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-3xl">
              <ChatBox
              conversationId={selectedConversation.id}
                productId={selectedConversation.product_id}
                sellerId={selectedConversation.seller_id}
                buyerId={selectedConversation.buyer_id}
                currentUserId={currentUserId}
              />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}