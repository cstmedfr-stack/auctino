import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export function Section({ children, className }: SectionProps) {
  return <section className={cn("py-16", className)}>{children}</section>;
}