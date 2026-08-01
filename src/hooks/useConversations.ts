"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { getUserConversations } from "@/services/chat.service";
import { useMessages } from "@/i18n/useMessages";
import {
  ConversationListItem,
  ConversationMessagePreview,
} from "@/types/chat";

function getConversationSortDate(
  conversation: ConversationListItem
) {
  return (
    conversation.messages?.[0]?.created_at ??
    conversation.created_at
  );
}

function sortConversationMessages(
  messages: ConversationMessagePreview[]
) {
  return [...messages].sort(
    (firstMessage, secondMessage) =>
      new Date(
        secondMessage.created_at
      ).getTime() -
      new Date(
        firstMessage.created_at
      ).getTime()
  );
}

function sortConversations(
  conversations: ConversationListItem[]
) {
  return [...conversations].sort(
    (firstConversation, secondConversation) =>
      new Date(
        getConversationSortDate(
          secondConversation
        )
      ).getTime() -
      new Date(
        getConversationSortDate(
          firstConversation
        )
      ).getTime()
  );
}

export function useConversations() {
  const messages = useMessages();

  const [
    conversations,
    setConversations,
  ] = useState<ConversationListItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadConversations = useCallback(
    async (
      options?: {
        silent?: boolean;
      }
    ) => {
      if (!options?.silent) {
        setLoading(true);
      }

      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const {
        data,
        error: conversationsError,
      } = await getUserConversations(user.id);

      if (conversationsError) {
        console.error(
          messages.chat.conversationsLoadError,
          conversationsError.message
        );

        setError(
          messages.chat.conversationsLoadError
        );

        setLoading(false);
        return;
      }

      const preparedConversations = (
        (data ?? []) as ConversationListItem[]
      ).map((conversation) => ({
        ...conversation,
        messages: sortConversationMessages(
          conversation.messages ?? []
        ),
      }));

      setConversations(
        sortConversations(preparedConversations)
      );

      setLoading(false);
    },
    [messages.chat.conversationsLoadError]
  );

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

      const uniqueChannelName = [
        "conversation-updates",
        user.id,
        Date.now(),
        Math.random()
          .toString(36)
          .slice(2),
      ].join("-");

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
              void loadConversations({
                silent: true,
              });
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
              void loadConversations({
                silent: true,
              });
            }
          }
        )
        .subscribe(
          (status, realtimeError) => {
            if (realtimeError) {
              console.error(
                messages.chat
                  .conversationsRealtimeError,
                status,
                realtimeError
              );
            }
          }
        );
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
  }, [
    loadConversations,
    messages.chat.conversationsRealtimeError,
  ]);

  return {
    conversations,
    loading,
    error,
    refresh: loadConversations,
  };
}