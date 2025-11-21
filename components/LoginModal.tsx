
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

export const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isLoginModalOpen) {
            setTimeout(() => setAnimate(true), 10);
        } else {
            setAnimate(false);
        }
    }, [isLoginModalOpen]);

    if (!isLoginModalOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) login(email);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className={cn(
                    "absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300",
                    animate ? "opacity-100" : "opacity-0"
                )}
                onClick={closeLoginModal}
            />

            {/* Modal Content */}
            <div 
                className={cn(
                    "relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all duration-300 dark:bg-slate-900 ring-1 ring-slate-900/5 dark:ring-slate-50/10",
                    animate ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
                )}
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-4 dark:bg-primary-900/30 dark:text-primary-400">
                         <span className="material-symbols-outlined text-2xl">lock_person</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">Chào mừng trở lại</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
                        Nhập email của bạn để đăng nhập vào tài khoản
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="name@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <button type="button" className="text-xs font-bold text-primary-600 hover:underline dark:text-primary-400">
                                Quên mật khẩu?
                            </button>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg">
                        Đăng nhập
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">Hoặc đăng nhập với</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button type="button" variant="outline" onClick={() => login('google@gmail.com')}>
                            Google
                        </Button>
                        <Button type="button" variant="outline" onClick={() => login('facebook@gmail.com')}>
                            Facebook
                        </Button>
                    </div>
                </form>

                <button 
                    onClick={closeLoginModal}
                    className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>
        </div>
    );
};
