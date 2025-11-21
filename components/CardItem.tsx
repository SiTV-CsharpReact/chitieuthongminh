import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../types';

interface CardItemProps {
  card: Card;
}

export const CardItem: React.FC<CardItemProps> = ({ card }) => {
  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      <div className="flex-grow p-6">
        <div className="mb-4 flex items-center justify-between h-8">
          <img alt={card.bankName} className="h-8 object-contain" src={card.bankLogo} />
          {card.isBest && (
            <span className="inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-900/30 px-3 py-1 text-xs font-bold text-primary-700 dark:text-primary-400">
              <span className="material-symbols-outlined mr-1 text-sm">workspace_premium</span>
              Tốt nhất
            </span>
          )}
        </div>
        
        <div className="relative mb-6 aspect-[1.58/1] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
             <img 
                alt={card.name} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src={card.image} 
            />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{card.name}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px]">{card.description}</p>
        
        <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                    <span className="material-symbols-outlined text-sm">payments</span>
                </div>
                <span className="font-medium">Phí thường niên: <span className="text-slate-900 dark:text-slate-100">{card.annualFee}</span></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                    <span className="material-symbols-outlined text-sm">savings</span>
                </div>
                <span className="font-medium">Hoàn tiền ước tính: <strong className="text-primary-600 dark:text-primary-400">{card.cashbackEstimate}</strong></span>
            </div>
        </div>
      </div>
      
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4">
        <Link 
            to={`/card/${card.id}`}
            className="flex w-full items-center justify-center rounded-xl bg-primary-500 py-3 text-sm font-bold text-white transition-all hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/20 dark:hover:shadow-none"
        >
          Mở thẻ ngay
        </Link>
      </div>
    </div>
  );
};