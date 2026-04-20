"use client";

import React, { useEffect, useState } from 'react';
import { promotionApi, scraperApi } from '@/services/api';
import { CardPromotion } from '@/types';

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState<CardPromotion[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal Cào Dữ Liệu
    const [showScraperModal, setShowScraperModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importJson, setImportJson] = useState('');
    const [scrapeUrl, setScrapeUrl] = useState('https://www.vib.com.vn/vn/promotion/vib-world');
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeResult, setScrapeResult] = useState<any[]>([]);

    // Pagination & Filter state
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleScraping = async () => {
        if (!scrapeUrl) return;
        try {
            setIsScraping(true);
            const result = await scraperApi.extractPromotions(scrapeUrl);
            setScrapeResult(result.promotions || []);
        } catch (error) {
            console.error('Lỗi lấy khuyến mại:', error);
            alert('Quét dữ liệu thất bại, vui lòng kiểm tra thiết lập CORS và kết nối mạng!');
        } finally {
            setIsScraping(false);
        }
    };

    const handleSaveExtracted = async () => {
        if (scrapeResult.length === 0) return;
        try {
            const payload = scrapeResult.map(p => ({
                ...p,
                applicableCards: ['VIB Card / Default']
            }));
            await promotionApi.saveBatch(payload);
            setShowScraperModal(false);
            setScrapeResult([]);
            fetchPromotions();
        } catch (error) {
            console.error('Lưu khuyến mại thất bại:', error);
            alert('Có lỗi xảy ra khi lưu hàng loạt dữ liệu');
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

    const filteredPromotions = promotions.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPromotions.length / pageSize);
    const currentItems = filteredPromotions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="max-w-7xl mx-auto pb-12 p-4 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                        Quản Lý Ưu Đãi Thẻ
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Quản lý hệ thống ưu đãi và khuyến mãi từ các ngân hàng
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">upload_file</span> Nhập JSON
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-sm">delete_sweep</span> Xoá Tất Cả
                    </button>
                    <button
                        onClick={() => setShowScraperModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <span className="material-symbols-outlined">api</span> Clone Từ VIB World
                    </button>
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
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
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
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Hình ảnh</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên ưu đãi</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mức giảm</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Hạn dùng</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thẻ áp dụng</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="material-symbols-outlined animate-spin">sync</span>
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        Không tìm thấy ưu đãi nào
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4 min-w-[250px]">
                                            <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2" title={p.title}>
                                                {p.title}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{p.sourceUrl?.includes('vib.com.vn') ? 'VIB Deals' : 'Source'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md font-medium border border-indigo-100 dark:border-indigo-800">
                                                {p.categoryTab || 'Khác'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-black ring-1 ring-inset ring-green-600/20">
                                                {p.discountRate || 'Khám phá'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500 text-sm">
                                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                {formatDate(p.startDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                                                <span className="material-symbols-outlined text-sm">event_available</span>
                                                {formatDate(p.validUntil)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
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
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                                                    title="Chỉnh sửa (Sắp ra mắt)"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id!)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                                                    title="Xoá ưu đãi"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
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
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
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
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                                        currentPage === i + 1 
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500'
                                    }`}
                                >
                                    {i + 1}
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
                )}
            </div>

            {/* Scraper Modal */}
            {showScraperModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                    Robot Cào Dữ Liệu Ưu Đãi (Scraper)
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Dán liên kết trang danh sách khuyến mại để tiến hành tự động bóc tách.</p>
                            </div>
                            <button onClick={() => setShowScraperModal(false)} className="text-slate-400 hover:text-red-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="p-6 flex flex-col sm:flex-row gap-4 border-b border-slate-100 dark:border-slate-700">
                            <input
                                type="text"
                                value={scrapeUrl}
                                onChange={(e) => setScrapeUrl(e.target.value)}
                                placeholder="https://www.vib.com.vn/vn/promotion/vib-world"
                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                            />
                            <button
                                onClick={handleScraping}
                                disabled={isScraping || !scrapeUrl}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                            >
                                {isScraping ? (
                                    <><span className="material-symbols-outlined animate-spin">refresh</span> Đang rà quét...</>
                                ) : (
                                    <><span className="material-symbols-outlined">search</span> Bắt đầu quét</>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">
                            {scrapeResult.length > 0 ? (
                                <div>
                                    <h4 className="font-bold text-green-600 flex items-center gap-2 mb-4">
                                        <span className="material-symbols-outlined">check_circle</span> 
                                        Tìm thấy {scrapeResult.length} ưu đãi
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {scrapeResult.map((res, i) => (
                                            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex gap-4">
                                                    <img src={res.imageUrl} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-100" />
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-xs font-bold text-green-600 mb-1">{res.discountRate || 'Khám phá'}</span>
                                                        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">{res.title}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">{res.categoryTab}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                                    <span className="material-symbols-outlined text-6xl opacity-20 mb-4">robot_2</span>
                                    {isScraping ? "Bot đang chạy xuyên qua các thẻ HTML..." : "Kết quả cào dữ liệu sẽ hiển thị tại đây"}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => { setScrapeResult([]); setShowScraperModal(false); }}
                                className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold"
                            >
                                Đóng
                            </button>
                            <button
                                disabled={scrapeResult.length === 0}
                                onClick={handleSaveExtracted}
                                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-green-500/20"
                            >
                                Lưu ({scrapeResult.length}) Dữ Liệu Này
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
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
                                <button
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
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                >
                                    Lưu Dữ Liệu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
