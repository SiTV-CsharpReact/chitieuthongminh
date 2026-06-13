"use client";

import React, { useState, useEffect } from 'react';
import { notificationApi } from '@/services/api';
import { Notification } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [target, setTarget] = useState('ALL');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [sending, setSending] = useState(false);

    // Pagination & Filter state
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [targetFilter, setTargetFilter] = useState('ALL_FILTERS');
    const itemsPerPage = 10;

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationApi.getAdminNotifications();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !message.trim()) return;

        try {
            setSending(true);
            await notificationApi.sendNotification({ target, title, message, link });
            alert("Đã gửi thông báo thành công!");
            setTitle('');
            setMessage('');
            setLink('');
            setIsModalOpen(false);
            fetchNotifications(); // reload history
        } catch (error) {
            alert("Lỗi khi gửi thông báo.");
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    const filteredNotifications = React.useMemo(() => {
        let filtered = notifications;
        if (targetFilter !== 'ALL_FILTERS') {
            filtered = filtered.filter(n => {
                if (targetFilter === 'ALL') return n.userId === 'ALL';
                if (targetFilter === 'VIP') return n.userId === 'VIP';
                return n.userId !== 'ALL' && n.userId !== 'VIP'; // Cá nhân
            });
        }
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(n => 
                (n.title && n.title.toLowerCase().includes(lowerSearch)) || 
                (n.message && n.message.toLowerCase().includes(lowerSearch)) ||
                (n.targetName && n.targetName.toLowerCase().includes(lowerSearch))
            );
        }
        return filtered;
    }, [notifications, searchTerm, targetFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, targetFilter]);

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Quản lý Thông báo</h1>
                    <p className="text-slate-500">Đẩy thông báo trực tiếp đến người dùng trên hệ thống.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input 
                            type="text" 
                            placeholder="Tìm tiêu đề, nội dung..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-sm"
                        />
                    </div>
                    <select
                        value={targetFilter}
                        onChange={e => setTargetFilter(e.target.value)}
                        className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium transition-all shadow-sm cursor-pointer w-full sm:w-auto"
                    >
                        <option value="ALL_FILTERS">Tất cả đối tượng</option>
                        <option value="ALL">Gửi Chung</option>
                        <option value="VIP">Gửi VIP</option>
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 w-full sm:w-auto justify-center whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Gửi thông báo mới
                    </button>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-xl bg-white dark:bg-slate-900 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Gửi thông báo mới</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSend} className="space-y-4 mt-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gửi đến</label>
                            <select 
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-2.5.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0"
                            >
                                <option value="ALL">Tất cả đối tượng</option>
                                <option value="VIP">Tất cả tài khoản VIP</option>
                            </select>
                            <p className="text-[11px] text-slate-500 mt-1">Hệ thống sẽ gửi thông báo đồng loạt cho nhóm đối tượng được chọn.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Nhập tiêu đề..."
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-2.5.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nội dung <span className="text-red-500">*</span></label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Nhập nội dung thông báo..."
                                rows={4}
                                required
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-2.5.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Đường dẫn (Link tuỳ chọn)</label>
                            <input 
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="vd: /wallet hoặc https://..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-2.5.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit"
                                disabled={sending}
                                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Gửi thông báo
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* History Table */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6">Lịch sử gửi</h2>
                {loading ? (
                    <div className="py-20 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">sync</span>
                    </div>
                ) : notifications.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                                        <th className="py-4 px-4 font-bold text-slate-500 text-sm w-48">Thời gian</th>
                                        <th className="py-4 px-4 font-bold text-slate-500 text-sm w-40">Đối tượng</th>
                                        <th className="py-4 px-4 font-bold text-slate-500 text-sm">Tiêu đề / Nội dung</th>
                                        <th className="py-4 px-4 font-bold text-slate-500 text-sm w-32 text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedNotifications.map(noti => (
                                        <tr key={noti.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 px-4 align-top">
                                                <div className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                                                    {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium">
                                                    {new Date(noti.createdAt).toLocaleTimeString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 align-top">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-block ${
                                                    noti.userId === 'ALL' 
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
                                                        : noti.userId === 'VIP'
                                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                    {(noti as any).targetName || noti.userId}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{noti.title}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{noti.message}</p>
                                                {noti.link && (
                                                    <a href={noti.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 font-bold hover:underline mt-2 inline-flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">link</span> Link đính kèm
                                                    </a>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 align-top text-center">
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-lg">
                                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                    Thành công
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-500 font-medium">
                                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, notifications.length)} trong {notifications.length} thông báo
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                                                    currentPage === page
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">notifications_off</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có thông báo nào</p>
                        <p className="text-sm text-slate-500">Bạn chưa gửi thông báo nào cho người dùng trên hệ thống.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-6 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                            Gửi thông báo đầu tiên <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
