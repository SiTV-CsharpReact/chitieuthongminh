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

export function getFallbackBankLogo(bankName: string | undefined): string | null {
  if (!bankName) return null;
  const lower = bankName.trim().toLowerCase();
  if (lower.includes('bvbank') || lower.includes('bản việt') || lower.includes('viet capital')) return 'https://bvbank.net.vn/wp-content/themes/bvb/www/img/bvb_logo_hs.png';
  if (lower.includes('shinhan')) return 'https://shinhan.com.vn/public/themes/shinhan/img/logo.png';
  if (lower.includes('vpbank')) return 'https://www.vpbank.com.vn/assets/img/logo-vpbank.svg';
  if (lower.includes('vib')) return 'https://www.vib.com.vn/static-contents/logo_vib_blue.png';
  if (lower.includes('techcombank')) return 'https://techcombank.com/images/logo.png';
  if (lower.includes('sacombank')) return 'https://www.sacombank.com.vn/assets/logo.png';
  if (lower.includes('mbbank') || lower === 'mb') return 'https://mbbank.com.vn/images/logo.png';
  if (lower.includes('hsbc')) return 'https://www.hsbc.com.vn/content/dam/hsbc/hsbcvn/images/common/logo-hsbc.svg';
  if (lower.includes('standard chartered')) return 'https://av.sc.com/vn/content/images/logo.png';
  if (lower.includes('acb')) return 'https://acb.com.vn/wps/wcm/connect/acb-logo.png';
  return null;
}
