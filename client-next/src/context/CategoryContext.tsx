"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category } from '@/types';
import { categoryApi } from '@/services/api';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  getCategoryColor: (categoryName: string) => string;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryColor = (categoryName: string) => {
    if (!categoryName) return '#3b82f6';
    const found = categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase());
    return found?.color || '#3b82f6'; // Default to blue if not found
  };

  return (
    <CategoryContext.Provider value={{ categories, loading, getCategoryColor }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
};
