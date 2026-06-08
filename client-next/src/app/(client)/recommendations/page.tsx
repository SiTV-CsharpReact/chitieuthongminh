"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CardItem } from '@/components/CardItem';
import { Card, CashbackRule, ComboResult, CategorySpending } from '@/types';
import { useCompare } from '@/context/CompareContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cardApi } from '@/services/api';
import { cleanCardName, generateSlug } from '@/lib/utils';
import SaveCardModal from '@/components/SaveCardModal';

// ═══════════════════════════════════════════════════════════
// COMBO UI COLORS
// ═══════════════════════════════════════════════════════════

const COMBO_TW_COLORS = [
    { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-emerald-100/50 dark:border-emerald-900/30', btn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' },
    { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50/50 dark:bg-cyan-950/20', border: 'border-cyan-100/50 dark:border-cyan-900/30', btn: 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20' },
    { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50/50 dark:bg-violet-950/20', border: 'border-violet-100/50 dark:border-violet-900/30', btn: 'bg-violet-500 hover:bg-violet-600 shadow-violet-500/20' },
];

// ═══════════════════════════════════════════════════════════
// COMBO RECOMMENDATION UI
// ═══════════════════════════════════════════════════════════

function ComboRecommendation({ combo, bestSingleCashback }: { combo: ComboResult; bestSingleCashback: number }) {
    const cardCount = combo.cards.length;
    const gridClass = cardCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

    return (
        <div className="relative mb-10 animate-[scaleUp_0.8s_ease-out]">
            {/* Glowing background */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 opacity-50 blur-xl animate-[pulse_3s_infinite]"></div>

            <div className="relative rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-400/50 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 px-6 sm:px-8 py-5 border-b border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <span className="material-symbols-outlined text-white text-xl">lightbulb</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Chiến lược Combo: Dùng {cardCount} thẻ</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Chia chi tiêu giữa {cardCount} ngân hàng để tối ưu hoàn tiền</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 w-fit">
                                <span className="material-symbols-outlined text-[16px]">savings</span>
                                <span className="text-sm font-black">Tiết kiệm thêm {combo.savingsPercent.toFixed(0)}%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/30 w-fit">
                                <span className="material-symbols-outlined text-lg">trending_up</span>
                                <span className="text-sm font-black">+{combo.savingsVsSingle.toLocaleString('vi-VN')}đ/tháng</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards comparison - dynamic grid */}
                <div className={`grid grid-cols-1 ${gridClass}`}>
                    {combo.cards.map((cc, idx) => {
                        const tw = COMBO_TW_COLORS[idx];
                        const categories = combo.allocation.filter(a => a.assignedTo === idx);
                        const isLast = idx === cardCount - 1;
                        return (
                            <div key={cc.card.id} className={`p-6 ${!isLast ? 'border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800' : ''}`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex-shrink-0">
                                        {cc.card.imageUrl && <img src={cc.card.imageUrl} alt={cc.card.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-bold uppercase tracking-widest ${tw.text}`}>{cc.label}</p>
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{cleanCardName(cc.card.name)}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium">{cc.card.bankName}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {categories.map((a, i) => (
                                        <div key={i} className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${tw.bg} border ${tw.border}`}>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.category}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold ${tw.text}`}>{a.rate}%</span>
                                                <span className={`text-xs font-black ${tw.text}`}>+{a.cashback.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-1 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng hoàn</span>
                                        <span className={`text-lg font-black ${tw.text}`}>{cc.cashback.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    {cc.card.minSpendForCashback ? (
                                        <div className="flex items-center justify-between pt-1 border-t border-slate-100/50 dark:border-slate-800/50 mt-1">
                                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">info</span> Chi tiêu tối thiểu
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                                {(cc.card.minSpendForCashback / 1000000).toLocaleString('vi-VN')}Tr/th
                                            </span>
                                        </div>
                                    ) : null}
                                </div>

                                {cc.card.registerUrl ? (
                                    <a href={cc.card.registerUrl} target="_blank" rel="noopener noreferrer"
                                        className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${tw.btn}`}>
                                        Đăng ký thẻ
                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </a>
                                ) : (
                                    <Link href={`/card/${generateSlug(cc.card.name)}`}
                                        className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${tw.btn}`}>
                                        Xem chi tiết
                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Summary footer */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Combo {cardCount} thẻ</p>
                                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{combo.totalCashback.toLocaleString('vi-VN')}đ<span className="text-xs font-semibold text-slate-400">/tháng</span></p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chỉ 1 thẻ</p>
                                <p className="text-xl font-black text-slate-400 line-through">{bestSingleCashback.toLocaleString('vi-VN')}đ<span className="text-xs font-semibold">/tháng</span></p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                <span className="material-symbols-outlined text-lg">monitoring</span>
                                <span className="text-sm font-black">Hoàn tiền: {((combo.totalCashback / combo.allocation.reduce((sum, a) => sum + a.amount, 1)) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// GAMIFIED BEST CARD (unchanged from original)
// ═══════════════════════════════════════════════════════════

function GamifiedBestCard({ card, onSaveCard }: { card: Card, onSaveCard: (c: Card) => void }) {
    const { isInCompare, addToCompare, removeFromCompare } = useCompare();
    const isSelected = isInCompare(card.id || '');

    return (
        <div className="relative mb-8 animate-[scaleUp_0.8s_ease-out]">
            {/* Glowing background */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-70 blur-xl animate-[pulse_3s_infinite]"></div>

            {/* Main Card Container */}
            <div className="relative flex flex-col md:flex-row gap-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400/50 p-6 sm:p-8 shadow-2xl overflow-hidden">
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 dark:from-white/10 to-transparent pointer-events-none"></div>

                {/* Crown Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[11px] sm:text-xs px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-10">
                    <span className="material-symbols-outlined text-[14px] animate-pulse">auto_awesome</span>
                    Đề xuất bởi CredBack
                </div>

                {/* Left Side: Image */}
                <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center z-10 relative">
                    <div className="relative w-full aspect-[1.58/1] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(251,191,36,0.3)] transform transition-transform hover:scale-105 duration-500 hover:-rotate-2 border-2 border-amber-200 dark:border-slate-700">
                        <img
                            alt={card.name}
                            className="h-full w-full object-cover"
                            src={card.imageUrl}
                        />
                        {isSelected && (
                            <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center backdrop-blur-sm">
                                <div className="bg-amber-500 text-white rounded-full p-2 shadow-lg">
                                    <span className="material-symbols-outlined text-2xl">check</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Content */}
                <div className="flex flex-1 flex-col justify-between gap-4 z-10 relative text-slate-900 dark:text-white">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-200 dark:to-yellow-500 bg-clip-text text-transparent leading-tight drop-shadow-sm">
                                {card.name}
                            </h3>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            Phát hành bởi <strong className="text-slate-900 dark:text-white">{card.bankName}</strong>
                            {card.bankLogo && <img src={card.bankLogo} alt={card.bankName} className="h-4 ml-1 bg-white rounded-sm px-1 py-0.5 object-contain shadow-sm border border-slate-100" />}
                        </p>
                    </div>

                    <div className="space-y-3 my-2">
                        <div className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 mt-0.5 text-[20px]">percent</span>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Nhận hoàn tiền <strong className="text-slate-900 dark:text-white">{card.cashbackRate || 0}%</strong> cho chi tiêu <strong className="text-slate-900 dark:text-white">{card.cashbackCategory || "các danh mục"}</strong>.
                            </p>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 mt-0.5 text-[20px]">format_quote</span>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                                {card.description || "Thẻ tín dụng xuất sắc nhất dành cho nhu cầu chi tiêu của bạn."}
                            </p>
                        </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2 pt-5 border-t border-slate-200 dark:border-slate-700/50">
                        <div>
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500/80 uppercase tracking-widest mb-1">Hoàn tiền ước tính</p>
                            <p className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 drop-shadow-sm dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                {card.cashbackAmount !== undefined ? (
                                    <>~{card.cashbackAmount.toLocaleString()} đ<span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/tháng</span></>
                                ) : (
                                    <span className="text-base text-slate-400 font-bold uppercase tracking-wide">Nhập chi tiêu để tính</span>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                variant="secondary"
                                onClick={() => isSelected ? removeFromCompare(card.id!) : addToCompare(card)}
                                className={`flex-1 sm:flex-none font-bold transition-all border-none ${isSelected ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
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
                            <Button 
                                variant="outline" 
                                onClick={() => onSaveCard(card)}
                                className="flex-1 sm:flex-none font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-500 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg mr-1">mail</span>
                                Lưu thẻ
                            </Button>
                            <Link href={`/card/${generateSlug(card.name)}`} className="flex-1 sm:flex-none">
                                <Button className="w-full font-black px-8 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-900 shadow-xl shadow-amber-500/30 hover:scale-105 transition-transform border-none">
                                    ĐĂNG KÝ NGAY
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

function RecommendationsContent() {
    const { selectedCards, clearCompare } = useCompare();
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const spending = Number(searchParams.get('spending')) || 10000000;
    const salary = Number(searchParams.get('salary')) || 0;
    const topCategory = searchParams.get('topCategory') || 'Ăn uống';

    const [cards, setCards] = useState<Card[]>([]);
    const [comboResult, setComboResult] = useState<ComboResult | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<string>('Tất cả ngân hàng');
    const [spendingBreakdown, setSpendingBreakdown] = useState<CategorySpending[]>([]);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [cardToEmail, setCardToEmail] = useState<Card | null>(null);
    const historySavedRef = useRef(false);

    // Reset history saved flag when search params change
    useEffect(() => {
        historySavedRef.current = false;
    }, [spending, salary, topCategory]);

    // Load spending breakdown from sessionStorage
    useEffect(() => {
        try {
            const stored = sessionStorage.getItem('spendingBreakdown');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Map local Storage `{ name, amount }` to CategorySpending `{ category, amount }`
                    const mapped = parsed.map(p => ({ category: p.name || p.category, amount: p.amount }));
                    setSpendingBreakdown(mapped);
                    return;
                }
            }
        } catch { /* ignore */ }
        // Fallback: single category from URL
        setSpendingBreakdown([{ category: topCategory, amount: spending }]);
    }, [topCategory, spending]);

    useEffect(() => {
        // Wait until spendingBreakdown has loaded from sessionStorage
        if (spendingBreakdown.length === 0) return;

        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                const response = await cardApi.getRecommendation({
                    salary: salary,
                    incomeLevel: salary >= 30000000 ? 'High' : salary >= 10000000 ? 'Medium' : 'Low',
                    creditScoreRange: 'Good',
                    spendings: spendingBreakdown
                });

                const cardsWithCashback = response.singleCards.map((res, index) => {
                    const card = res.card;
                    const topRule = res.breakdown.reduce((best, curr) => curr.rate > best.rate ? curr : best, res.breakdown[0]);
                    return {
                        ...card,
                        cashbackAmount: res.totalCashback,
                        isBest: index === 0,
                        cashbackCategory: topRule?.category || topCategory,
                        cashbackRate: topRule?.rate || 0,
                    };
                });

                setCards(cardsWithCashback);
                setComboResult(response.bestCombo);

                // Save to search history (only once per search)
                if (user?.id && cardsWithCashback.length > 0 && !historySavedRef.current) {
                    historySavedRef.current = true;
                    try {
                        const historyKey = `search_history_${user.id}`;
                        const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
                        const bestCashback = cardsWithCashback.length > 0 ? (cardsWithCashback[0].cashbackAmount || 0) : 0;
                        const newEntry = {
                            id: Date.now().toString(),
                            date: new Date().toISOString(),
                            query: `Chi tiêu ${(spending / 1000000).toFixed(0)}tr - ${topCategory}`,
                            salary: salary,
                            totalSpending: spending,
                            spendingCategories: spendingBreakdown.map(s => ({ category: s.category, amount: s.amount })),
                            bestCashback: bestCashback,
                            results: cardsWithCashback.slice(0, 6).map((c: Card) => ({ id: c.id, name: c.name, imageUrl: c.imageUrl, bankName: c.bankName })),
                        };
                        const updated = [newEntry, ...existing].slice(0, 20);
                        localStorage.setItem(historyKey, JSON.stringify(updated));
                    } catch { /* ignore storage errors */ }
                }
            } catch (e) {
                console.error("Failed to fetch recommendations:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [spending, topCategory, spendingBreakdown]);

    const bestSingleCashback = useMemo(() => {
        if (cards.length === 0) return 0;
        return Math.max(...cards.map(c => c.cashbackAmount || 0));
    }, [cards]);

    const filteredCards = cards.filter(card =>
        selectedBank === 'Tất cả ngân hàng' || card.bankName === selectedBank
    );

    const banks = Array.from(new Set(cards.map(c => c.bankName)));

    const handleShowMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    return (
        <main className="flex-grow pt-10 px-4 pb-16 sm:px-8 md:px-16 lg:px-24 xl:px-40 bg-slate-50 dark:bg-[#0f0f0f] min-h-screen">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50 mb-2 uppercase">
                            Đề xuất dành riêng cho bạn
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl">
                            Top <strong className="text-vp-green">{filteredCards.length} thẻ</strong> hoàn tiền tốt nhất cho bạn.
                        </p>
                    </div>
                </div>

                {/* Spending Breakdown Summary */}
                {spendingBreakdown.length > 1 && (
                    <div className="rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200/50 dark:border-slate-800 p-5 mb-6 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                            <span className="material-symbols-outlined text-base">receipt_long</span>
                            Chi tiêu hàng tháng của bạn
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {spendingBreakdown.map((sc, i) => (
                                <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <span className="text-slate-400">{sc.category}:</span>
                                    <span className="text-vp-green">{(sc.amount / 1000000).toFixed(1)}tr</span>
                                </div>
                            ))}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vp-green/10 border border-vp-green/20 text-xs font-black text-vp-green">
                                Tổng: {(spendingBreakdown.reduce((sum, item) => sum + item.amount, 0) / 1000000).toFixed(1)}tr/tháng
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Bar */}
                <div className="rounded-3xl bg-white dark:bg-[#18181b] border border-slate-200/50 dark:border-slate-800 p-5 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none transition-all hover:shadow-[0_20px_40px_rgba(0,177,79,0.04)]">
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
                                    className="appearance-none bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-xl border border-slate-200/60 dark:border-slate-700 hover:border-vp-green focus:border-vp-green focus:ring-2 focus:ring-vp-green/20 focus:outline-none cursor-pointer transition-all"
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

                {/* List Layout */}
                <div className="flex flex-col gap-6 pb-20">
                    {loading ? (
                        <div className="py-20 text-center animate-pulse">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">Đang tải đề xuất tốt nhất...</p>
                        </div>
                    ) : filteredCards.length > 0 ? (
                        <>
                            {/* Combo Recommendation — shown first if available */}
                            {comboResult && selectedBank === 'Tất cả ngân hàng' && (
                                <ComboRecommendation combo={comboResult} bestSingleCashback={bestSingleCashback} />
                            )}

                            {/* Individual card recommendations */}
                            {filteredCards.slice(0, visibleCount).map((card, idx) => (
                                (idx === 0 && selectedBank === 'Tất cả ngân hàng') ? (
                                    <GamifiedBestCard key={`best-${card.id}`} card={card} onSaveCard={(c) => { setCardToEmail(c); setIsEmailModalOpen(true); }} />
                                ) : (
                                    <CardItem key={card.id} card={card} onSaveCard={(c) => { setCardToEmail(c); setIsEmailModalOpen(true); }} />
                                )
                            ))}
                        </>
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
                                    <img src={card.imageUrl} alt={card.name} className="h-full w-full object-cover" />
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

            <SaveCardModal 
                isOpen={isEmailModalOpen} 
                onClose={() => setIsEmailModalOpen(false)} 
                card={cardToEmail} 
            />
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
