"use client";

import React, { useState, useEffect } from 'react';
import { Card, WalletCard, UserCardDetail } from '@/types';
import { userApi, recommendationApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import CardItem from '@/components/CardItem';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
    const { isAuthenticated, user, openLoginModal } = useAuth();
    const [savedCards, setSavedCards] = useState<WalletCard[]>([]);
    const [loadingCards, setLoadingCards] = useState(true);
    const [activeTab, setActiveTab] = useState<'wallet' | 'selector'>('wallet');

    // Edit Card Details State
    const [editingCard, setEditingCard] = useState<WalletCard | null>(null);
    const [editDetails, setEditDetails] = useState<{ issueDate: string, statementDate: number, dueDate: number }>({
        issueDate: '', statementDate: 0, dueDate: 0
    });
    const [isSavingDetails, setIsSavingDetails] = useState(false);

    // Smart Selector State
    const [amount, setAmount] = useState<string>('');
    const [category, setCategory] = useState<string>('Ăn uống');
    const [selectorLoading, setSelectorLoading] = useState(false);
    const [selectorResults, setSelectorResults] = useState<{ card: Card, cashbackRate: number, cashbackAmount: number }[] | null>(null);
    const [selectorError, setSelectorError] = useState('');

    const categories = [
        'Ăn uống', 'Siêu thị/Tạp hoá', 'Mua sắm trực tuyến',
        'Du lịch/Máy bay', 'Làm đẹp/Sức khỏe', 'Giao thông/Xăng xe',
        'Giải trí/Xem phim', 'Khác'
    ];

    useEffect(() => {
        if (isAuthenticated) {
            fetchWallet();
        } else {
            setLoadingCards(false);
        }
    }, [isAuthenticated]);

    const fetchWallet = async () => {
        setLoadingCards(true);
        try {
            const cards = await userApi.getWallet();
            setSavedCards(cards);
        } catch (error) {
            console.error("Failed to fetch wallet:", error);
        } finally {
            setLoadingCards(false);
        }
    };

    const { removeOwnedCard } = useFavorites();

    const handleRemoveCard = async (cardId: string) => {
        try {
            await userApi.removeFromWallet(cardId);
            setSavedCards(prev => prev.filter(c => c.card.id !== cardId));
            removeOwnedCard(cardId); // Sync with local context
        } catch (error) {
            console.error("Failed to remove card:", error);
        }
    };

    const handleUpdateDetails = async () => {
        if (!editingCard) return;
        setIsSavingDetails(true);
        try {
            const detailsToSave: UserCardDetail = {
                issueDate: editDetails.issueDate ? new Date(editDetails.issueDate).toISOString() : undefined,
                statementDate: editDetails.statementDate > 0 ? editDetails.statementDate : undefined,
                dueDate: editDetails.dueDate > 0 ? editDetails.dueDate : undefined
            };

            await userApi.updateCardDetails(editingCard.card.id!, detailsToSave);

            setSavedCards(prev => prev.map(c =>
                c.card.id === editingCard.card.id
                    ? { ...c, details: detailsToSave }
                    : c
            ));
            setEditingCard(null);
        } catch (error) {
            console.error("Failed to update card details:", error);
            alert("Lỗi khi lưu cài đặt thẻ");
        } finally {
            setIsSavingDetails(false);
        }
    };

    const handleSmartSelect = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
        if (isNaN(numAmount) || numAmount <= 0) {
            setSelectorError('Vui lòng nhập số tiền hợp lệ.');
            return;
        }

        if (savedCards.length === 0) {
            setSelectorError('Ví thẻ của bạn đang trống. Hãy thêm thẻ vào ví trước.');
            return;
        }

        setSelectorLoading(true);
        setSelectorError('');
        setSelectorResults(null);

        try {
            const res = await recommendationApi.smartSelector(numAmount, category);
            setSelectorResults(res.cards);
        } catch (error: any) {
            setSelectorError(error.message || 'Có lỗi xảy ra khi tính toán.');
        } finally {
            setSelectorLoading(false);
        }
    };

    const formatCurrency = (val: string) => {
        const num = parseInt(val.replace(/\D/g, ''), 10);
        return isNaN(num) ? '' : num.toLocaleString('vi-VN');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#0f0f0f] pt-32 pb-20 px-4 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-400">lock</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Vui lòng đăng nhập</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
                    Bạn cần đăng nhập để quản lý ví thẻ và sử dụng tính năng gợi ý thanh toán thông minh.
                </p>
                <Button onClick={openLoginModal} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-emerald-500/20">
                    Đăng nhập ngay
                </Button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-[#0f0f0f] pt-10 pb-20 px-4 sm:px-8 md:px-16 lg:px-24">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 tracking-tight text-slate-900 dark:text-white">
                            Ví Thẻ Của Tôi
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl">
                            Quản lý các thẻ bạn đang sở hữu và nhận gợi ý thanh toán tối ưu nhất cho từng giao dịch.
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white dark:bg-[#18181b] p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 mb-8 w-full sm:w-fit shadow-sm">
                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`flex-1 sm:w-48 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'wallet' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined text-lg">credit_card</span>
                        Thẻ của tôi
                    </button>
                    <button
                        onClick={() => setActiveTab('selector')}
                        className={`flex-1 sm:w-48 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'selector' ? 'bg-emerald-500/10 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined text-lg">auto_awesome</span>
                        Smart Selector
                    </button>
                </div>

                {/* Tab Content: Wallet */}
                {activeTab === 'wallet' && (
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                        {loadingCards ? (
                            <div className="py-20 text-center animate-pulse">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">Đang tải ví thẻ...</p>
                            </div>
                        ) : savedCards.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                {savedCards.map(walletCard => (
                                    <div key={walletCard.card.id} className="relative group">
                                        <CardItem card={walletCard.card} />

                                        {/* Hiển thị chi tiết thẻ */}
                                        <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Ngày phát hành</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {walletCard.details?.issueDate ? new Date(walletCard.details.issueDate).toLocaleDateString('vi-VN') : 'Chưa cài đặt'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Ngày chốt sao kê</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {walletCard.details?.statementDate ? `Ngày ${walletCard.details.statementDate}` : 'Chưa cài đặt'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Hạn thanh toán</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {walletCard.details?.dueDate ? `Ngày ${walletCard.details.dueDate}` : 'Chưa cài đặt'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                                            <button
                                                onClick={() => {
                                                    setEditingCard(walletCard);
                                                    setEditDetails({
                                                        issueDate: walletCard.details?.issueDate ? walletCard.details.issueDate.split('T')[0] : '',
                                                        statementDate: walletCard.details?.statementDate || 0,
                                                        dueDate: walletCard.details?.dueDate || 0
                                                    });
                                                }}
                                                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center justify-center shadow-sm"
                                                title="Cài đặt thẻ"
                                            >
                                                <span className="material-symbols-outlined text-xl">settings</span>
                                            </button>
                                            <button
                                                onClick={() => handleRemoveCard(walletCard.card.id!)}
                                                className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center shadow-sm"
                                                title="Xóa khỏi ví"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-white dark:bg-[#18181b] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-4xl text-slate-400">account_balance_wallet</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Ví thẻ đang trống</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">Bạn chưa lưu thẻ nào vào ví. Hãy tìm và lưu các thẻ bạn đang có.</p>
                                <Button onClick={() => window.location.href = '/cards'} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                                    Tìm kiếm thẻ
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Content: Smart Selector */}
                {activeTab === 'selector' && (
                    <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col lg:flex-row gap-8">
                        {/* Form */}
                        <div className="w-full lg:w-1/3">
                            <div className="bg-white dark:bg-[#18181b] p-6 sm:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-xl shadow-emerald-500/5">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-2xl">magic_button</span>
                                    Thanh toán thông minh
                                </h3>

                                <form onSubmit={handleSmartSelect} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Số tiền thanh toán (VNĐ)
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors font-black">đ</span>
                                            <input
                                                type="text"
                                                value={amount}
                                                onChange={(e) => setAmount(formatCurrency(e.target.value))}
                                                placeholder="Ví dụ: 10,000,000"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-slate-900 dark:text-white font-bold text-lg focus:border-emerald-500 focus:ring-0 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Danh mục chi tiêu
                                        </label>
                                        <div className="relative group">
                                            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-emerald-500 pointer-events-none transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">category</span>
                                            </span>
                                            <select
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="appearance-none w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-12 pr-10 text-slate-900 dark:text-white font-bold focus:border-emerald-500 focus:ring-0 transition-colors cursor-pointer"
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <span className="absolute inset-y-0 right-4 flex items-center text-slate-400 pointer-events-none">
                                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                            </span>
                                        </div>
                                    </div>

                                    {selectorError && (
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined">error</span>
                                            {selectorError}
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={selectorLoading}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl text-base shadow-lg shadow-emerald-500/20"
                                    >
                                        {selectorLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="material-symbols-outlined animate-spin">sync</span>
                                                Đang tính toán...
                                            </span>
                                        ) : "Tìm thẻ tốt nhất"}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="w-full lg:w-2/3">
                            {selectorResults ? (
                                <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                        Kết quả gợi ý từ Ví của bạn
                                    </h3>

                                    {selectorResults.length > 0 ? (
                                        selectorResults.map((result, idx) => (
                                            <div key={result.card.id} className={`relative flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border-2 ${idx === 0 ? 'bg-emerald-500/5 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'bg-white dark:bg-[#18181b] border-slate-200/50 dark:border-slate-800'}`}>
                                                {idx === 0 && (
                                                    <div className="absolute -top-3 sm:-left-3 sm:top-auto bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">stars</span>
                                                        Lựa chọn số 1
                                                    </div>
                                                )}
                                                <div className="w-24 sm:w-32 flex-shrink-0">
                                                    <div className="aspect-[1.58/1] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                        <img src={result.card.imageUrl} alt={result.card.name} className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">{result.card.name}</h4>
                                                        <p className="text-xs font-bold text-slate-500">{result.card.bankName}</p>
                                                    </div>
                                                    <div className="mt-3 flex items-end justify-between bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Tỷ lệ hoàn</p>
                                                            <p className="text-lg font-black text-slate-700 dark:text-slate-300">{result.cashbackRate}%</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Tiền hoàn dự kiến</p>
                                                            <p className={`text-xl font-black ${idx === 0 ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                +{result.cashbackAmount.toLocaleString('vi-VN')} đ
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center bg-white dark:bg-[#18181b] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                                            <p className="text-slate-500 font-bold">Không tìm thấy thẻ phù hợp trong ví.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-100/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                        <span className="material-symbols-outlined text-4xl text-emerald-500/50">touch_app</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Sắp thanh toán?</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                        Nhập số tiền và danh mục ở bên trái, chúng tôi sẽ cho bạn biết nên dùng thẻ nào trong ví để được hoàn tiền nhiều nhất.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Card Details Modal */}
            {editingCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">edit_calendar</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Cài đặt thông tin thẻ</h3>
                                    <p className="text-sm font-bold text-slate-500">{editingCard.card.name}</p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Ngày phát hành thẻ
                                    </label>
                                    <input
                                        type="date"
                                        value={editDetails.issueDate}
                                        onChange={(e) => setEditDetails({ ...editDetails, issueDate: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:ring-0 transition-colors"
                                    />
                                    <p className="text-[11px] text-slate-500 mt-1">Dùng để nhắc phí thường niên hàng năm.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Ngày chốt sao kê
                                        </label>
                                        <select
                                            value={editDetails.statementDate}
                                            onChange={(e) => setEditDetails({ ...editDetails, statementDate: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:ring-0 transition-colors"
                                        >
                                            <option value={0}>-- Chọn ngày --</option>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                <option key={d} value={d}>Ngày {d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Ngày đến hạn
                                        </label>
                                        <select
                                            value={editDetails.dueDate}
                                            onChange={(e) => setEditDetails({ ...editDetails, dueDate: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:ring-0 transition-colors"
                                        >
                                            <option value={0}>-- Chọn ngày --</option>
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                <option key={d} value={d}>Ngày {d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setEditingCard(null)}
                                className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <Button
                                onClick={handleUpdateDetails}
                                disabled={isSavingDetails}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                {isSavingDetails ? 'Đang lưu...' : 'Lưu cài đặt'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
