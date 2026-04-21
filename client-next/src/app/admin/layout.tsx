"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const ADMIN_NAV_ITEMS = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/cards', label: 'Quản lý thẻ', icon: 'credit_card' },
    { path: '/admin/categories', label: 'Danh mục hoàn tiền', icon: 'category' },
    { path: '/admin/articles', label: 'Quản lý bài viết', icon: 'article' },
    { path: '/admin/article-categories', label: 'Chuyên mục bài viết', icon: 'topic' },
    { path: '/admin/promotions', label: 'Ưu đãi thẻ (VIB)', icon: 'redeem' },
    { path: '/admin/users', label: 'Người dùng', icon: 'group' },
    { path: '/admin/settings', label: 'Cài đặt hệ thống', icon: 'settings' },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    // Authentication Guard
    useEffect(() => {
        // If not authenticated and checking auth has finished, redirect to login
        // But only if we are not already on the login page
        if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
    }, [isLoading, isAuthenticated, pathname, router]);

    // If on login page, just render children without layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // If still checking authentication, render nothing (or a loading spinner)
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-500 dark:border-slate-800"></div>
            </div>
        );
    }

    // If not authenticated yet (and finished loading), show nothing or wait for redirect
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col sticky top-0 h-screen z-40 transition-colors">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg shadow-primary-500/20">
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
                            <h1 className="text-sm font-extrabold leading-tight text-slate-900 dark:text-white">Admin Portal</h1>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">CredBack</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">Menu Chính</p>
                    {ADMIN_NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                    }
                                `}
                            >
                                <span className={`material-symbols-outlined transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hệ thống quản trị</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Content Header */}
                <header className="h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <span>Admin</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white">{ADMIN_NAV_ITEMS.find(i => i.path === pathname)?.label || 'Chi tiết'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:text-primary-500 transition-all hover:scale-110 active:scale-95"
                            title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {isDarkMode ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:text-primary-500 transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <Link href="/" className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            Xem Web
                        </Link>
                    </div>
                </header>

                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
