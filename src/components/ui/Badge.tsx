import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "accent" | "success" | "danger" | "outline";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";

  const variants = {
    default: "bg-slate-100 text-slate-700",
    accent: "bg-orange-100 text-orange-700",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    outline: "border border-slate-200 bg-white text-slate-700",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}