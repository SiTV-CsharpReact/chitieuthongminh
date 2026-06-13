"use client";

import React, { useEffect, useState } from 'react';
import { promotionApi, scraperApi } from '@/services/api';
import { CardPromotion } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminButton from '@/components/Admin/AdminButton';

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState<CardPromotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPromotion, setSelectedPromotion] = useState<CardPromotion | null>(null);
    
    const [showImportModal, setShowImportModal] = useState(false);
    const [importJson, setImportJson] = useState('');

    // Pagination & Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [bankFilter, setBankFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const data = await promotionApi.getAll();
            setPromotions(data);
        } catch (error) {
            console.error('Failed to fetch promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xoá ưu đãi này?')) return;
        try {
            await promotionApi.delete(id);
            fetchPromotions();
        } catch (error) {
            console.error('Failed to delete promotion:', error);
        }
    };



    const handleDeleteAll = async () => {
        if (!confirm('CẢNH BÁO: Hành động này sẽ xoá TOÀN BỘ ưu đãi hiện có. Bạn có chắc chắn?')) return;
        try {
            await promotionApi.deleteAll();
            fetchPromotions();
        } catch (error) {
            console.error('Xoá tất cả thất bại:', error);
            alert('Có lỗi xảy ra khi xoá toàn bộ dữ liệu');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Vô thời hạn';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    const uniqueBanks = Array.from(new Set(promotions.map(p => p.bankName).filter(Boolean))).sort() as string[];
    const uniqueCategories = Array.from(new Set(promotions.map(p => p.categoryTab).filter(Boolean))).sort() as string[];

    const filteredPromotions = promotions.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchBank = !bankFilter || p.bankName === bankFilter;
        const matchCategory = !categoryFilter || p.categoryTab === categoryFilter;
        return matchSearch && matchBank && matchCategory;
    });

    const totalPages = Math.ceil(filteredPromotions.length / pageSize);
    const currentItems = filteredPromotions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

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

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản Lý Ưu Đãi Thẻ</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Quản lý hệ thống ưu đãi và khuyến mãi từ các ngân hàng
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <AdminButton
                        variant="outline"
                        onClick={() => setShowImportModal(true)}
                        icon="upload_file"
                    >
                        Nhập JSON
                    </AdminButton>
                    <AdminButton
                        variant="outline"
                        onClick={handleDeleteAll}
                        icon="delete_sweep"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                        Xoá Tất Cả
                    </AdminButton>

                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[300px] relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm ưu đãi theo tên..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <select
                        value={bankFilter}
                        onChange={(e) => { setBankFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    >
                        <option value="">Tất cả Ngân hàng</option>
                        {uniqueBanks.map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                        ))}
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                    >
                        <option value="">Tất cả Danh mục</option>
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
                        <span className="text-sm text-slate-500">Hiển thị:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Hình ảnh</th>
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên ưu đãi</th>
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngân hàng</th>
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</th>
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Mức giảm</th>
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu</th>
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn dùng</th>
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Thẻ áp dụng</th>
                                <th className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-6 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="material-symbols-outlined animate-spin">sync</span>
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-6 text-center text-slate-500">
                                        Không tìm thấy ưu đãi nào
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-5 py-2.5 cursor-pointer" onClick={() => setSelectedPromotion(p)}>
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <span className="material-symbols-outlined text-sm">image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-2.5 min-w-[250px] cursor-pointer" onClick={() => setSelectedPromotion(p)}>
                                            <div className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline line-clamp-2" title={p.title}>
                                                {p.title}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{p.bankName || p.sourceUrl || 'Source'}</div>
                                        </td>
                                        <td className="px-5 py-2.5 whitespace-nowrap">
                                            <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800">
                                                {p.bankName || 'Khác'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 whitespace-nowrap">
                                            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md font-medium border border-indigo-100 dark:border-indigo-800">
                                                {p.categoryTab || 'Khác'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 whitespace-nowrap">
                                            <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-black ring-1 ring-inset ring-green-600/20">
                                                {p.discountRate || 'Khám phá'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-2.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 text-sm">
                                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                {formatDate(p.startDate)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-2.5 text-slate-500 text-sm">
                                            <div className="flex flex-col gap-1">
                                                {p.startDate && p.validUntil ? (
                                                    <span>Từ <b>{p.startDate}</b> đến <b>{p.validUntil}</b></span>
                                                ) : p.validUntil ? (
                                                    <span>Đến <b>{p.validUntil}</b></span>
                                                ) : p.startDate ? (
                                                    <span>Từ <b>{p.startDate}</b></span>
                                                ) : (
                                                    <span>Vô thời hạn</span>
                                                )}
                                                {isExpired(p.validUntil) && (
                                                    <span className="inline-block w-fit px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-bold uppercase tracking-wider">Đã hết hạn</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-2.5">
                                            <div className="flex flex-wrap gap-1">
                                                {(p.applicableCards || []).slice(0, 1).map((card, i) => (
                                                    <span key={i} className="text-xs bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                        {card}
                                                    </span>
                                                ))}
                                                {p.applicableCards && p.applicableCards.length > 1 && (
                                                    <span className="text-[10px] flex items-center text-slate-400">+{p.applicableCards.length - 1}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-2.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <AdminButton
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-8 h-8 p-0"
                                                    icon="edit"
                                                    title="Chỉnh sửa (Sắp ra mắt)"
                                                />
                                                <AdminButton
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-8 h-8 p-0 text-red-500 border-red-100 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                    onClick={() => handleDelete(p.id!)}
                                                    icon="delete"
                                                    title="Xoá ưu đãi"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {!loading && totalPages > 1 && (
                    <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredPromotions.length)} trong số {filteredPromotions.length}
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
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                                ) : (
                                    <button
                                        key={`page-${page}`}
                                        onClick={() => setCurrentPage(page as number)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                            currentPage === page 
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
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
                )}
            </div>

            {/* Detail Modal */}
            {selectedPromotion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                        <div className="relative h-48 sm:h-64 shrink-0 bg-slate-100 dark:bg-slate-800">
                            {selectedPromotion.imageUrl ? (
                                <img src={selectedPromotion.imageUrl} alt={selectedPromotion.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-6xl text-slate-300">local_offer</span>
                                </div>
                            )}
                            <button 
                                onClick={() => setSelectedPromotion(null)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-black ring-1 ring-inset ring-amber-600/20">
                                    {selectedPromotion.bankName}
                                </span>
                                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-black ring-1 ring-inset ring-green-600/20">
                                    {selectedPromotion.discountRate || 'Khám phá'}
                                </span>
                                <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-black ring-1 ring-inset ring-indigo-600/20">
                                    {selectedPromotion.categoryTab || 'Chung'}
                                </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">{selectedPromotion.title}</h2>
                            
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <span className="material-symbols-outlined text-lg">event_available</span>
                                <span>Thời gian: <span className="font-bold">
                                    {selectedPromotion.startDate && selectedPromotion.validUntil ? `Từ ${selectedPromotion.startDate} đến ${selectedPromotion.validUntil}` 
                                    : selectedPromotion.validUntil ? `Đến ${selectedPromotion.validUntil}`
                                    : selectedPromotion.startDate ? `Từ ${selectedPromotion.startDate}`
                                    : 'Vô thời hạn'}
                                </span></span>
                            </div>

                            <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Chi tiết ưu đãi</h3>
                                {selectedPromotion.description ? (
                                    <div 
                                        className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-full break-words" 
                                        dangerouslySetInnerHTML={{ __html: selectedPromotion.description }} 
                                    />
                                ) : (
                                    <p className="text-slate-400 italic">Không có mô tả chi tiết từ ngân hàng.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                            <AdminButton variant="ghost" onClick={() => setSelectedPromotion(null)}>Đóng</AdminButton>
                            {selectedPromotion.sourceUrl && (
                                <a 
                                    href={selectedPromotion.sourceUrl} 
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

            {/* Manual Import Modal */}
            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 p-0 gap-0 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden shadow-2xl">
                    <DialogHeader className="hidden"><DialogTitle>Import Data</DialogTitle></DialogHeader>
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-indigo-600">upload_file</span>
                                    Nhập Dữ Liệu JSON
                                </h2>
                                <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Dán nội dung JSON đã cào được vào đây để nhập nhanh vào hệ thống.
                            </p>

                            <textarea
                                value={importJson}
                                onChange={(e) => setImportJson(e.target.value)}
                                placeholder="Paste JSON here..."
                                className="w-full h-64 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all outline-none mb-6"
                            />

                            <div className="flex gap-4">
                                <AdminButton
                                    onClick={async () => {
                                        try {
                                            const data = JSON.parse(importJson);
                                            await promotionApi.saveBatch(data);
                                            setShowImportModal(false);
                                            setImportJson('');
                                            fetchPromotions();
                                        } catch (e) {
                                            alert('Dữ liệu JSON không hợp lệ hoặc lỗi server');
                                        }
                                    }}
                                    className="flex-1 py-4 rounded-2xl"
                                >
                                    Lưu Dữ Liệu
                                </AdminButton>
                            </div>
                        </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
