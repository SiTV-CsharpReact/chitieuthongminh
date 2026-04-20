import { Card, Category, Article, ArticleCategory, CardPromotion } from '@/types';

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

    async getRecommendation(input: any): Promise<Card[]> {
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

    async extractCard(url: string): Promise<{ host: string, images: string[], cashbackInfos: { text: string, suggestedPercentage?: number, suggestedCap?: number }[] }> {
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
