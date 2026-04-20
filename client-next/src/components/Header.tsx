"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCompare } from '@/context/CompareContext';

const NAV_ITEMS = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Đề xuất thẻ', path: '/recommendations' },
    { label: 'Tất cả thẻ', path: '/cards' },
    { label: 'Tin tức', path: '/news' },
    { label: 'Cài đặt', path: '/settings' },
];

export const Header: React.FC = () => {
    const pathname = usePathname();
    const { isAuthenticated, user, openLoginModal } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const { selectedCards } = useCompare();

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Sliding Indicator State
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const activeIndex = NAV_ITEMS.findIndex(item =>
            item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
        );

        if (activeIndex !== -1 && itemsRef.current[activeIndex]) {
            const el = itemsRef.current[activeIndex];
            setIndicatorStyle({
                left: el!.offsetLeft,
                width: el!.offsetWidth,
                opacity: 1
            });
        } else {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
        }
    }, [pathname]);

    return (
        <header className={`sticky top-0 z-[60] w-full transition-all duration-500 ${scrolled
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-2 shadow-sm'
            : 'bg-transparent '
            }`}>
            <div className="mx-auto max-w-7xl px-6 h-20 flex items-center justify-between">

                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-3.5 group">
                    <div className="flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-110">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                            <defs>
                                <linearGradient id="neonGreen" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#80e5a3"/><stop offset="100%" stopColor="#2a7a45"/></linearGradient>
                                <linearGradient id="neonYellow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fbc2eb"/><stop offset="100%" stopColor="#a6c1ee"/></linearGradient>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
                            </defs>
                            <path d="M 100 20 L 170 60 L 170 130 L 100 180 L 30 130 L 30 60 Z" fill="none" stroke="url(#neonGreen)" strokeWidth="10" strokeLinejoin="round" filter="url(#glow)"/>
                            <path d="M 60 110 L 100 140 L 140 70" fill="none" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" className="stroke-slate-800 dark:stroke-white"/>
                            <path d="M 140 70 L 140 100 M 140 70 L 110 70" fill="none" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className="stroke-slate-800 dark:stroke-white"/>
                            <circle cx="70" cy="80" r="15" fill="url(#neonYellow)" filter="url(#glow)"/>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-primary-500">
                            Chi tiêu thông minh
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Hoàn tiền cực đã
                        </p>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1.5 relative bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-full ring-1 ring-slate-200/50 dark:ring-slate-800/50 backdrop-blur-md">
                    {/* Sliding Indicator */}
                    <div
                        className="absolute top-1.5 bottom-1.5 bg-primary-500 rounded-full shadow-2xl shadow-primary-500/50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                        style={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width,
                            opacity: indicatorStyle.opacity
                        }}
                    />

                    {NAV_ITEMS.map((item, idx) => {
                        const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                ref={el => { itemsRef.current[idx] = el; }}
                                className={`relative z-10 flex items-center h-9 px-6 rounded-full text-xs font-bold transition-all duration-300 ${isActive
                                    ? 'text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* Admin portal shortcut for admin users */}
                    {isAuthenticated && user?.email === 'admin@zenith.com' && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 h-9 px-5 rounded-full text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                            ADMIN
                        </Link>
                    )}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3 z-10">
                    {/* Comparison Badge */}
                    {selectedCards.length > 0 && (
                        <Link
                            href="/compare"
                            className="flex items-center gap-2 h-10 px-4 rounded-full bg-primary-500 text-white text-xs font-black shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                            <span className="hidden sm:inline">So sánh</span>
                            <span className="h-5 w-5 flex items-center justify-center bg-white text-primary-600 rounded-full text-[10px]">
                                {selectedCards.length}
                            </span>
                        </Link>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50 backdrop-blur-md transition-all hover:bg-white dark:hover:bg-slate-800 hover:text-primary-500 dark:hover:text-primary-400 hover:shadow-md hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {isDarkMode ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {isAuthenticated && user ? (
                        <Link href="/settings" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70 p-0.5 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50 backdrop-blur-md transition-all hover:ring-primary-500 hover:shadow-md hover:-translate-y-0.5">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full rounded-full object-cover"
                            />
                        </Link>
                    ) : (
                        <button
                            onClick={openLoginModal}
                            className="hidden sm:flex items-center gap-2 h-10 px-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                            <span>Đăng nhập</span>
                        </button>
                    )}

                    {/* Mobile Menu Trigger */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50 backdrop-blur-md transition-all"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Menu Content */}
                    <div className="absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800 flex flex-col p-6">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-sm font-black uppercase tracking-widest text-primary-500">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${isActive
                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}

                            {isAuthenticated && user?.email === 'admin@zenith.com' && (
                                <Link
                                    href="/admin"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl text-sm font-black text-rose-500 bg-rose-50 dark:bg-rose-950/20 mt-4"
                                >
                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                    ADMIN PORTAL
                                </Link>
                            )}
                        </nav>

                        <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            {!isAuthenticated && (
                                <button
                                    onClick={() => { setMobileMenuOpen(false); openLoginModal(); }}
                                    className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg"
                                >
                                    Đăng nhập
                                </button>
                            )}
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Giao diện tối</span>
                                <button
                                    onClick={toggleTheme}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-primary-500' : 'bg-slate-300'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
