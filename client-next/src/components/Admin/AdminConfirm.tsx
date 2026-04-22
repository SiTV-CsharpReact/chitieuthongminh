"use client";

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import AdminButton from './AdminButton';
import { cn } from '@/lib/utils';

interface AdminConfirmProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'warning';
    isLoading?: boolean;
}

const AdminConfirm: React.FC<AdminConfirmProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Xác nhận hành động",
    description = "Bạn có chắc chắn muốn thực hiện hành động này? Hành động này không thể hoàn tác.",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "danger",
    isLoading = false,
}) => {
    const iconMap = {
        danger: { icon: "warning", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
        primary: { icon: "help", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
        warning: { icon: "report_problem", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    };

    const config = iconMap[variant];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-none bg-white dark:bg-slate-900 shadow-2xl">
                <div className="p-8 pb-4">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-2", config.bg)}>
                            <span className={cn("material-symbols-outlined text-4xl", config.color)}>
                                {config.icon}
                            </span>
                        </div>
                        
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/20 gap-3 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                    <AdminButton
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest text-[10px]"
                    >
                        {cancelText}
                    </AdminButton>
                    <AdminButton
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        loading={isLoading}
                        className="flex-1 py-5 font-black uppercase tracking-[0.1em]"
                    >
                        {confirmText}
                    </AdminButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AdminConfirm;
