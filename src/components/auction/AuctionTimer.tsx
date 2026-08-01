"use client";

import {
  useEffect,
  useState,
} from "react";
import { Clock3 } from "lucide-react";
import { useMessages } from "@/i18n/useMessages";

type AuctionTimerProps = {
  auctionEnd: string | null;
  onEnd?: () => void;
};

type AuctionTimerMessages = {
  noEnd: string;
  ended: string;
  daysShort: string;
  hoursShort: string;
  minutesShort: string;
  secondsShort: string;
};

function formatRemainingTime(
  totalSeconds: number,
  t: AuctionTimerMessages
) {
  const seconds = Math.max(totalSeconds, 0);

  const days = Math.floor(seconds / 86400);

  const hours = Math.floor(
    (seconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  if (days > 0) {
    return `${days}${t.daysShort} ${hours}${t.hoursShort} ${minutes}${t.minutesShort}`;
  }

  if (hours > 0) {
    return `${hours}${t.hoursShort} ${minutes}${t.minutesShort} ${remainingSeconds}${t.secondsShort}`;
  }

  return `${minutes}${t.minutesShort} ${remainingSeconds}${t.secondsShort}`;
}

export default function AuctionTimer({
  auctionEnd,
  onEnd,
}: AuctionTimerProps) {
  const messages = useMessages();
  const t = messages.auctionTimer;

  const [remaining, setRemaining] =
    useState("");

  const [isEndingSoon, setIsEndingSoon] =
    useState(false);

  useEffect(() => {
    if (!auctionEnd) {
      setRemaining(t.noEnd);
      setIsEndingSoon(false);
      return;
    }

    function updateTimer() {
      const endTimestamp =
        new Date(auctionEnd as string).getTime();

      const difference =
        endTimestamp - Date.now();

      if (
        !Number.isFinite(endTimestamp) ||
        difference <= 0
      ) {
        setRemaining(t.ended);
        setIsEndingSoon(false);
        onEnd?.();

        return true;
      }

      setRemaining(
        formatRemainingTime(
          Math.floor(difference / 1000),
          t
        )
      );

      setIsEndingSoon(
        difference <= 10 * 60 * 1000
      );

      return false;
    }

    const alreadyEnded = updateTimer();

    if (alreadyEnded) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        const ended = updateTimer();

        if (ended) {
          window.clearInterval(intervalId);
        }
      }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    auctionEnd,
    onEnd,
    t,
  ]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isEndingSoon
          ? "bg-red-50 text-red-700"
          : "bg-orange-50 text-orange-700"
      }`}
    >
      <Clock3 size={14} />
      {remaining}
    </span>
  );
}