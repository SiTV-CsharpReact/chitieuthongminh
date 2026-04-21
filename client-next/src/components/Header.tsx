"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCompare } from '@/context/CompareContext';

const NAV_ITEMS = [
    { label: 'Trang chủ', path: '/' },
    // { label: 'Đề xuất thẻ', path: '/recommendations' },
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
                        <svg
                            viewBox="0 0 200 200"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full drop-shadow-2xl"
                        >
                            <defs>
                                {/* Gradient thẻ Xanh Lá mượt mà, sang trọng */}
                                <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#4ade80" />
                                    <stop offset="40%" stopColor="#22c55e" />
                                    <stop offset="100%" stopColor="#14532d" />
                                </linearGradient>
                                {/* Gradient Vàng Kim cho chữ $ và Chip */}
                                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#fef08a" />
                                    <stop offset="50%" stopColor="#eab308" />
                                    <stop offset="100%" stopColor="#a16207" />
                                </linearGradient>
                                {/* Bóng đổ cho thẻ và các chi tiết nổi */}
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow
                                        dx={0}
                                        dy={8}
                                        stdDeviation={6}
                                        floodColor="#000"
                                        floodOpacity="0.4"
                                    />
                                </filter>
                                {/* Hiệu ứng phát sáng cho các tia lấp lánh */}
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation={3} result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                {/* Hiệu ứng chuyển động (Animation) cho các ngôi sao */}
                                <style
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            "\n                        @keyframes twinkle {\n                            0%, 100% { opacity: 0.1; transform: translateY(4px) scale(0.6); }\n                            50% { opacity: 1; transform: translateY(-4px) scale(1.2); }\n                        }\n                        @keyframes spinArrow {\n                            0%, 70% { transform: rotate(0deg); }\n                            85%, 100% { transform: rotate(360deg); }\n                        }\n                        .sparkle {\n                            transform-origin: center;\n                            transform-box: fill-box;\n                        }\n                        .sp-1 { animation: twinkle 2.5s ease-in-out infinite; }\n                        .sp-2 { animation: twinkle 3s ease-in-out infinite 0.8s; }\n                        .sp-3 { animation: twinkle 2s ease-in-out infinite 1.5s; }\n                        \n                        /* Hiệu ứng nhịp thở cho chữ $ */\n                        @keyframes dollarFloat {\n                            0%, 100% { transform: translateY(0px) scale(1); }\n                            50% { transform: translateY(-8px) scale(1.25); }\n                        }\n                        .dollar-anim {\n                            transform-origin: center;\n                            transform-box: fill-box;\n                            animation: dollarFloat 3s ease-in-out infinite;\n                        }\n                    "
                                    }}
                                />
                            </defs>
                            {/* LỚP QUỸ ĐẠO PHÍA SAU (Nửa vòng elip bị che) */}
                            <g filter="url(#shadow)">
                                {/* Đường vòng tròn ngang mờ phía sau tạo không gian 3D */}
                                <path
                                    d="M 20 100 A 80 35 0 0 1 180 100"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth={4}
                                    opacity="0.3"
                                />
                            </g>
                            {/* Nhóm Thẻ 1 (Bên trái) */}
                            <g transform="rotate(-15 100 100) translate(-15, 0)">
                                {/* Bóng mờ phía sau thẻ */}
                                <rect
                                    x={50}
                                    y={15}
                                    width={100}
                                    height={170}
                                    rx={12}
                                    fill="#000"
                                    opacity="0.3"
                                    filter="url(#shadow)"
                                />
                                {/* Thân Thẻ Ngân Hàng Dọc */}
                                <rect x={50} y={15} width={100} height={170} rx={12} fill="url(#cardBg)" />
                                {/* Họa tiết chìm hình tròn */}
                                <circle
                                    cx={120}
                                    cy={140}
                                    r={40}
                                    fill="#ffffff"
                                    opacity="0.05"
                                    pointerEvents="none"
                                />
                                <circle
                                    cx={140}
                                    cy={160}
                                    r={30}
                                    fill="#ffffff"
                                    opacity="0.05"
                                    pointerEvents="none"
                                />
                                {/* Hiệu ứng viền nổi và ánh kính chéo thẻ */}
                                <path
                                    d="M 50 15 L 150 115 L 150 15 Z"
                                    fill="#ffffff"
                                    opacity="0.1"
                                    pointerEvents="none"
                                    style={{ mixBlendMode: "overlay" }}
                                />
                                <rect
                                    x={51}
                                    y={16}
                                    width={98}
                                    height={168}
                                    rx={11}
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth="1.5"
                                    opacity="0.2"
                                />
                                {/* Chip Thẻ */}
                                <g transform="translate(65, 35)">
                                    <rect x={0} y={0} width={18} height={24} rx={4} fill="url(#goldGrad)" />
                                    <line
                                        x1={0}
                                        y1={8}
                                        x2={18}
                                        y2={8}
                                        stroke="#ca8a04"
                                        strokeWidth={1}
                                        opacity="0.8"
                                    />
                                    <line
                                        x1={0}
                                        y1={16}
                                        x2={18}
                                        y2={16}
                                        stroke="#ca8a04"
                                        strokeWidth={1}
                                        opacity="0.8"
                                    />
                                    <line
                                        x1={9}
                                        y1={0}
                                        x2={9}
                                        y2={24}
                                        stroke="#ca8a04"
                                        strokeWidth={1}
                                        opacity="0.8"
                                    />
                                    <rect
                                        x={4}
                                        y={6}
                                        width={10}
                                        height={12}
                                        rx={2}
                                        fill="none"
                                        stroke="#ca8a04"
                                        strokeWidth={1}
                                    />
                                </g>
                                {/* Biểu tượng Contactless */}
                                <g
                                    transform="translate(125, 38)"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    opacity="0.6"
                                >
                                    <path d="M 0 0 A 8 8 0 0 1 0 16" />
                                    <path d="M 6 -4 A 14 14 0 0 1 6 20" />
                                    <path d="M 12 -8 A 20 20 0 0 1 12 24" />
                                </g>
                                <text
                                    x={140}
                                    y={170}
                                    fontFamily="'Montserrat', sans-serif"
                                    fontSize={8}
                                    fontWeight={900}
                                    fontStyle="italic"
                                    fill="#ffffff"
                                    opacity="0.5"
                                    textAnchor="end"
                                >
                                    CASHBACK
                                </text>
                            </g>
                            {/* LỚP QUỸ ĐẠO PHÍA TRƯỚC (Nửa vòng elip nổi bật) */}
                            <g filter="url(#shadow)">
                                {/* Đường vòng tròn sáng phía trước vắt ngang thẻ */}
                                <path
                                    d="M 180 100 A 80 35 0 0 1 20 100"
                                    fill="none"
                                    stroke="#ffffff"
                                    strokeWidth={5}
                                    strokeLinecap="round"
                                />
                                {/* Đầu mũi tên tĩnh hiển thị rõ ràng */}
                                <polygon points="20,85 12,102 28,102" fill="#ffffff" />
                                {/* Chữ $ lớn ở trung tâm (Có animation nhịp thở lên xuống và phóng to) */}
                                <text
                                    className="dollar-anim"
                                    x={100}
                                    y={118}
                                    fontFamily="'Montserrat', sans-serif"
                                    fontWeight={900}
                                    fontSize={52}
                                    fill="url(#goldGrad)"
                                    textAnchor="middle"
                                >
                                    $
                                </text>
                            </g>
                            {/* Các ngôi sao lấp lánh (Sparkles) kèm animation */}
                            <path
                                className="sparkle sp-1"
                                d="M 135 65 Q 135 75 145 75 Q 135 75 135 85 Q 135 75 125 75 Q 135 75 135 65 Z"
                                fill="#fde047"
                                filter="url(#glow)"
                            />
                            <path
                                className="sparkle sp-2"
                                d="M 60 120 Q 60 126 66 126 Q 60 126 60 132 Q 60 126 54 126 Q 60 126 60 120 Z"
                                fill="#ffffff"
                                filter="url(#glow)"
                            />
                            <path
                                className="sparkle sp-3"
                                d="M 100 30 Q 100 36 106 36 Q 100 36 100 42 Q 100 36 94 36 Q 100 36 100 30 Z"
                                fill="#ffffff"
                                filter="url(#glow)"
                            />
                        </svg>


                    </div>
                    <div className="flex flex-col">
                        <h1 className="flex items-baseline  text-2xl font-black tracking-tight transition-colors">
                            {/* Phần "Credi" - Giữ màu chính (trắng/đen) để tạo nền tảng */}
                            <span className="text-slate-900 dark:text-white group-hover:text-primary-500">
                                Cred
                            </span>

                            {/* Phần "Back" - Nhấn mạnh màu thương hiệu từ Logo */}
                            <span className="text-[#3eda78] drop-shadow-[0_2px_4px_rgba(62,218,120,0.2)]">
                                Back
                            </span>

                            {/* (Tùy chọn) Thêm một chi tiết nhỏ để nhấn mạnh 'cash' */}
                            <span className="text-xs font-medium text-slate-400 group-hover:text-primary-500">
                                ©
                            </span>
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
