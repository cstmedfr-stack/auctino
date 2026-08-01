import { Locale } from "@/i18n/config";
import { formatLocalizedPrice } from "@/i18n/format";
import { frMessages } from "@/i18n/messages/fr";
import { roMessages } from "@/i18n/messages/ro";
import { Notification } from "@/types/notification";

type Messages =
  | typeof roMessages
  | typeof frMessages;

type LocalizedNotificationContent = {
  title: string;
  message: string;
};

function replaceVariables(
  template: string,
  variables: Record<string, string>
) {
  return template.replace(
    /\{(\w+)\}/g,
    (match, variableName: string) =>
      variables[variableName] ?? match
  );
}

export function getLocalizedNotificationContent(
  notification: Notification,
  messages: Messages,
  locale: Locale
): LocalizedNotificationContent {
  const fallback = {
    title: notification.title,
    message: notification.message,
  };

  const metadata = notification.metadata;

  if (!metadata) {
    return fallback;
  }

  const productTitle =
    typeof metadata.productTitle === "string"
      ? metadata.productTitle
      : "";

  const currency =
    metadata.currency === "EUR"
      ? "EUR"
      : "RON";

  const hasAmount =
    metadata.amount !== null &&
    metadata.amount !== undefined;

  const amount = hasAmount
    ? formatLocalizedPrice(
        metadata.amount,
        locale,
        currency
      )
    : "";

  switch (notification.type) {
    case "auction_won": {
      if (!productTitle || !hasAmount) {
        return fallback;
      }

      const content =
        messages.notificationContent.auctionWon;

      return {
        title: content.title,
        message: replaceVariables(
          content.message,
          {
            productTitle,
            amount,
          }
        ),
      };
    }

    case "transaction_created": {
      if (!productTitle || !hasAmount) {
        return fallback;
      }

      const content =
        messages.notificationContent
          .transactionCreated;

      return {
        title: content.title,
        message: replaceVariables(
          content.message,
          {
            productTitle,
            amount,
          }
        ),
      };
    }

    case "transaction_confirmed": {
      if (!productTitle) {
        return fallback;
      }

      if (
        metadata.confirmedBy === "seller"
      ) {
        const content =
          messages.notificationContent
            .transactionConfirmedBySeller;

        return {
          title: content.title,
          message: replaceVariables(
            content.message,
            {
              productTitle,
            }
          ),
        };
      }

      if (
        metadata.confirmedBy === "buyer"
      ) {
        const content =
          messages.notificationContent
            .transactionConfirmedByBuyer;

        return {
          title: content.title,
          message: replaceVariables(
            content.message,
            {
              productTitle,
            }
          ),
        };
      }

      return fallback;
    }

    case "transaction_completed": {
      if (!productTitle) {
        return fallback;
      }

      const content =
        messages.notificationContent
          .transactionCompleted;

      return {
        title: content.title,
        message: replaceVariables(
          content.message,
          {
            productTitle,
          }
        ),
      };
    }

    case "auction_ended": {
      if (
        metadata.outcome !== "no_bids" ||
        !productTitle
      ) {
        return fallback;
      }

      const content =
        messages.notificationContent
          .auctionEndedNoBids;

      return {
        title: content.title,
        message: replaceVariables(
          content.message,
          {
            productTitle,
          }
        ),
      };
    }

    default:
      return fallback;
  }
}