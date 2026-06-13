"use client";

import { useEffect, useState } from 'react';
import { autoScraperApi } from '@/services/api';
import AdminButton from '@/components/Admin/AdminButton';

export default function PromoScraperDashboardPage() {
    const [isScraping, setIsScraping] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [selectedDraft, setSelectedDraft] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bankFilter, setBankFilter] = useState('');

    useEffect(() => {
        checkStatus();
        fetchDrafts();
        const interval = setInterval(() => {
            checkStatus();
            if (isScraping) fetchDrafts();
        }, 2000);
        return () => clearInterval(interval);
    }, [isScraping]);

    const checkStatus = async () => {
        try {
            const data = await autoScraperApi.getStatus();
            setStatus(data);
            setIsScraping(data.isRunning);
        } catch (error) {
            // Ignore API error if server is restarting
        }
    };

    const fetchDrafts = async () => {
        try {
            const data = await autoScraperApi.getPromoDrafts();
            setDrafts(data);
        } catch (error) {
            console.error('Failed to fetch promo drafts', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTriggerPromoScraper = async () => {
        if (isScraping) return;
        setIsScraping(true);
        try {
            await autoScraperApi.triggerPromotions();
            setStatus(null);
            checkStatus();
        } catch (error) {
            alert('Có lỗi xảy ra khi gọi Bot cào ưu đãi!');
            setIsScraping(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn duyệt và thêm ưu đãi này vào dữ liệu chính?')) return;
        try {
            const data = await autoScraperApi.approvePromoDraft(id);
            alert(data.message);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi duyệt ưu đãi.');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Từ chối ưu đãi này?')) return;
        try {
            const data = await autoScraperApi.rejectPromoDraft(id);
            alert(data.message);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi từ chối.');
        }
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Bạn có chắc chắn muốn duyệt ${selectedIds.length} ưu đãi đã chọn vào hệ thống chính?`)) return;
        setIsLoading(true);
        try {
            await Promise.all(selectedIds.map(id => autoScraperApi.approvePromoDraft(id)));
            alert(`Đã duyệt thành công ${selectedIds.length} ưu đãi!`);
            setSelectedIds([]);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi duyệt hàng loạt.');
            setIsLoading(false);
        }
    };

    const handleBulkReject = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Bạn có chắc chắn muốn từ chối ${selectedIds.length} ưu đãi đã chọn?`)) return;
        setIsLoading(true);
        try {
            await Promise.all(selectedIds.map(id => autoScraperApi.rejectPromoDraft(id)));
            alert(`Đã từ chối thành công ${selectedIds.length} ưu đãi!`);
            setSelectedIds([]);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi từ chối hàng loạt.');
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xoá bản nháp này khỏi lịch sử?')) return;
        try {
            const data = await autoScraperApi.deletePromoDraft(id);
            alert(data.message);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi xoá.');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Bạn có chắc chắn muốn xoá ${selectedIds.length} ưu đãi đã chọn khỏi lịch sử?`)) return;
        setIsLoading(true);
        try {
            await Promise.all(selectedIds.map(id => autoScraperApi.deletePromoDraft(id)));
            alert(`Đã xoá thành công ${selectedIds.length} ưu đãi!`);
            setSelectedIds([]);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi xoá hàng loạt.');
            setIsLoading(false);
        }
    };

    const handleClearAll = async () => {
        const pendingCount = pendingDrafts.length;
        if (!confirm(`Từ chối tất cả ${pendingCount} bản nháp đang chờ? Hành động này không thể hoàn tác.`)) return;
        try {
            const data = await autoScraperApi.clearAllPromoDrafts();
            alert(data.message);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi xoá tất cả.');
        }
    };

    const handleApproveAll = async () => {
        const pendingCount = pendingDrafts.length;
        if (!confirm(`Bạn có chắc chắn muốn duyệt tất cả ${pendingCount} ưu đãi đang chờ? Hành động này có thể mất chút thời gian.`)) return;
        setIsLoading(true);
        try {
            const data = await autoScraperApi.approveAllPromoDrafts();
            alert(data.message);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi duyệt tất cả.');
            setIsLoading(false);
        }
    };

    const handleClearHistory = async () => {
        const historyCount = historyDrafts.length;
        if (!confirm(`Xóa toàn bộ ${historyCount} bản nháp trong lịch sử? Hành động này không thể hoàn tác.`)) return;
        try {
            const data = await autoScraperApi.clearHistoryPromoDrafts();
            alert(data.message);
            fetchDrafts();
        } catch (error) {
            alert('Lỗi khi xoá lịch sử.');
        }
    };

    const filteredDrafts = bankFilter ? drafts.filter(d => d.bankName === bankFilter) : drafts;
    const pendingDrafts = filteredDrafts.filter(d => d.status === 'Pending' || !d.status);
    const historyDrafts = filteredDrafts.filter(d => d.status === 'Approved' || d.status === 'Rejected');
    const displayDrafts = activeTab === 'pending' ? pendingDrafts : historyDrafts;

    const uniqueBanks = Array.from(new Set(drafts.map(d => d.bankName).filter(Boolean)));

    const totalPages = Math.ceil(displayDrafts.length / pageSize);
    const currentItems = displayDrafts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const isExpired = (dateString?: string) => {
        if (!dateString) return false;
        const parts = dateString.split(/[\/\-\.]/);
        if (parts.length >= 2) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = parts.length >= 3 ? parseInt(parts[2], 10) : new Date().getFullYear();
            if (year < 100) year += 2000;
            const date = new Date(year, month, day);
            if (isNaN(date.getTime())) return false;
            date.setHours(23, 59, 59, 999);
            return date < new Date();
        }
        return false;
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === currentItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentItems.map(d => d.id!));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bot Cào Ưu Đãi (Ưu đãi thẻ tín dụng)</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý và xét duyệt các ưu đãi thẻ được Bot tự động thu thập từ các ngân hàng.</p>
                </div>
                <div className="flex items-center gap-3">
                    {pendingDrafts.length > 0 && activeTab === 'pending' && (
                        <>
                            {selectedIds.length > 0 && (
                                <>
                                    <AdminButton
                                        onClick={handleBulkApprove}
                                        variant="primary"
                                        icon="check_circle"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                                    >
                                        Duyệt ({selectedIds.length})
                                    </AdminButton>
                                    <button
                                        onClick={handleBulkReject}
                                        disabled={isScraping}
                                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">block</span>
                                        Từ chối ({selectedIds.length})
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleApproveAll}
                                disabled={isScraping}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">done_all</span>
                                Duyệt tất cả ({pendingDrafts.length})
                            </button>
                            <button
                                onClick={handleClearAll}
                                disabled={isScraping}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                                Từ chối tất cả ({pendingDrafts.length})
                            </button>
                        </>
                    )}
                    {historyDrafts.length > 0 && activeTab === 'history' && (
                        <>
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isScraping}
                                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    Xoá đã chọn ({selectedIds.length})
                                </button>
                            )}
                            <button
                                onClick={handleClearHistory}
                                disabled={isScraping}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                                Xoá tất cả ({historyDrafts.length})
                            </button>
                        </>
                    )}
                    <AdminButton
                        onClick={handleTriggerPromoScraper}
                        disabled={isScraping}
                        loading={isScraping}
                        variant="primary"
                        icon={!isScraping ? "local_offer" : undefined}
                        className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    >
                        {isScraping ? 'Bot đang chạy...' : 'Cào Ưu Đãi'}
                    </AdminButton>
                </div>
            </div>

            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
                <div className="flex">
                    <button
                        onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                        Chờ duyệt ({pendingDrafts.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                        className={`py-4 px-6 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${activeTab === 'history' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-500 hover:text-slate-400'}`}
                    >
                        <span className="material-symbols-outlined text-[20px]">history</span>
                        Lịch sử ({historyDrafts.length})
                    </button>
                </div>
                <div className="flex items-center gap-2 px-4">
                    <span className="material-symbols-outlined text-slate-400 text-sm">filter_alt</span>
                    <select
                        value={bankFilter}
                        onChange={(e) => { setBankFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
                    >
                        <option value="">Tất cả ngân hàng</option>
                        {uniqueBanks.map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-col sm:flex-row flex justify-between items-start sm:items-center gap-4">
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
                        <p className="text-sm mt-1">{activeTab === 'pending' ? 'Bot chưa phát hiện thêm ưu đãi mới nào.' : 'Các bản nháp đã duyệt hoặc từ chối sẽ hiển thị ở đây.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-5 py-2.5 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                        />
                                    </th>
                                    <th className="px-5 py-2.5">Tên Ưu Đãi / Ngân hàng</th>
                                    <th className="px-5 py-2.5">Lý do</th>
                                    <th className="px-5 py-2.5">Mức giảm</th>
                                    <th className="px-5 py-2.5">Thời gian áp dụng</th>
                                    <th className="px-5 py-2.5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {currentItems.map((draft) => {
                                    const expired = isExpired(draft.validUntil);
                                    return (
                                        <tr key={draft.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(draft.id!)}
                                                    onChange={() => toggleSelect(draft.id!)}
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                                />
                                            </td>
                                            <td className="px-5 py-2.5 cursor-pointer" onClick={() => setSelectedDraft(draft)}>
                                                <div className="flex items-center gap-3">
                                                    {draft.imageUrl ? (
                                                        <img src={draft.imageUrl} alt={draft.title} className="w-12 h-8 object-cover rounded shadow-sm" />
                                                    ) : (
                                                        <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-sm text-slate-400">local_offer</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline line-clamp-1 max-w-md">{draft.title}</div>
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase">{draft.bankName || 'Khác'}</div>
                                                        {draft.sourceUrl && (
                                                            <div className="text-[10px] text-slate-400 mt-0.5 block truncate max-w-xs">
                                                                {draft.sourceUrl}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                    {draft.reason}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5">
                                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-black ring-1 ring-inset ring-green-600/20">
                                                    {draft.discountRate || 'Khám phá'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5 text-slate-500 text-xs">
                                                <div className="flex flex-col gap-1">
                                                    {draft.startDate && draft.validUntil ? (
                                                        <span>Từ <b>{draft.startDate}</b> đến <b>{draft.validUntil}</b></span>
                                                    ) : draft.validUntil ? (
                                                        <span>Đến <b>{draft.validUntil}</b></span>
                                                    ) : draft.startDate ? (
                                                        <span>Từ <b>{draft.startDate}</b></span>
                                                    ) : (
                                                        <span>Vô thời hạn</span>
                                                    )}
                                                    {expired && (
                                                        <span className="inline-block w-fit px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-bold uppercase tracking-wider">Đã hết hạn</span>
                                                    )}
                                                </div>
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
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className={`px-3 py-1.5 rounded font-bold text-xs ${draft.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                            {draft.status === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDelete(draft.id!)}
                                                            className="px-2 py-1.5 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded font-bold text-xs transition-colors flex items-center justify-center"
                                                            title="Xoá khỏi lịch sử"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination footer */}
                {!isLoading && totalPages > 1 && (
                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, displayDrafts.length)} trong số {displayDrafts.length}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Hiển thị:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 text-slate-600 dark:text-slate-400"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                {getPageNumbers().map((page, index) => (
                                    <button
                                        key={`page-${page}`}
                                        onClick={() => setCurrentPage(page as number)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === page
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                                                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-500'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 text-slate-600 dark:text-slate-400"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedDraft && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative h-48 sm:h-64 shrink-0 bg-slate-100 dark:bg-slate-800">
                            {selectedDraft.imageUrl ? (
                                <img src={selectedDraft.imageUrl} alt={selectedDraft.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-6xl text-slate-300">local_offer</span>
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedDraft(null)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black ring-1 ring-inset ring-amber-600/20">
                                    {selectedDraft.bankName}
                                </span>
                                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-black ring-1 ring-inset ring-green-600/20">
                                    {selectedDraft.discountRate || 'Khám phá'}
                                </span>
                                <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-black ring-1 ring-inset ring-indigo-600/20">
                                    {selectedDraft.categoryTab || 'Chung'}
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{selectedDraft.title}</h2>

                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <span className="material-symbols-outlined text-lg">event_available</span>
                                <span>Thời gian: <span className="font-bold">
                                    {selectedDraft.startDate && selectedDraft.validUntil ? `Từ ${selectedDraft.startDate} đến ${selectedDraft.validUntil}`
                                        : selectedDraft.validUntil ? `Đến ${selectedDraft.validUntil}`
                                            : selectedDraft.startDate ? `Từ ${selectedDraft.startDate}`
                                                : 'Vô thời hạn'}
                                </span></span>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Chi tiết ưu đãi</h3>
                                {selectedDraft.description ? (
                                    <div
                                        className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-full break-words"
                                        dangerouslySetInnerHTML={{ __html: selectedDraft.description }}
                                    />
                                ) : (
                                    <p className="text-slate-400 italic">Không có mô tả chi tiết từ ngân hàng.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                            <AdminButton variant="ghost" onClick={() => setSelectedDraft(null)}>Đóng</AdminButton>
                            {selectedDraft.sourceUrl && (
                                <a
                                    href={selectedDraft.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    Xem trên trang gốc
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
