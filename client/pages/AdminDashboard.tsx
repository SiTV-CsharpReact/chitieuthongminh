import React, { useState, useEffect, useMemo } from 'react';
import { cardApi } from '../services/api';
import { Card as CreditCard } from '../types';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

// Mock growth data (can keep for now)
const growthData = [
    { name: 'T2', value: 400 },
    { name: 'T3', value: 300 },
    { name: 'T4', value: 600 },
    { name: 'T5', value: 800 },
    { name: 'T6', value: 500 },
    { name: 'T7', value: 900 },
    { name: 'CN', value: 1100 },
];

interface ActivityLog {
    title: string;
    time: string;
    type: 'system' | 'edit' | 'user';
    icon: string;
}

const AdminDashboard: React.FC = () => {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [isSeeding, setIsSeeding] = useState(false);
    const [activities, setActivities] = useState<ActivityLog[]>([
        { title: 'Hệ thống đã sẵn sàng', time: 'Vừa xong', type: 'system', icon: 'check_circle' },
        { title: 'Khởi tạo dashboard', time: '1 phút trước', type: 'system', icon: 'dashboard' },
    ]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await cardApi.getAll();
            setCards(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSeed = async () => {
        if (!window.confirm('Bạn có muốn xóa dữ liệu cũ và tạo lại toàn bộ 10 thẻ & danh mục mẫu không?')) return;
        setIsSeeding(true);
        try {
            await cardApi.seedAll();
            await fetchStats();
            setActivities(prev => [{
                title: 'Đã seed 10 thẻ & danh mục mẫu',
                time: 'Vừa xong',
                type: 'system',
                icon: 'database'
            }, ...prev.slice(0, 3)]);
        } catch (error) {
            console.error('Error seeding cards:', error);
        } finally {
            setIsSeeding(false);
        }
    };

    // Calculate dynamic category statistics
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

    const stats = [
        { label: 'Tổng số thẻ', value: cards.length.toString(), icon: 'credit_card', color: 'bg-emerald-500', trend: '+5%' },
        { label: 'Người dùng', value: '1,240', icon: 'group', color: 'bg-primary-500', trend: '+12%' },
        { label: 'Yêu cầu so sánh', value: '3.2K', icon: 'compare_arrows', color: 'bg-amber-500', trend: '+18%' },
        { label: 'Tiết kiệm ước tính', value: '45.2M', icon: 'savings', color: 'bg-indigo-500', trend: '+8%' },
    ];

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Dữ liệu phân tích cập nhật theo thời gian thực</p>
                </div>
                <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-md"
                >
                    <span className="material-symbols-outlined text-[18px]">{isSeeding ? 'sync' : 'database'}</span>
                    {isSeeding ? 'Đang tạo...' : 'Tạo lại dữ liệu mẫu'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50 group relative overflow-hidden transition-all hover:ring-primary-500/30">
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
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hoạt động trong 7 ngày qua (Mô phỏng)</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
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
                                <span className="text-primary-500 uppercase">{categoryStats[0].name} ({Math.round(categoryStats[0].value / cards.reduce((a, b) => a + b.cashbackRules.length, 0) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary-500 h-full" style={{ width: `${Math.round(categoryStats[0].value / cards.reduce((a, b) => a + b.cashbackRules.length, 0) * 100)}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Hoạt động hệ thống (Thực tế)</h3>
                    <button className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Xem tất cả</button>
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
        </div>
    );
};

export default AdminDashboard;
