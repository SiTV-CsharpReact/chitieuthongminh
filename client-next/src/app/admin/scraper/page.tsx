"use client";

import React, { useState, useEffect } from 'react';
import { ScraperDraft } from '@/types';
import AdminButton from '@/components/Admin/AdminButton';
import { autoScraperApi } from '@/services/api';

export default function ScraperDashboardPage() {
    const [drafts, setDrafts] = useState<ScraperDraft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScraping, setIsScraping] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    useEffect(() => {
        fetchDrafts();
        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const data = await autoScraperApi.getStatus();
            setStatus(data);
            setIsScraping(data.isRunning);
            if (!data.isRunning && data.newDraftsFound > 0 && isScraping) {
                // Just finished scraping
                fetchDrafts();
            }
        } catch (error) {
            // Ignore API error if server is restarting
        }
    };

    const fetchDrafts = async () => {
        setIsLoading(true);
        try {
            const data = await autoScraperApi.getDrafts();
            setDrafts(data);
        } catch (error) {
            console.error('Failed to fetch drafts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTriggerScraper = async () => {
        if (isScraping) return;
        setIsScraping(true);
        try {
            await autoScraperApi.trigger();
            setStatus(null);
            checkStatus();
        } catch (error) {
            alert('Có lỗi xảy ra khi gọi Bot!');
            setIsScraping(false);
        }
    };

    const pendingDrafts = drafts.filter(d => d.status === 'Pending' || !d.status);
    const historyDrafts = drafts.filter(d => d.status === 'Approved' || d.status === 'Rejected');
    const displayDrafts = activeTab === 'pending' ? pendingDrafts : historyDrafts;

    const handleApprove = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn duyệt và thêm thẻ này vào dữ liệu chính?')) return;
        try {
            await autoScraperApi.approve(id);
            setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'Approved' } : d));
            alert('Đã duyệt thành công!');
        } catch (error) {
            alert('Lỗi khi duyệt thẻ.');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn từ chối bản nháp này?')) return;
        try {
            await autoScraperApi.reject(id);
            setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: 'Rejected' } : d));
        } catch (error) {
            alert('Lỗi khi từ chối bản nháp.');
        }
    };

    const handleClearAll = async () => {
        if (!confirm(`Xóa toàn bộ ${pendingDrafts.length} bản nháp đang chờ? Hành động này không thể hoàn tác.`)) return;
        try {
            const data = await autoScraperApi.clearAll();
            setDrafts(prev => prev.map(d => (d.status === 'Pending' || !d.status) ? { ...d, status: 'Rejected' } : d));
            alert(data.message);
        } catch (error) {
            alert('Lỗi khi từ chối bản nháp.');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bot Cào Dữ Liệu (Auto-Scraper)</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý và xét duyệt các thẻ tín dụng được Bot tự động thu thập từ các ngân hàng.</p>
                </div>
                <div className="flex items-center gap-3">
                    {pendingDrafts.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            disabled={isScraping}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-sm">delete_sweep</span>
                            Từ chối tất cả ({pendingDrafts.length})
                        </button>
                    )}

                    <AdminButton
                        onClick={handleTriggerScraper}
                        disabled={isScraping}
                        loading={isScraping}
                        variant="primary"
                        icon={!isScraping ? "smart_toy" : undefined}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                    >
                        {isScraping ? 'Bot đang chạy...' : 'Cào Thẻ'}
                    </AdminButton>
                </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                    Chờ duyệt ({pendingDrafts.length})
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'history' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
                >
                    <span className="material-symbols-outlined text-[20px]">history</span>
                    Lịch sử ({historyDrafts.length})
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-col sm:flex-row flex justify-between items-start sm:items-center gap-4">
                    {/* <h2 className="text-lg font-black flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">pending_actions</span>
                        Quản lý Bản Nháp
                    </h2> */}

                    {isScraping && status && (
                        <div className="w-full sm:w-1/2 md:w-1/3">
                            <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-emerald-600">Đang quét: {status.currentBank || '...'}</span>
                                <span className="text-slate-500">{status.processedBanks} / {status.totalBanks} Ngân hàng</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${status.totalBanks > 0 ? (status.processedBanks / status.totalBanks) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {isLoading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full"></div>
                    </div>
                ) : displayDrafts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">task</span>
                        <p className="text-lg font-bold">{activeTab === 'pending' ? 'Không có bản nháp nào chờ duyệt!' : 'Chưa có lịch sử thao tác!'}</p>
                        <p className="text-sm mt-1">{activeTab === 'pending' ? 'Bot chưa phát hiện thêm thẻ mới hoặc bản cập nhật nào.' : 'Các bản nháp đã duyệt hoặc từ chối sẽ hiển thị ở đây.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-5 py-2.5">Tên Thẻ / Ngân hàng</th>
                                    <th className="px-5 py-2.5">Lý do</th>
                                    <th className="px-5 py-2.5">Thời gian quét</th>
                                    <th className="px-5 py-2.5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {displayDrafts.map((draft) => (
                                    <tr key={draft.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-2.5">
                                            <div className="flex items-center gap-3">
                                                {draft.imageUrl ? (
                                                    <img src={draft.imageUrl} alt={draft.name} className="w-12 h-8 object-cover rounded shadow-sm" />
                                                ) : (
                                                    <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-sm text-slate-400">credit_card</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-black text-slate-900 dark:text-white">{draft.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase">{draft.bankName}</div>
                                                    {draft.link && (
                                                        <a href={draft.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline mt-0.5 block truncate max-w-xs">
                                                            {draft.link}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-2.5">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${draft.existingCardId ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                                                {draft.reason}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 text-slate-500">
                                            {new Date(draft.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="px-5 py-2.5 text-right space-x-2">
                                            {activeTab === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(draft.id!)}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs transition-colors"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(draft.id!)}
                                                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded font-bold text-xs transition-colors"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`px-3 py-1.5 rounded font-bold text-xs ${draft.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    {draft.status === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
