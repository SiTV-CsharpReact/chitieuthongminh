"use client";

import React, { useEffect, useState } from 'react';
import { userApi } from '@/services/api';
import { User } from '@/types';
import AdminButton from '@/components/Admin/AdminButton';
import AdminTable, { AdminTableColumn } from '@/components/Admin/AdminTable';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmBlockUser, setConfirmBlockUser] = useState<User | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

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

    const confirmToggleBlock = async () => {
        if (!confirmBlockUser) return;
        try {
            const { isBlocked } = await userApi.toggleBlock(confirmBlockUser.id);
            setUsers(users.map(u => u.id === confirmBlockUser.id ? { ...u, isBlocked } : u));
            setConfirmBlockUser(null);
        } catch (error) {
            console.error('Failed to toggle block:', error);
            alert('Lỗi khi thao tác khóa/mở khóa');
        }
    };

    const columns: AdminTableColumn<User>[] = [
        {
            header: 'Thông tin Định danh',
            key: 'name',
            width: '35%',
            render: (user) => (
                <div className="flex items-center gap-4">
                    <div className={`relative w-10 h-10 rounded-full border-2 overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 ${user.role === 'VIP' ? 'border-yellow-400 shadow-md shadow-yellow-500/20' : 'border-white dark:border-slate-800 shadow-sm'}`}>
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1">
                            {user.name}
                            {user.role === 'VIP' && <span className="material-symbols-outlined text-[14px] text-yellow-500">workspace_premium</span>}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {user.id.substring(user.id.length - 8).toUpperCase()}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Email Bảo mật',
            key: 'email',
            width: '25%',
            render: (user) => (
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {user.email}
                </p>
            )
        },
        {
            header: 'Quyền hạn',
            key: 'role',
            width: '20%',
            render: (user) => (
                <select
                    value={user.role || 'User'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`text-[11px] font-black uppercase tracking-widest py-1.5 px-3 rounded-xl border-none outline-none appearance-none cursor-pointer transition-colors shadow-sm
                        ${user.role === 'Admin' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/20' : 
                          user.role === 'VIP' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 ring-1 ring-yellow-400/50' : 
                          'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20'}`}
                >
                    <option value="User">User</option>
                    <option value="VIP">VIP</option>
                    <option value="Admin">Admin</option>
                </select>
            )
        },
        {
            header: 'Trạng thái',
            key: 'isBlocked',
            width: '15%',
            render: (user) => (
                <button
                    onClick={() => setConfirmBlockUser(user)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 shadow-sm
                        ${user.isBlocked 
                            ? 'bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/20 dark:hover:bg-rose-500/30' 
                            : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30'}`}
                    title={user.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                >
                    <span className="material-symbols-outlined text-[16px]">
                        {user.isBlocked ? 'lock' : 'lock_open'}
                    </span>
                </button>
            )
        }
    ];

    const regularUsers = React.useMemo(() => {
        let filtered = users.filter(u => u.role !== 'Admin');
        
        if (roleFilter !== 'All') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }
        
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(u => 
                (u.name && u.name.toLowerCase().includes(lowerSearch)) || 
                (u.email && u.email.toLowerCase().includes(lowerSearch))
            );
        }
        
        return filtered;
    }, [users, searchTerm, roleFilter]);

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản Lý Người Dùng</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Giám sát và phân quyền hệ thống tài khoản CredBack ({users.filter(u => u.role !== 'Admin').length} tài khoản)
                    </p>
                </div>
                <div className="flex gap-3 items-center w-full sm:w-auto">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium transition-all shadow-sm cursor-pointer"
                    >
                        <option value="All">Tất cả quyền</option>
                        <option value="User">User</option>
                        <option value="VIP">VIP</option>
                    </select>
                    <AdminButton
                        variant="outline"
                        onClick={fetchUsers}
                        icon="sync"
                    >
                        Làm mới
                    </AdminButton>
                </div>
            </div>

            <AdminTable
                columns={columns}
                data={regularUsers}
                isLoading={loading}
                onDelete={(user) => handleDelete(user.id)}
                emptyMessage="Không có dữ liệu"
            />

            {/* Block Confirmation Modal */}
            {confirmBlockUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
                        <div className="p-6">
                            <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
                                confirmBlockUser.isBlocked 
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                    : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                            }`}>
                                <span className="material-symbols-outlined text-2xl">
                                    {confirmBlockUser.isBlocked ? 'lock_open' : 'lock'}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {confirmBlockUser.isBlocked ? 'Mở khóa tài khoản?' : 'Khóa tài khoản này?'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {confirmBlockUser.isBlocked 
                                    ? `Bạn có chắc chắn muốn mở khóa cho tài khoản ${confirmBlockUser.email}? Người dùng sẽ có thể đăng nhập lại bình thường.`
                                    : `Bạn có chắc chắn muốn khóa tài khoản ${confirmBlockUser.email}? Người dùng sẽ bị đăng xuất và không thể đăng nhập lại.`}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setConfirmBlockUser(null)}
                                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={confirmToggleBlock}
                                className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${
                                    confirmBlockUser.isBlocked 
                                        ? 'bg-emerald-500 hover:bg-emerald-600' 
                                        : 'bg-rose-500 hover:bg-rose-600'
                                }`}
                            >
                                {confirmBlockUser.isBlocked ? 'Xác nhận Mở khóa' : 'Xác nhận Khóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
