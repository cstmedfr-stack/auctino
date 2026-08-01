"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";

import { useChat } from "@/hooks/useChat";
import { Message } from "@/types/chat";
import { useMessages } from "@/i18n/useMessages";

import ChatBoxHeader from "@/components/chat/ChatBoxHeader";
import ChatMessageList from "@/components/chat/ChatMessageList";
import ChatMessageInput from "@/components/chat/ChatMessageInput";

type ChatBoxProps = {
  conversationId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  currentUserId: string;
  productTitle?: string | null;
  productImageUrl?: string | null;
};

export default function ChatBox({
  conversationId,
  productId,
  sellerId,
  buyerId,
  currentUserId,
  productTitle,
  productImageUrl,
}: ChatBoxProps) {
  const messages = useMessages();

  const [message, setMessage] =
    useState("");

  const [sending, setSending] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const {
    messages: chatMessages,
    loading,
    error,
    clearError,
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

  const typedMessages =
    chatMessages as Message[];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [typedMessages]);

  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanMessage =
      message.trim();

    if (!cleanMessage || sending) {
      return;
    }

    setSending(true);

    try {
      const sentSuccessfully =
        await sendChatMessage(
          currentUserId,
          cleanMessage
        );

      if (sentSuccessfully) {
        setMessage("");
      }
    } finally {
      setSending(false);
    }
  }

  function handleMessageChange(value: string) {
    setMessage(value);

    if (error) {
      clearError();
    }
  }

  if (loading) {
    return (
      <section className="flex h-full w-full items-center justify-center rounded-3xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Loader2
              size={28}
              className="animate-spin"
            />
          </div>

          <p className="font-semibold text-slate-600">
            {messages.chat.loadingChat}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full w-full flex-col rounded-3xl border border-slate-200 bg-white shadow-sm">
      <ChatBoxHeader
        productId={productId}
        productTitle={productTitle}
        productImageUrl={productImageUrl}
      />

      <ChatMessageList
        messages={typedMessages}
        currentUserId={currentUserId}
        messagesEndRef={messagesEndRef}
      />

      <ChatMessageInput
        message={message}
        sending={sending}
        isTyping={isTyping}
        error={error}
        onMessageChange={handleMessageChange}
        onTyping={() => {
          void sendTypingEvent();
        }}
        onSubmit={handleSendMessage}
      />
    </section>
  );
}