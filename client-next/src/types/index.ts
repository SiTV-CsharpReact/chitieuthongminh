
export interface CashbackRule {
  category: string;
  percentage: number;
  capAmount?: number;
}

export interface Card {
  id?: string;
  name: string;
  bank: string;
  bankName: string;
  bankLogo?: string;
  imageUrl?: string;
  link?: string;
  annualFee: number;
  minSalary?: number; // Lương tối thiểu (VNĐ). 0 = không yêu cầu
  cashbackRules: CashbackRule[];
  description?: string;
  benefits: string[];
  cashbackAmount?: number;
  creditLimit?: string;
  interestRate?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  amount: number;
  isEditing: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
}

export interface Article {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  parentCategory?: string;
  subCategory?: string;
  author: string;
  coverImage: string;
  imageDescription?: string;
  seoDescription?: string;
  seoKeywords?: string;
  status: 'published' | 'draft';
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  theme: 'light' | 'dark';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    promotions: boolean;
  };
  security: {
    twoFactor: boolean;
  };
  preferences: {
    language: string;
    currency: string;
  };
}

export interface Category {
  id?: string;
  name: string;
  color: string;
  icon?: string;
  mccCodes?: string[];
  isFrequent?: boolean;
}

export interface ArticleCategory {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CardPromotion {
  id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  discountRate?: string;
  categoryTab?: string;
  sourceUrl?: string;
  startDate?: string;
  validUntil?: string;
  applicableCards?: string[];
  createdAt?: string;
  updatedAt?: string;
}
