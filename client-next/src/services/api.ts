import { Card, Category, Article, ArticleCategory, CardPromotion, SpendingData, User, UserProfile, RecommendationRequest, RecommendationResponse, WalletCard, UserCardDetail, Notification } from '../types';

const API_BASE_URL = '/api';

export const cardApi = {
    async getAll(): Promise<Card[]> {
        const response = await fetch(`${API_BASE_URL}/CreditCards`);
        if (!response.ok) throw new Error('Failed to fetch cards');
        return response.json();
    },

    async getById(id: string): Promise<Card> {
        const response = await fetch(`${API_BASE_URL}/CreditCards/${id}`);
        if (!response.ok) throw new Error('Failed to fetch card');
        return response.json();
    },

    async create(card: Card): Promise<Card> {
        const response = await fetch(`${API_BASE_URL}/CreditCards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card),
        });
        if (!response.ok) throw new Error('Failed to create card');
        return response.json();
    },

    async update(id: string, card: Card): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/CreditCards/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(card),
        });
        if (!response.ok) throw new Error('Failed to update card');
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/CreditCards/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete card');
    },

    async getRecommendation(input: RecommendationRequest): Promise<RecommendationResponse> {
        const response = await fetch(`${API_BASE_URL}/Recommendation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return response.json();
    },

    async saveSpending(data: any): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/Spending`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to save spending data');
        return response.json();
    },

    async getSpending(): Promise<SpendingData[]> {
        const response = await fetch(`${API_BASE_URL}/Spending`);
        if (!response.ok) throw new Error('Failed to fetch spending data');
        return response.json();
    },

    async seedCards(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/Seed/cards`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to seed cards');
        return response.json();
    },

    async seedAll(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/Seed/all`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to seed system');
        return response.json();
    },
};

export const categoryApi = {
    async getAll(): Promise<Category[]> {
        const response = await fetch(`${API_BASE_URL}/Categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return response.json();
    },

    async create(category: Category): Promise<Category> {
        const response = await fetch(`${API_BASE_URL}/Categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
        });
        if (!response.ok) throw new Error('Failed to create category');
        return response.json();
    },

    async update(id: string, category: Category): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/Categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
        });
        if (!response.ok) throw new Error('Failed to update category');
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/Categories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete category');
    },

    async seedMcc(): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/Categories/seed-mcc`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to seed MCC categories');
    }
};

export const articleApi = {
    async getAll(): Promise<Article[]> {
        const response = await fetch(`${API_BASE_URL}/Articles`);
        if (!response.ok) throw new Error('Failed to fetch articles');
        return response.json();
    },

    async getById(id: string): Promise<Article> {
        const response = await fetch(`${API_BASE_URL}/Articles/${id}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        return response.json();
    },

    async create(article: Article): Promise<Article> {
        const response = await fetch(`${API_BASE_URL}/Articles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article),
        });
        if (!response.ok) throw new Error('Failed to create article');
        return response.json();
    },

    async update(id: string, article: Article): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/Articles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article),
        });
        if (!response.ok) throw new Error('Failed to update article');
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/Articles/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete article');
    },
};

export const scraperApi = {
    async getVibCards(): Promise<{ name: string, imageUrl: string }[]> {
        const response = await fetch(`${API_BASE_URL}/Scraper/vib-cards`);
        if (!response.ok) throw new Error('Failed to fetch VIB cards');
        return response.json();
    },

    async extractCard(url: string): Promise<{
        host: string;
        cards: {
            cardName: string;
            imageUrl?: string;
            registerUrl?: string;
            cashbackInfos: { text: string; suggestedPercentage?: number; suggestedCap?: number }[];
        }[];
    }> {
        const response = await fetch(`${API_BASE_URL}/Scraper/extract-card-details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
        if (!response.ok) throw new Error('Failed to extract card details');
        return response.json();
    },

    async extractPromotions(url: string): Promise<{ host: string, totalFound: number, promotions: any[] }> {
        const response = await fetch(`${API_BASE_URL}/Scraper/extract-promotions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });
        if (!response.ok) throw new Error('Failed to extract promotions');
        return response.json();
    },

    async getSupportedBanks(): Promise<{ bankName: string, url: string }[]> {
        const response = await fetch(`${API_BASE_URL}/Scraper/supported-banks`);
        if (!response.ok) throw new Error('Failed to fetch supported banks');
        return response.json();
    }
};

