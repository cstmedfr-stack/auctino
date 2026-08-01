import type { AdminDispute } from "@/types/transaction";
import { formatMessage } from "@/utils/formatMessage";

export type ResolutionDecision =
  | "completed"
  | "cancelled";

export function getDisputeAuthor(
  dispute: AdminDispute,
  labels: {
    sellerAuthor: string;
    buyerAuthor: string;
    unknownAuthor: string;
  }
) {
  if (
    dispute.disputed_by === dispute.seller_id
  ) {
    return formatMessage(labels.sellerAuthor, {
      name: dispute.seller_name,
    });
  }

  if (
    dispute.disputed_by === dispute.buyer_id
  ) {
    return formatMessage(labels.buyerAuthor, {
      name: dispute.buyer_name,
    });
  }

  return labels.unknownAuthor;
}

export function validateResolutionReason(
  reason: string,
  messages: {
    reasonTooShort: string;
    reasonTooLong: string;
  }
) {
  const cleanReason = reason.trim();

  if (cleanReason.length < 5) {
    return messages.reasonTooShort;
  }

  if (cleanReason.length > 2000) {
    return messages.reasonTooLong;
  }

  return "";
}