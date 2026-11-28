
"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Notification } from "@/types/notification";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatLocalizedDateTime } from "@/i18n/format";
import {
  getNotificationHref,
  getNotificationIcon,
} from "@/utils/notifications";

type NotificationItemProps = {
  notification: Notification;
  onRead: (id: string) => void;
};

const frenchTitles: Record<string, string> = {
  "Tranzacție creată": "Transaction créée",
  "Licitația se încheie în curând":
    "Enchère bientôt terminée",
  "Ai primit o ofertă nouă":
    "Vous avez reçu une nouvelle offre",
  "Ai fost depășit la licitație":
    "Votre offre a été dépassée",
  "Licitația a fost prelungită":
    "L'enchère a été prolongée",
  "Licitația s-a încheiat":
    "L'enchère est terminée",
  "Produs vândut": "Produit vendu",
  "Tranzacție finalizată":
    "Transaction terminée",
  "Tranzacție anulată":
    "Transaction annulée",
};

function getFrenchMessage(
  notification: Notification
): string {
  const original = notification.message || "";

  // Traducem mesajele vechi, pastrand
  // titlul produsului, sumele si datele.

  const patterns: Array<{
    pattern: RegExp;
    translate: (...parts: string[]) => string;
  }> = [
    {
      pattern:
        /^Licitația pentru [„"](.+?)[”"] s-a încheiat la prețul de (.+)\.$/i,
      translate: (product, price) =>
        `L'enchère pour « ${product} » s'est terminée au prix de ${price}.`,
    },
    {
      pattern:
        /^Licitația pentru [„"](.+?)[”"] se încheie la (.+)\.$/i,
      translate: (product, date) =>
        `L'enchère pour « ${product} » se termine le ${date}.`,
    },
    {
      pattern:
        /^Produsul tău [„"](.+?)[”"] a primit o ofertă de (.+)\.$/i,
      translate: (product, amount) =>
        `Votre produit « ${product} » a reçu une offre de ${amount}.`,
    },
    {
      pattern:
        /^Oferta ta pentru [„"](.+?)[”"] a fost depășită\. Noua ofertă este (.+)\.$/i,
      translate: (product, amount) =>
        `Votre offre pour « ${product} » a été dépassée. La nouvelle offre est de ${amount}.`,
    },
    {
      pattern:
        /^Licitația pentru [„"](.+?)[”"] a fost prelungită automat cu 2 minute\.$/i,
      translate: (product) =>
        `L'enchère pour « ${product} » a été prolongée automatiquement de 2 minutes.`,
    },
  ];

  for (const { pattern, translate } of patterns) {
    const match = original.trim().match(pattern);

    if (match) {
      return translate(...match.slice(1));
    }
  }

  // Daca avem metadate structurate,
  // le folosim pentru notificari noi.
  const metadata = notification.metadata as
    | Record<string, unknown>
    | null
    | undefined;

  const productTitle =
    typeof metadata?.productTitle === "string"
      ? metadata.productTitle
      : null;

  const amount =
    typeof metadata?.amount === "number" ||
    typeof metadata?.amount === "string"
      ? String(metadata.amount)
      : null;

  const currency =
    typeof metadata?.currency === "string"
      ? metadata.currency
      : null;

  if (productTitle) {
    if (
      notification.type === "new_bid" &&
      amount
    ) {
      return `Votre produit « ${productTitle} » a reçu une offre de ${amount}${currency ? ` ${currency}` : ""}.`;
    }

    if (
      notification.type === "outbid" &&
      amount
    ) {
      return `Votre offre pour « ${productTitle} » a été dépassée. La nouvelle offre est de ${amount}${currency ? ` ${currency}` : ""}.`;
    }

    if (
      notification.type === "auction_extended"
    ) {
      return `L'enchère pour « ${productTitle} » a été prolongée automatiquement de 2 minutes.`;
    }
  }

  // Pentru tipurile necunoscute pastram
  // mesajul original, fara a inventa detalii.
  return original;
}

export default function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const messages = useMessages();
  const { locale } = useLocale();
  const t = messages.notificationsPage;

  const href = getNotificationHref(notification);
  const Icon = getNotificationIcon(notification.type);

  const notificationTypeLabels =
    t.types as Record<string, string>;

  const typeLabel =
    notificationTypeLabels[notification.type] ??
    t.genericType;

  const title =
    locale === "fr"
      ? frenchTitles[notification.title ?? ""] ??
        notification.title ??
        t.notificationFallback
      : notification.title ??
        t.notificationFallback;

  const message =
    locale === "fr"
      ? getFrenchMessage(notification) || t.noMessage
      : notification.message || t.noMessage;

  function handleClick() {
    if (!notification.is_read) {
      onRead(notification.id);
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`block rounded-2xl border p-4 transition hover:bg-slate-50 ${
        notification.is_read
          ? "border-slate-100 bg-white"
          : "border-indigo-100 bg-indigo-50/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
            notification.is_read
              ? "bg-slate-100 text-slate-600"
              : "bg-white text-indigo-700"
          }`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-black text-slate-950">
                {title}
              </p>

              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                {message}
              </p>
            </div>

            {!notification.is_read && (
              <span
                aria-label={t.unread}
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600"
              />
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              {typeLabel}
            </span>

            <span className="text-[11px] font-medium text-slate-400">
              {formatLocalizedDateTime(
                notification.created_at,
                locale
              )}
            </span>

            {notification.is_read && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 size={13} />
                {t.read}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
