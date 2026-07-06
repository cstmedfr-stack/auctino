import { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
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
    "inline-flex items-center justify-center rounded-2xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-orange-500 text-white shadow-sm hover:bg-orange-600 hover:shadow-md",
    secondary:
      "bg-slate-900 text-white shadow-sm hover:bg-slate-800 hover:shadow-md",
    outline:
      "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900",
    danger:
      "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-4 text-base",
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