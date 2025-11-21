
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../types';
import { Button } from './ui/button';
import { useCompare } from '../context/CompareContext';

interface CardItemProps {
  card: Card;
}

export const CardItem: React.FC<CardItemProps> = ({ card }) => {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const isSelected = isInCompare(card.id);

  const handleCompareClick = () => {
    if (isSelected) {
      removeFromCompare(card.id);
    } else {
      addToCompare(card);
    }
  };

  return (
    <div className={`group relative flex flex-col md:flex-row gap-6 rounded-3xl border bg-white dark:bg-[#1e1e1e] p-5 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isSelected ? 'border-primary-500 ring-1 ring-primary-500' : 'border-slate-200 dark:border-slate-800 hover:border-primary-500/30 dark:hover:border-primary-500/30'}`}>
      
      {/* Left Side: Image */}
      <div className="w-full md:w-56 flex-shrink-0 flex flex-col items-center justify-start pt-2">
        <div className="relative w-full aspect-[1.58/1] overflow-hidden rounded-xl shadow-md bg-slate-100 dark:bg-slate-800/50 group-hover:shadow-lg transition-shadow">
             <img 
                alt={card.name} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src={card.image} 
            />
            {isSelected && (
              <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                <div className="bg-primary-500 text-white rounded-full p-1 shadow-lg">
                  <span className="material-symbols-outlined text-xl">check</span>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Right Side: Content */}
      <div className="flex flex-1 flex-col justify-between gap-4">
        
        {/* Header */}
        <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {card.name}
                </h3>
                {card.isBest && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-primary-500/20">
                        <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                        Tốt nhất
                    </span>
                )}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                Phát hành bởi <span className="text-slate-700 dark:text-slate-200">{card.bankName}</span>
                <img src={card.bankLogo} alt={card.bankName} className="h-4 ml-1 opacity-70 grayscale group-hover:grayscale-0 transition-all" />
            </p>
        </div>

        {/* Description / Benefits */}
        <div className="space-y-3">
            <div className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary-500 mt-0.5 text-[20px]">format_quote</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {card.description}
                </p>
            </div>
            
            <div className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary-500 mt-0.5 text-[20px]">shopping_cart</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nhận <strong className="text-slate-900 dark:text-white">x3 điểm</strong> cho mọi chi tiêu mua sắm trực tuyến.
                </p>
            </div>
        </div>

        {/* Footer: Stats & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            
            {/* Highlight Metric */}
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hoàn tiền ước tính</p>
                <p className="text-xl sm:text-2xl font-black text-primary-600 dark:text-primary-400 tracking-tight">
                    ~{card.cashbackNum.toLocaleString()} VNĐ<span className="text-sm font-semibold text-slate-500 dark:text-slate-500">/tháng</span>
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button 
                    variant="secondary" 
                    onClick={handleCompareClick}
                    className={`flex-1 sm:flex-none font-bold transition-all ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
                >
                    {isSelected ? (
                        <>
                            <span className="material-symbols-outlined text-lg mr-1">check_box</span>
                            Đã chọn
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg mr-1">compare_arrows</span>
                            So sánh
                        </>
                    )}
                </Button>
                <Link to={`/card/${card.id}`} className="flex-1 sm:flex-none">
                    <Button className="w-full font-bold px-6 bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20">
                        Xem Chi tiết
                    </Button>
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
};
