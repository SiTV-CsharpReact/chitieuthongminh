"use client";

import React, { useState, useEffect } from 'react';
import { scraperApi } from '@/services/api';

interface CashbackInfo {
    text: string;
    suggestedPercentage?: number;
    suggestedCap?: number;
}

interface ScrapedCard {
    id: string; // Internal temporary ID
    cardName: string;
    imageUrl?: string;
    cashbackInfos: CashbackInfo[];
    annualFee?: number;
    minSalary?: number;
}

interface BankScraperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveCards: (cards: any[]) => void;
}

export const BankScraperModal: React.FC<BankScraperModalProps> = ({ isOpen, onClose, onSaveCards }) => {
    const [url, setUrl] = useState('');
    const [bankName, setBankName] = useState('VIB');
    const [supportedBanks, setSupportedBanks] = useState<{bankName: string, url: string}[]>([]);
    
    // Extracted Data
    const [extractedCards, setExtractedCards] = useState<ScrapedCard[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [scrapedHost, setScrapedHost] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [progressLabel, setProgressLabel] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && supportedBanks.length === 0) {
            loadBanks();
        }
    }, [isOpen]);

    const loadBanks = async () => {
        setIsLoading(true);
        setError('');
        try {
            const banksData = await scraperApi.getSupportedBanks();
            setSupportedBanks(banksData);
        } catch (err: any) {
            setError(err.message || 'Không thể lấy dữ liệu mặc định từ ngân hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExtract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        
        setIsLoading(true);
        setError('');
        setExtractedCards([]);
        setSelectedIds(new Set());
        setScrapedHost('');
        setProgressLabel('Đang khởi động Robot cào dữ liệu...');

        try {
            // Simulated progress steps for better UX
            setTimeout(() => setProgressLabel('Đang vượt tường lửa Akamai...'), 1000);
            setTimeout(() => setProgressLabel('Đang phân tích cấu trúc DOM (h2-h5)...'), 2000);
            setTimeout(() => setProgressLabel('Đang bóc tách hình ảnh và ưu đãi...'), 3500);

            const data = await scraperApi.extractCard(url);
            
            // Map with unique IDs
            const cardsWithIds = (data.cards || []).map((c: any, i: number) => ({
                ...c,
                id: `scraped-${Date.now()}-${i}`,
                annualFee: 0,
                minSalary: 0
            }));

            setScrapedHost(data.host || '');
            setExtractedCards(cardsWithIds);
            
            // Auto select all cards that have a name
            setSelectedIds(new Set(cardsWithIds.filter((c: any) => c.cardName && c.cardName !== 'Thẻ chung').map((c: any) => c.id)));

            // Tìm bankName từ link
            const matchedBank = supportedBanks.find(b => url.toLowerCase().includes(b.bankName.toLowerCase()) || url.toLowerCase().includes(b.url.replace('https://', '').replace('www.', '').split('/')[0]));
            if (matchedBank) setBankName(matchedBank.bankName);

        } catch (err: any) {
            setError(err.message || 'Lý do: Link lỗi hoặc bị chặn bởi hệ thống ngân hàng.');
        } finally {
            setIsLoading(false);
            setProgressLabel('');
        }
    };

    const toggleCardSelection = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === extractedCards.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(extractedCards.map(c => c.id)));
        }
    };

    const handleRemoveCard = (id: string) => {
        setExtractedCards(extractedCards.filter(c => c.id !== id));
        const next = new Set(selectedIds);
        next.delete(id);
        setSelectedIds(next);
    };

    const handleCardFieldChange = (id: string, field: keyof ScrapedCard, value: any) => {
        setExtractedCards(extractedCards.map(c => 
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const handleSaveAll = () => {
        const selectedCards = extractedCards.filter(c => selectedIds.has(c.id));
        const validCards = selectedCards.filter(c => c.cardName && c.cardName.trim() !== '');
        
        const payload = validCards.map(c => {
            const rules = c.cashbackInfos
                .filter(info => info.suggestedPercentage != null)
                .map(info => ({
                    category: 'Tự động bóc',
                    percentage: info.suggestedPercentage!,
                    capAmount: info.suggestedCap
                }));

            const benefits = c.cashbackInfos.filter(info => info.text).map(info => info.text);

            return {
                name: c.cardName,
                bank: bankName,
                bankName: bankName,
                imageUrl: c.imageUrl || '',
                link: url,
                annualFee: c.annualFee || 0,
                minSalary: c.minSalary || 0,
                cashbackRules: rules,
                benefits: benefits
            };
        });

        if (payload.length === 0) {
            alert('Vui lòng chọn ít nhất một thẻ hợp lệ để lưu.');
            return;
        }

        onSaveCards(payload);
    };

    if (!isOpen) return null;

    const isShowingExtracted = extractedCards.length > 0;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/60 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-6xl max-h-[92vh] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
                {/* Header & Search Bar */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">Smart Scraper (Batch Clone)</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Trích xuất đồng loạt toàn bộ Thẻ Tín Dụng từ liên kết</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleExtract} className="flex gap-3">
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">link</span>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Dán link trang thẻ có nhiều thẻ cần nhân bản (VD: https://www.vib.com.vn/vn/the-tin-dung/...)"
                                className="w-full bg-white dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm outline-none"
                            />
                        </div>
                        
                        <select 
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                        >
                            <option value="VIB">VIB</option>
                            {supportedBanks.map(b => (
                                <option key={b.bankName} value={b.bankName}>{b.bankName}</option>
                            ))}
                        </select>

                        <button 
                            type="submit" 
                            disabled={!url || isLoading}
                            className="bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2 shrink-0 active:scale-95 uppercase tracking-widest"
                        >
                            {isLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">page_info</span>}
                            Quét & Lấy Toàn Bộ Thẻ
                        </button>
                    </form>

                    {supportedBanks.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Link Nhanh:</span>
                            {supportedBanks.map(b => (
                                <button
                                    key={b.bankName}
                                    type="button"
                                    onClick={() => {
                                        setUrl(b.url);
                                        setBankName(b.bankName);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-500 transition-all hover:scale-105 active:scale-95"
                                >
                                    {b.bankName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-900/50 scrollbar-hide">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 border-4 border-primary-500/20 rounded-full animate-ping absolute inset-0"></div>
                                <div className="w-24 h-24 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary-500 text-3xl animate-bounce">robot_2</span>
                                </div>
                            </div>
                            <p className="font-black uppercase tracking-[0.2em] text-xs text-primary-600 dark:text-primary-400 mb-2">{progressLabel}</p>
                            <p className="text-sm font-medium opacity-60">Đây là quá trình tự động hóa cấp cao, vui lòng không đóng cửa sổ...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-3xl flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/30 max-w-2xl mx-auto mt-10">
                            <span className="material-symbols-outlined text-3xl">error</span>
                            <div className="text-sm">
                                <p className="font-bold mb-1">Máy cào dữ liệu gặp sự cố!</p>
                                <p className="opacity-80 font-medium">{error}</p>
                            </div>
                        </div>
                    ) : isShowingExtracted ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-10 transition-all">
                                <div className="flex items-center gap-6">
                                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">library_add_check</span>
                                        Phát hiện ({extractedCards.length}) thẻ
                                    </h3>
                                    <button 
                                        onClick={toggleSelectAll}
                                        className="text-xs font-black text-primary-500 hover:text-primary-600 underline underline-offset-4"
                                    >
                                        {selectedIds.size === extractedCards.length ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-slate-500">Đã chọn: <span className="text-primary-500">{selectedIds.size}</span> thẻ</span>
                                    <button 
                                        onClick={handleSaveAll}
                                        disabled={selectedIds.size === 0}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-green-500/25 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest text-xs"
                                    >
                                        <span className="material-symbols-outlined text-xl">save</span>
                                        Lưu {selectedIds.size} Thẻ Đã Chọn
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                                <div className="overflow-x-auto scrollbar-hide">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                                <th className="px-6 py-4 w-12 text-center">
                                                    <span className="material-symbols-outlined text-slate-400 text-lg">checklist</span>
                                                </th>
                                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24">Hình ảnh</th>
                                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/4">Thông tin thẻ</th>
                                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-48">Chi phí & Yêu cầu</th>
                                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hoàn tiền bóc tách</th>
                                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-16 text-right">Xoá</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {extractedCards.map(card => (
                                                <tr key={card.id} className={`group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all ${selectedIds.has(card.id) ? 'bg-primary-50/10 dark:bg-primary-900/10' : ''}`}>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => toggleCardSelection(card.id)} className={`transition-colors ${selectedIds.has(card.id) ? 'text-primary-500' : 'text-slate-300 dark:text-slate-600'}`}>
                                                            <span className="material-symbols-outlined text-xl">
                                                                {selectedIds.has(card.id) ? 'check_box' : 'check_box_outline_blank'}
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="w-16 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm p-1">
                                                            {card.imageUrl ? (
                                                                <img src={card.imageUrl} alt={card.cardName} className="w-full h-full object-contain" />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-slate-300 text-lg">credit_card</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-1.5">
                                                            <input 
                                                                type="text" 
                                                                value={card.cardName}
                                                                onChange={e => handleCardFieldChange(card.id, 'cardName', e.target.value)}
                                                                className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-primary-500 rounded-lg px-2 py-1 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all"
                                                                placeholder="Tên thẻ"
                                                            />
                                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2">{bankName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 space-y-3">
                                                        <div className="flex items-center gap-2 group/input">
                                                            <span className="material-symbols-outlined text-[14px] text-slate-400 group-focus-within/input:text-primary-500 transition-colors">payments</span>
                                                            <input
                                                                type="number"
                                                                value={card.annualFee || ''}
                                                                onChange={e => handleCardFieldChange(card.id, 'annualFee', Number(e.target.value))}
                                                                placeholder="Phí thường niên"
                                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2 group/input">
                                                            <span className="material-symbols-outlined text-[14px] text-slate-400 group-focus-within/input:text-green-500 transition-colors">work</span>
                                                            <input
                                                                type="number"
                                                                value={card.minSalary || ''}
                                                                onChange={e => handleCardFieldChange(card.id, 'minSalary', Number(e.target.value))}
                                                                placeholder="Lương yêu cầu"
                                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2 scrollbar-hide">
                                                            {card.cashbackInfos.length === 0 && <span className="text-xs text-slate-400 italic">Thẻ chưa có thông tin ưu đãi hiển thị</span>}
                                                            {card.cashbackInfos.map((info, i) => (
                                                                <div key={i} className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                                                                    <span className="text-slate-400 mx-1">•</span>
                                                                    {info.text}
                                                                    {(info.suggestedPercentage != null || info.suggestedCap != null) && (
                                                                        <span className="ml-1 text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 px-1 py-0.5 rounded">
                                                                            ({info.suggestedPercentage}% - {info.suggestedCap}đ)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <button 
                                                            onClick={() => handleRemoveCard(card.id)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors inline-block"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <span className="material-symbols-outlined text-6xl mb-6 opacity-10">inventory_2</span>
                            <p className="font-bold text-center text-sm leading-relaxed uppercase tracking-widest">
                                Nhập link trang chủ danh sách thẻ tín dụng<br/>để cào tất cả cùng một lúc!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
