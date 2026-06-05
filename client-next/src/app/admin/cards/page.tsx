"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cardApi, categoryApi, imageApi } from '@/services/api';
import { BankScraperModal } from '@/components/BankScraperModal';
import { Card as CreditCard, CashbackRule, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminButton from '@/components/Admin/AdminButton';
import { cleanCardName } from '@/lib/utils';

export default function AdminCardsPage() {
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCard, setCurrentCard] = useState<CreditCard | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isScraperOpen, setIsScraperOpen] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [bank, setBank] = useState('');
    const [bankLogo, setBankLogo] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [annualFee, setAnnualFee] = useState<number | ''>('');
    const [minSalary, setMinSalary] = useState<number | ''>('');
    const [requirement, setRequirement] = useState('');
    const [maxCashbackPerMonth, setMaxCashbackPerMonth] = useState<number | ''>('');
    const [cashbackRules, setCashbackRules] = useState<CashbackRule[]>([]);
    const [welcomeOffer, setWelcomeOffer] = useState('');
    const [status, setStatus] = useState('Active');
    const [description, setDescription] = useState('');
    const [benefits, setBenefits] = useState<string[]>([]);
    const [pros, setPros] = useState<string[]>([]);
    const [cons, setCons] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [link, setLink] = useState('');
    const [registerUrl, setRegisterUrl] = useState('');

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

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const response = await imageApi.upload(file, 'cards');
            if (response.success && response.files && response.files.length > 0) {
                setImageUrl(response.files[0].url);
            } else {
                alert('Tải ảnh thất bại');
            }
        } catch (err: any) {
            console.error(err);
            alert('Tải ảnh thất bại: ' + (err.message || 'Lỗi kết nối'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await handleFileUpload(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (!file.type.startsWith('image/')) {
                alert('Chỉ cho phép tải lên file ảnh!');
                return;
            }
            await handleFileUpload(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const cardData: CreditCard = {
            ...currentCard,
            name: cleanCardName(name),
            bank,
            bankName: bank, // Required property in Card type
            bankLogo,
            imageUrl,
            link,
            registerUrl,
            annualFee: annualFee === '' ? 0 : Number(annualFee),
            minSalary: minSalary === '' ? 0 : Number(minSalary),
            requirement,
            welcomeOffer,
            status,
            maxCashbackPerMonth: maxCashbackPerMonth === '' ? undefined : Number(maxCashbackPerMonth),
            cashbackRules,
            description,
            benefits: benefits.filter(s => s.trim() !== '').length > 0 ? benefits.filter(s => s.trim() !== '') : ["Thanh toán tiện lợi", "Bảo mật cao"],
            pros: pros.filter(s => s.trim() !== ''),
            cons: cons.filter(s => s.trim() !== ''),
            tags: tags.filter(s => s.trim() !== '')
        } as CreditCard;

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
        setIsEditing(true);
        setCurrentCard(card);
        setName(card.name);
        setBank(card.bank || card.bankName || '');
        setBankLogo(card.bankLogo || '');
        setImageUrl(card.imageUrl || '');
        setAnnualFee(card.annualFee ?? '');
        setMinSalary(card.minSalary ?? '');
        setRequirement(card.requirement || '');
        setWelcomeOffer(card.welcomeOffer || '');
        setStatus(card.status || 'Active');
        setMaxCashbackPerMonth(card.maxCashbackPerMonth ?? '');
        setCashbackRules(card.cashbackRules || []);
        setDescription(card.description || '');
        setBenefits(card.benefits || []);
        setPros(card.pros || []);
        setCons(card.cons || []);
        setTags(card.tags || []);
        setLink(card.link || '');
        setRegisterUrl(card.registerUrl || '');
        setShowModal(true);
    };

    const openAdd = () => {
        setIsEditing(false);
        setCurrentCard(null);
        setName('');
        setBank('');
        setImageUrl('');
        setAnnualFee('');
        setMinSalary('');
        setRequirement('');
        setWelcomeOffer('');
        setStatus('Active');
        setMaxCashbackPerMonth('');
        setCashbackRules([{ category: 'Tất cả', percentage: 1 }]);
        setDescription('');
        setBenefits([]);
        setPros([]);
        setCons([]);
        setTags([]);
        setLink('');
        setRegisterUrl('');
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
                                <th className="px-4 py-2 w-12">
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
                                    <td className="px-4 py-2.5">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(card.id!)}
                                            onChange={() => toggleSelect(card.id!)}
                                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-10 flex items-center justify-center">
                                                {card.imageUrl ? (
                                                    <img
                                                        src={card.imageUrl}
                                                        alt={card.name}
                                                        className="max-h-full max-w-full object-contain rounded shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-slate-300 text-xl">credit_card</span>
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

            {/* Modal */}
            <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
                <DialogContent className="max-w-6xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800 p-0 gap-0 shadow-2xl">
                    <DialogHeader className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-left shrink-0 flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            {isEditing ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
                        </DialogTitle>
                        <AdminButton
                            type="submit"
                            form="cardForm"
                            className="px-5 py-2 rounded-lg text-xs mr-8"
                        >
                            {isEditing ? 'Lưu cập nhật' : 'Khởi tạo thẻ'}
                        </AdminButton>
                    </DialogHeader>

                    <div className="max-h-[80vh] overflow-y-auto scrollbar-hide">
                        <form id="cardForm" onSubmit={handleSave} className="p-5 space-y-3 pb-8">
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 space-y-2.5">
                                <div className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    Thông tin cơ bản
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-4 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tên thẻ</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                            placeholder="Ví dụ: HSBC Visa Platinum"
                                        />
                                    </div>
                                    <div className="md:col-span-4 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Ngân hàng</label>
                                        <input
                                            type="text"
                                            value={bank}
                                            onChange={e => setBank(e.target.value)}
                                            required
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                            placeholder="HSBC, Techcombank..."
                                        />
                                    </div>

                                    <div className="md:col-span-4 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Logo Ngân hàng (URL)</label>
                                        <input
                                            type="url"
                                            value={bankLogo}
                                            onChange={e => setBankLogo(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Trạng thái</label>
                                        <select
                                            value={status}
                                            onChange={e => setStatus(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none cursor-pointer"
                                        >
                                            <option value="Active">Đang phát hành</option>
                                            <option value="Discontinued">Ngừng phát hành</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phí thường niên</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={annualFee !== '' ? annualFee.toLocaleString('vi-VN') : ''}
                                                onChange={e => {
                                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                    setAnnualFee(numericValue ? Number(numericValue) : '');
                                                }}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 pl-9 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₫</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Hoàn tối đa / tháng</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={maxCashbackPerMonth !== '' ? maxCashbackPerMonth.toLocaleString('vi-VN') : ''}
                                                onChange={e => {
                                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                    setMaxCashbackPerMonth(numericValue ? Number(numericValue) : '');
                                                }}
                                                placeholder="Vd: 500000"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 pl-9 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₫</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Lương tối thiểu</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={minSalary !== '' ? minSalary.toLocaleString('vi-VN') : ''}
                                                onChange={e => {
                                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                    setMinSalary(numericValue ? Number(numericValue) : '');
                                                }}
                                                placeholder="Vd: 15000000"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 pl-9 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                            />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₫</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mt-2">
                                {/* Left: Image Upload */}
                                <div className="w-full md:w-72 shrink-0 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 space-y-2.5">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                                        Hình ảnh thẻ
                                    </div>

                                    {/* Or Input URL manually */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={imageUrl}
                                            onChange={e => setImageUrl(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-mono"
                                            placeholder="Hoặc nhập URL ảnh..."
                                        />
                                    </div>

                                    {/* Card Preview & Upload Zone */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        className={`relative w-full aspect-[1.58/1] rounded-2xl overflow-hidden cursor-pointer group border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800/40 ${imageUrl
                                            ? 'border-transparent shadow-md shadow-slate-200/50 dark:shadow-black/30'
                                            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400'
                                            }`}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="hidden"
                                        />

                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 animate-pulse">Đang tải...</p>
                                            </div>
                                        ) : imageUrl ? (
                                            <>
                                                <img
                                                    src={imageUrl}
                                                    alt="Card preview"
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <div className="bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 transform translate-y-1 group-hover:translate-y-0 transition-transform">
                                                        Đổi ảnh
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setImageUrl('');
                                                        }}
                                                        className="bg-red-500/90 hover:bg-red-600/90 text-white p-1.5 rounded-lg text-[10px] font-bold shadow-sm flex items-center justify-center transform translate-y-1 group-hover:translate-y-0 transition-transform"
                                                    >
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5 text-center select-none">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                                                    <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200">Tải ảnh lên</p>
                                                    <p className="text-[9px] text-slate-400">Hoặc kéo thả</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Links */}
                                <div className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 space-y-2.5">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                                        Liên kết & Mô tả
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                            URL Chi tiết thẻ
                                        </label>
                                        <input
                                            type="text"
                                            value={link}
                                            onChange={e => setLink(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-mono"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                            Link Đăng ký thẻ (Register URL)
                                        </label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="url"
                                                value={registerUrl}
                                                onChange={e => setRegisterUrl(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 pr-[85px] text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-green-500 transition-all outline-none font-mono"
                                                placeholder="https://cards.vpbank.com.vn/basic-details/..."
                                            />
                                            {registerUrl && (
                                                <a href={registerUrl} target="_blank" rel="noopener noreferrer" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-green-600 dark:text-green-400 font-bold hover:underline bg-slate-50 dark:bg-slate-800 px-1">
                                                    Kiểm tra link
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mô tả thẻ</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                            placeholder="Mô tả chi tiết về đặc quyền thẻ..."
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 space-y-2">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                                        Điều kiện mở thẻ
                                    </div>
                                    <textarea
                                        value={requirement}
                                        onChange={e => setRequirement(e.target.value)}
                                        placeholder="Ví dụ: Lương chuyển khoản từ 15 triệu/tháng..."
                                        rows={2}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 space-y-2">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                                        Quà chào mừng mở thẻ
                                    </div>
                                    <textarea
                                        value={welcomeOffer}
                                        onChange={e => setWelcomeOffer(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        placeholder="Ví dụ: Tặng vali cao cấp, hoàn 500k khi chi tiêu..."
                                        rows={1}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mt-2">
                                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 space-y-2">
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                                        Lợi ích thẻ (Mỗi dòng một lợi ích)
                                    </div>
                                    <textarea
                                        value={benefits.join('\n')}
                                        onChange={e => setBenefits(e.target.value.split('\n'))}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        placeholder="Thanh toán tiện lợi&#10;Bảo mật cao"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 space-y-2">
                                    <div className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Ưu điểm (Mỗi dòng một ý)
                                    </div>
                                    <textarea
                                        value={pros.join('\n')}
                                        onChange={e => setPros(e.target.value.split('\n'))}
                                        className="w-full bg-white dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-emerald-200 dark:ring-emerald-800 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        placeholder="Ví dụ: Hoàn tiền nhanh chóng&#10;Nhiều ưu đãi tại siêu thị"
                                        rows={3}
                                    />
                                </div>
                                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 space-y-2">
                                    <div className="text-xs font-black uppercase tracking-widest text-red-700 dark:text-red-400 flex items-center gap-1.5 mb-2">
                                        <span className="material-symbols-outlined text-[16px]">cancel</span> Nhược điểm (Mỗi dòng một ý)
                                    </div>
                                    <textarea
                                        value={cons.join('\n')}
                                        onChange={e => setCons(e.target.value.split('\n'))}
                                        className="w-full bg-white dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-red-200 dark:ring-red-800 focus:ring-2 focus:ring-red-500 transition-all outline-none"
                                        placeholder="Ví dụ: Phí thường niên cao&#10;Chỉ áp dụng vài danh mục"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/10 space-y-2 mt-2">
                                <div className="text-xs font-black uppercase tracking-widest text-violet-700 dark:text-violet-400 flex items-center gap-1.5 mb-2">
                                    <span className="material-symbols-outlined text-[16px]">label</span> Phân loại đối tượng
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Sinh viên', 'Người đi làm', 'Gia đình', 'Doanh nghiệp'].map(audience => {
                                        const isSelected = tags.includes(audience);
                                        return (
                                            <button
                                                key={audience}
                                                type="button"
                                                onClick={() => setTags(prev => isSelected ? prev.filter(t => t !== audience) : [...prev, audience])}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'bg-violet-500 text-white border-violet-600 shadow-md shadow-violet-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400'}`}
                                            >
                                                {audience}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 space-y-2.5 mt-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        Chính sách hoàn tiền (Cashback Rule)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addCashbackRule}
                                        className="text-emerald-600 dark:text-emerald-400 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-transform"
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
                                        <div key={index} className="flex gap-3 items-center bg-white dark:bg-slate-800/20 p-2 rounded-xl ring-1 ring-slate-100 dark:ring-slate-800 transition-all">
                                            <span className="material-symbols-outlined text-slate-400 text-[16px] cursor-grab active:cursor-grabbing px-1">drag_indicator</span>

                                            <select
                                                value={rule.category}
                                                onChange={e => updateCashbackRule(index, 'category', e.target.value)}
                                                className="flex-[4] min-w-0 bg-slate-50 dark:bg-slate-900 border-0 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                                            >
                                                <option value="">-- Chọn danh mục --</option>
                                                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                <option value="Tất cả">Tất cả chi tiêu</option>
                                                <option value="Khác">Khác / Tự động bóc</option>
                                            </select>

                                            <div className="flex-[3] min-w-0 flex items-center bg-slate-50 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500">
                                                <span className="text-slate-400 font-black text-[11px] mr-3">%</span>
                                                <input
                                                    type="number"
                                                    value={rule.percentage}
                                                    placeholder="0"
                                                    step="0.1"
                                                    onChange={e => updateCashbackRule(index, 'percentage', Number(e.target.value))}
                                                    className="w-full bg-transparent border-0 text-[11px] font-black text-slate-900 dark:text-white outline-none"
                                                />
                                            </div>

                                            <div className="flex-[4] min-w-0 flex items-center bg-slate-50 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-3 shrink-0 hidden sm:block">Tối đa</span>
                                                <span className="text-slate-400 font-black text-[11px] mr-2 shrink-0">₫</span>
                                                <input
                                                    type="text"
                                                    value={rule.capAmount ? rule.capAmount.toLocaleString('vi-VN') : ''}
                                                    placeholder="Không giới hạn"
                                                    onChange={e => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                        updateCashbackRule(index, 'capAmount', numericValue ? Number(numericValue) : undefined);
                                                    }}
                                                    className="w-full bg-transparent border-0 text-[11px] font-bold text-slate-900 dark:text-white outline-none"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeCashbackRule(index)}
                                                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 border border-transparent hover:border-red-200 dark:hover:border-red-900/60 transition-all ml-1"
                                                title="Xóa rule này"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
