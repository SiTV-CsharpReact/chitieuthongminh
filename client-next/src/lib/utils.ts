import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanCardName(name: string): string {
  if (!name) return "";
  return name.replace(/^(thẻ tín dụng|Thẻ tín dụng)\s+/i, "").trim();
}