export const autoScraperApi = {
    async getDrafts(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/drafts`);
        if (!response.ok) throw new Error('Failed to fetch drafts');
        return response.json();
    },

    async trigger(): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/trigger`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to trigger scraper');
        return response.json();
    },

    async getStatus(): Promise<{ isRunning: boolean, totalBanks: number, processedBanks: number, currentBank: string, newDraftsFound: number, errorMessage?: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/status`);
        if (!response.ok) throw new Error('Failed to get status');
        return response.json();
    },

    async approve(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/approve/${id}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to approve draft');
        return response.json();
    },

    async reject(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/draft/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to reject draft');
        return response.json();
    },

    async clearAll(): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/drafts/all`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to clear all drafts');
        return response.json();
    },

    async triggerPromotions(): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/trigger-promotions`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to trigger promotion scraper');
        return response.json();
    },

    async getPromoDrafts(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/promo-drafts`);
        if (!response.ok) throw new Error('Failed to fetch promo drafts');
        return response.json();
    },

    async approvePromoDraft(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/promo-drafts/${id}/approve`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to approve promo draft');
        return response.json();
    },

    async approveAllPromoDrafts(): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/promo-drafts/approve-all`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to approve all promo drafts');
        return response.json();
    },

    async rejectPromoDraft(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/promo-drafts/${id}/reject`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to reject promo draft');
        return response.json();
    },

    async deletePromoDraft(id: string): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/promo-drafts/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete promo draft');
        return response.json();
    },

    async clearAllPromoDrafts(): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/promo-drafts/clear`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to clear all promo drafts');
        return response.json();
    },

    async clearHistoryPromoDrafts(): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/AutoScraper/promo-drafts/clear-history`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to clear history promo drafts');
        return response.json();
    }
};

export const articleCategoryApi = {
    async getAll(): Promise<ArticleCategory[]> {
        const response = await fetch(`${API_BASE_URL}/ArticleCategories`);
        if (!response.ok) throw new Error('Failed to fetch article categories');
        return response.json();
    },

    async create(category: ArticleCategory): Promise<ArticleCategory> {
        const response = await fetch(`${API_BASE_URL}/ArticleCategories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
        });
        if (!response.ok) throw new Error('Failed to create article category');
        return response.json();
    },

    async update(id: string, category: ArticleCategory): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/ArticleCategories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category),
        });
        if (!response.ok) throw new Error('Failed to update article category');
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/ArticleCategories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete article category');
    }
};

