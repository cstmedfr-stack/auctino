"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Conversation, Message } from "@/types/chat";
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "@/services/chat.service";

export function useChat({
  conversationId,
  productId,
  sellerId,
  buyerId,
  currentUserId,
}: {
  conversationId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  currentUserId: string;
}) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChat = async () => {
    setLoading(true);

    try {
      const activeConversation: Conversation = {
        id: conversationId,
        product_id: productId,
        seller_id: sellerId,
        buyer_id: buyerId,
        created_at: new Date().toISOString(),
      };

      setConversation(activeConversation);

      const { data: messagesData, error: messagesError } = await getMessages(
        conversationId
      );

      if (messagesError) {
        console.error("Eroare getMessages:", messagesError.message);
        return;
      }

      setMessages(messagesData || []);

      if (currentUserId) {
        const { error: readError } = await markMessagesAsRead(
          conversationId,
          currentUserId
        );

        if (readError) {
          console.error("Eroare markMessagesAsRead:", readError.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      setLoading(false);
      return;
    }

    loadChat();
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          setMessages((prev) => {
            const alreadyExists = prev.some(
              (message) => message.id === newMessage.id
            );

            if (alreadyExists) return prev;

            return [...prev, newMessage];
          });

          if (currentUserId && newMessage.sender_id !== currentUserId) {
            await markMessagesAsRead(conversationId, currentUserId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const sendChatMessage = async (senderId: string, content: string) => {
    if (!conversationId) {
      console.error("Nu există conversationId.");
      return;
    }

    const receiverId = senderId === sellerId ? buyerId : sellerId;

    const { error } = await sendMessage({
      conversationId,
      senderId,
      receiverId,
      productId,
      content,
    });

    if (error) {
      console.error("Eroare sendMessage:", error.message);
      alert(`Eroare la trimiterea mesajului: ${error.message}`);
      return;
    }

    const { data: messagesData } = await getMessages(conversationId);
    setMessages(messagesData || []);
  };

  return {
    conversation,
    messages,
    loading,
    sendChatMessage,
  };
}