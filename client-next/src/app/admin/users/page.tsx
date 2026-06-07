"use client";

import React, { useEffect, useState } from 'react';
import { userApi } from '@/services/api';
import { User } from '@/types';
import AdminButton from '@/components/Admin/AdminButton';
import AdminTable, { AdminTableColumn } from '@/components/Admin/AdminTable';

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

    const columns: AdminTableColumn<User>[] = [
        {
            header: 'Thông tin Định danh',
            key: 'name',
            width: '35%',
            render: (user) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
                        <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{user.name}</span>
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
                        ${user.role === 'Admin' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20'}`}
                >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                </select>
            )
        }
    ];

    const regularUsers = React.useMemo(() => {
        return users.filter(u => u.role !== 'Admin');
    }, [users]);

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản Lý Người Dùng</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Giám sát và phân quyền hệ thống tài khoản CredBack ({regularUsers.length} tài khoản)
                    </p>
                </div>
                <AdminButton
                    variant="outline"
                    onClick={fetchUsers}
                    icon="sync"
                >
                    Làm mới
                </AdminButton>
            </div>

            <AdminTable
                columns={columns}
                data={regularUsers}
                isLoading={loading}
                onDelete={(user) => handleDelete(user.id)}
                emptyMessage="Không có dữ liệu"
            />
        </div>
    );
}
