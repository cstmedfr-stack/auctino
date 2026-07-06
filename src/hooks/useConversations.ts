"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { getUserConversations } from "@/services/chat.service";

type ConversationWithProduct = {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  created_at: string;

  products: {
    id: string;
    title: string;
    image_url: string | null;
  } | null;

  messages: {
    id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
  }[];
};

export function useConversations() {
  const [conversations, setConversations] =
    useState<ConversationWithProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadConversations =
    useCallback(async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data, error } =
        await getUserConversations(user.id);

      if (error) {
        console.error(
          "Eroare la încărcarea conversațiilor:",
          error.message
        );

        setLoading(false);
        return;
      }

      const sorted = (
        (data ?? []) as ConversationWithProduct[]
      )
        .map((conversation) => ({
          ...conversation,

          messages: [
            ...(conversation.messages ?? []),
          ].sort(
            (firstMessage, secondMessage) =>
              new Date(
                secondMessage.created_at
              ).getTime() -
              new Date(
                firstMessage.created_at
              ).getTime()
          ),
        }))
        .sort(
          (
            firstConversation,
            secondConversation
          ) => {
            const firstDate =
              firstConversation.messages[0]
                ?.created_at ??
              firstConversation.created_at;

            const secondDate =
              secondConversation.messages[0]
                ?.created_at ??
              secondConversation.created_at;

            return (
              new Date(secondDate).getTime() -
              new Date(firstDate).getTime()
            );
          }
        );

      setConversations(sorted);
      setLoading(false);
    }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    let isCancelled = false;

    let realtimeChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    async function setupRealtime() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        isCancelled ||
        userError ||
        !user
      ) {
        return;
      }

      /*
       * Numele unic împiedică React Strict Mode
       * să refolosească un canal deja abonat.
       */
      const uniqueChannelName = [
        "conversation-updates",
        user.id,
        Date.now(),
        Math.random()
          .toString(36)
          .slice(2),
      ].join("-");

      /*
       * Toate callbackurile sunt adăugate înainte
       * de apelarea subscribe().
       */
      realtimeChannel = supabase
        .channel(uniqueChannelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          () => {
            if (!isCancelled) {
              void loadConversations();
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "conversations",
          },
          () => {
            if (!isCancelled) {
              void loadConversations();
            }
          }
        )
        .subscribe((status, error) => {
          if (error) {
            console.error(
              "Eroare Realtime conversații:",
              status,
              error
            );
          }
        });
    }

    void setupRealtime();

    return () => {
      isCancelled = true;

      if (realtimeChannel) {
        void supabase.removeChannel(
          realtimeChannel
        );
      }
    };
  }, [loadConversations]);

  return {
    conversations,
    loading,
    refresh: loadConversations,
  };
}