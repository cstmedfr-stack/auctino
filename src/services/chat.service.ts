import { supabase } from "@/lib/supabase";
import { SendMessagePayload } from "@/types/chat";

export async function getConversation(
  productId: string,
  sellerId: string,
  buyerId: string
) {
  return await supabase
    .from("conversations")
    .select("*")
    .eq("product_id", productId)
    .eq("seller_id", sellerId)
    .eq("buyer_id", buyerId)
    .maybeSingle();
}

export async function createConversation(
  productId: string,
  sellerId: string,
  buyerId: string
) {
  void sellerId;

  return await supabase.rpc(
    "get_or_create_product_conversation",
    {
      p_product_id: productId,
      p_buyer_id: buyerId,
    }
  );
}

export async function getConversationById(
  conversationId: string
) {
  return await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
}

export async function getMessages(
  conversationId: string
) {
  return await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: true,
    });
}

export async function sendMessage({
  conversationId,
  senderId,
  receiverId,
  productId,
  content,
}: SendMessagePayload) {
  void senderId;
  void receiverId;
  void productId;

  const { data, error } = await supabase.rpc(
    "send_message_with_notification",
    {
      p_conversation_id: conversationId,
      p_content: content,
    }
  );

  return {
    data,
    error,
  };
}

export async function getUserConversations(
  userId: string
) {
  return await supabase
    .from("conversations")
    .select(`
      *,
      products (
        id,
        title,
        image_url
      ),
      messages (
        id,
        sender_id,
        content,
        is_read,
        created_at
      )
    `)
    .or(
      `seller_id.eq.${userId},buyer_id.eq.${userId}`
    );
}

export async function markMessagesAsRead(
  conversationId: string,
  currentUserId: string
) {
  void currentUserId;

  return await supabase.rpc(
    "mark_own_conversation_messages_as_read",
    {
      p_conversation_id: conversationId,
    }
  );
}