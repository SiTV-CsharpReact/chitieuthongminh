"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { UserSettings, Card } from '@/types';
import { cardApi } from '@/services/api';
import { useFavorites } from '@/context/FavoritesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cleanCardName, generateSlug } from '@/lib/utils';
import { Suspense } from 'react';

function SettingsContent() {
    const { user, isAuthenticated, logout, openLoginModal, updateUser } = useAuth();
    const searchParams = useSearchParams();
    const { isDarkMode, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'notifications' | 'history' | 'mycards' | 'vip'>('profile');
    const { favorites, ownedCards, removeFavorite, removeOwnedCard, clearFavorites, clearOwnedCards } = useFavorites();

    const [settings, setSettings] = useState<UserSettings>({
        notifications: { email: true, push: true, promotions: false },
        security: { twoFactor: false },
        preferences: { language: 'vi', currency: 'VND' }
    });

    // Search history state
    const [searchHistory, setSearchHistory] = useState<{ id: string; date: string; query: string; salary?: number; totalSpending?: number; spendingCategories?: { category: string; amount: number }[]; bestCashback?: number; results: Card[] }[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const HISTORY_ITEMS_PER_PAGE = 5;

    useEffect(() => {
        if (activeTab === 'history' && user?.id) {
            setHistoryLoading(true);
            const saved = localStorage.getItem(`search_history_${user.id}`);
            if (saved) {
                try { setSearchHistory(JSON.parse(saved)); } catch { setSearchHistory([]); }
            } else {
                setSearchHistory([]);
            }
            setHistoryLoading(false);
        }
    }, [activeTab, user?.id]);

    const [showErrorToast, setShowErrorToast] = useState(false);

    useEffect(() => {
        const vnpResponseCode = searchParams.get('vnp_ResponseCode');
        if (vnpResponseCode) {
            setActiveTab('profile');

            // Nếu giao dịch thành công (00), gọi IPN cục bộ để cập nhật DB (vì VNPay không gọi được localhost)
            if (vnpResponseCode === '00' && user?.role !== 'VIP') {
                const query = window.location.search;
                fetch(`/api/payment/vnpay/ipn${query}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.RspCode === '00') {
                            // Cập nhật role trong Context ngay lập tức
                            updateUser({ role: 'VIP' });
                        }
                    })
                    .catch(console.error);
            } else if (vnpResponseCode !== '00') {
                setShowErrorToast(true);
                const timer = setTimeout(() => setShowErrorToast(false), 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [searchParams, user?.role]);

    const toggleSetting = (category: keyof UserSettings, key: string) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                // @ts-ignore
                [key]: !prev[category][key]
            }
        }));
    };

    const clearHistory = () => {
        localStorage.removeItem(`search_history_${user?.id}`);
        setSearchHistory([]);
    };

    const handleUpgradeVnpay = async () => {
        try {
            const getCookie = (name: string) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
                return null;
            };
            const token = getCookie('token');
            const res = await fetch('/api/payment/vnpay/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                console.error('API Error:', res.status, res.statusText);
                throw new Error('API request failed');
            }

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Lỗi khi tạo payment url', error);
            alert('Không thể kết nối đến VNPay, vui lòng thử lại sau.');
        }
    };

    const menuItems = [
        { id: 'profile', label: 'Hồ sơ', icon: 'person' },
        { id: 'mycards', label: 'Thẻ của tôi', icon: 'credit_card' },
        { id: 'history', label: 'Lịch sử tìm thẻ', icon: 'history' },
        { id: 'preferences', label: 'Sở thích & Giao diện', icon: 'palette' },
        { id: 'notifications', label: 'Thông báo', icon: 'notifications' },
        { id: 'security', label: 'Bảo mật', icon: 'security' },
    ].filter(item => {
        if (user?.role === 'Admin') {
            return item.id === 'profile';
        }
        return true;
    });

    if (!isAuthenticated || !user) {
        return (
            <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16 min-h-[70vh] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                        <span className="material-symbols-outlined text-5xl">lock</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Yêu cầu đăng nhập</h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md">
                        Vui lòng đăng nhập để truy cập cài đặt cá nhân và quản lý tài khoản của bạn.
                    </p>
                    <Button size="lg" onClick={openLoginModal} className="rounded-xl font-bold px-8 bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all">
                        Đăng nhập ngay
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-grow pt-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16 min-h-screen">
            <div className="mx-auto max-w-6xl">

                <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {activeTab === 'profile' ? (
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hồ sơ của tôi</h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quản lý thông tin tài khoản và xem quyền lợi của bạn</p>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-3xl font-bold mb-2 tracking-tight text-slate-900 dark:text-white">Cài đặt</h1>
                            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400 font-medium">Quản lý tài khoản {user.name}</p>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="self-start sm:self-auto flex items-center gap-2 rounded-xl font-bold px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white border border-red-600 shadow-lg shadow-red-500/20 transition-all text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Đăng xuất
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-12">

                    {/* Sidebar Menu */}
                    <aside className="md:col-span-3">
                        <nav className="space-y-2 sticky top-32">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200
                                        ${activeTab === item.id
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                        }
                                    `}
                                >
                                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content Panel */}
                    <div className="md:col-span-9">
                        {activeTab === 'profile' ? (
                            <div className="animate-fade-in space-y-4">
                                {/* Profile Card */}
                                <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101828] overflow-hidden shadow-sm">
                                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between border-b border-slate-100 dark:border-slate-800/60">
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                                            <div className={`h-16 w-16 rounded-full overflow-hidden ring-4 transition-all flex-shrink-0 ${user.role === 'VIP' ? 'ring-amber-500 dark:ring-amber-500/80' : 'ring-slate-100 dark:ring-slate-800'}`}>
                                                <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="text-center sm:text-left mt-1 sm:mt-0">
                                                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-0.5">{user.name}</h2>
                                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">{user.email}</p>
                                                {user.role === 'VIP' && (
                                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50">
                                                        <span className="material-symbols-outlined !text-[12px] text-yellow-600 dark:text-yellow-500">diamond</span>
                                                        <span className="text-yellow-600 dark:text-yellow-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">VIP</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* VIP Section */}
                                <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101828] overflow-hidden relative shadow-sm">
                                    <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none translate-x-10 -translate-y-10">
                                        <span className="material-symbols-outlined text-[160px] sm:text-[200px]">diamond</span>
                                    </div>

                                    {searchParams.get('vnp_ResponseCode') === '00' && (
                                        <div className="m-5 sm:mx-6 mt-5 p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl font-bold text-xs sm:text-sm z-10 relative">
                                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><span className="material-symbols-outlined text-lg">check_circle</span>Thanh toán thành công! Bạn hiện đang là thành viên VIP.</span>
                                        </div>
                                    )}

                                    {user.role === 'VIP' ? (
                                        <>
                                            <div className="p-5 sm:p-6 pb-0 relative z-10">
                                                {/* <div className="flex items-center gap-4 sm:gap-5 mb-5 sm:mb-6">
                                                    <span className="material-symbols-outlined text-4xl sm:text-5xl text-yellow-500">workspace_premium</span>

                                                </div> */}
                                            </div>

                                            <div className="p-5 sm:px-6 sm:pb-6 pt-0 relative z-10">
                                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 p-5 sm:p-6">
                                                    <div className="flex items-center gap-2 sm:gap-3 text-slate-900 dark:text-white mb-4 sm:mb-5 font-bold text-sm sm:text-base">
                                                        <span className="material-symbols-outlined text-4xl sm:text-5xl text-yellow-500">workspace_premium</span>
                                                        Quyền lợi của bạn
                                                    </div>

                                                    <div className="space-y-3 sm:space-y-4">
                                                        <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                                                            <div className="flex items-center gap-3 sm:gap-5">
                                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-500 shrink-0">
                                                                    <span className="material-symbols-outlined text-lg sm:text-xl">mail</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-slate-900 dark:text-white font-bold mb-0.5 sm:mb-1 text-sm sm:text-base">Thông báo ưu đãi</h4>
                                                                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">Hệ thống tự động gửi email các khuyến mãi phù hợp với loại thẻ bạn đang có.</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                                                            <div className="flex items-center gap-3 sm:gap-5">
                                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-500 shrink-0">
                                                                    <span className="material-symbols-outlined text-lg sm:text-xl">event</span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-slate-900 dark:text-white font-bold mb-0.5 sm:mb-1 text-sm sm:text-base">Nhắc phí thường niên</h4>
                                                                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">Tự động nhắc nhở đóng phí trước 7 ngày để tránh bị phạt trễ hạn.</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 dark:border-slate-800/60 p-4 sm:p-5 flex justify-center bg-slate-50/50 dark:bg-slate-900/20">
                                                <button className="text-yellow-600 dark:text-yellow-500 text-xs sm:text-sm font-bold flex items-center gap-1 hover:text-yellow-700 dark:hover:text-yellow-400 transition-colors">
                                                    Xem tất cả quyền lợi <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chevron_right</span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-5 sm:p-6 relative z-10">
                                            <div className="mb-6 sm:mb-8 text-center sm:text-left">
                                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Chọn gói thành viên</h2>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Nâng cấp tài khoản nhận thêm các đặc quyền tốt hơn</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                                                {/* Gói Thường */}
                                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent p-6 sm:p-8 flex flex-col h-full">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                                                            <span className="material-symbols-outlined text-[20px]">person</span>
                                                        </div>
                                                        <span className="font-bold text-slate-900 dark:text-white text-lg">Gói Thường</span>
                                                    </div>
                                                    <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-8">Miễn phí</div>

                                                    <div className="space-y-4 mb-8 flex-1">
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">check_circle</span>
                                                            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Quản lý hồ sơ cá nhân</span>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">check_circle</span>
                                                            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Xem thông tin thẻ đã lưu</span>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">check_circle</span>
                                                            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Nhận gợi ý thẻ cơ bản</span>
                                                        </div>
                                                    </div>

                                                    <div className="w-full h-12 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center cursor-default bg-slate-50 dark:bg-slate-800/50">
                                                        Đang sử dụng
                                                    </div>
                                                </div>

                                                {/* Gói VIP */}
                                                <div className="rounded-2xl border-2 border-amber-500 dark:border-amber-500/80 bg-amber-50/30 dark:bg-[#1a1106] p-6 sm:p-8 relative flex flex-col h-full shadow-xl shadow-amber-500/10 mt-4 md:mt-0">
                                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                                        <div className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-[#3d240d] border border-amber-200 dark:border-amber-700/80 text-amber-700 dark:text-amber-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                            <span className="material-symbols-outlined text-[14px]">stars</span> Đặc quyền
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-[#3d240d] flex items-center justify-center text-amber-600 dark:text-amber-500">
                                                            <span className="material-symbols-outlined text-[20px]">diamond</span>
                                                        </div>
                                                        <span className="font-bold text-amber-700 dark:text-amber-500 text-lg">Gói VIP</span>
                                                    </div>

                                                    <div className="flex items-baseline gap-1.5 mb-8">
                                                        <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-500">199K</div>
                                                        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">/trọn đời</div>
                                                    </div>

                                                    <div className="space-y-4 mb-8 flex-1">
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-amber-500 text-[20px]">check_circle</span>
                                                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Cảnh báo khuyến mãi thẻ tín dụng theo thẻ sở hữu</span>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-amber-500 text-[20px]">check_circle</span>
                                                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Nhắc nhở phí thường niên trước 7 ngày</span>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-amber-500 text-[20px]">check_circle</span>
                                                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Ưu tiên cập nhật ưu đãi mới</span>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <span className="material-symbols-outlined text-amber-500 text-[20px]">check_circle</span>
                                                            <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Hỗ trợ gợi ý tối ưu chi tiêu tốt hơn</span>
                                                        </div>
                                                    </div>

                                                    <Button onClick={handleUpgradeVnpay} className="w-full h-12 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2">
                                                        <span className="material-symbols-outlined text-[18px]">diamond</span> Nâng cấp VIP
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-slate-400 text-xs text-center px-4">
                                                <span className="material-symbols-outlined text-[14px]">info</span>
                                                <span>Giao dịch được xử lý qua cổng thanh toán</span>
                                                <img src="/images/vnpay-logo.svg" alt="VNPAY" className="h-3 sm:h-3.5 opacity-80" />

                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm min-h-[500px]">

                                {/* Preferences Tab */}
                                {activeTab === 'preferences' && (
                                    <div className="animate-fade-in space-y-8">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Giao diện</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Tùy chỉnh giao diện ứng dụng theo ý thích.</p>
                                        </div>

                                        <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined">dark_mode</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">Chế độ tối (Dark Mode)</span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">TIẾT KIỆM PIN & BẢO VỆ MẮT</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={toggleTheme}
                                                className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                            >
                                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'} shadow-sm`}></span>
                                            </button>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Ngôn ngữ & Khu vực</h3>
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ngôn ngữ</Label>
                                                    <select className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold focus:border-primary-500 outline-none transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
                                                        <option value="vi">Tiếng Việt</option>
                                                        <option value="en">English</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đơn vị tiền tệ</Label>
                                                    <select className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold focus:border-primary-500 outline-none transition-all dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50">
                                                        <option value="VND">VND (₫)</option>
                                                        <option value="USD">USD ($)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications Tab */}
                                {activeTab === 'notifications' && (
                                    <div className="animate-fade-in space-y-8">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Cài đặt thông báo</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Chọn loại thông báo bạn muốn nhận qua hệ thống và email.</p>
                                        </div>

                                        <div className="space-y-4">
                                            {[
                                                { key: 'email', label: 'Thông báo qua Email', desc: 'Nhận cập nhật về tài khoản và bảo mật.' },
                                                { key: 'push', label: 'Thông báo đẩy (Push)', desc: 'Nhận thông báo ngay lập tức trên trình duyệt.' },
                                                { key: 'promotions', label: 'Tin tức & Ưu đãi', desc: 'Cập nhật về các thẻ mới và khuyến mãi hot.' }
                                            ].map((item) => (
                                                <div key={item.key} className="flex items-start justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="block font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight pr-4">{item.desc}</span>
                                                    </div>
                                                    <button
                                                        // @ts-ignore
                                                        onClick={() => toggleSetting('notifications', item.key)}
                                                        // @ts-ignore
                                                        className={`mt-1 relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${settings.notifications[item.key] ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                    >
                                                        {/* @ts-ignore */}
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${settings.notifications[item.key] ? 'translate-x-6' : 'translate-x-1'} shadow-sm`}></span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div className="animate-fade-in space-y-8">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Bảo mật tài khoản</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Quản lý các lớp bảo mật để giữ tài khoản của bạn an toàn.</p>
                                        </div>

                                        <div className="max-w-xl space-y-4 font-manrope">
                                            <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                                                <div className="text-left flex flex-col gap-1 pr-4">
                                                    <span className="block font-bold text-slate-900 dark:text-white">Đổi mật khẩu</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Bạn nên cập nhật mật khẩu ít nhất mỗi 6 tháng một lần.</span>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors">chevron_right</span>
                                            </button>

                                            <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                <div className="flex flex-col gap-1 pr-4">
                                                    <span className="block font-bold text-slate-700 dark:text-slate-200">Xác thực 2 yếu tố (2FA)</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Yêu cầu mã xác minh mỗi khi đăng nhập từ thiết bị mới.</span>
                                                </div>
                                                <button
                                                    onClick={() => toggleSetting('security', 'twoFactor')}
                                                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${settings.security.twoFactor ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'} shadow-sm`}></span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-red-100 dark:border-red-900/10 mt-8">
                                            <h4 className="text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Vùng nguy hiểm</h4>
                                            <Button variant="destructive" className="rounded-xl font-bold bg-red-500 hover:bg-red-600">
                                                <span className="material-symbols-outlined mr-2">delete_forever</span>
                                                Xoá tài khoản & Dữ liệu
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* History Tab */}
                                {activeTab === 'history' && (
                                    <div className="animate-fade-in space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Lịch sử tìm thẻ</h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Các lần tìm kiếm thẻ phù hợp gần đây của bạn.</p>
                                            </div>
                                            {searchHistory.length > 0 && (
                                                <button onClick={clearHistory} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                                                    <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                                                    Xóa lịch sử
                                                </button>
                                            )}
                                        </div>

                                        {historyLoading ? (
                                            <div className="py-16 text-center">
                                                <div className="animate-spin inline-block w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                                            </div>
                                        ) : searchHistory.length > 0 ? (
                                            <div className="space-y-3">
                                                {searchHistory.slice((historyPage - 1) * HISTORY_ITEMS_PER_PAGE, historyPage * HISTORY_ITEMS_PER_PAGE).map((entry) => (
                                                    <div key={entry.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all group">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                                                                    <span className="material-symbols-outlined text-primary-500">search</span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{entry.query}</p>
                                                                    <p className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                {entry.bestCashback != null && entry.bestCashback > 0 && (
                                                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-[14px]">savings</span>
                                                                        {entry.bestCashback.toLocaleString('vi-VN')}đ
                                                                    </span>
                                                                )}
                                                                <span className="text-xs font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1 rounded-full">{entry.results.length} thẻ</span>
                                                            </div>
                                                        </div>

                                                        {/* Spending details */}
                                                        {(entry.salary || entry.spendingCategories) && (
                                                            <div className="mb-4 flex flex-wrap gap-2">
                                                                {entry.salary != null && entry.salary > 0 && (
                                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200/50 dark:border-slate-700">
                                                                        <span className="material-symbols-outlined text-[12px]">payments</span>
                                                                        Lương: {(entry.salary / 1000000).toFixed(0)}tr
                                                                    </span>
                                                                )}
                                                                {entry.totalSpending != null && entry.totalSpending > 0 && (
                                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-lg flex items-center gap-1 border border-slate-200/50 dark:border-slate-700">
                                                                        <span className="material-symbols-outlined text-[12px]">shopping_cart</span>
                                                                        Tổng: {(entry.totalSpending / 1000000).toFixed(0)}tr
                                                                    </span>
                                                                )}
                                                                {entry.spendingCategories && entry.spendingCategories.map((sc, idx) => (
                                                                    <span key={idx} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                                                                        {sc.category}: {(sc.amount / 1000000).toFixed(sc.amount % 1000000 === 0 ? 0 : 1)}tr
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {entry.results.length > 0 && (
                                                            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-3 shadow-sm">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thẻ gợi ý</p>
                                                                </div>
                                                                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                                                                    {entry.results.slice(0, 4).map((card, i) => (
                                                                        <Link key={i} href={`/card/${generateSlug(card.name)}`} className="flex-shrink-0 w-[72px] group/card">
                                                                            <div className="w-[72px] h-[46px] rounded-lg overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 group-hover/card:ring-emerald-500 transition-all shadow-sm">
                                                                                <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300" />
                                                                            </div>
                                                                            <p className="text-[9px] text-slate-600 dark:text-slate-400 font-bold truncate mt-1.5 text-center">{cleanCardName(card.name)}</p>
                                                                        </Link>
                                                                    ))}
                                                                    {entry.results.length > 4 && (
                                                                        <div className="flex-shrink-0 w-[72px] h-[46px] rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                                                            <span className="text-xs font-bold text-slate-400">+{entry.results.length - 4}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {Math.ceil(searchHistory.length / HISTORY_ITEMS_PER_PAGE) > 1 && (
                                                    <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                                            disabled={historyPage === 1}
                                                            className="rounded-xl"
                                                        >
                                                            <span className="material-symbols-outlined text-sm mr-1">chevron_left</span>
                                                            Trước
                                                        </Button>
                                                        <span className="text-sm font-bold text-slate-500">
                                                            Trang {historyPage} / {Math.ceil(searchHistory.length / HISTORY_ITEMS_PER_PAGE)}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setHistoryPage(p => Math.min(Math.ceil(searchHistory.length / HISTORY_ITEMS_PER_PAGE), p + 1))}
                                                            disabled={historyPage === Math.ceil(searchHistory.length / HISTORY_ITEMS_PER_PAGE)}
                                                            className="rounded-xl"
                                                        >
                                                            Sau
                                                            <span className="material-symbols-outlined text-sm ml-1">chevron_right</span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">manage_search</span>
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">Chưa có lịch sử tìm kiếm</p>
                                                <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Hãy thử tìm thẻ phù hợp với bạn để lịch sử được lưu tại đây.</p>
                                                <Link href="/input" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all">
                                                    <span className="material-symbols-outlined text-lg">search</span>
                                                    Tìm thẻ ngay
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* My Cards Tab */}
                                {activeTab === 'mycards' && (
                                    <div className="animate-fade-in space-y-8">
                                        {/* Favorites Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">❤️ Thẻ yêu thích</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Những thẻ bạn quan tâm và muốn theo dõi.</p>
                                                </div>
                                                {favorites.length > 0 && (
                                                    <button onClick={clearFavorites} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                                                        Xóa tất cả
                                                    </button>
                                                )}
                                            </div>
                                            {favorites.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {favorites.map(card => (
                                                        <div key={card.id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all group">
                                                            <Link href={`/card/${generateSlug(card.name)}`} className="flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                                                                <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            </Link>
                                                            <div className="flex-1 min-w-0">
                                                                <Link href={`/card/${generateSlug(card.name)}`} className="font-bold text-sm text-slate-900 dark:text-white truncate block hover:text-primary-500 transition-colors">{cleanCardName(card.name)}</Link>
                                                                <p className="text-xs text-slate-400 truncate">{card.bankName}</p>
                                                            </div>
                                                            <button onClick={() => removeFavorite(card.id)} className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Bỏ yêu thích">
                                                                <span className="material-symbols-outlined text-lg">favorite</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-10 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">favorite_border</span>
                                                    <p className="text-slate-400 text-sm font-medium">Chưa có thẻ yêu thích nào</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Nhấn ❤️ trên thẻ để thêm vào danh sách yêu thích.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-slate-100 dark:border-slate-800"></div>

                                        {/* Owned Cards Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">💳 Thẻ đang sở hữu</h3>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Quản lý danh sách thẻ bạn hiện đang sử dụng.</p>
                                                </div>
                                                {ownedCards.length > 0 && (
                                                    <button onClick={clearOwnedCards} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                                                        Xóa tất cả
                                                    </button>
                                                )}
                                            </div>
                                            {ownedCards.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {ownedCards.map(card => (
                                                        <div key={card.id} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all group">
                                                            <Link href={`/card/${generateSlug(card.name)}`} className="flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                                                                <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            </Link>
                                                            <div className="flex-1 min-w-0">
                                                                <Link href={`/card/${generateSlug(card.name)}`} className="font-bold text-sm text-slate-900 dark:text-white truncate block hover:text-primary-500 transition-colors">{cleanCardName(card.name)}</Link>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <p className="text-xs text-slate-400 truncate">{card.bankName}</p>
                                                                    <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded">Đang dùng</span>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => removeOwnedCard(card.id)} className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Xóa khỏi danh sách">
                                                                <span className="material-symbols-outlined text-lg">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-10 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">credit_card_off</span>
                                                    <p className="text-slate-400 text-sm font-medium">Chưa thêm thẻ đang sở hữu</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Thêm thẻ bạn đang dùng để quản lý dễ dàng hơn.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        {favorites.length === 0 && ownedCards.length === 0 && (
                                            <div className="text-center pt-4">
                                                <Link href="/cards" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all">
                                                    <span className="material-symbols-outlined text-lg">explore</span>
                                                    Khám phá thẻ tín dụng
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showErrorToast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 shadow-xl rounded-xl p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Thanh toán thất bại</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Giao dịch đã bị hủy hoặc có lỗi xảy ra.</p>
                        </div>
                        <button onClick={() => setShowErrorToast(false)} className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                </div>
            )}
        </main >
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16 min-h-[70vh] flex items-center justify-center">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </main>
        }>
            <SettingsContent />
        </Suspense>
    );
}
