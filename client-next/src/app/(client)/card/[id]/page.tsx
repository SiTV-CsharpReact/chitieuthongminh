"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { cardApi } from '@/services/api';
import { Card } from '@/types';

interface CardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CardDetailPage({ params }: CardDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useTheme();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardId, setCardId] = useState<string | null>(null);

  const spendingAmount = Number(searchParams.get('spending')) || 10000000;
  const topCategory = searchParams.get('topCategory') || 'Ăn uống';

  useEffect(() => {
    params.then(p => setCardId(p.id));
  }, [params]);

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) return;
      try {
        setLoading(true);
        const data = await cardApi.getById(cardId);

        // Calculate estimated cashback for this card
        const matchingRule = data.cashbackRules.find(r =>
          topCategory.toLowerCase().includes(r.category.toLowerCase()) ||
          r.category.toLowerCase().includes(topCategory.toLowerCase())
        );

        const generalRule = data.cashbackRules.find(r =>
          r.category === 'Tất cả' || r.category === 'All'
        );

        const rate = matchingRule ? matchingRule.percentage : (generalRule ? generalRule.percentage : 0);
        const cashbackAmount = (spendingAmount * rate) / 100;

        setCard({ ...data, cashbackAmount });
      } catch (e) {
        console.error("Failed to fetch card details:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId, spendingAmount, topCategory]);

  if (loading) {
    return (
      <div className="pt-40 text-center animate-pulse">
        <p className="text-slate-400 font-bold uppercase tracking-widest">Đang tải thông tin chi tiết...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="pt-40 text-center">
        <p className="text-slate-500 font-bold">Không tìm thấy thông tin thẻ.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary-500 font-bold">Quay lại</button>
      </div>
    );
  }

  // Pre-calculate chart data based on card rules and spending
  const chartData = card.cashbackRules.map(rule => {
    const amount = (spendingAmount * rule.percentage) / 100;
    return {
      name: rule.category,
      value: amount,
      percentage: rule.percentage
    };
  }).slice(0, 5); // Limit to top 5 rules for chart

  const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

  const tooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
    color: isDarkMode ? '#f8fafc' : '#0f172a'
  };

  return (
    <main className="flex-grow pt-18 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16 min-h-screen bg-slate-50 dark:bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined mr-1 text-lg">arrow_back</span>
            Quay lại
          </button>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50">
            Chi Tiết Thẻ Tín Dụng
          </h1>
          <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
            Khám phá lợi ích và ưu đãi độc quyền của {card.bankName}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* Left Column: Card Info */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] p-8 shadow-sm lg:sticky lg:top-28">
              <div className="flex flex-col items-center">
                <div className="relative w-full mb-8 group perspective">
                  <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full transform translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img
                    alt={card.name}
                    className="relative w-full -rotate-3 transform transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 shadow-xl rounded-xl border border-slate-100 dark:border-slate-800"
                    src={card.imageUrl}
                  />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 text-center">{card.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{card.bankName}</p>

                <div className="mt-8 w-full space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Phí thường niên</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{card.annualFee?.toLocaleString()} VND</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Hạn mức từ</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{card.creditLimit || '20,000,000 VND'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Lãi suất</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{card.interestRate || '1.5 - 2.5%/tháng'}</span>
                  </div>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 h-12 px-6 text-base font-bold text-white transition-all shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30 active:scale-95">
                    Mở thẻ ngay
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Hoàn Tiền Theo Danh Mục Chi Tiêu</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Dựa trên chi tiêu {spendingAmount?.toLocaleString()}đ hàng tháng.</p>

              <div className="mt-8 h-[300px] w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fontWeight: 700, fill: isDarkMode ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [value.toLocaleString() + ' VND', 'Ước tính']}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-4">
                {card.cashbackRules.map((rule, idx) => (
                  <div key={idx} className={`flex items-center justify-between rounded-xl p-5 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 transition-transform hover:scale-[1.01]`}>
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-primary-500 shadow-sm shadow-primary-500/10`}>
                        <span className="material-symbols-outlined text-2xl">
                          {rule.category === 'Ăn uống' ? 'restaurant' :
                            rule.category === 'Online' ? 'shopping_cart' :
                              rule.category === 'Du lịch' ? 'flight' : 'payments'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-50 text-lg">{rule.category}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Hoàn tiền {rule.percentage}%</span>
                      </div>
                    </div>
                    <span className={`text-xl font-bold text-primary-600 dark:text-primary-400`}>+ {((spendingAmount * rule.percentage) / 100).toLocaleString()} VND</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-between items-center text-right">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Tổng tiền tích lũy một năm:</span>
                <span className="text-2xl font-black text-primary-600 dark:text-primary-400">~ {((card.cashbackAmount || 0) * 12).toLocaleString()} VND</span>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Đặc Quyền Nổi Bật</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {card.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-primary-500">check_circle</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
