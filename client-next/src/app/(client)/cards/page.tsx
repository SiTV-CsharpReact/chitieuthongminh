"use client";

import React, { useState, useEffect } from 'react';
import { CardItem } from '@/components/CardItem';
import { Card } from '@/types';
import { cardApi } from '@/services/api';

export default function AllCardsPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<string>('Tất cả ngân hàng');

    useEffect(() => {
        const fetchAllCards = async () => {
            try {
                setLoading(true);
                const results = await cardApi.getAll();
                setCards(results);
            } catch (e) {
                console.error("Failed to fetch cards:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAllCards();
    }, []);

    const filteredCards = cards.filter(card =>
        selectedBank === 'Tất cả ngân hàng' || card.bankName === selectedBank
    );

    const banks = Array.from(new Set(cards.map(c => c.bankName)));

    return (
        <div className="min-h-screen bg-white dark:bg-[#050a12] text-slate-900 dark:text-white transition-colors duration-500 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-slate-100/50 to-white dark:from-slate-900/10 dark:to-[#050a12] -z-10"></div>

            <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-20">
                <div className="mx-auto max-w-7xl">

                    <div className="text-center mb-16">
                        <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight leading-tight uppercase">
                            Tất Cả Thẻ Tín Dụng
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Khám phá danh sách đầy đủ các sản phẩm thẻ từ các ngân hàng hàng đầu Việt Nam với những ưu đãi đặc quyền nhất.
                        </p>
                    </div>

                    {/* Bank Filter Pills */}
                    <div className="mb-12 flex items-center justify-center gap-3 flex-wrap">
                        <button
                            onClick={() => setSelectedBank('Tất cả ngân hàng')}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${selectedBank === 'Tất cả ngân hàng' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                        >
                            Tất cả
                        </button>
                        {banks.map(bank => (
                            <button
                                key={bank}
                                onClick={() => setSelectedBank(bank)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${selectedBank === bank ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                            >
                                {bank}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {loading ? (
                            <div className="py-20 text-center animate-pulse">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Đang tải danh sách thẻ...</p>
                            </div>
                        ) : filteredCards.length > 0 ? (
                            filteredCards.map(card => (
                                <CardItem key={card.id} card={card} />
                            ))
                        ) : (
                            <div className="py-20 text-center bg-slate-50 dark:bg-white/5 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/10">
                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
                                <p className="text-slate-500 dark:text-slate-400 font-bold">Không tìm thấy thẻ phù hợp.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
