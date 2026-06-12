"use client";

import React, { useState, useEffect } from 'react';
import { notificationApi } from '@/services/api';
import { Notification } from '@/types';

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const [target, setTarget] = useState('ALL');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [sending, setSending] = useState(false);

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
            fetchNotifications(); // reload history
        } catch (error) {
            alert("Lỗi khi gửi thông báo.");
            console.error(error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Quản lý Thông báo</h1>
                    <p className="text-slate-500">Đẩy thông báo trực tiếp đến người dùng trên hệ thống.</p>
                </div>
                <button
                    onClick={async () => {
                        try {
                            setSending(true);
                            const res = await notificationApi.triggerReminders();
                            alert(res.message);
                            fetchNotifications();
                        } catch (error) {
                            alert("Lỗi khi chạy quét nhắc nhở.");
                        } finally {
                            setSending(false);
                        }
                    }}
                    disabled={sending}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    Kích hoạt quét nhắc nhở VIP
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Send Notification Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Gửi thông báo mới</h2>
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Gửi đến</label>
                                <select 
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0"
                                >
                                    <option value="ALL">Tất cả người dùng</option>
                                    <option value="VIP">Tất cả tài khoản VIP</option>
                                </select>
                                <p className="text-[11px] text-slate-500 mt-1">Gợi ý: Cần nhập ID cụ thể nếu muốn gửi cá nhân.</p>
                            </div>
                            
                            {target !== 'ALL' && target !== 'VIP' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nhập User ID cụ thể</label>
                                    <input 
                                        type="text"
                                        placeholder="Nhập ID người dùng"
                                        onChange={(e) => setTarget(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tiêu đề <span className="text-red-500">*</span></label>
                                <input 
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề..."
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0"
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
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Đường dẫn (Link tuỳ chọn)</label>
                                <input 
                                    type="text"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="vd: /wallet hoặc https://..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-emerald-500 focus:ring-0"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={sending}
                                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">send</span>
                                {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Lịch sử gửi</h2>
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <span className="material-symbols-outlined animate-spin text-slate-400">sync</span>
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm">Thời gian</th>
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm">Đối tượng</th>
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm">Tiêu đề / Nội dung</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {notifications.map(noti => (
                                            <tr key={noti.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-3 px-4 align-top w-32">
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-medium">
                                                        {new Date(noti.createdAt).toLocaleTimeString('vi-VN')}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 align-top w-32">
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                                        noti.userId === 'ALL' 
                                                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                                            : noti.userId === 'VIP'
                                                                ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                        {noti.userId}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{noti.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-2">{noti.message}</p>
                                                    {noti.link && (
                                                        <a href={noti.link} className="text-[10px] text-emerald-500 font-bold hover:underline mt-1 inline-block">Link đính kèm</a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl text-slate-400">notifications_off</span>
                                </div>
                                <p className="text-slate-500 font-medium">Chưa có thông báo nào được gửi.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