export const promotionApi = {
    async getAll(): Promise<CardPromotion[]> {
        const response = await fetch(`${API_BASE_URL}/Promotions`);
        if (!response.ok) throw new Error('Failed to fetch promotions');
        return response.json();
    },

    async create(promotion: CardPromotion): Promise<CardPromotion> {
        const response = await fetch(`${API_BASE_URL}/Promotions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promotion),
        });
        if (!response.ok) throw new Error('Failed to create promotion');
        return response.json();
    },

    async saveBatch(promotions: CardPromotion[]): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/Promotions/batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promotions),
        });
        if (!response.ok) throw new Error('Failed to save batch promotions');
        return response.json();
    },

    async update(id: string, promotion: CardPromotion): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/Promotions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promotion),
        });
        if (!response.ok) throw new Error('Failed to update promotion');
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/Promotions/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete promotion');
    },

    async deleteAll(): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/Promotions/all`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete all promotions');
    }
};

export const chatApi = {
    async sendMessage(message: string, history: { role: string; content: string }[] = []): Promise<{
        reply: string;
        intent: string;
        suggestedCards?: any[];
        quickReplies?: string[];
    }> {
        const response = await fetch(`${API_BASE_URL}/Chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history }),
        });
        if (!response.ok) throw new Error('Failed to send chat message');
        return response.json();
    }
};

const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

export const userApi = {
    async getAll(): Promise<User[]> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    async updateRole(id: string, role: string): Promise<void> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ role }),
        });
        if (!response.ok) throw new Error('Failed to update user');
    },

    async delete(id: string): Promise<void> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete user');
    },

    async toggleBlock(userId: string): Promise<{ message: string, isBlocked: boolean }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/${userId}/block`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to toggle block status');
        return response.json();
    },

    async getVips(): Promise<any[]> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/admin/vips`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch VIPs');
        return response.json();
    },

    async sendVipReminder(vipId: string, cardId: string, daysRemaining: number, cardName: string, nextDueDate: string): Promise<{ message: string, lastRemindedAt: string }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/admin/vips/${vipId}/remind/${cardId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ daysRemaining, cardName, nextDueDate })
        });
        if (!response.ok) throw new Error('Failed to send VIP reminder');
        return response.json();
    },

    async getWallet(): Promise<WalletCard[]> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/wallet`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch wallet');
        return response.json();
    },

    async updateCardDetails(cardId: string, details: UserCardDetail): Promise<void> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/wallet/${cardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(details),
        });
        if (!response.ok) throw new Error('Failed to update card details');
    },

    async addToWallet(cardId: string): Promise<{ message: string, savedCardIds: string[] }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/wallet/${cardId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to add to wallet');
        return response.json();
    },

    async removeFromWallet(cardId: string): Promise<{ message: string, savedCardIds: string[] }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Users/wallet/${cardId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to remove from wallet');
        return response.json();
    }
};

export const notificationApi = {
    async getMyNotifications(): Promise<Notification[]> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    async markAsRead(id: string): Promise<void> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
    },

    async getAdminNotifications(): Promise<Notification[]> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Notifications/admin`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch admin notifications');
        return response.json();
    },

    async sendNotification(data: { target: string, title: string, message: string, link?: string }): Promise<void> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Notifications/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to send notification');
    },

    async triggerReminders(): Promise<{ message: string }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Notifications/admin/trigger-reminders`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to trigger reminders');
        return response.json();
    }
};



export const recommendationApi = {
    async smartSelector(amount: number, category: string): Promise<{ cards: { card: Card, cashbackRate: number, cashbackAmount: number }[] }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/Recommendation/smart-selector`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount, category }),
        });
        if (!response.ok) throw new Error('Failed to fetch smart recommendation');
        return response.json();
    }
};

export const imageApi = {
    async upload(file: File, folder = 'cards'): Promise<{ success: boolean; files: { name: string; path: string; size: number; url: string }[] }> {
        const formData = new FormData();
        formData.append('files', file);
        const response = await fetch(`${API_BASE_URL}/Image/upload?folder=${folder}`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload image');
        return response.json();
    }
};

export const settingsApi = {
    async getSettings(): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/SystemSettings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },

    async updateSettings(settings: any): Promise<{ message: string }> {
        const response = await fetch(`${API_BASE_URL}/SystemSettings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return response.json();
    }
};

export const cardScraperApi = {
    async start(): Promise<{ message: string }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/CardScraper/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to start Thẻ tín dụng');
        return response.json();
    },

    async getStatus(): Promise<{ isRunning: boolean, totalBanks: number, processedBanks: number, currentBank: string, newCardsFound: number, lastRunTime?: string }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/CardScraper/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to get status');
        return response.json();
    },

    async getDrafts(): Promise<any[]> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/CardScraper/drafts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch drafts');
        return response.json();
    },

    async importDraft(id: string): Promise<{ message: string }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/CardScraper/import/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to import draft');
        return response.json();
    },

    async deleteDraft(id: string): Promise<{ message: string }> {
        const token = getCookie('token');
        const response = await fetch(`${API_BASE_URL}/CardScraper/drafts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete draft');
        return response.json();
    }
};
