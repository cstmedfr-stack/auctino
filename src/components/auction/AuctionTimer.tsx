"use client";

import { useEffect, useState } from "react";

type AuctionTimerProps = {
  auctionEnd: string | null;
};

function formatTimeLeft(ms: number) {
  if (ms <= 0) return "Încheiată";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}z ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

export default function AuctionTimer({ auctionEnd }: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (!auctionEnd) {
      setTimeLeft("Fără termen");
      return;
    }

    const updateTimer = () => {
      const endTime = new Date(auctionEnd).getTime();
      const diff = endTime - Date.now();

      setIsEnded(diff <= 0);
      setTimeLeft(formatTimeLeft(diff));
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auctionEnd]);

  return (
    <span
      className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isEnded
          ? "bg-red-50 text-red-600"
          : "bg-orange-50 text-orange-600"
      }`}
    >
      ⏳ {timeLeft}
    </span>
  );
}