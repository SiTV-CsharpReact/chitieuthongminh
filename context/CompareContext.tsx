
import React, { createContext, useContext, useState } from 'react';
import { Card } from '../types';

interface CompareContextType {
  selectedCards: Card[];
  addToCompare: (card: Card) => void;
  removeFromCompare: (cardId: string) => void;
  isInCompare: (cardId: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const addToCompare = (card: Card) => {
    if (selectedCards.length >= 3) {
      alert("Bạn chỉ có thể so sánh tối đa 3 thẻ cùng lúc.");
      return;
    }
    if (!selectedCards.find(c => c.id === card.id)) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const removeFromCompare = (cardId: string) => {
    setSelectedCards(selectedCards.filter(c => c.id !== cardId));
  };

  const isInCompare = (cardId: string) => {
    return selectedCards.some(c => c.id === cardId);
  };

  const clearCompare = () => {
    setSelectedCards([]);
  };

  return (
    <CompareContext.Provider value={{ selectedCards, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
