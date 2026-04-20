"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CardItem } from '@/components/CardItem';
import { Card } from '@/types';
import { useCompare } from '@/context/CompareContext';
import { Button } from '@/components/ui/button';
import { cardApi } from '@/services/api';

function RecommendationsContent() {
    const { selectedCards, clearCompare } = useCompare();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const spending = Number(searchParams.get('spending')) || 10000000;
    const salary = Number(searchParams.get('salary')) || 0;
    const topCategory = searchParams.get('topCategory') || 'Ăn uống';

    const [cards, setCards] = useState<Card[]>([]);
    const [visibleCount, setVisibleCount] = useState(3);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<string>('Tất cả ngân hàng');

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const results = await cardApi.getRecommendation({
                    amount: spending,
                    salary: salary,
                    category: topCategory,
                    incomeLevel: salary >= 30000000 ? 'High' : salary >= 10000000 ? 'Medium' : 'Low',
                    creditScoreRange: 'Good'
                });

                // Calculate estimated cashback for each card
                const cardsWithCashback = results.map((card: Card) => {
                    const matchingRule = card.cashbackRules.find(r =>
                        topCategory.toLowerCase().includes(r.category.toLowerCase()) ||
                        r.category.toLowerCase().includes(topCategory.toLowerCase())
                    );

                    const generalRule = card.cashbackRules.find(r =>
                        r.category === 'Tất cả' || r.category === 'All'
                    );

                    const rate = matchingRule ? matchingRule.percentage : (generalRule ? generalRule.percentage : 0);
                    const cashbackAmount = (spending * rate) / 100;

                    return { ...card, cashbackAmount };
                });

                setCards(cardsWithCashback);
            } catch (e) {
                console.error("Failed to fetch recommendations:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [spending, topCategory]);

    const filteredCards = cards.filter(card =>
        selectedBank === 'Tất cả ngân hàng' || card.bankName === selectedBank
    );

    const banks = Array.from(new Set(cards.map(c => c.bankName)));

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    return (
        <main className="flex-grow pt-32 px-4 pb-16 sm:px-8 md:px-16 lg:px-24 xl:px-40 bg-slate-50 dark:bg-[#0f0f0f] min-h-screen">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50 mb-2 uppercase">
                            Đề xuất dành riêng cho bạn
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl">
                            Chúng tôi tìm thấy <strong className="text-primary-500">{filteredCards.length} thẻ</strong> phù hợp nhất với hồ sơ chi tiêu của bạn.
                        </p>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="rounded-3xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 p-5 mb-10 shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-lg">filter_list</span>
                            Bộ lọc tìm kiếm
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="relative group min-w-fit">
                                <select
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                    className="appearance-none bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none cursor-pointer transition-all"
                                >
                                    <option>Tất cả ngân hàng</option>
                                    {banks.map(bank => (
                                        <option key={bank} value={bank}>{bank}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-slate-400">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Layout for Horizontal Cards */}
                <div className="flex flex-col gap-6 pb-20">
                    {loading ? (
                        <div className="py-20 text-center animate-pulse">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Đang tải đề xuất tốt nhất...</p>
                        </div>
                    ) : filteredCards.length > 0 ? (
                        filteredCards.slice(0, visibleCount).map(card => (
                            <CardItem key={card.id} card={card} />
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
                            <p className="text-slate-500 font-bold">Không tìm thấy thẻ phù hợp. Hãy thử chọn ngân hàng khác.</p>
                        </div>
                    )}
                </div>

                {/* Load More */}
                {filteredCards.length > visibleCount && (
                    <div className="mt-12 mb-20 flex items-center justify-center">
                        <button
                            onClick={handleShowMore}
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-8 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm"
                        >
                            Hiển thị thêm kết quả
                            <span className="material-symbols-outlined">expand_more</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Comparison Bar */}
            <div
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40 transition-all duration-500 ease-in-out ${selectedCards.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
            >
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900 dark:bg-white p-4 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200 dark:ring-slate-800">
                    <div className="flex items-center gap-3 pl-2">
                        <div className="flex items-center -space-x-3">
                            {selectedCards.map((card) => (
                                <div key={card.id} className="h-10 w-10 rounded-full border-2 border-slate-900 dark:border-white overflow-hidden bg-white">
                                    <img src={card.image} alt={card.name} className="h-full w-full object-cover" />
                                </div>
                            ))}
                            {Array.from({ length: Math.max(0, 3 - selectedCards.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-10 w-10 rounded-full border-2 border-slate-900 dark:border-white bg-slate-800 dark:bg-slate-100 flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{i + 1 + selectedCards.length}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white dark:text-slate-900">Đã chọn {selectedCards.length}/3</span>
                            <button onClick={clearCompare} className="text-xs text-slate-400 dark:text-slate-500 hover:underline text-left">Xóa tất cả</button>
                        </div>
                    </div>
                    <Button
                        onClick={() => router.push('/compare')}
                        className="rounded-xl bg-primary-500 text-white hover:bg-primary-600 px-6 font-bold"
                    >
                        So sánh ngay
                    </Button>
                </div>
            </div>
        </main>
    );
}

export default function RecommendationsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        }>
            <RecommendationsContent />
        </Suspense>
    );
}
