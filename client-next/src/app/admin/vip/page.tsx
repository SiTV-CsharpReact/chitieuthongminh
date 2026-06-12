"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { userApi, notificationApi } from '@/services/api';

export default function VIPManagementPage() {
    const [vips, setVips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'reminders' | 'list'>('reminders');
    const [sendingId, setSendingId] = useState<string | null>(null);

    useEffect(() => {
        fetchVips();
    }, []);

    const fetchVips = async () => {
        try {
            setLoading(true);
            const data = await userApi.getVips();
            setVips(data);
        } catch (error) {
            console.error("Failed to fetch VIPs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendReminder = async (userId: string, cardId: string, cardName: string, daysRemaining: number, nextDueDate: string) => {
        if (!confirm(`Bạn có chắc muốn gửi thông báo nhắc nhở thẻ ${cardName} cho người dùng này?`)) return;

        setSendingId(`${userId}-${cardId}`);
        try {
            const res = await userApi.sendVipReminder(userId, cardId, daysRemaining, cardName, nextDueDate);
            
            // Update local state to reflect the new lastRemindedAt
            setVips(prev => prev.map(vip => {
                if (vip.id === userId) {
                    return {
                        ...vip,
                        cards: vip.cards.map((c: any) => c.cardId === cardId ? { ...c, lastRemindedAt: res.lastRemindedAt } : c)
                    };
                }
                return vip;
            }));

            alert("Đã gửi thông báo nhắc nhở thành công!");
        } catch (error) {
            alert("Lỗi khi gửi thông báo.");
            console.error(error);
        } finally {
            setSendingId(null);
        }
    };

    const handleSendAllReminders = async () => {
        const eligibleReminders = allReminders.filter(r => !r.lastRemindedAt || (new Date().getTime() - new Date(r.lastRemindedAt).getTime() >= 24 * 60 * 60 * 1000));
        if (eligibleReminders.length === 0) {
            alert("Không có thẻ nào cần nhắc nhở lúc này (tất cả thẻ đều đã được nhắc trong 24h qua).");
            return;
        }
        if (!confirm(`Bạn có chắc muốn gửi nhắc nhở đồng loạt cho ${eligibleReminders.length} thẻ chưa được nhắc?`)) return;
        
        let success = 0;
        for (const r of eligibleReminders) {
            try {
                setSendingId(`${r.userId}-${r.cardId}`);
                const res = await userApi.sendVipReminder(r.userId, r.cardId, r.daysRemaining, r.cardName, r.nextDueDate);
                setVips(prev => prev.map(vip => {
                    if (vip.id === r.userId) {
                        return {
                            ...vip,
                            cards: vip.cards.map((c: any) => c.cardId === r.cardId ? { ...c, lastRemindedAt: res.lastRemindedAt } : c)
                        };
                    }
                    return vip;
                }));
                success++;
            } catch (error) {
                console.error(`Lỗi khi gửi thẻ ${r.cardId} của user ${r.userId}:`, error);
            }
        }
        setSendingId(null);
        alert(`Đã hoàn tất gửi nhắc nhở đồng loạt! Thành công ${success}/${eligibleReminders.length} thẻ.`);
    };

    // Flatten all cards from all VIPs for the Reminders Tab
    const allReminders = useMemo(() => {
        const list: any[] = [];
        vips.forEach(vip => {
            if (vip.cards && vip.cards.length > 0) {
                vip.cards.forEach((card: any) => {
                    if (card.daysRemaining !== null && card.daysRemaining !== undefined) {
                        list.push({
                            ...card,
                            userId: vip.id,
                            userName: vip.name,
                            userEmail: vip.email,
                            userAvatar: vip.avatar
                        });
                    }
                });
            }
        });
        // Sort by days remaining (ascending)
        list.sort((a, b) => a.daysRemaining - b.daysRemaining);
        return list;
    }, [vips]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Quản lý Khách hàng VIP</h1>
                    <p className="text-slate-500">Giám sát và nhắc nhở khách hàng VIP thanh toán thẻ tín dụng.</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('reminders')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'reminders' 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                        Lịch nhắc nhở Sao kê
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'list' 
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">group</span>
                        Danh sách VIP
                    </span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <span className="material-symbols-outlined animate-spin text-4xl text-emerald-500">sync</span>
                    </div>
                ) : activeTab === 'reminders' ? (
                    /* Reminders Tab */
                    <div>
                        {allReminders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <div className="flex justify-end mb-4">
                                    <button 
                                        onClick={handleSendAllReminders}
                                        disabled={sendingId !== null}
                                        className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                                        Nhắc nhở tất cả
                                    </button>
                                </div>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm">Khách hàng</th>
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm">Thẻ tín dụng</th>
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm">Ngày hạn</th>
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm">Trạng thái</th>
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allReminders.map((reminder, idx) => {
                                            const isUrgent = reminder.daysRemaining <= 3;
                                            const isWarning = reminder.daysRemaining > 3 && reminder.daysRemaining <= 7;
                                            const isSafe = reminder.daysRemaining > 7;

                                            return (
                                                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <img src={reminder.userAvatar} alt="Avatar" className="w-8 h-8 rounded-full border" />
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{reminder.userName}</p>
                                                                <p className="text-[10px] text-slate-500">{reminder.userEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{reminder.cardName}</p>
                                                        <p className="text-[10px] text-slate-500">{reminder.bankName}</p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {new Date(reminder.nextDueDate).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                                            isUrgent ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                            isWarning ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}>
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                isUrgent ? 'bg-red-500 animate-pulse' :
                                                                isWarning ? 'bg-amber-500' :
                                                                'bg-emerald-500'
                                                            }`} />
                                                            {reminder.daysRemaining <= 0 ? 'Đã đến hạn' : `Còn ${reminder.daysRemaining} ngày`}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {reminder.lastRemindedAt && (
                                                            <p className="text-[10px] text-slate-400 mb-1">
                                                                Đã nhắc: {new Date(reminder.lastRemindedAt).toLocaleString('vi-VN')}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleSendReminder(reminder.userId, reminder.cardId, reminder.cardName, reminder.daysRemaining, reminder.nextDueDate)}
                                                                disabled={sendingId === `${reminder.userId}-${reminder.cardId}` || (reminder.lastRemindedAt && (new Date().getTime() - new Date(reminder.lastRemindedAt).getTime() < 24 * 60 * 60 * 1000))}
                                                                className="inline-flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">send</span>
                                                                {sendingId === `${reminder.userId}-${reminder.cardId}` ? 'Đang gửi...' : 
                                                                (reminder.lastRemindedAt && (new Date().getTime() - new Date(reminder.lastRemindedAt).getTime() < 24 * 60 * 60 * 1000)) ? 'Đã nhắc' : 'Nhắc nhở'}
                                                            </button>
                                                            {(reminder.lastRemindedAt && (new Date().getTime() - new Date(reminder.lastRemindedAt).getTime() < 24 * 60 * 60 * 1000)) && (
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm("Bạn có chắc chắn muốn bỏ qua quy định chống spam và gửi nhắc nhở lại ngay bây giờ?")) {
                                                                            handleSendReminder(reminder.userId, reminder.cardId, reminder.cardName, reminder.daysRemaining, reminder.nextDueDate);
                                                                        }
                                                                    }}
                                                                    className="inline-flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 px-2 py-1.5 rounded-lg transition-colors"
                                                                    title="Nhắc lại (Gửi đè)"
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">replay</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">done_all</span>
                                <p className="text-slate-500 font-medium">Hiện không có thẻ nào đã cấu hình ngày đến hạn.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* VIP List Tab */
                    <div>
                        {vips.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm">Thông tin</th>
                                            <th className="py-3 px-4 font-bold text-slate-500 text-sm text-center">Số thẻ trong ví</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vips.map(vip => (
                                            <tr key={vip.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={vip.avatar} alt="Avatar" className="w-10 h-10 rounded-full border" />
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                                {vip.name}
                                                                <span className="material-symbols-outlined text-[14px] text-amber-500">stars</span>
                                                            </p>
                                                            <p className="text-[11px] text-slate-500">{vip.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black px-3 py-1 rounded-full text-xs">
                                                        {vip.cards?.length || 0} thẻ
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-slate-500 font-medium">Hệ thống chưa có người dùng VIP nào.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
