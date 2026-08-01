"use client";

import { Loader2 } from "lucide-react";

import { useMessages } from "@/i18n/useMessages";

export default function AuthLoadingState() {
  const messages = useMessages();

  return (
    <div className="flex min-h-[420px] w-full max-w-md items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Loader2
            size={28}
            className="animate-spin"
          />
        </div>

        <p className="font-semibold text-slate-600">
          {messages.auth.shell.checkingSession}
        </p>
      </div>
    </div>
  );
}