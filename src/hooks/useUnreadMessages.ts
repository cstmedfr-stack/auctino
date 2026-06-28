"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUnreadCount(0);
      return;
    }

    const { data: conversations } = await supabase
      .from("conversations")
      .select("id")
      .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);

    const conversationIds = conversations?.map((c) => c.id) || [];

    if (conversationIds.length === 0) {
      setUnreadCount(0);
      return;
    }

    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .neq("sender_id", user.id)
      .eq("is_read", false);

    setUnreadCount(count || 0);
  };

  useEffect(() => {
    loadUnreadMessages();
  }, []);

  return {
    unreadCount,
    refreshUnreadMessages: loadUnreadMessages,
  };
}