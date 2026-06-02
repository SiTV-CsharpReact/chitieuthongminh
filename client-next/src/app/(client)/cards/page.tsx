"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CardItem } from '@/components/CardItem';
import { Card } from '@/types';
import { cardApi } from '@/services/api';

export default function AllCardsPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<string>('Tất cả ngân hàng');
    const [sortBy, setSortBy] = useState<string>('default');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
    const [bankSearch, setBankSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsBankDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

    const sortedCards = React.useMemo(() => {
        const result = [...filteredCards];
        if (sortBy === 'fee_asc') {
            result.sort((a, b) => (a.annualFee || 0) - (b.annualFee || 0));
        } else if (sortBy === 'fee_desc') {
            result.sort((a, b) => (b.annualFee || 0) - (a.annualFee || 0));
        }
        return result;
    }, [filteredCards, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedBank, sortBy]);

    const totalPages = Math.ceil(sortedCards.length / ITEMS_PER_PAGE);
    const paginatedCards = sortedCards.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const banks = Array.from(new Set(cards.map(c => c.bankName)));

    const filteredBankList = React.useMemo(() => {
        return banks.filter(bank =>
            bank.toLowerCase().includes(bankSearch.toLowerCase())
        );
    }, [banks, bankSearch]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#050a12] text-slate-900 dark:text-white transition-colors duration-500 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-slate-100/50 to-white dark:from-slate-900/10 dark:to-[#050a12] -z-10"></div>

            <main className="flex-grow pt-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-15">
                <div className="mx-auto max-w-7xl">

                    <div className="text-center mb-6">
                        <h1 className="text-2xl sm:text-2xl font-black mb-4 tracking-tight leading-tight uppercase">
                            Tất Cả Thẻ Tín Dụng
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Khám phá danh sách đầy đủ các sản phẩm thẻ từ các ngân hàng hàng đầu Việt Nam với những ưu đãi đặc quyền nhất.
                        </p>
                    </div>

                    {/* Filters and Sorting Bar */}
                    <div className="mb-10 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        {/* Bank Filter Select Dropdown */}
                        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px]">account_balance</span> Ngân hàng:
                            </span>
                            <div className="relative flex-grow sm:flex-grow-0">
                                <button
                                    onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                                    className="w-full sm:w-60 flex items-center justify-between bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 hover:border-vp-green focus:border-vp-green focus:outline-none cursor-pointer transition-all shadow-sm group"
                                >
                                    <span className="truncate">{selectedBank}</span>
                                    <span className="material-symbols-outlined absolute right-3 text-lg pointer-events-none text-slate-400 group-hover:text-vp-green transition-colors">
                                        {isBankDropdownOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </button>

                                {isBankDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-full sm:w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                                            <div className="relative flex items-center">
                                                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-sm">search</span>
                                                <input
                                                    type="text"
                                                    placeholder="Tìm ngân hàng..."
                                                    value={bankSearch}
                                                    onChange={(e) => setBankSearch(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:border-vp-green text-slate-800 dark:text-slate-200"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto py-1.5">
                                            <button
                                                onClick={() => {
                                                    setSelectedBank('Tất cả ngân hàng');
                                                    setIsBankDropdownOpen(false);
                                                    setBankSearch('');
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${selectedBank === 'Tất cả ngân hàng' ? 'bg-vp-green/10 text-vp-green' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                            >
                                                <span>Tất cả ngân hàng</span>
                                                {selectedBank === 'Tất cả ngân hàng' && <span className="material-symbols-outlined text-xs">check</span>}
                                            </button>
                                            {filteredBankList.map(bank => (
                                                <button
                                                    key={bank}
                                                    onClick={() => {
                                                        setSelectedBank(bank);
                                                        setIsBankDropdownOpen(false);
                                                        setBankSearch('');
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-between ${selectedBank === bank ? 'bg-vp-green/10 text-vp-green' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                                >
                                                    <span>{bank}</span>
                                                    {selectedBank === bank && <span className="material-symbols-outlined text-xs">check</span>}
                                                </button>
                                            ))}
                                            {filteredBankList.length === 0 && (
                                                <div className="px-4 py-3 text-xs text-slate-400 text-center italic">Không tìm thấy ngân hàng</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                                <span className="material-symbols-outlined text-[18px]">sort</span> Sắp xếp:
                            </span>
                            <div className="relative group min-w-[180px] flex-grow sm:flex-grow-0">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700 hover:border-vp-green focus:border-vp-green focus:outline-none cursor-pointer transition-all shadow-sm"
                                >
                                    <option value="default">Mặc định</option>
                                    <option value="fee_asc">Phí thường niên (Thấp → Cao)</option>
                                    <option value="fee_desc">Phí thường niên (Cao → Thấp)</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-slate-400">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {loading ? (
                            <div className="py-20 text-center animate-pulse">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Đang tải danh sách thẻ...</p>
                            </div>
                        ) : paginatedCards.length > 0 ? (
                            <>
                                {paginatedCards.map(card => (
                                    <CardItem key={card.id} card={card} />
                                ))}

                                {/* Pagination UI */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                        </button>

                                        <div className="flex items-center gap-1.5 px-2">
                                            {(() => {
                                                const pages: (number | string)[] = [];
                                                if (totalPages <= 7) {
                                                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                                                } else {
                                                    if (currentPage <= 4) {
                                                        for (let i = 1; i <= 5; i++) pages.push(i);
                                                        pages.push('...');
                                                        pages.push(totalPages);
                                                    } else if (currentPage >= totalPages - 3) {
                                                        pages.push(1);
                                                        pages.push('...');
                                                        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
                                                    } else {
                                                        pages.push(1);
                                                        pages.push('...');
                                                        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                                                        pages.push('...');
                                                        pages.push(totalPages);
                                                    }
                                                }
                                                return pages.map((p, i) => (
                                                    p === '...' ? (
                                                        <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold">...</span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            onClick={() => setCurrentPage(p as number)}
                                                            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === p ? 'bg-vp-green text-white shadow-md shadow-vp-green/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                ));
                                            })()}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                        </button>
                                    </div>
                                )}
                            </>
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
