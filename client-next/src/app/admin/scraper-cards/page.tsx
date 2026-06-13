"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { cardScraperApi } from '@/services/api';

export default function CardScraperPage() {
    const [status, setStatus] = useState<any>(null);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statusData, draftsData] = await Promise.all([
                cardScraperApi.getStatus(),
                cardScraperApi.getDrafts()
            ]);
            setStatus(statusData);
            setDrafts(draftsData);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu scraper:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStart = async () => {
        try {
            await cardScraperApi.start();
            alert('Đã bắt đầu chạy Bot!');
            fetchData();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn duyệt và thêm thẻ này vào dữ liệu chính?')) return;
        try {
            await cardScraperApi.importDraft(id);
            alert('Đã Import (Ghi đè/Thêm mới) thẻ thành công!');
            fetchData();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa bản nháp này?')) return;
        try {
            await cardScraperApi.deleteDraft(id);
            fetchData();
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Bot Cào Thẻ Tín Dụng (Credit Thẻ tín dụng)</h1>
                <p className="text-slate-500 mt-1">Điều khiển bot quét website ngân hàng để tìm Thẻ tín dụng và bóc tách Thể lệ PDF.</p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-[#1a1f2e] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                    <div className={`absolute top-0 w-full h-1 ${status?.isRunning ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <span className={`material-symbols-outlined text-[48px] mb-2 ${status?.isRunning ? 'text-indigo-500 animate-spin-slow' : 'text-slate-400'}`}>
                        smart_toy
                    </span>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Trạng thái</h3>
                    <p className={`text-xl font-black mt-1 ${status?.isRunning ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {status?.isRunning ? 'Đang chạy' : 'Đang nghỉ'}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1a1f2e] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[32px] text-blue-500 mb-2">account_balance</span>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ngân hàng xử lý</h3>
                    <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
                        {status?.processedBanks || 0} <span className="text-lg text-slate-400 font-medium">/ {status?.totalBanks || 0}</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1a1f2e] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[32px] text-emerald-500 mb-2">credit_card</span>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Thẻ tìm thấy (Phiên này)</h3>
                    <p className="text-3xl font-black text-emerald-600 mt-1">
                        +{status?.newCardsFound || 0}
                    </p>
                </div>

                <div className="bg-white dark:bg-[#1a1f2e] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
                    <button
                        onClick={handleStart}
                        disabled={status?.isRunning}
                        className="w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:shadow-none"
                    >
                        <span className="material-symbols-outlined text-[32px]">{status?.isRunning ? 'hourglass_empty' : 'play_arrow'}</span>
                        <span className="font-bold">{status?.isRunning ? 'Đang xử lý...' : 'CHẠY BOT NGAY'}</span>
                    </button>
                </div>
            </div>

            {status?.isRunning && status?.currentBank && (
                <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    <p className="font-medium">Bot đang lướt trang: <strong className="bg-white dark:bg-indigo-900 px-2 py-1 rounded">{status.currentBank}</strong> ...</p>
                </div>
            )}

            {/* Drafts List */}
            <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">inventory_2</span>
                        Bản nháp chờ duyệt ({drafts.length})
                    </h2>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-[#1e2536] text-slate-500 dark:text-slate-400 text-sm font-semibold">
                                <th className="px-5 py-2.5 text-left">Ảnh Thẻ</th>
                                <th className="px-5 py-2.5 text-left">Tên Thẻ & Ngân Hàng</th>
                                <th className="px-5 py-2.5 text-left">Nguồn gốc</th>
                                <th className="px-5 py-2.5 text-left">File Thể Lệ (PDF)</th>
                                <th className="px-5 py-2.5 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {drafts.map((draft) => (
                                <tr key={draft.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1e2536]/50 transition-colors">
                                    <td className="px-5 py-2.5">
                                        {draft.imageUrl ? (
                                            <div className="w-20 h-12 relative rounded-md overflow-hidden bg-slate-100">
                                                <Image src={draft.imageUrl} alt={draft.title} fill className="object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-12 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-400">image_not_supported</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[250px]">{draft.title}</div>
                                        <div className="text-sm text-slate-500 mt-1 bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded">
                                            {draft.bankName}
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <a href={draft.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm break-all max-w-[200px] inline-block">
                                            Link chi tiết thẻ
                                        </a>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        {draft.termsPdfUrl ? (
                                            <a href={draft.termsPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-bold text-sm border border-red-200">
                                                <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                                                Xem PDF
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">Không tìm thấy</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-2.5 text-right space-x-2">
                                        <button
                                            onClick={() => handleApprove(draft.id)}
                                            className="px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg font-semibold transition-colors"
                                        >
                                            Phê duyệt (Import)
                                        </button>
                                        <button
                                            onClick={() => handleReject(draft.id)}
                                            className="px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg font-semibold transition-colors"
                                        >
                                            Bỏ qua
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {drafts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-6 text-center text-slate-500">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                                        <p>Chưa có thẻ nào được thu thập.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
