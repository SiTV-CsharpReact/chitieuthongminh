import React, { useState, useEffect } from 'react';
import { cardApi, categoryApi } from '../services/api';
import { BankScraperModal } from '../components/BankScraperModal';
import { Card as CreditCard, CashbackRule, Category } from '../types';

const AdminCards: React.FC = () => {
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
    const [cashbackRules, setCashbackRules] = useState<CashbackRule[]>([]);
    const [description, setDescription] = useState('');
    const [benefits, setBenefits] = useState<string[]>([]);

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [bankFilter, setBankFilter] = useState('All');
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const cardData: CreditCard = {
            name,
            bank,
            bankName: bank, // Required property in Card type
            imageUrl,
            annualFee,
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
            fetchCards();
            closeModal();
        } catch (error) {
            console.error('Error saving card:', error);
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
        setBank(card.bank);
        setImageUrl(card.imageUrl || '');
        setAnnualFee(card.annualFee);
        setCashbackRules(card.cashbackRules);
        setDescription(card.description || '');
        setBenefits(card.benefits || []);
        setShowModal(true);
    };

    const openAdd = () => {
        setIsEditing(false);
        setCurrentCard(null);
        setName('');
        setBank('');
        setImageUrl('');
        setAnnualFee(0);
        setCashbackRules([{ category: 'Tất cả', percentage: 1 }]);
        setDescription('');
        setBenefits([]);
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
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quản lý thẻ tín dụng</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Hệ thống quản lý thông tin thẻ và chính sách hoàn tiền</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm thẻ mới
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 mb-6 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full text-slate-400">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">search</span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên thẻ hoặc ngân hàng..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        className="bg-slate-50 dark:bg-slate-800 border-0 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        value={bankFilter}
                        onChange={(e) => setBankFilter(e.target.value)}
                    >
                        <option value="All">Tất cả ngân hàng</option>
                        {banks.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select
                        className="bg-slate-50 dark:bg-slate-800 border-0 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={10}>10 dòng</option>
                        <option value={20}>20 dòng</option>
                        <option value={50}>50 dòng</option>
                        <option value={cards.length || 100}>Hiện tất cả</option>
                    </select>
                    <div className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center">
                        {filteredCards.length} THẺ
                    </div>
                </div>
            </div>

            {/* Cards Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Thẻ & Ngân hàng</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Phí thường niên</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 font-sans">Chính sách hoàn tiền</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Tiền hoàn tối đa</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 text-right font-sans">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedCards.map(card => (
                                <tr key={card.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                                                {card.imageUrl ? (
                                                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">credit_card</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-0.5">{card.name}</p>
                                                <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{card.bank}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="text-[13px] font-bold text-slate-900 dark:text-white">{card.annualFee.toLocaleString()}đ</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {card.cashbackRules.slice(0, 3).map((rule, i) => {
                                                const categoryColor = categories.find(c => c.name === rule.category)?.color || '#3b82f6';
                                                return (
                                                    <div key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ backgroundColor: `${categoryColor}15`, color: categoryColor, borderColor: `${categoryColor}30` }}>
                                                        {rule.category}: {rule.percentage}%
                                                    </div>
                                                );
                                            })}
                                            {card.cashbackRules.length > 3 && (
                                                <span className="text-[10px] font-bold text-slate-400">+{card.cashbackRules.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="space-y-1">
                                            {card.cashbackRules.filter(r => r.capAmount).slice(0, 2).map((rule, i) => (
                                                <p key={i} className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                    <span className="text-slate-300 dark:text-slate-600 mr-1">•</span>
                                                    {rule.category}: {rule.capAmount?.toLocaleString()}đ
                                                </p>
                                            ))}
                                            {card.cashbackRules.filter(r => r.capAmount).length === 0 && (
                                                <span className="text-[10px] font-medium text-slate-300 dark:text-slate-600 italic">Không giới hạn</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button
                                                onClick={() => openEdit(card)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-primary-500 hover:shadow-md transition-all"
                                                title="Chỉnh sửa"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit_square</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(card.id!)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 lg:group-hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
                                                title="Xóa"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
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
                    <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Hiển thị {Math.min(filteredCards.length, (currentPage - 1) * pageSize + 1)} - {Math.min(filteredCards.length, currentPage * pageSize)} trong {filteredCards.length}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === page ? 'bg-primary-500 text-white shadow-md' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-800 border border-transparent'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {cards.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 mt-10">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">credit_card_off</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chưa có thẻ nào được thêm</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Bắt đầu xây dựng cơ sở dữ liệu thẻ của bạn để cung cấp các gợi ý hoàn tiền chính xác cho người dùng.</p>
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-3xl font-bold shadow-xl shadow-primary-500/25 transition-all hover:-translate-y-1"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Thêm thẻ đầu tiên
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isEditing ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}
                            </h2>
                            <button onClick={closeModal} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Tên thẻ</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl p-3 text-xs text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="Ví dụ: HSBC Visa Platinum"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Ngân hàng</label>
                                    <input
                                        type="text"
                                        value={bank}
                                        onChange={e => setBank(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl p-3 text-xs text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="HSBC, Techcombank..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">URL Hình ảnh</label>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsScraperOpen(true)}
                                            className="text-primary-500 hover:text-primary-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                            Clone từ VIB
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl p-3 text-xs text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Phí thường niên</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={annualFee}
                                            onChange={e => setAnnualFee(Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-xl p-3 pl-8 text-xs text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 transition-all"
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">đ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">Chính sách hoàn tiền</label>
                                    <button
                                        type="button"
                                        onClick={addCashbackRule}
                                        className="text-primary-600 dark:text-primary-400 text-[11px] font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">add_circle</span> Thêm
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {cashbackRules.map((rule, index) => (
                                        <div key={index} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 transition-all">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex gap-2">
                                                    <select
                                                        value={rule.category}
                                                        onChange={e => updateCashbackRule(index, 'category', e.target.value)}
                                                        className="flex-1 bg-white dark:bg-slate-900 border-0 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500"
                                                    >
                                                        <option value="">Chọn danh mục</option>
                                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                        <option value="Khác">Khác</option>
                                                    </select>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={rule.percentage}
                                                            placeholder="%"
                                                            step="0.1"
                                                            onChange={e => updateCashbackRule(index, 'percentage', Number(e.target.value))}
                                                            className="w-12 bg-white dark:bg-slate-900 border-0 rounded-lg px-2 py-1.5 text-[11px] text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 text-right"
                                                        />
                                                        <span className="text-slate-400 font-bold text-[11px]">%</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tiền hoàn tối đa:</span>
                                                    <input
                                                        type="number"
                                                        value={rule.capAmount || ''}
                                                        placeholder="Vd: 500000"
                                                        onChange={e => updateCashbackRule(index, 'capAmount', e.target.value ? Number(e.target.value) : undefined)}
                                                        className="flex-1 bg-white dark:bg-slate-900 border-0 rounded-lg px-3 py-1 text-[10px] text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeCashbackRule(index)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    className="w-full bg-primary-500 hover:bg-primary-600 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-xl shadow-primary-500/25 transition-all active:scale-[0.98]"
                                >
                                    {isEditing ? 'Lưu thay đổi' : 'Tạo thẻ ngay'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <BankScraperModal 
                isOpen={isScraperOpen} 
                onClose={() => setIsScraperOpen(false)} 
                onSelectImage={(url, cardName) => {
                    setImageUrl(url);
                    if (!name) setName(cardName);
                    if (!bank) setBank('VIB');
                    setIsScraperOpen(false);
                }} 
                onSelectCashback={(info) => {
                    if (info.suggestedPercentage != null) {
                        setCashbackRules(prev => [...prev, {
                            category: 'Tự động bóc',
                            percentage: info.suggestedPercentage!,
                            capAmount: info.suggestedCap
                        }]);
                    }
                    if (info.text) {
                        setBenefits(prev => [...prev, info.text]);
                    }
                }}
            />
        </div>
    );
};

export default AdminCards;
