"use client";

import LegalPageShell from "@/components/legal/LegalPageShell";
import { useMessages } from "@/i18n/useMessages";

export default function SafetyPage() {
  const messages = useMessages();
  const t = messages.legal.common;
  const page = messages.legal.safety;

  return (
    <LegalPageShell
      eyebrow={page.eyebrow}
      title={page.title}
      description={page.description}
      lastUpdatedLabel={t.lastUpdated}
      lastUpdated={t.lastUpdatedDate}
      sections={page.sections}
      backLabel={t.backHome}
    />
  );
}