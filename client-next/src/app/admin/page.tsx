"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { cardApi, userApi } from '@/services/api';
import { Card as CreditCard, User, SpendingData } from '@/types';
import AdminButton from '@/components/Admin/AdminButton';
import AdminConfirm from '@/components/Admin/AdminConfirm';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

interface ActivityLog {
    title: string;
    time: string;
    type: 'system' | 'edit' | 'user';
    icon: string;
}

const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 0) return 'Vừa xong';
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} năm trước`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} tháng trước`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} ngày trước`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} giờ trước`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} phút trước`;
    return 'Vừa xong';
};

export default function AdminDashboardPage() {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [spendingLogs, setSpendingLogs] = useState<SpendingData[]>([]);
    const [isSeeding, setIsSeeding] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [showSeedConfirm, setShowSeedConfirm] = useState(false);

    const buildActivities = (logs: SpendingData[]) => {
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const mappedLogs: ActivityLog[] = sortedLogs.slice(0, 6).map(log => ({
            title: `Yêu cầu so sánh: ${log.amount.toLocaleString()} đ - ${log.category || 'Tất cả'}`,
            time: formatTimeAgo(new Date(log.date)),
            type: 'user',
            icon: 'compare_arrows',
        }));

        const result: ActivityLog[] = [...mappedLogs];
        
        if (result.length === 0) {
            result.push(
                { title: 'Hệ thống đã sẵn sàng', time: 'Vừa xong', type: 'system', icon: 'check_circle' },
                { title: 'Khởi tạo dashboard', time: '1 phút trước', type: 'system', icon: 'dashboard' }
            );
        }
        return result.slice(0, 8);
    };

    useEffect(() => {
        setMounted(true);
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [cardsData, usersData, spendingData] = await Promise.all([
                cardApi.getAll().catch(e => { console.error('Error fetching cards:', e); return [] as CreditCard[]; }),
                userApi.getAll().catch(e => { console.error('Error fetching users:', e); return [] as User[]; }),
                cardApi.getSpending().catch(e => { console.error('Error fetching spending:', e); return [] as SpendingData[]; }),
            ]);
            setCards(cardsData);
            setUsers(usersData);
            setSpendingLogs(spendingData);
            setActivities(buildActivities(spendingData));
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSeed = async () => {
        setShowSeedConfirm(false);
        setIsSeeding(true);
        try {
            await cardApi.seedAll();
            await fetchStats();
        } catch (error) {
            console.error('Error seeding cards:', error);
        } finally {
            setIsSeeding(false);
        }
    };

    const categoryStats = useMemo(() => {
        const counts: Record<string, number> = {};
        cards.forEach(card => {
            card.cashbackRules.forEach(rule => {
                const cat = rule.category || 'Khác';
                counts[cat] = (counts[cat] || 0) + 1;
            });
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [cards]);

    const estimatedSavings = useMemo(() => {
        if (!spendingLogs.length || !cards.length) return 0;
        let total = 0;
        spendingLogs.forEach(log => {
            const category = log.category || 'Tất cả';
            let maxCashbackAmount = 0;
            
            cards.forEach(card => {
                const matchingRule = card.cashbackRules.find(r =>
                    category.toLowerCase().includes(r.category.toLowerCase()) ||
                    r.category.toLowerCase().includes(category.toLowerCase())
                );
                const generalRule = card.cashbackRules.find(r =>
                    r.category === 'Tất cả' || r.category === 'All' || r.category === 'Mọi chi tiêu'
                );
                const appliedRule = matchingRule || generalRule;
                const rate = appliedRule ? appliedRule.percentage : 0;
                
                let cb = (log.amount * rate) / 100;
                if (appliedRule && appliedRule.capAmount && cb > appliedRule.capAmount) {
                    cb = appliedRule.capAmount;
                }
                
                if (cb > maxCashbackAmount) {
                    maxCashbackAmount = cb;
                }
            });
            total += maxCashbackAmount;
        });
        return total;
    }, [spendingLogs, cards]);

    const formattedSavings = useMemo(() => {
        if (estimatedSavings >= 1000000) {
            return `${(estimatedSavings / 1000000).toFixed(1)}M`;
        }
        return `${estimatedSavings.toLocaleString()} đ`;
    }, [estimatedSavings]);

    const growthData = useMemo(() => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                dateString: d.toDateString(),
                label: days[d.getDay()],
                value: 0,
            };
        });

        spendingLogs.forEach(log => {
            if (!log.date) return;
            const logDate = new Date(log.date);
            const logDateString = logDate.toDateString();
            const match = last7Days.find(item => item.dateString === logDateString);
            if (match) {
                match.value += 1;
            }
        });

        return last7Days.map(item => ({
            name: item.label,
            value: item.value,
        }));
    }, [spendingLogs]);

    const stats = useMemo(() => [
        { label: 'Tổng số thẻ', value: cards.length.toString(), icon: 'credit_card', color: 'bg-emerald-500', trend: '+5%' },
        { label: 'Người dùng', value: users.filter(u => u.role !== 'Admin').length.toString(), icon: 'group', color: 'bg-blue-600', trend: '+12%' },
        { label: 'Yêu cầu so sánh', value: spendingLogs.length.toString(), icon: 'compare_arrows', color: 'bg-amber-500', trend: '+18%' },
        { label: 'Tiết kiệm ước tính', value: formattedSavings, icon: 'savings', color: 'bg-indigo-500', trend: '+8%' },
    ], [cards, users, spendingLogs, formattedSavings]);

    if (!mounted) return null;

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Dữ liệu phân tích cập nhật theo thời gian thực</p>
                </div>
                <AdminButton
                    onClick={() => setShowSeedConfirm(true)}
                    disabled={isSeeding}
                    loading={isSeeding}
                    variant="primary"
                    icon={!isSeeding ? "database" : undefined}
                    size="sm"
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4"
                >
                    {isSeeding ? 'Đang tạo...' : 'Tạo lại dữ liệu mẫu'}
                </AdminButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 group relative overflow-hidden transition-all hover:ring-blue-600/30">
                        <div className="flex items-start justify-between relative z-10 mb-3">
                            <div className={`w-10 h-10 rounded-xl ${stat.color} text-white flex items-center justify-center shadow-lg shadow-slate-500/10`}>
                                <span className="material-symbols-outlined text-lg">{stat.icon}</span>
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 border border-emerald-100 dark:border-emerald-800">{stat.trend}</span>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-0.5">{stat.label}</p>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 flex flex-col min-h-[360px]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-black text-lg text-slate-900 dark:text-white">Lượt truy cập & So sánh</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hoạt động trong 7 ngày qua (Thực tế)</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                Tỉ lệ chuyển đổi
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full h-full min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 flex flex-col min-h-[360px]">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white mb-6">Thẻ theo Danh mục (Thực tế)</h3>
                    <div className="flex-1 w-full h-full min-h-[200px]">
                        {categoryStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryStats} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} width={80} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                                        {categoryStats.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-slate-400 italic">Chưa có dữ liệu thẻ</div>
                        )}
                    </div>
                    {categoryStats.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-slate-400 uppercase">DANH MỤC PHỔ BIẾN</span>
                                <span className="text-blue-600 uppercase">{categoryStats[0].name} ({Math.round(categoryStats[0].value / cards.reduce((a, b) => a + b.cashbackRules.length, 0) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-full" style={{ width: `${Math.round(categoryStats[0].value / cards.reduce((a, b) => a + b.cashbackRules.length, 0) * 100)}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Hoạt động hệ thống (Thực tế)</h3>
                    <AdminButton
                        variant="ghost"
                        size="sm"
                        className="text-[10px]"
                    >
                        Xem tất cả
                    </AdminButton>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {activities.map((act, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${act.type === 'system' ? 'bg-indigo-500' : act.type === 'edit' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                                <span className="material-symbols-outlined text-sm">{act.icon}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 truncate">{act.title}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5">{act.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AdminConfirm
                isOpen={showSeedConfirm}
                onClose={() => setShowSeedConfirm(false)}
                onConfirm={handleSeed}
                title="Tạo lại dữ liệu mẫu?"
                description="Hành động này sẽ xoá toàn bộ dữ liệu hiện tại (Thẻ, Danh mục, Ưu đãi) và thay thế bằng 10 bộ dữ liệu mẫu chuẩn. Bạn có chắc chắn muốn thực hiện?"
                confirmText="Đồng ý, tạo mẫu"
                variant="warning"
                isLoading={isSeeding}
            />
        </div>
    );
}
