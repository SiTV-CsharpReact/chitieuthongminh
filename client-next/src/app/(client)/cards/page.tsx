"use client";

import React, { useState, useEffect } from 'react';
import { CardItem } from '@/components/CardItem';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoryContext } from '@/context/CategoryContext';
import { Card, Category } from '@/types';
import { cardApi, categoryApi } from '@/services/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PortraitCardVisual } from '@/components/PortraitCardVisual';
import { cleanCardName, generateSlug } from '@/lib/utils';
import Link from 'next/link';
import { useCompare } from '@/context/CompareContext';

export default function AllCardsPage() {
    const [cards, setCards] = useState<Card[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBank, setSelectedBank] = useState<string>('Tất cả');
    const [selectedAudience, setSelectedAudience] = useState<string>('Tất cả');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [feeFilter, setFeeFilter] = useState<string>('Tất cả');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<string>('default');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(6);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { isInCompare, addToCompare, removeFromCompare } = useCompare();

    const [expandedSections, setExpandedSections] = useState({
        bank: true,
        audience: true,
        category: true,
        fee: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };
    
    const { getCategoryColor } = useCategoryContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [cardResults, categoryResults] = await Promise.all([
                    cardApi.getAll(),
                    categoryApi.getAll()
                ]);
                setCards(cardResults);
                setCategories(categoryResults);
            } catch (e) {
                console.error("Failed to fetch data:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredCards = cards.filter(card => {
        // Bank Filter
        const matchBank = selectedBank === 'Tất cả' || card.bankName === selectedBank;

        // Audience Filter
        const matchAudience = selectedAudience === 'Tất cả' || (card.tags && card.tags.includes(selectedAudience));

        // Fee Filter
        let matchFee = true;
        if (feeFilter === 'Miễn phí') {
            matchFee = card.annualFee === 0;
        } else if (feeFilter === 'Dưới 500.000đ') {
            matchFee = card.annualFee > 0 && card.annualFee < 500000;
        } else if (feeFilter === '500.000đ - 1.000.000đ') {
            matchFee = card.annualFee >= 500000 && card.annualFee <= 1000000;
        } else if (feeFilter === 'Trên 1.000.000đ') {
            matchFee = card.annualFee > 1000000;
        }

        // Category Filter
        const matchCategory = selectedCategories.length === 0 || (card.cashbackRules && card.cashbackRules.some(r => selectedCategories.includes(r.category)));

        // Search Filter
        const matchSearch = searchTerm === '' || card.name.toLowerCase().includes(searchTerm.toLowerCase()) || (card.bankName && card.bankName.toLowerCase().includes(searchTerm.toLowerCase()));

        return matchBank && matchAudience && matchFee && matchCategory && matchSearch;
    });

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
    }, [selectedBank, selectedAudience, feeFilter, selectedCategories, sortBy, searchTerm]);

    const totalPages = Math.ceil(sortedCards.length / pageSize);
    const paginatedCards = sortedCards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const banks = Array.from(new Set(cards.map(c => c.bankName)));
    const audiences = ['Tất cả', 'Sinh viên', 'Người đi làm', 'Gia đình', 'Doanh nghiệp'];
    const filterCategories = ['Tất cả', ...Array.from(new Set(cards.flatMap(c => c.cashbackRules?.map(r => r.category) || []))).filter(Boolean).filter(c => c !== 'Tất cả')];
    const fees = ['Tất cả', 'Miễn phí', 'Dưới 500.000đ', '500.000đ - 1.000.000đ', 'Trên 1.000.000đ'];

    return (
        <div className="min-h-screen bg-white dark:bg-[#050a12] text-slate-900 dark:text-white transition-colors duration-500 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-slate-100/50 to-white dark:from-slate-900/10 dark:to-[#050a12] -z-10"></div>

            <main className="flex-grow pt-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-15">
                <div className="mx-auto max-w-7xl">



                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar Filters */}
                        <aside className="lg:w-72 flex-shrink-0">
                            <div className="sticky top-10">
                                <div className="bg-white dark:bg-[#0c1425] rounded-3xl border border-slate-200/50 dark:border-slate-800 p-6 pt-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none">
                                    {/* Header */}
                                    <div className="flex items-center justify-between pb-4 pt-3 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-vp-green/15 flex items-center justify-center text-vp-green">
                                                <span className="material-symbols-outlined !text-[20px]">filter_alt</span>
                                            </div>
                                            <h3 className="font-bold text-[17px] text-slate-900 dark:text-white tracking-wide">Bộ lọc</h3>
                                        </div>
                                        <button onClick={() => { setSelectedBank('Tất cả'); setFeeFilter('Tất cả'); setSelectedAudience('Tất cả'); setSelectedCategories([]); setSearchTerm(''); }} className="text-[13px] text-vp-green hover:text-vp-green/80 flex items-center gap-1.5 font-semibold transition-colors">
                                            Xóa bộ lọc <span className="material-symbols-outlined !text-[16px]">refresh</span>
                                        </button>
                                    </div>

                                    <div className="pt-4 space-y-6">
                                        {/* Bank Filter */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4 cursor-pointer group select-none" onClick={() => toggleSection('bank')}>
                                                <h4 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Ngân hàng</h4>
                                                <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${expandedSections.bank ? 'rotate-0' : 'rotate-180'}`}>expand_less</span>
                                            </div>
                                            <div className={`space-y-1 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar ${expandedSections.bank ? 'block' : 'hidden'}`}>
                                                <div onClick={() => setSelectedBank('Tất cả')} className="flex items-center justify-between cursor-pointer py-1.5 group">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 transition-all ${selectedBank === 'Tất cả' ? 'bg-green-300 dark:bg-green-400 text-green-900 dark:text-green-950 shadow-sm' : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-green-400/50'}`}>
                                                            {selectedBank === 'Tất cả' && <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 800" }}>check</span>}
                                                        </span>
                                                        <span className="material-symbols-outlined text-vp-green text-[20px]">account_balance</span>
                                                        <span className="text-[15px] text-slate-700 dark:text-slate-300">Tất cả ngân hàng</span>
                                                    </div>
                                                    <span className={`text-[13px] ${selectedBank === 'Tất cả' ? 'text-vp-green font-semibold' : 'text-slate-400'}`}>{cards.length}</span>
                                                </div>
                                                {banks.map(bank => {
                                                    const bankLogo = cards.find(c => c.bankName === bank)?.bankLogo;
                                                    const count = cards.filter(c => c.bankName === bank).length;
                                                    return (
                                                        <div key={bank} onClick={() => setSelectedBank(bank)} className="flex items-center justify-between cursor-pointer py-1.5 group">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 transition-all ${selectedBank === bank ? 'bg-green-300 dark:bg-green-400 text-green-900 dark:text-green-950 shadow-sm' : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-green-400/50'}`}>
                                                                    {selectedBank === bank && <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 800" }}>check</span>}
                                                                </span>
                                                                {bankLogo ? (
                                                                    <img src={bankLogo} alt={bank} className="h-5 w-6 object-contain flex-shrink-0 dark:bg-white/90 dark:rounded dark:px-0.5" />
                                                                ) : (
                                                                    <span className="material-symbols-outlined text-slate-400 text-[20px] flex-shrink-0">credit_card</span>
                                                                )}
                                                                <span className="text-[15px] text-slate-700 dark:text-slate-300 truncate">{bank}</span>
                                                            </div>
                                                            <span className={`text-[13px] ${selectedBank === bank ? 'text-vp-green font-semibold' : 'text-slate-400'}`}>{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <hr className="border-slate-100 dark:border-slate-800" />

                                        {/* Target Audience Filter */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4 cursor-pointer group select-none" onClick={() => toggleSection('audience')}>
                                                <h4 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Phân loại đối tượng</h4>
                                                <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${expandedSections.audience ? 'rotate-0' : 'rotate-180'}`}>expand_less</span>
                                            </div>
                                            <div className={`${expandedSections.audience ? 'flex' : 'hidden'} flex-wrap gap-1.5`}>
                                                {audiences.map(aud => (
                                                    <button
                                                        key={aud}
                                                        onClick={() => setSelectedAudience(aud)}
                                                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${selectedAudience === aud
                                                            ? 'bg-vp-green/10 text-vp-green border-vp-green'
                                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-vp-green/50 hover:text-vp-green'
                                                            }`}
                                                    >
                                                        {aud}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <hr className="border-slate-100 dark:border-slate-800" />

                                        {/* Category Filter */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4 cursor-pointer group select-none" onClick={() => toggleSection('category')}>
                                                <h4 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Danh mục hoàn tiền</h4>
                                                <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${expandedSections.category ? 'rotate-0' : 'rotate-180'}`}>expand_less</span>
                                            </div>
                                            <div className={`${expandedSections.category ? 'flex' : 'hidden'} flex-wrap gap-1.5 max-h-[185px] overflow-y-auto pr-1 custom-scrollbar`}>
                                                {filterCategories.map(cat => {
                                                    const isSelected = cat === 'Tất cả' ? selectedCategories.length === 0 : selectedCategories.includes(cat);
                                                    return (
                                                        <button
                                                            key={cat}
                                                            onClick={() => {
                                                                if (cat === 'Tất cả') {
                                                                    setSelectedCategories([]);
                                                                } else {
                                                                    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                                                                }
                                                            }}
                                                            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${isSelected
                                                                ? 'bg-vp-green/10 text-vp-green border-vp-green'
                                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-vp-green/50 hover:text-vp-green'
                                                                }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <hr className="border-slate-100 dark:border-slate-800" />

                                        {/* Fee Filter */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4 cursor-pointer group select-none" onClick={() => toggleSection('fee')}>
                                                <h4 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Phí thường niên</h4>
                                                <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${expandedSections.fee ? 'rotate-0' : 'rotate-180'}`}>expand_less</span>
                                            </div>
                                            <div className={`${expandedSections.fee ? 'flex' : 'hidden'} flex-wrap gap-1.5`}>
                                                {fees.map(fee => (
                                                    <button
                                                        key={fee}
                                                        onClick={() => setFeeFilter(fee)}
                                                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${feeFilter === fee
                                                            ? 'bg-vp-green/10 text-vp-green border-vp-green'
                                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-vp-green/50 hover:text-vp-green'
                                                            }`}
                                                    >
                                                        {fee}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content Area */}
                        <div className="flex-1">
                            {/* Header inside right column */}
                            <div className="text-center mb-5">
                                <h1 className="text-3xl font-bold mb-2 tracking-tight text-slate-900 dark:text-white">
                                    Danh sách thẻ tín dụng
                                </h1>
                                <p className="text-[15px] text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                                    So sánh ưu đãi và chọn thẻ mang lại giá trị tốt nhất cho bạn.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-1">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Tìm thấy <strong className="text-slate-900 dark:text-white">{filteredCards.length} thẻ</strong>
                                </p>
                                <div className="flex items-center gap-3">
                                    {/* Search Bar */}
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">search</span>
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm thẻ..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-[38px] w-48 text-sm bg-white dark:bg-[#0c1425] border border-slate-200/50 dark:border-slate-800 rounded-xl pl-9 pr-3 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-vp-green/50 placeholder:text-slate-400 placeholder:font-normal"
                                        />
                                    </div>

                                    {/* View Mode Toggle */}


                                    {/* Page Size */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-medium hidden sm:inline">Hiển thị</span>
                                        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                                            className="h-[38px] text-sm bg-white dark:bg-[#0c1425] border border-slate-200/50 dark:border-slate-800 rounded-xl px-3 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-vp-green/50"
                                        >
                                            {[6, 9, 12, 24].map(n => (
                                                <option key={n} value={n}>{n} thẻ</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Sort */}
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                        className="h-[38px] text-sm bg-white dark:bg-[#0c1425] border border-slate-200/50 dark:border-slate-800 rounded-xl px-4 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-vp-green/50"
                                    >
                                        <option value="default">Mặc định</option>
                                        <option value="fee_asc">Phí thường niên (Thấp → Cao)</option>
                                        <option value="fee_desc">Phí thường niên (Cao → Thấp)</option>
                                    </select>
                                    <div className="flex items-center bg-slate-100 dark:bg-[#0c1425] rounded-xl p-1 border border-slate-200/50 dark:border-slate-800 h-[38px]">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`w-8 h-full rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-vp-green' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                            title="Lưới"
                                        >
                                            <span className="material-symbols-outlined !text-[18px]">grid_view</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`w-8 h-full rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-vp-green' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                            title="Danh sách"
                                        >
                                            <span className="material-symbols-outlined !text-[18px]">view_list</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
                                {loading ? (
                                    viewMode === 'grid' ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 animate-pulse">
                                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                                                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4"></div>
                                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
                                                <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center animate-pulse w-full">
                                            <p className="text-slate-400 font-bold uppercase tracking-widest">Đang tải danh sách thẻ...</p>
                                        </div>
                                    )
                                ) : paginatedCards.length > 0 ? (
                                    paginatedCards.map(card => {
                                        if (viewMode === 'list') {
                                            return <CardItem key={card.id} card={card} />;
                                        }

                                        const topRule = card.cashbackRules?.reduce((best, r) => r.percentage > (best?.percentage || 0) ? r : best, card.cashbackRules[0]);
                                        return (
                                            <div key={card.id} className={`group bg-white dark:bg-[#0c1425] rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_20px_40px_rgba(0,177,79,0.04)] dark:hover:shadow-[0_20px_40px_rgba(0,177,79,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col ${
                                              card.id && isInCompare(card.id)
                                                ? 'border-vp-green ring-1 ring-vp-green'
                                                : 'border-slate-200/60 dark:border-slate-800/80 hover:border-vp-green/60 dark:hover:border-vp-green/50'
                                            }`}>
                                                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        {card.bankLogo && <img src={card.bankLogo} alt={card.bankName} className="h-5 object-contain dark:bg-white/90 dark:rounded dark:px-1 dark:py-0.5" />}
                                                    </div>
                                                    <div className="px-3 py-1.5 rounded-full border border-vp-green/50 text-vp-green text-[11px] font-medium flex items-center gap-1.5 glow-green bg-vp-green/10 select-none">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-vp-green animate-pulse"></span>
                                                        Phù hợp với {card.tags && card.tags.length > 0 ? card.tags[0].toLowerCase() : 'bạn'}
                                                    </div>
                                                </div>

                                                <div className="px-5 pb-3">
                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[45px]">{cleanCardName(card.name)}</h3>
                                                </div>

                                                <div className="px-5 pb-4">
                                                    <div className="relative w-full aspect-[1.6/1] rounded-xl overflow-hidden border border-slate-100/70 dark:border-slate-800/80 shadow-md group-hover:shadow-lg transition-shadow">
                                                        <PortraitCardVisual imageUrl={card.imageUrl} name={card.name} />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-1 py-2.5 mx-5 mb-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/40">
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">Hoàn tiền ↑</p>
                                                        <p className="text-sm text-vp-green font-black">{topRule ? `${topRule.percentage}%` : 'N/A'}</p>
                                                    </div>
                                                    <div className="text-center border-x border-slate-200/50 dark:border-slate-800/50">
                                                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">Phí thường niên</p>
                                                        <p className="text-[10px] font-black text-slate-900 dark:text-white">{card.annualFee === 0 ? 'Miễn phí' : `${(card.annualFee / 1000).toFixed(0)}K`}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] text-slate-400 font-medium mb-0.5">Hoàn tối đa</p>
                                                        <p className="text-sm font-black text-vp-green">
                                                            {card.maxCashbackPerMonth ? `${(card.maxCashbackPerMonth / 1000).toLocaleString('vi-VN')}K/th` : 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {card.minSpendForCashback ? (
                                                    <div className="mx-5 mb-4 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 flex items-center justify-center gap-1.5 text-sky-700 dark:text-sky-300">
                                                        <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                                                        <span className="text-[11px] font-bold">Chi tiêu tối thiểu: {(card.minSpendForCashback / 1000000).toLocaleString('vi-VN')} Tr/tháng</span>
                                                    </div>
                                                ) : null}

                                                {/* Category Tags */}
                                                {(() => {
                                                    const cardCategories = Array.from(new Set(card.cashbackRules?.map(r => r.category)))
                                                        .filter(Boolean)
                                                        .map(catName => {
                                                            const rulesForCat = card.cashbackRules?.filter(r => r.category === catName) || [];
                                                            const maxPercentage = Math.max(...rulesForCat.map(r => r.percentage));
                                                            return { name: catName, percentage: maxPercentage };
                                                        });
                                                    if (cardCategories.length > 0) {
                                                        return (
                                                            <div className="px-5 pb-3 relative">
                                                                            {(() => {
                                                                                const cardCategoriesWithPercentage = cardCategories; // Already calculated above
                                                                                // Removed hardcoded tagColors array as we are using backend colors now

                                                                                const allTags = [
                                                                                    ...cardCategoriesWithPercentage.map((cat, idx) => ({ type: 'category' as const, data: cat, idx })),
                                                                                    ...(card.tags || []).map((tag, idx) => ({ type: 'tag' as const, data: tag, idx }))
                                                                                ];

                                                                                if (allTags.length === 0) return null;

                                                                                let currentLength = 0;
                                                                                let MAX_TAGS = 0;
                                                                                for (let i = 0; i < allTags.length; i++) {
                                                                                    const textLength = allTags[i].type === 'category' ? (allTags[i].data as {name: string}).name.length : (allTags[i].data as string).length;
                                                                                    if (currentLength + textLength > 25 && MAX_TAGS > 0) {
                                                                                        break;
                                                                                    }
                                                                                    currentLength += textLength + 5;
                                                                                    MAX_TAGS++;
                                                                                    if (MAX_TAGS >= 2) break;
                                                                                }
                                                                                if (allTags.length > 0 && MAX_TAGS === 0) MAX_TAGS = 1;

                                                                                const visibleTags = allTags.slice(0, MAX_TAGS);
                                                                                const hiddenTags = allTags.slice(MAX_TAGS);

                                                                                return (
                                                                                    <div className="flex flex-nowrap items-center gap-2 overflow-hidden max-w-full">
                                                                                        {visibleTags.map((item) => {
                                                                                            if (item.type === 'category') {
                                                                                                const cat = item.data as { name: string; percentage: number };
                                                                                                const hexColor = getCategoryColor(cat.name);
                                                                                                return (
                                                                                                    <div key={`cat-${item.idx}`} className="inline-flex items-center rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40 overflow-hidden shrink-0 max-w-full shadow-sm">
                                                                                                        <div className="flex items-center pl-2 pr-1.5 py-1 min-w-0">
                                                                                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mr-1.5" style={{ backgroundColor: hexColor }}></span>
                                                                                                            <span className="text-[10.5px] font-bold truncate" style={{ color: hexColor }}>
                                                                                                                {cat.name}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <div className="pl-1.5 pr-2 py-1 border-l border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 flex items-center justify-center bg-white/50 dark:bg-black/20">
                                                                                                            <span className="text-[10.5px] font-black leading-none mb-[1px]" style={{ color: hexColor }}>
                                                                                                                {cat.percentage}%
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            } else {
                                                                                                const tag = item.data;
                                                                                                return (
                                                                                                    <div key={`tag-${item.idx}`} className="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 shrink-0 max-w-full min-w-0">
                                                                                                        <span className="text-[10px] text-slate-400 flex-shrink-0 mr-1">●</span>
                                                                                                        <span className="text-[10px] font-medium truncate">{tag}</span>
                                                                                                    </div>
                                                                                                );
                                                                                            }
                                                                                        })}

                                                                                        {hiddenTags.length > 0 && (
                                                                                            <TooltipProvider delay={100}>
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger className="flex items-center justify-center px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0">
                                                                                                        <span className="text-[12px] font-medium">+{hiddenTags.length}</span>
                                                                                                    </TooltipTrigger>
                                                                                                    <TooltipContent side="top" className="flex flex-col gap-2 p-2 bg-white dark:bg-[#0c1425] border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-50">
                                                                                                        {hiddenTags.map((item) => {
                                                                                                            if (item.type === 'category') {
                                                                                                                const cat = item.data as { name: string; percentage: number };
                                                                                                                const hexColor = getCategoryColor(cat.name);
                                                                                                                return (
                                                                                                                    <div key={`hidden-cat-${item.idx}`} className={`inline-flex items-center justify-between rounded-full border overflow-hidden shrink-0 w-full`} style={{ borderColor: `${hexColor}60`, backgroundColor: `${hexColor}15` }}>
                                                                                                                        <div className="flex items-center px-2 py-1 min-w-0">
                                                                                                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mr-1.5`} style={{ backgroundColor: hexColor }}></span>
                                                                                                                            <span className={`text-[11px] font-bold truncate`} style={{ color: hexColor }}>
                                                                                                                                {cat.name}
                                                                                                                            </span>
                                                                                                                        </div>
                                                                                                                        <div className={`px-2 py-1 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-l flex-shrink-0`} style={{ borderColor: `${hexColor}60` }}>
                                                                                                                            <span className={`text-[11px] font-black`} style={{ color: hexColor }}>
                                                                                                                                {cat.percentage}%
                                                                                                                            </span>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                );
                                                                                                            } else {
                                                                                                                const tag = item.data;
                                                                                                                return (
                                                                                                                    <div key={`hidden-tag-${item.idx}`} className="inline-flex items-center px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 w-full">
                                                                                                                        <span className="text-[11px] text-slate-400 flex-shrink-0 mr-1.5">●</span>
                                                                                                                        <span className="text-[11px] font-medium truncate">{tag}</span>
                                                                                                                    </div>
                                                                                                                );
                                                                                                            }
                                                                                                        })}
                                                                                                    </TooltipContent>
                                                                                                </Tooltip>
                                                                                            </TooltipProvider>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* Benefits preview */}
                                                <div className="px-5 pb-4 flex-grow">
                                                    <ul className="space-y-1.5">
                                                        {(card.benefits || []).slice(0, 2).map((b, i) => (
                                                            <li key={i} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                                <span className="material-symbols-outlined text-vp-green !text-[14px] flex-shrink-0">check_circle</span>
                                                                <span className="line-clamp-1">{b}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="flex items-center gap-2 px-5 pb-5 mt-auto">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (!card.id) return;
                                                            if (isInCompare(card.id)) {
                                                              removeFromCompare(card.id);
                                                            } else {
                                                              addToCompare(card);
                                                            }
                                                        }}
                                                        className={`flex items-center justify-center w-11 h-11 rounded-xl border flex-shrink-0 transition-colors ${
                                                            card.id && isInCompare(card.id)
                                                            ? 'bg-vp-green/10 border-vp-green text-vp-green'
                                                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-200/60 dark:border-slate-700/50 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                                        }`}
                                                        title={card.id && isInCompare(card.id) ? "Bỏ chọn" : "So sánh thẻ"}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">
                                                            {card.id && isInCompare(card.id) ? 'check_box' : 'compare_arrows'}
                                                        </span>
                                                    </button>
                                                    <Link href={`/card/${generateSlug(card.name)}`} className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/50 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                                                        Chi tiết
                                                    </Link>
                                                    {card.registerUrl ? (
                                                        <a href={card.registerUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-vp-green hover:bg-vp-green/90 text-sm font-bold text-white shadow-md shadow-vp-green/10 hover:shadow-vp-green/20 active:scale-95 transition-all">
                                                            Đăng ký
                                                        </a>
                                                    ) : (
                                                        <Link href={`/card/${generateSlug(card.name)}`} className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-vp-green hover:bg-vp-green/90 text-sm font-bold text-white shadow-md shadow-vp-green/10 hover:shadow-vp-green/20 active:scale-95 transition-all">
                                                            Đăng ký
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold">Không tìm thấy thẻ phù hợp.</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {!loading && filteredCards.length > pageSize && (
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-400 font-medium">
                                        Trang {currentPage}/{totalPages} · Hiển thị {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredCards.length)} / {filteredCards.length} thẻ
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage <= 1}
                                            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-vp-green/10 hover:text-vp-green hover:border-vp-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                            .reduce<(number | string)[]>((acc, p, idx, arr) => {
                                                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((p, idx) =>
                                                typeof p === 'string' ? (
                                                    <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-xs text-slate-400">…</span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() => setCurrentPage(p)}
                                                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${p === currentPage
                                                            ? 'bg-vp-green text-white shadow-md shadow-vp-green/30'
                                                            : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-vp-green/10 hover:text-vp-green hover:border-vp-green/50'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage >= totalPages}
                                            className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-vp-green/10 hover:text-vp-green hover:border-vp-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
