"use client";

import ChatBox from "@/components/chat/ChatBox";
import ChatPageHeader from "@/components/chat/ChatPageHeader";
import ChatConversationList from "@/components/chat/ChatConversationList";
import ChatSelectState from "@/components/chat/ChatSelectState";

import { useChatPage } from "@/hooks/useChatPage";

export default function ChatPage() {
  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    currentUserId,
    loading,
    error,
    refresh,
  } = useChatPage();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ChatPageHeader />

        <div className="grid min-h-[720px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[360px_1fr]">
          <ChatConversationList
            conversations={conversations}
            selectedConversationId={
              selectedConversationId
            }
            currentUserId={currentUserId}
            loading={loading}
            error={error}
            onRetry={() => {
              void refresh();
            }}
          />

          <section className="flex min-h-[720px] items-center justify-center bg-slate-50 p-4 sm:p-6">
            {!selectedConversation ||
            !currentUserId ? (
              <ChatSelectState />
            ) : (
              <ChatBox
                conversationId={
                  selectedConversation.id
                }
                productId={
                  selectedConversation.product_id
                }
                sellerId={
                  selectedConversation.seller_id
                }
                buyerId={
                  selectedConversation.buyer_id
                }
                currentUserId={currentUserId}
                productTitle={
                  selectedConversation.products?.title
                }
                productImageUrl={
                  selectedConversation.products
                    ?.image_url
                }
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}