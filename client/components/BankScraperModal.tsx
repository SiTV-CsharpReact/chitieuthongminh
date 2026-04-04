import React, { useState, useEffect } from 'react';
import { scraperApi } from '../services/api';

interface CashbackInfo {
    text: string;
    suggestedPercentage?: number;
    suggestedCap?: number;
}

interface BankScraperModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (imageUrl: string, name: string) => void;
    onSelectCashback: (info: CashbackInfo) => void;
}

export const BankScraperModal: React.FC<BankScraperModalProps> = ({ isOpen, onClose, onSelectImage, onSelectCashback }) => {
    const [url, setUrl] = useState('');
    const [vibCards, setVibCards] = useState<{name: string, imageUrl: string}[]>([]);
    
    // Extracted Data
    const [extractedImages, setExtractedImages] = useState<string[]>([]);
    const [extractedCashbacks, setExtractedCashbacks] = useState<CashbackInfo[]>([]);
    const [scrapedHost, setScrapedHost] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && vibCards.length === 0 && !url) {
            loadVibCards();
        }
    }, [isOpen]);

    const loadVibCards = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await scraperApi.getVibCards();
            setVibCards(data);
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
        setExtractedImages([]);
        setExtractedCashbacks([]);
        setScrapedHost('');

        try {
            const data = await scraperApi.extractCard(url);
            setScrapedHost(data.host);
            setExtractedImages(data.images);
            setExtractedCashbacks(data.cashbackInfos);
        } catch (err: any) {
            setError(err.message || 'Lý do: Link lỗi hoặc bị chặn bởi hệ thống ngân hàng.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const isShowingExtracted = extractedImages.length > 0 || extractedCashbacks.length > 0;

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
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Smart Scraper (AI Clone)</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trích xuất tự động Hình ảnh và Lợi ích phần trăm Hoàn tiền</p>
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
                                placeholder="Dán link trang thẻ tín dụng bất kỳ vào đây (VD: https://www.vib.com.vn/vn/the-tin-dung/...)"
                                className="w-full bg-white dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!url || isLoading}
                            className="bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary-500/25 transition-all flex items-center gap-2"
                        >
                            {isLoading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">search</span>}
                            Phân Tích Thẻ
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50 dark:bg-slate-900/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-primary-500 rounded-full animate-spin mb-6"></div>
                            <p className="font-bold uppercase tracking-widest text-xs animate-pulse">Đang vượt rào & bóc tách dữ liệu...</p>
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
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            {/* Images Column */}
                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">image</span>
                                    Ảnh Quét Được từ {scrapedHost}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {extractedImages.map((src, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => onSelectImage(src, "Thẻ từ " + scrapedHost)}
                                            className="group relative aspect-[16/10] bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary-500 cursor-pointer overflow-hidden transition-all flex items-center justify-center"
                                        >
                                            <img src={src} className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-500 group-hover:scale-110" alt="Extracted" />
                                            <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/10 transition-colors flex items-center justify-center">
                                                <span className="opacity-0 group-hover:opacity-100 bg-primary-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">Chọn ảnh này</span>
                                            </div>
                                        </div>
                                    ))}
                                    {extractedImages.length === 0 && (
                                        <div className="col-span-2 aspect-[16/10] bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-800">
                                            <span className="material-symbols-outlined text-3xl mb-2 opacity-50">hide_image</span>
                                            <p className="text-[10px] font-bold uppercase">Không tìm thấy ảnh thẻ</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Cashback Column */}
                            <div className="lg:col-span-3 space-y-4">
                                <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">price_change</span>
                                    Thông tin Hoàn Tiền / Lợi Ích Quét Được
                                </h3>
                                <div className="space-y-3">
                                    {extractedCashbacks.length === 0 && (
                                        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-10 flex flex-col items-center justify-center text-slate-400 text-center border border-slate-200 dark:border-slate-800">
                                            <span className="material-symbols-outlined text-4xl mb-3 opacity-50">search_off</span>
                                            <p className="font-bold">Hệ thống chưa quét ra chuỗi ký tự nào có chứa cụm từ 'hoàn tiền', '%'.</p>
                                            <p className="text-xs mt-1">Trang này có thể không ghi điều kiện hoàn trực tiếp bằng chữ!</p>
                                        </div>
                                    )}
                                    {extractedCashbacks.map((info, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-box shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary-500 transition-colors">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-3">"{info.text}"</p>
                                                <div className="flex gap-2">
                                                    {info.suggestedPercentage != null && (
                                                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px]">percent</span> Máy đoán: {info.suggestedPercentage}%
                                                        </span>
                                                    )}
                                                    {info.suggestedCap != null && (
                                                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px]">payments</span> Tối đa: {info.suggestedCap.toLocaleString()}đ
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onSelectCashback(info)}
                                                className="shrink-0 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-500 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">add_task</span>
                                                Dùng làm thông tin
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-[18px]">collections_bookmark</span>
                                Bộ sưu tập thẻ VIB Mặc Định
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                {vibCards.map((card, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => onSelectImage(card.imageUrl, card.name)}
                                        className="group bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-500/10 cursor-pointer transition-all duration-300 flex flex-col h-full items-center text-center"
                                    >
                                        <div className="w-full flex-1 flex items-center justify-center mb-3">
                                            <img src={card.imageUrl} alt={card.name} className="max-w-full max-h-24 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md" />
                                        </div>
                                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2 w-full mt-auto">{card.name}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
