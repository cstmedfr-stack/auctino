"use client";

import { ShieldAlert } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useMessages } from "@/i18n/useMessages";
import { formatDateTime } from "@/utils/formatDateTime";

type RemovedProductNoticeProps = {
  reason: string | null;
  removedAt: string | null;
};

export default function RemovedProductNotice({
  reason,
  removedAt,
}: RemovedProductNoticeProps) {
  const messages = useMessages();
  const t = messages.productPage;
  const { locale } = useLocale();

  return (
    <section className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-red-700">
          <ShieldAlert size={24} />
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-red-600">
            {t.removedNoticeEyebrow}
          </p>

          <h2 className="mt-2 text-xl font-black text-red-950">
            {t.removedNoticeTitle}
          </h2>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-red-800">
            <span className="font-bold">
              {t.removalReason}:
            </span>{" "}
            {reason || t.removalReasonUnavailable}
          </p>

          {removedAt && (
            <p className="mt-3 text-sm text-red-700">
              <span className="font-bold">
                {t.removedAt}:
              </span>{" "}
              {formatDateTime(removedAt, locale)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}