import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ADMIN_NAV_ITEMS = [
    { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/cards', label: 'Quản lý thẻ', icon: 'credit_card' },
    { path: '/admin/categories', label: 'Danh mục hoàn tiền', icon: 'category' },
    { path: '/admin/articles', label: 'Quản lý bài viết', icon: 'article' },
    { path: '/admin/users', label: 'Người dùng', icon: 'group' },
    { path: '/admin/settings', label: 'Cài đặt hệ thống', icon: 'settings' },
];

const AdminLayout: React.FC = () => {
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col sticky top-0 h-screen z-40 transition-colors">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/20">
                            <span className="material-symbols-outlined text-[18px]">savings</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-extrabold leading-tight text-slate-900 dark:text-white">Admin Portal</h1>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-sans">Chi tiêu thông minh</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">Menu Chính</p>
                    {ADMIN_NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
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
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Administrator</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hệ thống quản trị</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Content Header (Optional) */}
                <header className="h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <span>Admin</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white">{ADMIN_NAV_ITEMS.find(i => i.path === location.pathname)?.label || 'Chi tiết'}</span>
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
                        <Link to="/" className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all">
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            Xem Web
                        </Link>
                    </div>
                </header>

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
