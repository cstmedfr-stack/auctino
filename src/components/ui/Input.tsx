import { InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100",
          error && "border-red-400 focus:border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />

      {error && <p className="mt-2 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}