import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-all duration-200 hover:shadow-[0_24px_80px_rgba(15,23,42,0.10)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}