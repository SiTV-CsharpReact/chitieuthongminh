"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Admin/AppSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

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
        if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
            router.replace('/admin/login');
        }
    }, [isLoading, isAuthenticated, pathname, router]);

    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 dark:border-slate-800"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <TooltipProvider>
            <SidebarProvider defaultOpen={true} style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
                <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans">
                    <AppSidebar />

                    <SidebarInset className="flex flex-col min-w-0">
                        {/* Content Header */}
                        <header className="h-16 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                <SidebarTrigger className="-ml-2" />
                                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden md:block" />
                                <div className="flex items-center gap-2">
                                    <span>Admin</span>
                                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                    <span className="text-slate-900 dark:text-white">
                                        {ADMIN_NAV_ITEMS.find(i => i.path === pathname)?.label || 'Chi tiết'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleTheme}
                                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:text-emerald-500 transition-all hover:scale-110 active:scale-95"
                                    title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {isDarkMode ? 'light_mode' : 'dark_mode'}
                                    </span>
                                </button>
                                <button className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:text-emerald-500 transition-colors">
                                    <span className="material-symbols-outlined">notifications</span>
                                </button>
                                <Link href="/" className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all">
                                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                    Xem Web
                                </Link>
                            </div>
                        </header>

                        <div className="p-6">
                            {children}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}
