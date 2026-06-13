"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cardApi, imageApi } from '@/services/api';
import { Card as CreditCard, CashbackRule, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminButton from '@/components/Admin/AdminButton';
import { cleanCardName } from '@/lib/utils';
import { PortraitCardVisual } from '@/components/PortraitCardVisual';

interface AdminCardFormProps {
    isOpen: boolean;
    onClose: () => void;
    currentCard: CreditCard | null;
    categories: Category[];
    onSaveSuccess: () => void;
}

export function AdminCardForm({ isOpen, onClose, currentCard, categories, onSaveSuccess }: AdminCardFormProps) {
    const isEditing = !!currentCard;
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
    const [minSpendForCashback, setMinSpendForCashback] = useState<number | ''>('');
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
    const [termsPdfUrl, setTermsPdfUrl] = useState('');
    const [ratings, setRatings] = useState({
        cashback: 0,
        annualFee: 0,
        spendFit: 0,
        offer: 0,
        incomeRequirement: 0,
        overall: 0
    });

    useEffect(() => {
        if (isOpen) {
            if (currentCard) {
                setName(currentCard.name || '');
                setBank(currentCard.bank || currentCard.bankName || '');
                setBankLogo(currentCard.bankLogo || '');
                setImageUrl(currentCard.imageUrl || '');
                setAnnualFee(currentCard.annualFee ?? '');
                setMinSalary(currentCard.minSalary ?? '');
                setRequirement(currentCard.requirement || '');
                setWelcomeOffer(currentCard.welcomeOffer || '');
                setStatus(currentCard.status || 'Active');
                setMaxCashbackPerMonth(currentCard.maxCashbackPerMonth ?? '');
                setMinSpendForCashback(currentCard.minSpendForCashback ?? '');
                setCashbackRules(currentCard.cashbackRules || []);
                setDescription(currentCard.description || '');
                setBenefits(currentCard.benefits || []);
                setPros(currentCard.pros || []);
                setCons(currentCard.cons || []);
                setTags(currentCard.tags || []);
                setLink(currentCard.link || '');
                setRegisterUrl(currentCard.registerUrl || '');
                setTermsPdfUrl(currentCard.termsPdfUrl || '');
                setRatings(currentCard.ratings || {
                    cashback: 0,
                    annualFee: 0,
                    spendFit: 0,
                    offer: 0,
                    incomeRequirement: 0,
                    overall: 0
                });
            } else {
                setName('');
                setBank('');
                setBankLogo('');
                setImageUrl('');
                setAnnualFee('');
                setMinSalary('');
                setRequirement('');
                setWelcomeOffer('');
                setStatus('Active');
                setMaxCashbackPerMonth('');
                setMinSpendForCashback('');
                setCashbackRules([{ category: 'Tất cả', percentage: 1 }]);
                setDescription('');
                setBenefits([]);
                setPros([]);
                setCons([]);
                setTags([]);
                setLink('');
                setRegisterUrl('');
                setTermsPdfUrl('');
                setRatings({
                    cashback: 0,
                    annualFee: 0,
                    spendFit: 0,
                    offer: 0,
                    incomeRequirement: 0,
                    overall: 0
                });
            }
        }
    }, [isOpen, currentCard]);

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
            termsPdfUrl,
            annualFee: annualFee === '' ? 0 : Number(annualFee),
            minSalary: minSalary === '' ? 0 : Number(minSalary),
            requirement,
            welcomeOffer,
            status,
            maxCashbackPerMonth: maxCashbackPerMonth === '' ? undefined : Number(maxCashbackPerMonth),
            minSpendForCashback: minSpendForCashback === '' ? undefined : Number(minSpendForCashback),
            cashbackRules,
            description,
            benefits: benefits.filter(s => s.trim() !== '').length > 0 ? benefits.filter(s => s.trim() !== '') : ["Thanh toán tiện lợi", "Bảo mật cao"],
            pros: pros.filter(s => s.trim() !== ''),
            cons: cons.filter(s => s.trim() !== ''),
            tags: tags.filter(s => s.trim() !== ''),
            ratings: {
                ...ratings,
                overall: Number(((ratings.cashback + ratings.annualFee + ratings.spendFit + ratings.offer + ratings.incomeRequirement) / 5).toFixed(1))
            }
        } as CreditCard;

        try {
            if (isEditing && currentCard?.id) {
                await cardApi.update(currentCard.id, cardData);
            } else {
                await cardApi.create(cardData);
            }
            alert('Lưu thẻ thành công!');
            onSaveSuccess();
        } catch (error: any) {
            console.error('Error saving card:', error);
            alert('Có lỗi xảy ra khi lưu thẻ: ' + (error.message || 'Kiểm tra lại dữ liệu nhập.'));
        }
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
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
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
                        <form id="cardForm" onSubmit={handleSave} className="p-5 flex flex-col xl:flex-row gap-5 pb-8 items-start">
                            <div className="flex-1 min-w-0 space-y-3 w-full">
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
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Chi tiêu tối thiểu / tháng</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={minSpendForCashback !== '' ? minSpendForCashback.toLocaleString('vi-VN') : ''}
                                                    onChange={e => {
                                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                                        setMinSpendForCashback(numericValue ? Number(numericValue) : '');
                                                    }}
                                                    placeholder="Vd: 5000000"
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 pl-9 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
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
                                                    <div className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-500 group-hover:scale-105">
                                                        <PortraitCardVisual imageUrl={imageUrl} name={name || 'Card Preview'} roundedClass="rounded-xl" />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
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
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                                Link Thể lệ (PDF)
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type="url"
                                                    value={termsPdfUrl}
                                                    onChange={e => setTermsPdfUrl(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-lg px-3 py-2 pr-[85px] text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-red-500 transition-all outline-none font-mono"
                                                    placeholder="https://.../the-le.pdf"
                                                />
                                                {termsPdfUrl && (
                                                    <a href={termsPdfUrl} target="_blank" rel="noopener noreferrer" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-red-600 dark:text-red-400 font-bold hover:underline bg-slate-50 dark:bg-slate-800 px-1 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[12px]">picture_as_pdf</span> Xem PDF
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
                            </div> {/* End left col */}

                            {/* Right col */}
                            <div className="w-full xl:w-[250px] shrink-0 space-y-3">
                                <div className="p-4 rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/10 space-y-2">
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

                                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 space-y-4">
                                    <div className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                                        <span className="material-symbols-outlined text-[16px]">star</span> Mức độ phù hợp
                                    </div>
                                    <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hoàn tiền</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={ratings.cashback}
                                                onChange={e => setRatings({ ...ratings, cashback: Number(e.target.value) })}
                                                className="w-full bg-white dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phí thường niên</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={ratings.annualFee}
                                                onChange={e => setRatings({ ...ratings, annualFee: Number(e.target.value) })}
                                                className="w-full bg-white dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phù hợp chi tiêu</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={ratings.spendFit}
                                                onChange={e => setRatings({ ...ratings, spendFit: Number(e.target.value) })}
                                                className="w-full bg-white dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ưu đãi mở thẻ</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={ratings.offer}
                                                onChange={e => setRatings({ ...ratings, offer: Number(e.target.value) })}
                                                className="w-full bg-white dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Điều kiện thu nhập</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="5"
                                                value={ratings.incomeRequirement}
                                                onChange={e => setRatings({ ...ratings, incomeRequirement: Number(e.target.value) })}
                                                className="w-full bg-white dark:bg-slate-800 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tổng quan (Tự động tính)</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={Number(((ratings.cashback + ratings.annualFee + ratings.spendFit + ratings.offer + ratings.incomeRequirement) / 5).toFixed(1))}
                                                    disabled
                                                    className="w-full bg-slate-100 dark:bg-slate-800/50 border-0 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                                                />
                                                <span className="text-xs text-slate-400">/ 5</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> {/* End right col */}
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
    );
}
