import { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-orange-500 text-white hover:bg-orange-600",
    outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}