export interface Conversation {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export type ConversationProductPreview = {
  id: string;
  title: string | null;
  image_url: string | null;
};

export type ConversationMessagePreview = {
  id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type ConversationListItem = Conversation & {
  products?: ConversationProductPreview | null;
  messages?: ConversationMessagePreview[];
};

export type SendMessagePayload = {
  conversationId: string;
  senderId: string;
  receiverId: string;
  productId: string;
  content: string;
};