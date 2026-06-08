"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

interface SaveCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: Card | null;
}

export default function SaveCardModal({ isOpen, onClose, card }: SaveCardModalProps) {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const hasAutoSent = useRef(false);

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    useEffect(() => {
        if (isOpen && card && user?.email && !hasAutoSent.current) {
            hasAutoSent.current = true;
            const autoSend = async () => {
                setLoading(true);
                setError('');
                try {
                    const response = await fetch(`http://localhost:5000/api/creditcards/${card.id}/send-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email }),
                    });

                    if (response.ok) {
                        setSuccess(true);
                        setTimeout(() => {
                            setSuccess(false);
                            setEmail(user.email || '');
                            onClose();
                        }, 2000);
                    } else {
                        const data = await response.json();
                        setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
                    }
                } catch (err) {
                    setError('Không thể kết nối đến máy chủ.');
                } finally {
                    setLoading(false);
                }
            };
            autoSend();
        } else if (!isOpen) {
            hasAutoSent.current = false;
        }
    }, [isOpen, card, user, onClose]);

    if (!isOpen || !card) return null;

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`http://localhost:5000/api/creditcards/${card.id}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    if (!user?.email) setEmail('');
                    onClose();
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
            }
        } catch (err) {
            setError('Không thể kết nối đến máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-[scaleUp_0.3s_ease-out]">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-blue-500">mail</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Gửi thông tin thẻ</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Nhập email của bạn để chúng tôi gửi thông tin chi tiết về thẻ <strong>{card.name}</strong>
                    </p>
                </div>

                {success ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">check_circle</span>
                        Đã gửi email thành công!
                    </div>
                ) : (
                    <form onSubmit={handleSendEmail} className="space-y-4">
                        <div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập địa chỉ email của bạn..."
                                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-0 transition-colors"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                        
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full font-bold py-3 bg-blue-500 hover:bg-blue-600 text-white border-none disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                    Đang gửi...
                                </span>
                            ) : (
                                "Gửi cho tôi"
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
