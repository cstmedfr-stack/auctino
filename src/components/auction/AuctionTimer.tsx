"use client";

import {
  useEffect,
  useState,
} from "react";

type AuctionTimerProps = {
  auctionEnd: string | null;
  onEnd?: () => void;
};

function formatRemainingTime(
  totalSeconds: number
) {
  const seconds = Math.max(
    totalSeconds,
    0
  );

  const days = Math.floor(
    seconds / 86400
  );

  const hours = Math.floor(
    (seconds % 86400) / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  if (days > 0) {
    return `${days}z ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export default function AuctionTimer({
  auctionEnd,
  onEnd,
}: AuctionTimerProps) {
  const [remaining, setRemaining] =
    useState("");

  const [isEndingSoon, setIsEndingSoon] =
    useState(false);

  useEffect(() => {
    if (!auctionEnd) {
      setRemaining("Fără termen");
      setIsEndingSoon(false);
      return;
    }

    function updateTimer() {
      const endTimestamp =
        new Date(
          auctionEnd as string
        ).getTime();

      const difference =
        endTimestamp - Date.now();

      if (
        !Number.isFinite(
          endTimestamp
        ) ||
        difference <= 0
      ) {
        setRemaining(
          "Licitație încheiată"
        );

        setIsEndingSoon(false);
        onEnd?.();

        return true;
      }

      setRemaining(
        formatRemainingTime(
          Math.floor(
            difference / 1000
          )
        )
      );

      setIsEndingSoon(
        difference <=
          10 * 60 * 1000
      );

      return false;
    }

    const alreadyEnded =
      updateTimer();

    if (alreadyEnded) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        const ended =
          updateTimer();

        if (ended) {
          window.clearInterval(
            intervalId
          );
        }
      }, 1000);

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [auctionEnd, onEnd]);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isEndingSoon
          ? "bg-red-100 text-red-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      ⏳ {remaining}
    </span>
  );
}