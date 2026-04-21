"use client";

import React, { useEffect, useState } from 'react';
import { userApi } from '@/services/api';
import { User } from '@/types';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userApi.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await userApi.updateRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Lỗi cập nhật quyền hạn');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Bạn có chắc muốn xoá hệ thống tài khoản này?')) return;
        try {
            await userApi.delete(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Lỗi xoá người dùng');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản Lý Người Dùng</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Giám sát và phân quyền hệ thống tài khoản Zenith ({users.length} tài khoản)
                    </p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 uppercase tracking-widest text-xs"
                >
                    <span className="material-symbols-outlined text-[20px]">sync</span> Làm mới
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-slate-500 dark:text-slate-400 animate-pulse flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                        <p className="font-black uppercase tracking-widest text-[10px]">Đang tải dữ liệu mạng...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400/80 uppercase text-[10px] font-black tracking-[0.2em]">
                                    <th className="px-8 py-5 w-[35%] uppercase">Thông tin Định danh</th>
                                    <th className="px-8 py-5 w-[25%] uppercase">Email Bảo mật</th>
                                    <th className="px-8 py-5 w-[20%] uppercase">Quyền hạn</th>
                                    <th className="px-8 py-5 w-[20%] text-right font-sans">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                                                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt={user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{user.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {user.id.substring(user.id.length - 8).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {user.email}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <select
                                                value={user.role || 'User'}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`text-[11px] font-black uppercase tracking-widest py-1.5 px-3 rounded-xl border-none outline-none appearance-none cursor-pointer transition-colors shadow-sm
                                                    ${user.role === 'Admin' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20'}`}
                                            >
                                                <option value="User">User</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                    title="Xoá người dùng này"
                                                >
                                                    <span className="material-symbols-outlined text-sm">person_remove</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <span className="material-symbols-outlined text-6xl">group_off</span>
                                                <p className="font-bold uppercase tracking-widest text-xs">Không có dữ liệu</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
