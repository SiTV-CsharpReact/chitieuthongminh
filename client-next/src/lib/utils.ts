import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanCardName(name: string): string {
  if (!name) return "";
  return name.replace(/^(thẻ tín dụng|Thẻ tín dụng)\s+/i, "").trim();
}
export function generateSlug(text: string): string {
  if (!text) return "";
  let slug = cleanCardName(text).toLowerCase();
  slug = slug.replace(/[áàảạãăắằẳẵặâấầẩẫậ]/gi, 'a');
  slug = slug.replace(/[éèẻẽẹêếềểễệ]/gi, 'e');
  slug = slug.replace(/[iíìỉĩị]/gi, 'i');
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/gi, 'o');
  slug = slug.replace(/[úùủũụưứừửữự]/gi, 'u');
  slug = slug.replace(/[ýỳỷỹỵ]/gi, 'y');
  slug = slug.replace(/đ/gi, 'd');
  // Replace spaces and special chars with hyphen
  slug = slug.replace(/[^a-z0-9-]/g, '-');
  // Replace multiple hyphens with single hyphen
  slug = slug.replace(/-+/g, '-');
  // Trim hyphens
  slug = slug.replace(/^-+|-+$/g, '');
  return slug;
}
