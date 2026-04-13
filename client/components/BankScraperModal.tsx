import React, { useState, useEffect } from 'react';
import { scraperApi } from '../services/api';

interface CashbackInfo {
    text: string;
    suggestedPercentage?: number;
    suggestedCap?: number;
}

interface ScrapedCard {
    cardName: string;
    imageUrl?: string;
    cashbackInfos: CashbackInfo[];
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
    const [scrapedHost, setScrapedHost] = useState('');

    const [isLoading, setIsLoading] = useState(false);
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
        setScrapedHost('');

        try {
            const data = await scraperApi.extractCard(url);
            setScrapedHost(data.host);
            setExtractedCards(data.cards || []);

            // Tìm bankName từ link
            const matchedBank = supportedBanks.find(b => url.toLowerCase().includes(b.bankName.toLowerCase()) || url.toLowerCase().includes(b.url.replace('https://', '').replace('www.', '').split('/')[0]));
            if (matchedBank) setBankName(matchedBank.bankName);

        } catch (err: any) {
            setError(err.message || 'Lý do: Link lỗi hoặc bị chặn bởi hệ thống ngân hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveCard = (index: number) => {
        setExtractedCards(extractedCards.filter((_, i) => i !== index));
    };

    const handleCardNameChange = (index: number, newName: string) => {
        const updated = [...extractedCards];
        updated[index].cardName = newName;
        setExtractedCards(updated);
    };

    const handleSaveAll = () => {
        const validCards = extractedCards.filter(c => c.cardName && c.cardName.trim() !== '');
        
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
                imageUrl: c.imageUrl || '',
                link: url,
                cashbackRules: rules,
                benefits: benefits
            };
        });

        if (payload.length === 0) {
            alert('Không có thẻ nào hợp lệ để lưu.');
            return;
        }

        onSaveCards(payload);
    };

    if (!isOpen) return null;

    const isShowingExtracted = extractedCards.length > 0;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/60 transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-6xl max-h-[92vh] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header & Search Bar */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Smart Scraper (Batch Clone)</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trích xuất đồng loạt toàn bộ Thẻ Tín Dụng từ liên kết</p>
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
                                className="w-full bg-white dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm"
                            />
                        </div>
                        
                        <select 
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-0 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="VIB">VIB</option>
                            {supportedBanks.map(b => (
                                <option key={b.bankName} value={b.bankName}>{b.bankName}</option>
                            ))}
                        </select>

                        <button 
                            type="submit" 
                            disabled={!url || isLoading}
                            className="bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2 shrink-0"
                        >
                            {isLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">page_info</span>}
                            Quét & Lấy Toàn Bộ Thẻ
                        </button>
                    </form>

                    {supportedBanks.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Link Nhanh:</span>
                            {supportedBanks.map(b => (
                                <button
                                    key={b.bankName}
                                    type="button"
                                    onClick={() => {
                                        setUrl(b.url);
                                        setBankName(b.bankName);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-500 transition-colors"
                                >
                                    {b.bankName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                            <p className="font-bold uppercase tracking-widest text-xs animate-pulse">Bot đang vượt rào quét toàn bộ thông tin... Vui lòng chờ!</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-3xl flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/30 max-w-2xl mx-auto mt-10">
                            <span className="material-symbols-outlined text-3xl">error</span>
                            <div className="text-sm">
                                <p className="font-bold mb-1">Máy cào dữ liệu gặp sự cố!</p>
                                <p className="opacity-80">{error}</p>
                            </div>
                        </div>
                    ) : isShowingExtracted ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">library_add_check</span>
                                    Tìm thấy ({extractedCards.length}) thẻ
                                </h3>
                                <button 
                                    onClick={handleSaveAll}
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-green-500/25 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">save</span>
                                    Lưu Toàn Bộ {extractedCards.length} Thẻ Này
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                {extractedCards.map((card, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6 relative group">
                                        <button 
                                            onClick={() => handleRemoveCard(idx)}
                                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                            title="Loại bỏ thẻ này khỏi danh sách lưu"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                        
                                        <div className="w-full md:w-48 shrink-0 flex flex-col gap-3">
                                            <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900/50 rounded-xl flex items-center justify-center p-3 border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                {card.imageUrl ? (
                                                    <img src={card.imageUrl} alt={card.cardName} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl">hide_image</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 block">Tên thẻ (Có thể sửa)</label>
                                                <input 
                                                    type="text" 
                                                    value={card.cardName}
                                                    onChange={e => handleCardNameChange(idx, e.target.value)}
                                                    className="w-full sm:max-w-md bg-slate-50 dark:bg-slate-900/50 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl px-4 py-2 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">Lợi ích & Hoàn tiền ({card.cashbackInfos.length})</label>
                                                <div className="space-y-2">
                                                    {card.cashbackInfos.length === 0 && (
                                                        <p className="text-sm text-slate-500 italic">Không tìm thấy quyền lợi nào</p>
                                                    )}
                                                    {card.cashbackInfos.map((info, iidx) => (
                                                        <div key={iidx} className="bg-slate-50 dark:bg-slate-900/30 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">"{info.text}"</p>
                                                            {(info.suggestedPercentage != null || info.suggestedCap != null) && (
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {info.suggestedPercentage != null && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded">
                                                                            <span className="material-symbols-outlined text-[12px]">percent</span> Gợi ý: {info.suggestedPercentage}%
                                                                        </span>
                                                                    )}
                                                                    {info.suggestedCap != null && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-bold rounded">
                                                                            <span className="material-symbols-outlined text-[12px]">payments</span> Tối đa: {info.suggestedCap.toLocaleString()}đ
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">inventory_2</span>
                            <p className="font-bold text-center">Nhập link trang chủ danh sách thẻ tín dụng của Ngân hàng<br/>để cào tất cả cùng một lúc!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
