"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCompare } from '@/context/CompareContext';
import { cleanCardName, generateSlug } from '@/lib/utils';
import { PortraitCardVisual } from '@/components/PortraitCardVisual';
import { useCategoryContext } from '@/context/CategoryContext';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ComparePage() {
    const { selectedCards, removeFromCompare } = useCompare();
    const { getCategoryColor } = useCategoryContext();
    const router = useRouter();

    if (selectedCards.length === 0) {
        return (
            <main className="flex-grow pt-10 px-4 pb-16 flex items-center justify-center min-h-[70vh]">
                <div className="text-center max-w-md">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-6">
                        <span className="material-symbols-outlined text-4xl">compare_arrows</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-2 uppercase tracking-tight">Chưa chọn thẻ nào</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Vui lòng chọn ít nhất 1 thẻ từ danh sách để bắt đầu so sánh.</p>
                    <button onClick={() => router.push('/cards')} className="bg-vp-green hover:bg-vp-green/90 text-white rounded-xl font-bold px-8 py-3 transition-colors">
                        Xem danh sách thẻ
                    </button>
                </div>
            </main>
        );
    }

    const ROW_HEIGHTS = {
        header: 'h-[280px]',
        bank: 'h-16',
        fee: 'h-16',
        limit: 'h-16',
        interest: 'h-16',
        income: 'h-16',
        cashback: 'h-16',
        category: 'h-20',
        benefits: 'h-[160px]',
        actions: 'h-[140px]',
    };

    return (
        <main className="flex-grow pt-10 px-4 sm:px-8 md:px-10 lg:px-16 pb-20 bg-slate-50 dark:bg-[#070b14] min-h-screen">
            <div className="mx-auto max-w-[1400px]">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white mb-2">
                            So sánh thẻ
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Đối chiếu nhanh ưu đãi, chi phí và quyền lợi để chọn thẻ phù hợp nhất
                        </p>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger render={<div className="inline-block" />}>
                                <button
                                    onClick={() => router.push('/cards')}
                                    disabled={selectedCards.length >= 3}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border font-medium transition-colors text-sm ${selectedCards.length >= 3 ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 opacity-60 cursor-not-allowed' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1425] text-slate-700 dark:text-slate-300 hover:border-vp-green hover:text-vp-green'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                                    Thêm thẻ khác
                                </button>
                            </TooltipTrigger>
                            {selectedCards.length >= 3 && (
                                <TooltipContent side="bottom" className="font-medium">
                                    <p>Chỉ được so sánh tối đa 3 thẻ</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                </div>

                {/* Compare Grid */}
                <div className="overflow-x-auto pb-4 pt-4 -mt-4 scrollbar-hide">
                    <div className="min-w-[1000px]">
                        <div className="grid grid-cols-[220px_repeat(3,minmax(0,1fr))] gap-4 xl:gap-6">
                            
                            {/* Left Column: Labels */}
                            <div className="col-span-1 flex flex-col mt-4">
                                {/* Header Spacer */}
                                <div className={`${ROW_HEIGHTS.header} flex flex-col justify-end pb-4`}>
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-500 px-2">Tiêu chí so sánh</h3>
                                </div>
                                {/* Rows */}
                                <div className={`${ROW_HEIGHTS.bank} flex items-center px-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60`}>
                                    <span className="material-symbols-outlined text-[18px] mr-3">account_balance</span> Ngân hàng
                                </div>
                                <div className={`${ROW_HEIGHTS.fee} flex items-center px-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60`}>
                                    <span className="material-symbols-outlined text-[18px] mr-3">event</span> Phí thường niên
                                </div>
                                <div className={`${ROW_HEIGHTS.limit} flex items-center px-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60`}>
                                    <span className="material-symbols-outlined text-[18px] mr-3">credit_card</span> Hạn mức tín dụng
                                </div>
                                <div className={`${ROW_HEIGHTS.interest} flex items-center px-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60`}>
                                    <span className="material-symbols-outlined text-[18px] mr-3">percent</span> Lãi suất
                                </div>
                                <div className={`${ROW_HEIGHTS.income} flex items-center px-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60`}>
                                    <span className="material-symbols-outlined text-[18px] mr-3">account_circle</span> Thu nhập tối thiểu
                                </div>
                                <div className={`${ROW_HEIGHTS.cashback} flex items-center px-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60`}>
                                    <span className="material-symbols-outlined text-[18px] mr-3">cached</span> Hoàn tiền ước tính
                                </div>
                                <div className={`${ROW_HEIGHTS.category} flex items-center px-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60`}>
                                    <span className="material-symbols-outlined text-[18px] mr-3">sell</span> Danh mục nổi bật
                                </div>
                                <div className={`${ROW_HEIGHTS.benefits} flex items-start pt-6 px-2 text-sm text-slate-600 dark:text-slate-400`}>
                                    <span className="material-symbols-outlined text-[18px] mr-3 mt-0.5">star</span> Ưu đãi nổi bật
                                </div>
                                <div className={`${ROW_HEIGHTS.actions}`}></div>
                            </div>

                            {/* Card Columns */}
                            {selectedCards.map((card, idx) => {
                                const isActive = card.isBest || (idx === 1 && !selectedCards.some(c => c.isBest));
                                const cardCategoriesWithPercentage = card.cashbackRules?.reduce((acc: {category: string, percentage: number}[], rule) => {
                                    const existing = acc.find(c => c.category === rule.category);
                                    if (!existing) {
                                        acc.push({ category: rule.category, percentage: rule.percentage });
                                    } else if (rule.percentage > existing.percentage) {
                                        existing.percentage = rule.percentage;
                                    }
                                    return acc;
                                }, []) || [];

                                return (
                                    <div 
                                        key={card.id} 
                                        className={`col-span-1 flex flex-col rounded-3xl relative transition-all duration-300 mt-4 ${
                                            isActive 
                                            ? 'border border-vp-green bg-white dark:bg-[#0c1425] shadow-[0_0_30px_rgba(0,177,79,0.1)] ring-1 ring-vp-green/50 z-10' 
                                            : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1425] shadow-sm'
                                        }`}
                                    >
                                        {/* Close Button */}
                                        <button
                                            onClick={() => removeFromCompare(card.id || '')}
                                            className="absolute top-4 left-4 h-7 w-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors z-20"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span>
                                        </button>

                                        {/* Badge */}
                                        <div className="absolute top-4 right-4 z-20 flex justify-center">
                                            {isActive ? (
                                                <div className="px-3 py-1 rounded-full bg-vp-green/10 dark:bg-[#0a2618] border border-vp-green text-vp-green text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                                                    <span className="material-symbols-outlined text-[12px]">star</span> PHỔ BIẾN
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-vp-green text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                                                    <span className="material-symbols-outlined text-[12px]">check_circle</span> PHÙ HỢP
                                                </div>
                                            )}
                                        </div>

                                        {/* Header Spacer (Image + Title) */}
                                        <div className={`${ROW_HEIGHTS.header} p-5 flex flex-col items-center text-center justify-end border-b border-slate-100 dark:border-slate-800/60`}>
                                            <div className="w-full h-[150px] flex items-center justify-center relative mb-3 mt-4">
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <PortraitCardVisual imageUrl={card.imageUrl} name={card.name} />
                                                </div>
                                            </div>
                                            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight mb-1.5 line-clamp-2">{cleanCardName(card.name)}</h3>
                                            <p className="text-[11px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">{card.bankName}</p>
                                        </div>

                                        {/* Rows */}
                                        <div className={`${ROW_HEIGHTS.bank} flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60`}>
                                            {card.bankName}
                                        </div>
                                        <div className={`${ROW_HEIGHTS.fee} flex items-center justify-center text-sm font-bold ${card.annualFee === 0 ? 'text-vp-green' : 'text-slate-700 dark:text-slate-300'} border-b border-slate-100 dark:border-slate-800/60`}>
                                            {card.annualFee === 0 ? 'Miễn phí năm đầu' : `${(card.annualFee! / 1000).toLocaleString('vi-VN')}K`}
                                        </div>
                                        <div className={`${ROW_HEIGHTS.limit} flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60`}>
                                            {card.creditLimit || 'Từ 20 triệu'}
                                        </div>
                                        <div className={`${ROW_HEIGHTS.interest} flex items-center justify-center text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800/60`}>
                                            {card.interestRate || '1.5% - 2.5%'}
                                        </div>
                                        <div className={`${ROW_HEIGHTS.income} flex items-center justify-center text-sm font-bold ${card.minSalary && card.minSalary <= 8000000 ? 'text-vp-green' : 'text-slate-700 dark:text-slate-300'} border-b border-slate-100 dark:border-slate-800/60`}>
                                            {card.minSalary ? `${(card.minSalary / 1000000).toLocaleString('vi-VN')} triệu/tháng` : '7 triệu/tháng'}
                                        </div>
                                        <div className={`${ROW_HEIGHTS.cashback} flex items-center justify-center text-sm font-black text-vp-green border-b border-slate-100 dark:border-slate-800/60 text-center px-2 leading-tight`}>
                                            {card.cashbackAmount ? `~${card.cashbackAmount.toLocaleString('vi-VN')}đ/tháng` : (() => {
                                                if (card.maxCashbackPerMonth) return `Đến ${(card.maxCashbackPerMonth / 1000).toLocaleString('vi-VN')}K/tháng`;
                                                const topRule = card.cashbackRules?.reduce((best, r) => r.percentage > (best?.percentage || 0) ? r : best, card.cashbackRules?.[0]);
                                                return topRule ? `Đến ${topRule.percentage}%` : 'Tùy chi tiêu';
                                            })()}
                                        </div>
                                        <div className={`${ROW_HEIGHTS.category} flex flex-wrap items-center justify-center gap-1.5 px-2 py-2 border-b border-slate-100 dark:border-slate-800/60 overflow-hidden`}>
                                            {cardCategoriesWithPercentage.length > 0 ? (
                                                cardCategoriesWithPercentage.map((cat, i) => {
                                                    const hexColor = getCategoryColor(cat.category);
                                                    return (
                                                        <div key={`cat-${i}`} className="inline-flex items-center rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40 overflow-hidden shrink-0 max-w-full shadow-sm">
                                                            <div className="flex items-center pl-2 pr-1.5 py-1 min-w-0">
                                                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mr-1.5" style={{ backgroundColor: hexColor }}></span>
                                                                <span className="text-[10.5px] font-bold truncate" style={{ color: hexColor }}>{cat.category}</span>
                                                            </div>
                                                            <div className="pl-1.5 pr-2 py-1 border-l border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 flex items-center justify-center bg-white/50 dark:bg-black/20">
                                                                <span className="text-[10.5px] font-black leading-none mb-[1px]" style={{ color: hexColor }}>
                                                                    {cat.percentage}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <span className="text-slate-400 text-sm">-</span>
                                            )}
                                        </div>
                                        <div className={`${ROW_HEIGHTS.benefits} flex flex-col justify-start py-5 px-5 border-b border-slate-100 dark:border-slate-800/60`}>
                                            <ul className="space-y-3">
                                                {(card.benefits || []).slice(0, 3).map((b, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 dark:text-slate-300 leading-snug">
                                                        <span className="material-symbols-outlined text-vp-green text-[16px] mt-0.5 flex-shrink-0">check_circle</span>
                                                        <span className="line-clamp-2">{b}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Actions */}
                                        <div className={`${ROW_HEIGHTS.actions} flex flex-col justify-center gap-2.5 px-5`}>
                                            {card.registerUrl ? (
                                                <a href={card.registerUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-1 py-3 rounded-xl bg-vp-green hover:bg-vp-green/90 text-white text-sm font-bold transition-all shadow-md shadow-vp-green/20">
                                                    Mở thẻ ngay <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                                </a>
                                            ) : (
                                                <Link href={`/card/${generateSlug(card.name)}`} className="w-full flex items-center justify-center gap-1 py-3 rounded-xl bg-vp-green hover:bg-vp-green/90 text-white text-sm font-bold transition-all shadow-md shadow-vp-green/20">
                                                    Mở thẻ ngay <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                                </Link>
                                            )}
                                            <Link href={`/card/${generateSlug(card.name)}`} className="w-full flex items-center justify-center gap-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all">
                                                Xem chi tiết <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Placeholders if less than 3 cards */}
                            {Array.from({ length: Math.max(0, 3 - selectedCards.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="col-span-1 pt-60 flex flex-col items-center">
                                    <button
                                        onClick={() => router.push('/cards')}
                                        className="w-full h-[600px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:border-vp-green/50 hover:text-vp-green hover:bg-vp-green/5 dark:hover:bg-vp-green/5 transition-all gap-4"
                                    >
                                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl">add</span>
                                        </div>
                                        <span className="font-bold">Thêm thẻ khác</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
