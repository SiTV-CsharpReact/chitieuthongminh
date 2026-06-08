"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '@/types';
import { Button } from '@/components/ui/button';
import { useCompare } from '@/context/CompareContext';
import { cleanCardName, getFallbackBankLogo } from '@/lib/utils';
import { PortraitCardVisual } from '@/components/PortraitCardVisual';

interface CardItemProps {
  card: Card;
  onSaveCard?: (card: Card) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onSaveCard }) => {
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const isSelected = isInCompare(card.id || '');

  const handleCompareClick = () => {
    if (isSelected && card.id) {
      removeFromCompare(card.id);
    } else {
      addToCompare(card);
    }
  };

  return (
    <div className={`group relative flex flex-col md:flex-row gap-6 rounded-3xl border bg-white dark:bg-[#0c1425] p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,177,79,0.04)] dark:hover:shadow-[0_20px_40px_rgba(0,177,79,0.08)] hover:-translate-y-1 ${isSelected ? 'border-vp-green ring-1 ring-vp-green' : 'border-slate-200/60 dark:border-slate-800 hover:border-vp-green/40 dark:hover:border-vp-green/40'}`}>

      {/* Left Side: Image */}
      <div className="w-full md:w-56 flex-shrink-0 flex flex-col items-center justify-start pt-2">
        <div className="relative w-full aspect-[1.58/1] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40 p-2 sm:p-2.5 flex items-center justify-center">
          <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md group-hover:scale-[1.03] transition-transform duration-300">
            <PortraitCardVisual imageUrl={card.imageUrl} name={card.name} />
            {isSelected && (
              <div className="absolute inset-0 bg-vp-green/20 flex items-center justify-center z-20">
                <div className="bg-vp-green text-white rounded-full p-1 shadow-lg">
                  <span className="material-symbols-outlined text-xl">check</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Content */}
      <div className="flex flex-1 flex-col justify-between gap-4">

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {cleanCardName(card.name)}
            </h3>
            {card.isBest && (
              <span className="inline-flex items-center gap-1 rounded-full bg-vp-green px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md shadow-vp-green/20">
                <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                Tốt nhất
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Phát hành bởi <span className="text-slate-700 dark:text-slate-200">{card.bankName}</span>
            {(card.bankLogo || getFallbackBankLogo(card.bankName)) && <img src={card.bankLogo || getFallbackBankLogo(card.bankName)!} alt={card.bankName} className="h-4 ml-1 opacity-70 grayscale group-hover:grayscale-0 transition-all" />}
          </p>
        </div>

        {/* Description / Benefits */}
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="material-symbols-outlined text-vp-green mt-0.5 text-[20px]">format_quote</span>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
              {card.description}
            </p>
          </div>

          {card.cashbackRate !== undefined && card.cashbackCategory && (
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-vp-green mt-0.5 text-[20px]">percent</span>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Nhận hoàn tiền <strong className="text-slate-900 dark:text-white">{card.cashbackRate}%</strong> cho chi tiêu <strong className="text-slate-900 dark:text-white">{card.cashbackCategory}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer: Stats & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">

          {/* Highlight Metric */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hoàn tiền ước tính</p>
            <p className="text-xl sm:text-2xl font-black text-vp-green tracking-tight">
              {card.cashbackAmount !== undefined ? (
                <>~{card.cashbackAmount.toLocaleString()} VNĐ<span className="text-sm font-semibold text-slate-500 dark:text-slate-500">/tháng</span></>
              ) : (
                <span className="text-base text-slate-400 font-bold uppercase tracking-wide">Nhập chi tiêu để tính</span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={handleCompareClick}
              className={`flex-1 sm:flex-none font-bold transition-all ${isSelected ? 'bg-vp-green/10 text-vp-green ring-1 ring-vp-green/30' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
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
            {onSaveCard && (
              <Button 
                variant="outline" 
                onClick={(e) => { e.preventDefault(); onSaveCard(card); }}
                className="flex-1 sm:flex-none font-bold transition-all border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-500 text-slate-700 dark:text-slate-300"
              >
                <span className="material-symbols-outlined text-lg mr-1">mail</span>
                Lưu thẻ
              </Button>
            )}
            <Link href={`/card/${card.id}`} className="flex-1 sm:flex-none">
              <Button className="w-full font-bold px-6 bg-vp-green hover:bg-vp-green/90 text-white shadow-lg shadow-vp-green/20">
                Xem Chi tiết
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
export default CardItem;

