"use client";

import { useEffect, useState } from "react";
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
  const [conversations, setConversations] = useState<ConversationWithProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const { data, error } = await getUserConversations(user.id);

    if (!error && data) {
     const sorted = (data as ConversationWithProduct[])
  .map((conversation) => ({
    ...conversation,
    messages: [...(conversation.messages || [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    ),
  }))
  .sort((a, b) => {
    const aDate =
      a.messages[0]?.created_at ?? a.created_at;

    const bDate =
      b.messages[0]?.created_at ?? b.created_at;

    return (
      new Date(bDate).getTime() -
      new Date(aDate).getTime()
    );
  });

setConversations(sorted);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return {
    conversations,
    loading,
    refresh: loadConversations,
  };
}