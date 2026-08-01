"use client";

import {
  CalendarDays,
  FileText,
  Info,
  MapPin,
  Package,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useMessages } from "@/i18n/useMessages";
import { useLocale } from "@/i18n/LocaleProvider";
import { formatDateTime } from "@/utils/formatDateTime";

type ProductDetailsProps = {
  description: string | null;
  category: string | null;
  condition: string | null;
  location: string | null;
  createdAt: string;
  status: string | null;
};

export default function ProductDetails({
  description,
  category,
  condition,
  location,
  createdAt,
  status,
}: ProductDetailsProps) {
  const messages = useMessages();
  const t = messages.productPage;
  const { locale } = useLocale();

  const formattedDate =
    formatDateTime(createdAt, locale);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText size={21} />
          </div>

          <h2 className="text-xl font-bold text-slate-950">
            {t.descriptionTitle}
          </h2>
        </div>

        <p className="whitespace-pre-wrap leading-8 text-slate-600">
          {description || t.noDescription}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Info size={21} />
          </div>

          <h2 className="text-xl font-bold text-slate-950">
            {t.detailsTitle}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Detail
            icon={<Tag size={18} />}
            label={t.category}
            value={category || t.unknownValue}
          />

          <Detail
            icon={<ShieldCheck size={18} />}
            label={t.condition}
            value={condition || t.unknownValue}
          />

          <Detail
            icon={<MapPin size={18} />}
            label={t.location}
            value={location || t.unknownValue}
          />

          <Detail
            icon={<CalendarDays size={18} />}
            label={t.publishedAt}
            value={formattedDate || t.unknownValue}
          />

          <Detail
            icon={<Package size={18} />}
            label={t.status}
            value={getStatusLabel(status, t)}
          />
        </div>
      </section>
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </p>
      </div>

      <p className="font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function getStatusLabel(
  status: string | null,
  t: {
    activeAuction: string;
    endedAuction: string;
    removedProduct: string;
    soldProduct: string;
    pendingTransaction: string;
    expiredAuction: string;
  }
) {
  switch (status) {
    case "ended":
      return t.endedAuction;

    case "removed":
      return t.removedProduct;

    case "sold":
      return t.soldProduct;

    case "transaction_pending":
      return t.pendingTransaction;

    case "expired":
      return t.expiredAuction;

    default:
      return t.activeAuction;
  }
}