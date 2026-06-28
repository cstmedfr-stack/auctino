import { supabase } from "@/lib/supabase";
import { createNotification } from "./notification.service";

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
  return await supabase
    .from("conversations")
    .insert({
      product_id: productId,
      seller_id: sellerId,
      buyer_id: buyerId,
    })
    .select()
    .single();
}
export async function getConversationById(conversationId: string) {
  return await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
}

export async function getMessages(conversationId: string) {
  return await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
}

export async function sendMessage({
  conversationId,
  senderId,
  receiverId,
  productId,
  content,
}: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  productId: string;
  content: string;
}) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  });

  if (error) {
    return { error };
  }
if (error) {
  return { error };
}



await createNotification({
  userId: receiverId,
  productId,
  conversationId,
  title: "Ai primit un mesaj nou",
  message: content,
  type: "new_message",
});

return { error: null };

}

export async function getUserConversations(userId: string) {
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
    .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`);
}
export async function markMessagesAsRead(
  conversationId: string,
  currentUserId: string
) {
  return await supabase
    .from("messages")
    .update({
      is_read: true,
    })
    .eq("conversation_id", conversationId)
    .neq("sender_id", currentUserId)
    .eq("is_read", false);
}