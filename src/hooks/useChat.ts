"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { Conversation, Message } from "@/types/chat";
import {
  getMessages,
  markMessagesAsRead,
  sendMessage,
} from "@/services/chat.service";
import { useMessages } from "@/i18n/useMessages";

type UseChatProps = {
  conversationId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  currentUserId: string;
};

export function useChat({
  conversationId,
  productId,
  sellerId,
  buyerId,
  currentUserId,
}: UseChatProps) {
  const appMessages = useMessages();

  const [
    conversation,
    setConversation,
  ] = useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(false);

  const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const channelRef =
    useRef<ReturnType<typeof supabase.channel> | null>(
      null
    );

  const loadChat = useCallback(async () => {
    if (!conversationId || !currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const activeConversation: Conversation = {
        id: conversationId,
        product_id: productId,
        seller_id: sellerId,
        buyer_id: buyerId,
        created_at: new Date().toISOString(),
      };

      setConversation(activeConversation);

      const {
        data: messagesData,
        error: messagesError,
      } = await getMessages(conversationId);

      if (messagesError) {
        console.error(
          appMessages.chat.loadMessagesError,
          messagesError.message
        );

        setError(
          appMessages.chat.loadMessagesError
        );
        return;
      }

      setMessages(
        (messagesData ?? []) as Message[]
      );

      const { error: readError } =
        await markMessagesAsRead(
          conversationId,
          currentUserId
        );

      if (readError) {
        console.error(
          appMessages.chat.markReadError,
          readError.message
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    conversationId,
    productId,
    sellerId,
    buyerId,
    currentUserId,
    appMessages.chat.loadMessagesError,
    appMessages.chat.markReadError,
  ]);

  useEffect(() => {
    void loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (!conversationId || !currentUserId) {
      return;
    }

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage =
            payload.new as Message;

          setMessages((currentMessages) => {
            const alreadyExists =
              currentMessages.some(
                (message) =>
                  message.id === newMessage.id
              );

            if (alreadyExists) {
              return currentMessages;
            }

            return [
              ...currentMessages,
              newMessage,
            ];
          });

          if (
            newMessage.sender_id !== currentUserId
          ) {
            const { error: readError } =
              await markMessagesAsRead(
                conversationId,
                currentUserId
              );

            if (readError) {
              console.error(
                appMessages.chat.markReadError,
                readError.message
              );
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage =
            payload.new as Message;

          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === updatedMessage.id
                ? {
                    ...message,
                    ...updatedMessage,
                  }
                : message
            )
          );
        }
      )
      .on(
        "broadcast",
        {
          event: "typing",
        },
        (payload: {
          payload?: {
            userId?: string;
          };
        }) => {
          const typingUserId =
            payload.payload?.userId;

          if (
            !typingUserId ||
            typingUserId === currentUserId
          ) {
            return;
          }

          setIsTyping(true);

          if (typingTimeoutRef.current) {
            clearTimeout(
              typingTimeoutRef.current
            );
          }

          typingTimeoutRef.current =
            setTimeout(() => {
              setIsTyping(false);
            }, 2000);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(
          typingTimeoutRef.current
        );
      }

      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [
    conversationId,
    currentUserId,
    appMessages.chat.markReadError,
  ]);

  async function sendTypingEvent() {
    if (
      !conversationId ||
      !currentUserId ||
      !channelRef.current
    ) {
      return;
    }

    await channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: currentUserId,
      },
    });
  }

  async function sendChatMessage(
    senderId: string,
    content: string
  ) {
    if (!conversationId) {
      setError(
        appMessages.chat.missingConversationError
      );
      return false;
    }

    setError("");

    const receiverId =
      senderId === sellerId
        ? buyerId
        : sellerId;

    const { error: sendError } =
      await sendMessage({
        conversationId,
        senderId,
        receiverId,
        productId,
        content,
      });

    if (sendError) {
      console.error(
        appMessages.chat.sendMessageError,
        sendError.message
      );

      setError(
        `${appMessages.chat.sendMessageError} ${sendError.message}`
      );

      return false;
    }

    setIsTyping(false);

    const {
      data: refreshedMessages,
      error: refreshError,
    } = await getMessages(conversationId);

    if (refreshError) {
      console.error(
        appMessages.chat.loadMessagesError,
        refreshError.message
      );
    } else {
      setMessages(
        (refreshedMessages ?? []) as Message[]
      );
    }

    return true;
  }

  function clearError() {
    setError("");
  }

  return {
    conversation,
    messages,
    loading,
    error,
    isTyping,
    clearError,
    loadChat,
    sendTypingEvent,
    sendChatMessage,
  };
}