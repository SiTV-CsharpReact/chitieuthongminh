"use client";

import React, { useState } from 'react';
import { Card } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/services/api';

interface SaveCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: Card | null;
}

export default function SaveCardModal({ isOpen, onClose, card }: SaveCardModalProps) {
    const { isAuthenticated, openLoginModal } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !card) return null;

    const handleSave = async () => {
        if (!isAuthenticated) {
            onClose();
            openLoginModal();
            return;
        }

        if (!card.id) {
            setError('Không thể lưu thẻ này (Lỗi dữ liệu).');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            await userApi.addToWallet(card.id);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi lưu thẻ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-[scaleUp_0.3s_ease-out]">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-emerald-500">account_balance_wallet</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Lưu vào ví thẻ</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Lưu thẻ <strong>{card.name}</strong> vào ví của bạn để tối ưu hóa gợi ý chi tiêu.
                    </p>
                </div>

                {success ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        Đã lưu thẻ thành công!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}
                        
                        <Button 
                            onClick={handleSave} 
                            disabled={loading}
                            className="w-full font-bold py-3 bg-emerald-500 hover:bg-emerald-600 text-white border-none disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                    Đang lưu...
                                </span>
                            ) : (
                                isAuthenticated ? "Lưu thẻ vào ví ngay" : "Đăng nhập để lưu thẻ"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
