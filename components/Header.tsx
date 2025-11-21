import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  transparent?: boolean;
}

const NAV_ITEMS = [
  { path: '/', label: 'Trang chủ' },
  { path: '/recommendations', label: 'Đề xuất thẻ' },
  { path: '/news', label: 'Tin tức' },
  { path: '/settings', label: 'Cài đặt' }
];

export const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = NAV_ITEMS.findIndex(item => item.path === location.pathname);
    
    // Small delay to ensure DOM is ready and fonts are loaded for correct width calculation
    const timer = setTimeout(() => {
        const activeEl = itemsRef.current[activeIndex];
        if (activeEl) {
            setIndicatorStyle({
                left: activeEl.offsetLeft,
                width: activeEl.offsetWidth,
                opacity: 1
            });
        } else {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
        }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Updated Container: Slightly darker/solid background for better contrast
  const navContainerClasses = "relative hidden lg:flex items-center gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 px-1.5 py-1.5 shadow-inner ring-1 ring-slate-200/50 dark:ring-slate-700/50 backdrop-blur-xl transition-all duration-300";

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${transparent ? 'bg-transparent py-3' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm dark:shadow-slate-900/20 py-3'}`}>
      <div className="relative mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40">
        
        {/* Logo Area */}
        <div className="flex flex-1 items-center z-10">
            <Link to="/" className="flex items-center gap-3 group w-max">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[20px]">savings</span>
            </div>
            <div className="flex flex-col">
                <h1 className="text-base font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">Chi tiêu thông minh</h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Hoàn tiền cực đã</p>
            </div>
            </Link>
        </div>

        {/* Centered Navigation Pill */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden lg:block">
            <nav className={navContainerClasses}>
                {/* Sliding Indicator - High Contrast Primary Color */}
                <div 
                    className="absolute top-1.5 bottom-1.5 rounded-full bg-primary-500 shadow-lg shadow-primary-500/30 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{ 
                        left: indicatorStyle.left, 
                        width: indicatorStyle.width,
                        opacity: indicatorStyle.opacity,
                    }}
                />

                {NAV_ITEMS.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.path}
                            to={item.path}
                            ref={(el) => { itemsRef.current[index] = el; }}
                            className={`relative z-10 rounded-full px-5 py-2 text-sm font-bold transition-colors duration-500 whitespace-nowrap
                                ${isActive 
                                    ? 'text-white' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400'
                                }
                            `}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>

        {/* Right Actions */}
        <div className="flex flex-1 justify-end gap-3 z-10">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50 backdrop-blur-md transition-all hover:bg-white dark:hover:bg-slate-800 hover:text-primary-500 dark:hover:text-primary-400 hover:shadow-md hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <button 
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50 backdrop-blur-md transition-all hover:bg-white dark:hover:bg-slate-800 hover:text-primary-500 dark:hover:text-primary-400 hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};