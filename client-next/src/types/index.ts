
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
  registerUrl?: string;
  termsPdfUrl?: string;
  sourceUrl?: string;
  annualFee: number;
  minSalary?: number; // Lương tối thiểu (VNĐ). 0 = không yêu cầu
  requirement?: string; // Yêu cầu mở thẻ
  welcomeOffer?: string; // Quà chào mừng mở thẻ
  status?: string; // 'Active' | 'Discontinued'
  maxCashbackPerMonth?: number; // Số tiền hoàn tối đa mỗi tháng (VNĐ)
  minSpendForCashback?: number; // Chi tiêu tối thiểu để được hoàn (VNĐ)
  cashbackRules: CashbackRule[];
  description?: string;
  benefits: string[];
  pros?: string[];
  cons?: string[];
  tags?: string[];
  cashbackAmount?: number;
  creditLimit?: string;
  interestRate?: string;
  isBest?: boolean;
  matchScore?: number;
  cashbackCategory?: string;
  cashbackRate?: number;
  ratings?: {
    cashback: number;
    annualFee: number;
    spendFit: number;
    offer: number;
    incomeRequirement: number;
    overall: number;
  };
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
  isBlocked?: boolean;
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
  bankName?: string;
}

export interface SpendingData {
  id?: string;
  userId?: string;
  amount: number;
  salary: number;
  category?: string;
  date: string;
  description?: string;
  incomeLevel?: string;
  spendingHabit?: string;
  creditScoreRange?: string;
  recommendedCardType?: string;
}

export interface CategorySpending {
  category: string;
  amount: number;
}

export interface RecommendationRequest {
  salary: number;
  incomeLevel?: string;
  creditScoreRange?: string;
  spendings: CategorySpending[];
}

export interface CardCashbackBreakdown {
  category: string;
  amount: number;
  cashback: number;
  rate: number;
}

export interface CardCashbackResult {
  card: Card;
  totalCashback: number;
  breakdown: CardCashbackBreakdown[];
}

export interface ComboCardItem {
  card: Card;
  label: string;
  cashback: number;
  color: string;
}

export interface CategoryAllocation {
  category: string;
  amount: number;
  assignedTo: number;
  cashback: number;
  rate: number;
}

export interface ComboResult {
  cards: ComboCardItem[];
  totalCashback: number;
  savingsVsSingle: number;
  savingsPercent: number;
  allocation: CategoryAllocation[];
}

export interface RecommendationResponse {
  singleCards: CardCashbackResult[];
  bestCombo: ComboResult | null;
}

export interface UserCardDetail {
  issueDate?: string;
  statementDate?: number;
  dueDate?: number;
}

export interface WalletCard {
  card: Card;
  details: UserCardDetail;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  targetName?: string;
  targetRole?: string;
}

export interface ScraperDraft extends Card {
  reason: string;
  createdAt: string;
  existingCardId?: string;
  status?: string; // "Pending" | "Approved" | "Rejected"
}
