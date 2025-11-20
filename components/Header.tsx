import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  transparent?: boolean;
  floating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ transparent = false, floating = false }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-primary-600 bg-primary-50 font-bold'
      : 'text-slate-500 hover:text-slate-900 font-medium';
  };

  const navClasses = floating
    ? "hidden lg:flex items-center gap-2 rounded-full bg-white/80 p-1.5 backdrop-blur-md shadow-sm border border-white/20"
    : "hidden lg:flex items-center gap-2";
    
  const linkClasses = (path: string) => floating 
    ? `rounded-full px-4 py-1.5 text-sm transition-colors ${location.pathname === path ? 'bg-white text-primary-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'}`
    : `rounded-lg px-4 py-2 text-sm transition-colors ${isActive(path)}`;

  return (
    <header className={`${transparent ? 'absolute top-0 z-20' : 'fixed top-0 z-20 bg-slate-50/90 backdrop-blur-sm'} w-full px-4 py-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 transition-all duration-300`}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between">
        
        {/* Logo Area */}
        <Link to="/" className="flex flex-1 items-center gap-4 text-slate-900 group">
          <div className="size-10 flex items-center justify-center rounded-full bg-primary-500 text-white transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined">savings</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight tracking-tight">Chi tiêu thông minh</h1>
            <p className="text-xs font-medium text-slate-500">Chi tiêu đúng cách – Hoàn tiền cực đã</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className={navClasses}>
          <Link to="/" className={linkClasses('/')}>Trang chủ</Link>
          <Link to="/recommendations" className={linkClasses('/recommendations')}>Đề xuất thẻ</Link>
          <Link to="/news" className={linkClasses('/news')}>Tin tức</Link>
          <Link to="/settings" className={linkClasses('/settings')}>Cài đặt</Link>
        </nav>

        {/* Actions */}
        <div className="flex flex-1 justify-end gap-3">
          <button className="relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 border border-slate-100">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute right-2.5 top-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
          </button>
          <button className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100 border border-slate-100">
            <span className="material-symbols-outlined text-[20px]">dark_mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};