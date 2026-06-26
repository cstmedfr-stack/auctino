import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}