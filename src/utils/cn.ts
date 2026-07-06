import clsx from "clsx";

export function cn(...classes: (string | false | null | undefined)[]) {
  return clsx(...classes);
}