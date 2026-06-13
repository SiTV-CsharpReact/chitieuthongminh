"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import AdminButton from './AdminButton';

export interface AdminTableColumn<T> {
    header: string;
    key: keyof T | string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T) => React.ReactNode;
}

interface AdminTableProps<T> {
    columns: AdminTableColumn<T>[];
    data: T[];
    isLoading?: boolean;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    rowKey?: keyof T | ((item: T) => string);
    actions?: (item: T) => React.ReactNode;
    emptyMessage?: string;
    compact?: boolean;
}

export default function AdminTable<T>({
    columns,
    data,
    isLoading,
    onEdit,
    onDelete,
    rowKey = 'id' as any,
    actions,
    emptyMessage = "Không có dữ liệu",
    compact = false
}: AdminTableProps<T>) {
    
    const getRowKey = (item: T) => {
        if (typeof rowKey === 'function') return rowKey(item);
        return String(item[rowKey as keyof T]);
    };

    const cellPadding = "px-5 py-2.5";

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            {isLoading ? (
                <div className="p-20 text-center text-slate-500 dark:text-slate-400 animate-pulse flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                    <p className="font-black uppercase tracking-widest text-[10px]">Đang đồng bộ hóa dữ liệu...</p>
                </div>
            ) : (
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400/80 uppercase text-[10px] font-black tracking-[0.2em]">
                                {columns.map((col, idx) => (
                                    <th 
                                        key={idx} 
                                        className={cn(
                                            cellPadding,
                                            col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                                        )}
                                        style={{ width: col.width }}
                                    >
                                        {col.header}
                                    </th>
                                ))}
                                {(onEdit || onDelete || actions) && (
                                    <th className={cn(cellPadding, "text-right w-[100px]")}>Thao Tác</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                            {data.map((item) => (
                                <tr key={getRowKey(item)} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all">
                                    {columns.map((col, idx) => (
                                        <td 
                                            key={idx} 
                                            className={cn(
                                                cellPadding,
                                                col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                                            )}
                                        >
                                            {col.render ? col.render(item) : String(item[col.key as keyof T] || '-')}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || actions) && (
                                        <td className={cellPadding}>
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                {actions ? actions(item) : (
                                                    <>
                                                        {onEdit && (
                                                            <button
                                                                onClick={() => onEdit(item)}
                                                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                                            >
                                                                <span className="material-symbols-outlined text-xl">edit_square</span>
                                                            </button>
                                                        )}
                                                        {onDelete && (
                                                            <button
                                                                onClick={() => onDelete(item)}
                                                                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                            >
                                                                <span className="material-symbols-outlined text-xl">delete</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <span className="material-symbols-outlined text-6xl">inventory_2</span>
                                            <p className="font-bold uppercase tracking-widest text-xs">{emptyMessage}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
