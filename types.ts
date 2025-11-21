
export interface Card {
  id: string;
  bankName: string;
  bankLogo: string;
  name: string;
  image: string;
  description: string;
  annualFee: string;
  annualFeeNum: number;
  cashbackEstimate: string;
  cashbackNum: number;
  tags: string[];
  isBest?: boolean;
  creditLimit: string;
  interestRate: string;
  categories: CashbackCategory[];
}

export interface CashbackCategory {
  name: string;
  icon: string;
  rate: number;
  amount: string;
  color: string;
  bgColor: string;
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
