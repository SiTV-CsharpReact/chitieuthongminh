"use client";

import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: string;
    loading?: boolean;
}

const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
    ({ className, variant = 'primary', size = 'md', icon, loading, children, ...props }, ref) => {
        
        const variants = {
            primary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
            secondary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20",
            outline: "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm",
            ghost: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
            danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20",
            success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
            warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20",
        };

        const sizes = {
            sm: "px-1.5 py-0.5 text-[8px] rounded-md",
            md: "px-2.5 py-1.5 text-[9px] rounded-lg",
            lg: "px-4 py-2 text-[10px] rounded-xl",
            icon: "w-7 h-7 flex items-center justify-center rounded-md",
            "icon-sm": "w-6 h-6 flex items-center justify-center rounded-sm",
        };

        const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest";

        return (
            <button
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={loading}
                {...props}
            >
                {loading ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                ) : icon ? (
                    <span className={cn("material-symbols-outlined", size.startsWith('icon') ? "text-base" : "text-[14px]")}>
                        {icon}
                    </span>
                ) : null}
                {children}
            </button>
        );
    }
);

AdminButton.displayName = 'AdminButton';

export default AdminButton;
