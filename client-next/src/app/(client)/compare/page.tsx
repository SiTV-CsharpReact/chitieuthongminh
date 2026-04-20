"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCompare } from '@/context/CompareContext';
import { Button } from '@/components/ui/button';

export default function ComparePage() {
    const { selectedCards, removeFromCompare } = useCompare();
    const router = useRouter();

    if (selectedCards.length === 0) {
        return (
            <main className="flex-grow pt-32 px-4 pb-16 flex items-center justify-center min-h-[70vh]">
                <div className="text-center max-w-md">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-6">
                        <span className="material-symbols-outlined text-4xl">compare_arrows</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-2 uppercase tracking-tight">Chưa chọn thẻ nào</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Vui lòng quay lại trang đề xuất và chọn ít nhất 1 thẻ để so sánh.</p>
                    <Button onClick={() => router.push('/recommendations')} size="lg" className="rounded-xl font-bold px-8">
                        Quay lại Đề xuất
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16 bg-slate-50 dark:bg-[#0f0f0f] min-h-screen">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => router.push('/recommendations')}
                            className="mb-2 flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                        >
                            <span className="material-symbols-outlined mr-1 text-lg">arrow_back</span>
                            Quay lại danh sách
                        </button>
                        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50 uppercase">
                            So sánh thẻ
                        </h1>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4 scrollbar-hide">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-4 gap-4">

                            {/* Label Column */}
                            <div className="col-span-1 pt-60 space-y-0">
                                {['Phí thường niên', 'Hạn mức tín dụng', 'Lãi suất', 'Hoàn tiền ước tính', 'Ưu đãi nổi bật'].map((label, idx) => (
                                    <div key={idx} className={`h-24 flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 ${idx !== 4 ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
                                        {label}
                                    </div>
                                ))}
                            </div>

                            {/* Card Columns */}
                            {selectedCards.map((card) => (
                                <div key={card.id} className="col-span-1 flex flex-col">
                                    {/* Card Header */}
                                    <div className="relative rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-4 flex flex-col items-center text-center h-60 hover:shadow-md transition-shadow">
                                        <button
                                            onClick={() => removeFromCompare(card.id)}
                                            className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                        <div className="h-24 w-auto aspect-[1.58/1] mb-4 rounded-lg shadow-md overflow-hidden">
                                            <img src={card.imageUrl} alt={card.name} className="h-full w-full object-cover" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-1">{card.name}</h3>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{card.bankName}</p>
                                    </div>

                                    {/* Specs */}
                                    <div className="rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 shadow-sm px-6">
                                        <div className="h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                                            <span className="font-bold text-slate-900 dark:text-white">{card.annualFee?.toLocaleString()}đ</span>
                                        </div>
                                        <div className="h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 text-center">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{card.creditLimit || 'Từ 20 triệu'}</span>
                                        </div>
                                        <div className="h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800 text-center">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{card.interestRate || '1.5% - 2.5%'}</span>
                                        </div>
                                        <div className="h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                                            <span className="font-black text-primary-600 dark:text-primary-400 text-lg">~{card.cashbackAmount?.toLocaleString() || 0} đ</span>
                                        </div>
                                        <div className="h-24 flex items-center justify-center text-center py-2">
                                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-4 leading-relaxed">{card.description}</p>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="mt-6">
                                        <Button className="w-full rounded-xl py-6 font-bold uppercase tracking-widest text-xs">Mở thẻ ngay</Button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Placeholder if less than 3 cards */}
                            {selectedCards.length < 3 && (
                                <div className="col-span-1 pt-60 flex flex-col items-center">
                                    <button
                                        onClick={() => router.push('/recommendations')}
                                        className="w-full h-full min-h-[400px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all gap-4"
                                    >
                                        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl">add</span>
                                        </div>
                                        <span className="font-bold">Thêm thẻ</span>
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
