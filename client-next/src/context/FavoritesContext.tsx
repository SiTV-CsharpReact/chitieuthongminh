"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { userApi } from '@/services/api';

interface SavedCard {
  id: string;
  name: string;
  imageUrl: string;
  bankName: string;
  bankLogo?: string;
  annualFee?: number;
  savedAt: string;
}

interface FavoritesContextType {
  favorites: SavedCard[];
  ownedCards: SavedCard[];
  addFavorite: (card: SavedCard) => void;
  removeFavorite: (cardId: string) => void;
  isFavorite: (cardId: string) => boolean;
  addOwnedCard: (card: SavedCard) => void;
  removeOwnedCard: (cardId: string) => void;
  isOwned: (cardId: string) => boolean;
  clearFavorites: () => void;
  clearOwnedCards: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<SavedCard[]>([]);
  const [ownedCards, setOwnedCards] = useState<SavedCard[]>([]);

  const favKey = user?.id ? `favorites_${user.id}` : null;
  const ownedKey = user?.id ? `owned_cards_${user.id}` : null;

  // Load from localStorage when user changes
  useEffect(() => {
    if (favKey) {
      try {
        const saved = localStorage.getItem(favKey);
        if (saved) setFavorites(JSON.parse(saved));
        else setFavorites([]);
      } catch { setFavorites([]); }
    } else {
      setFavorites([]);
    }
  }, [favKey]);

  useEffect(() => {
    if (user?.id && ownedKey) {
      // Sync from DB to local state on load
      userApi.getWallet().then(walletCards => {
        const mappedCards = walletCards.map(w => ({
          id: w.card.id!,
          name: w.card.name,
          imageUrl: w.card.imageUrl || '',
          bankName: w.card.bankName,
          bankLogo: w.card.bankLogo || '',
          annualFee: w.card.annualFee,
          savedAt: new Date().toISOString()
        }));
        setOwnedCards(mappedCards);
        localStorage.setItem(ownedKey, JSON.stringify(mappedCards));
      }).catch(err => {
        console.error("Lỗi đồng bộ ví thẻ:", err);
        // Fallback to local storage
        try {
          const saved = localStorage.getItem(ownedKey);
          if (saved) setOwnedCards(JSON.parse(saved));
        } catch {}
      });
    } else {
      setOwnedCards([]);
    }
  }, [user?.id, ownedKey]);

  // Persist helpers
  const saveFavorites = useCallback((items: SavedCard[]) => {
    setFavorites(items);
    if (favKey) localStorage.setItem(favKey, JSON.stringify(items));
  }, [favKey]);

  const saveOwned = useCallback((items: SavedCard[]) => {
    setOwnedCards(items);
    if (ownedKey) localStorage.setItem(ownedKey, JSON.stringify(items));
  }, [ownedKey]);

  const addFavorite = useCallback((card: SavedCard) => {
    setFavorites(prev => {
      if (prev.some(c => c.id === card.id)) return prev;
      const updated = [{ ...card, savedAt: new Date().toISOString() }, ...prev];
      if (favKey) localStorage.setItem(favKey, JSON.stringify(updated));
      return updated;
    });
  }, [favKey]);

  const removeFavorite = useCallback((cardId: string) => {
    setFavorites(prev => {
      const updated = prev.filter(c => c.id !== cardId);
      if (favKey) localStorage.setItem(favKey, JSON.stringify(updated));
      return updated;
    });
  }, [favKey]);

  const isFavorite = useCallback((cardId: string) => {
    return favorites.some(c => c.id === cardId);
  }, [favorites]);

  const addOwnedCard = useCallback(async (card: SavedCard) => {
    setOwnedCards(prev => {
      if (prev.some(c => c.id === card.id)) return prev;
      const updated = [{ ...card, savedAt: new Date().toISOString() }, ...prev];
      if (ownedKey) localStorage.setItem(ownedKey, JSON.stringify(updated));
      return updated;
    });
    // Sync to DB
    if (user?.id) {
      try { await userApi.addToWallet(card.id); } catch (e) { console.error(e); }
    }
  }, [ownedKey, user?.id]);

  const removeOwnedCard = useCallback(async (cardId: string) => {
    setOwnedCards(prev => {
      const updated = prev.filter(c => c.id !== cardId);
      if (ownedKey) localStorage.setItem(ownedKey, JSON.stringify(updated));
      return updated;
    });
    // Sync to DB
    if (user?.id) {
      try { await userApi.removeFromWallet(cardId); } catch (e) { console.error(e); }
    }
  }, [ownedKey, user?.id]);

  const isOwned = useCallback((cardId: string) => {
    return ownedCards.some(c => c.id === cardId);
  }, [ownedCards]);

  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  const clearOwnedCards = useCallback(() => {
    saveOwned([]);
  }, [saveOwned]);

  return (
    <FavoritesContext.Provider value={{
      favorites, ownedCards,
      addFavorite, removeFavorite, isFavorite,
      addOwnedCard, removeOwnedCard, isOwned,
      clearFavorites, clearOwnedCards,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
