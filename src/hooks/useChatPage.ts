"use client";

import {  useEffect,  useMemo,  useState,} from "react";
import { useSearchParams } from "next/navigation";
import { useConversations } from "@/hooks/useConversations";
import { supabase } from "@/lib/supabase";
import type { ConversationListItem } from "@/types/chat";

export function useChatPage() {
  const searchParams = useSearchParams();

  const selectedConversationId =
    searchParams.get("conversation");

  const {
    conversations,
    loading,
    error,
    refresh,
  } = useConversations();

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState("");

  const typedConversations =
    conversations as ConversationListItem[];

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? "");
    }

    void loadUser();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void refresh({
        silent: true,
      });
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [selectedConversationId, refresh]);

  const selectedConversation = useMemo(() => {
    return typedConversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId
    );
  }, [
    typedConversations,
    selectedConversationId,
  ]);

  return {
    conversations: typedConversations,
    selectedConversation,
    selectedConversationId,
    currentUserId,
    loading,
    error,
    refresh,
  };
}