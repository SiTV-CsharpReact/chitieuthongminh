"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cardApi, categoryApi, imageApi } from '@/services/api';
import { BankScraperModal } from '@/components/BankScraperModal';
import { AdminCardForm } from './AdminCardForm';
import { Card as CreditCard, CashbackRule, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminButton from '@/components/Admin/AdminButton';
import { cleanCardName } from '@/lib/utils';
import { PortraitCardVisual } from '@/components/PortraitCardVisual';

export default function AdminCardsPage() {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCard, setCurrentCard] = useState<CreditCard | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isScraperOpen, setIsScraperOpen] = useState(false);


    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [bankFilter, setBankFilter] = useState('All');
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            const [cardsData, categoriesData] = await Promise.all([
                cardApi.getAll(),
                categoryApi.getAll()
            ]);
            setCards(cardsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const filteredCards = cards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.bank.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBank = bankFilter === 'All' || card.bank === bankFilter;
        return matchesSearch && matchesBank;
    });

    const totalPages = Math.ceil(filteredCards.length / pageSize);
    const paginatedCards = filteredCards.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const banks = Array.from(new Set(cards.map(c => c.bank)));

    const handleBulkSaveCards = async (cardsToSave: any[]) => {
        setIsLoading(true);
        try {
            for (const card of cardsToSave) {
                await cardApi.create(card);
            }
            alert(`Đã lưu thành công ${cardsToSave.length} thẻ mới!`);
            fetchCards();
            setIsScraperOpen(false);
        } catch (error) {
            console.error('Failed to bulk save cards:', error);
            alert('Có lỗi xảy ra khi lưu thẻ đồng loạt.');
        } finally {
            setIsLoading(false);
        }
    };






    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
        try {
            await cardApi.delete(id);
            setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
            fetchCards();
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} thẻ đã chọn?`)) return;
        setIsLoading(true);
        try {
            await Promise.all(Array.from(selectedIds).map(id => cardApi.delete(id)));
            setSelectedIds(new Set());
            fetchCards();
        } catch (error) {
            console.error('Error bulk deleting cards:', error);
            alert('Có lỗi xảy ra khi xóa hàng loạt.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedCards.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedCards.map(c => c.id!)));
        }
    };

    const openEdit = (card: CreditCard) => {
        setCurrentCard(card);
        setShowModal(true);
    };

    const openAdd = () => {
        setCurrentCard(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentCard(null);
    };




    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý thẻ tín dụng</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Hệ thống quản lý danh mục sản phẩm và chính sách ưu đãi</p>
                </div>
                <div className="flex gap-4">
                    <AdminButton
                        variant="outline"
                        onClick={() => {
                            setShowModal(false);
                            setIsScraperOpen(true);
                        }}
                        icon="travel_explore"
                    >
                        Clone từ Link
                    </AdminButton>
                    <AdminButton
                        onClick={openAdd}
                        icon="add"
                    >
                        Thêm thẻ mới
                    </AdminButton>
                </div>
            </div>

            {/* Bulk Action Toolbar */}
            <div className={`overflow-hidden transition-all duration-300 ease-out ${selectedIds.size > 0 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="flex items-center justify-between bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/25">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px]">check_box</span>
                        <span className="text-sm font-bold">Đã chọn <strong>{selectedIds.size}</strong> thẻ</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 transition-all"
                        >
                            Bỏ chọn
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 transition-all shadow-md disabled:opacity-60"
                        >
                            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                            Xóa {selectedIds.size} thẻ
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên thẻ hoặc ngân hàng..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <select
                        className="flex-1 lg:flex-none bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 cursor-pointer outline-none"
                        value={bankFilter}
                        onChange={(e) => setBankFilter(e.target.value)}
                    >
                        <option value="All">Ngân hàng: Tất cả</option>
                        {banks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select
                        className="flex-1 lg:flex-none bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 cursor-pointer outline-none"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={10}>Hiện 10</option>
                        <option value={20}>Hiện 20</option>
                        <option value={50}>Hiện 50</option>
                    </select>
                    <div className="px-5 py-3.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center border border-emerald-100 dark:border-emerald-900/30">
                        {filteredCards.length} KẾT QUẢ
                    </div>
                </div>
            </div>

            {/* Cards Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-5 py-2.5 w-12">
                                    <input
                                        type="checkbox"
                                        checked={paginatedCards.length > 0 && selectedIds.size === paginatedCards.length}
                                        ref={el => { if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < paginatedCards.length; }}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                    />
                                </th>
                                <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thẻ & Ngân hàng</th>
                                <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                                <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PTN</th>
                                <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Điều kiện</th>
                                <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hoàn tiền</th>
                                <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hạn mức hoàn</th>
                                <th className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedCards.map(card => (
                                <tr
                                    key={card.id}
                                    onDoubleClick={() => openEdit(card)}
                                    className={`group transition-all cursor-pointer ${selectedIds.has(card.id!)
                                        ? 'bg-blue-600/5 dark:bg-blue-600/10'
                                        : 'hover:bg-slate-50/30 dark:hover:bg-slate-800/20'
                                        }`}
                                >
                                    <td className="px-5 py-2.5.5">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(card.id!)}
                                            onChange={() => toggleSelect(card.id!)}
                                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-10 relative rounded shadow-sm overflow-hidden flex items-center justify-center">
                                                {card.imageUrl ? (
                                                    <PortraitCardVisual imageUrl={card.imageUrl} name={card.name} roundedClass="rounded" />
                                                ) : (
                                                    <div className="w-full h-full rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-slate-300 text-lg">credit_card</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight block">
                                                    {cleanCardName(card.name)}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        {card.status === 'Discontinued' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Ngừng phát hành
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Đang phát hành
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-gray-100">{card.annualFee.toLocaleString()}đ</span>
                                            <span className="text-[9px] text-slate-400 uppercase font-black">Mỗi năm</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        {card.requirement ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 group/req cursor-help relative" title={card.requirement}>
                                                <span className="material-symbols-outlined text-[14px] text-green-600 dark:text-green-400">task_alt</span>
                                                <span className="text-xs font-bold text-green-700 dark:text-green-300 max-w-[120px] truncate block">{card.requirement}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-1.5 relative group/cb w-full">
                                            {card.cashbackRules.slice(0, 1).map((rule, i) => {
                                                const categoryColor = categories.find(c => c.name === rule.category)?.color || '#6366f1';
                                                return (
                                                    <div key={i} className="px-2.5 py-1 flex-1 min-w-0 max-w-fit rounded-lg text-[10px] font-bold border flex items-center gap-1.5" style={{ backgroundColor: `${categoryColor}10`, color: categoryColor, borderColor: `${categoryColor}20` }}>
                                                        <span className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ backgroundColor: categoryColor }}></span>
                                                        <span className="truncate">{rule.category}: {rule.percentage}%</span>
                                                    </div>
                                                );
                                            })}
                                            {card.cashbackRules.length > 1 && (
                                                <span className="shrink-0 cursor-help inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-black rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                    +{card.cashbackRules.length - 1}
                                                </span>
                                            )}

                                            {card.cashbackRules.length > 1 && (
                                                <div className="absolute left-0 top-full mt-1 hidden group-hover/cb:flex flex-col gap-1.5 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 min-w-[200px]">
                                                    <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Tất cả quy định ({card.cashbackRules.length})</div>
                                                    {card.cashbackRules.map((rule, i) => {
                                                        const categoryColor = categories.find(c => c.name === rule.category)?.color || '#6366f1';
                                                        return (
                                                            <div key={i} className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1.5" style={{ backgroundColor: `${categoryColor}10`, color: categoryColor, borderColor: `${categoryColor}20` }}>
                                                                <span className="w-1.5 h-1.5 shrink-0 rounded-full" style={{ backgroundColor: categoryColor }}></span>
                                                                {rule.category}: {rule.percentage}%
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex flex-col gap-1.5">
                                            {card.maxCashbackPerMonth ? (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 w-fit">
                                                    <span className="material-symbols-outlined text-[14px] text-orange-600 dark:text-orange-400">account_balance_wallet</span>
                                                    <span className="text-[11px] font-bold text-orange-700 dark:text-orange-300">{card.maxCashbackPerMonth.toLocaleString()}đ/tháng</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {card.cashbackRules.filter(r => r.capAmount).slice(0, 2).map((rule, i) => (
                                                        <div key={i} className="flex items-center gap-2 group/tip">
                                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                                {rule.category}: {rule.capAmount?.toLocaleString()}đ
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {card.cashbackRules.filter(r => r.capAmount).length === 0 && (
                                                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 italic">Chưa xác định</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5 text-right">
                                        <div className="flex justify-end gap-2 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            {card.registerUrl && (
                                                <a
                                                    href={card.registerUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-200/50 dark:border-emerald-500/20 hover:border-transparent transition-all shadow-sm active:scale-95"
                                                    title="Mở link đăng ký"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">link</span>
                                                </a>
                                            )}
                                            <AdminButton
                                                variant="ghost"
                                                onClick={() => openEdit(card)}
                                                icon="edit_square"
                                                size="sm"
                                                className="w-8 h-8 p-0"
                                                title="Chỉnh sửa chi tiết"
                                            />
                                            <AdminButton
                                                variant="outline"
                                                onClick={() => handleDelete(card.id!)}
                                                icon="delete"
                                                size="sm"
                                                className="w-8 h-8 p-0 text-red-500 border-red-100 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20"
                                                title="Xóa thẻ khỏi hệ thống"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Trang {currentPage} trên {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-all bg-white dark:bg-slate-800 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === page ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-700 transition-all bg-white dark:bg-slate-800 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AdminCardForm
                isOpen={showModal}
                onClose={closeModal}
                currentCard={currentCard}
                categories={categories}
                onSaveSuccess={() => {
                    fetchCards();
                    closeModal();
                }}
            />
            <BankScraperModal
                isOpen={isScraperOpen}
                onClose={() => setIsScraperOpen(false)}
                onSaveCards={handleBulkSaveCards}
            />
        </div>
    );
}
