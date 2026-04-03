import { Card, Category, Article } from '../types';

const API_BASE_URL = 'http://127.0.0.1:5169/api';

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
