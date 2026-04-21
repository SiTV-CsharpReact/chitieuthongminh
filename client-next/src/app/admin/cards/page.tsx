"use client";

import React, { useState, useEffect } from 'react';
import { cardApi, categoryApi } from '@/services/api';
import { BankScraperModal } from '@/components/BankScraperModal';
import { Card as CreditCard, CashbackRule, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AdminCardsPage() {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCard, setCurrentCard] = useState<CreditCard | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isScraperOpen, setIsScraperOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [bank, setBank] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [annualFee, setAnnualFee] = useState(0);
    const [minSalary, setMinSalary] = useState(0);
    const [cashbackRules, setCashbackRules] = useState<CashbackRule[]>([]);
    const [description, setDescription] = useState('');
    const [benefits, setBenefits] = useState<string[]>([]);
    const [link, setLink] = useState('');

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [bankFilter, setBankFilter] = useState('All');
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const cardData: CreditCard = {
            name,
            bank,
            bankName: bank, // Required property in Card type
            imageUrl,
            link,
            annualFee,
            minSalary,
            cashbackRules,
            description,
            benefits: benefits.length > 0 ? benefits : ["Thanh toán tiện lợi", "Bảo mật cao"]
        };

        try {
            if (isEditing && currentCard?.id) {
                await cardApi.update(currentCard.id, cardData);
            } else {
                await cardApi.create(cardData);
            }
            alert('Lưu thẻ thành công!');
            fetchCards();
            closeModal();
        } catch (error: any) {
            console.error('Error saving card:', error);
            alert('Có lỗi xảy ra khi lưu thẻ: ' + (error.message || 'Kiểm tra lại dữ liệu nhập.'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
        try {
            await cardApi.delete(id);
            fetchCards();
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const openEdit = (card: CreditCard) => {
        setIsEditing(true);
        setCurrentCard(card);
        setName(card.name);
        setBank(card.bank || card.bankName || '');
        setImageUrl(card.imageUrl || '');
        setAnnualFee(card.annualFee || 0);
        setMinSalary(card.minSalary || 0);
        setCashbackRules(card.cashbackRules || []);
        setDescription(card.description || '');
        setBenefits(card.benefits || []);
        setLink(card.link || '');
        setShowModal(true);
    };

    const openAdd = () => {
        setIsEditing(false);
        setCurrentCard(null);
        setName('');
        setBank('');
        setImageUrl('');
        setAnnualFee(0);
        setMinSalary(0);
        setCashbackRules([{ category: 'Tất cả', percentage: 1 }]);
        setDescription('');
        setBenefits([]);
        setLink('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentCard(null);
    };

    const addCashbackRule = () => {
        setCashbackRules([...cashbackRules, { category: '', percentage: 0 }]);
    };

    const updateCashbackRule = (index: number, field: keyof CashbackRule, value: any) => {
        const updated = [...cashbackRules];
        updated[index] = { ...updated[index], [field]: value };
        setCashbackRules(updated);
    };

    const removeCashbackRule = (index: number) => {
        setCashbackRules(cashbackRules.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý thẻ tín dụng</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Hệ thống quản lý danh mục sản phẩm và chính sách ưu đãi</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            setShowModal(false);
                            setIsScraperOpen(true);
                        }}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 px-6 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px] text-primary-500">travel_explore</span>
                        Clone từ Link
                    </button>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Thêm thẻ mới
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 mb-8 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên thẻ hoặc ngân hàng..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <select
                        className="flex-1 lg:flex-none bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none"
                        value={bankFilter}
                        onChange={(e) => setBankFilter(e.target.value)}
                    >
                        <option value="All">Ngân hàng: Tất cả</option>
                        {banks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select
                        className="flex-1 lg:flex-none bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl py-3.5 px-5 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none"
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
                    <div className="px-5 py-3.5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 flex items-center border border-indigo-100 dark:border-indigo-900/30">
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
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thẻ & Ngân hàng</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phí thường niên</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Yêu cầu lương</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hoàn tiền tiêu biểu</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hạn mức hoàn</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedCards.map(card => (
                                <tr key={card.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-20 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm p-1">
                                                {card.imageUrl ? (
                                                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-300 text-xl">credit_card</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{card.name}</p>
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{card.bank}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900 dark:text-gray-100">{card.annualFee.toLocaleString()}đ</span>
                                            <span className="text-[9px] text-slate-400 uppercase font-black">Mỗi năm</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {card.minSalary && card.minSalary > 0 ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                                                <span className="material-symbols-outlined text-[14px] text-green-600 dark:text-green-400">payments</span>
                                                <span className="text-xs font-bold text-green-700 dark:text-green-300">{(card.minSalary / 1000000).toLocaleString()}M+</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-wrap gap-2">
                                            {card.cashbackRules.slice(0, 2).map((rule, i) => {
                                                const categoryColor = categories.find(c => c.name === rule.category)?.color || '#6366f1';
                                                return (
                                                    <div key={i} className="px-3 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1.5" style={{ backgroundColor: `${categoryColor}10`, color: categoryColor, borderColor: `${categoryColor}20` }}>
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }}></span>
                                                        {rule.category}: {rule.percentage}%
                                                    </div>
                                                );
                                            })}
                                            {card.cashbackRules.length > 2 && (
                                                <span className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg">+{card.cashbackRules.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="space-y-1.5">
                                            {card.cashbackRules.filter(r => r.capAmount).slice(0, 2).map((rule, i) => (
                                                <div key={i} className="flex items-center gap-2 group/tip">
                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                        {rule.category}: {rule.capAmount?.toLocaleString()}đ
                                                    </span>
                                                </div>
                                            ))}
                                            {card.cashbackRules.filter(r => r.capAmount).length === 0 && (
                                                <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 italic">Không giới hạn hoàn</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            <button
                                                onClick={() => openEdit(card)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
                                                title="Chỉnh sửa chi tiết"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit_square</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(card.id!)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:shadow-xl hover:shadow-red-500/10 transition-all border border-transparent hover:border-red-100 dark:border-red-900/40"
                                                title="Xóa thẻ khỏi hệ thống"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
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
                                    className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all ${currentPage === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500'}`}
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

            {/* Modal */}
            <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
                <DialogContent className="max-w-4xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800 p-0 gap-0 shadow-2xl">
                    <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-left shrink-0">
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {isEditing ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-[80vh] overflow-y-auto scrollbar-hide">
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên thẻ</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        placeholder="Ví dụ: HSBC Visa Platinum"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ngân hàng</label>
                                    <input
                                        type="text"
                                        value={bank}
                                        onChange={e => setBank(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        placeholder="HSBC, Techcombank..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">URL Hình ảnh</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-mono"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">URL Chi tiết thẻ</label>
                                    <input
                                        type="text"
                                        value={link}
                                        onChange={e => setLink(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-mono"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phí thường niên</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={annualFee}
                                            onChange={e => setAnnualFee(Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 pl-10 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₫</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Yêu cầu lương tối thiểu</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={minSalary}
                                            onChange={e => setMinSalary(Number(e.target.value))}
                                            placeholder="0 = không yêu cầu"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 pl-10 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-green-500 transition-all outline-none"
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₫</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mô tả thẻ</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        placeholder="Mô tả chi tiết về đặc quyền thẻ..."
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lợi ích thẻ (Mỗi dòng một lợi ích)</label>
                                    <textarea
                                        value={benefits.join('\n')}
                                        onChange={e => setBenefits(e.target.value.split('\n').filter(s => s.trim() !== ''))}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl p-4 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                        placeholder="Thanh toán tiện lợi&#10;Bảo mật cao"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chính sách hoàn tiền (Cashback Rule)</label>
                                    <button
                                        type="button"
                                        onClick={addCashbackRule}
                                        className="text-indigo-600 dark:text-indigo-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add_circle</span> Thêm Rule
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {cashbackRules.length === 0 && (
                                        <div className="p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center text-slate-400">
                                            Chưa có chính sách hoàn tiền nào được bóc tách
                                        </div>
                                    )}
                                    {cashbackRules.map((rule, index) => (
                                        <div key={index} className="flex gap-3 items-start bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800 hover:ring-indigo-500/30 transition-all">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex gap-3">
                                                    <select
                                                        value={rule.category}
                                                        onChange={e => updateCashbackRule(index, 'category', e.target.value)}
                                                        className="flex-1 bg-white dark:bg-slate-900 border-0 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    >
                                                        <option value="">-- Chọn danh mục --</option>
                                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                        <option value="Tất cả">Tất cả chi tiêu</option>
                                                        <option value="Khác">Khác / Tự động bóc</option>
                                                    </select>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={rule.percentage}
                                                            placeholder="0"
                                                            step="0.1"
                                                            onChange={e => updateCashbackRule(index, 'percentage', Number(e.target.value))}
                                                            className="w-16 bg-white dark:bg-slate-900 border-0 rounded-xl px-3 py-2.5 text-[11px] font-black text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-right outline-none"
                                                        />
                                                        <span className="text-slate-400 font-black text-[11px] tracking-widest">%</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Hạn mức hoàn tối đa (VNĐ):</span>
                                                    <input
                                                        type="number"
                                                        value={rule.capAmount || ''}
                                                        placeholder="Vd: 500000"
                                                        onChange={e => updateCashbackRule(index, 'capAmount', e.target.value ? Number(e.target.value) : undefined)}
                                                        className="flex-1 bg-white dark:bg-slate-900 border-0 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeCashbackRule(index)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 border border-slate-100 dark:border-slate-800 hover:border-red-100 transition-all shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
                                >
                                    {isEditing ? 'Lưu thay đổi cập nhật' : 'Khởi tạo thẻ ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
            <BankScraperModal
                isOpen={isScraperOpen}
                onClose={() => setIsScraperOpen(false)}
                onSaveCards={handleBulkSaveCards}
            />
        </div>
    );
}
