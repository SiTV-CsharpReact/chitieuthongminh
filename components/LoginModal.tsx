
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

export const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    
    // UI State
    const [animate, setAnimate] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (isLoginModalOpen) {
            setTimeout(() => setAnimate(true), 10);
        } else {
            setAnimate(false);
            // Reset state on close
            setTimeout(() => {
                setIsRegister(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setName('');
            }, 300);
        }
    }, [isLoginModalOpen]);

    if (!isLoginModalOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would separate login logic from register logic
        // and pass the 'name' to the register function.
        if (isRegister && password !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        login(email);
    };

    const toggleMode = () => {
        setAnimate(false);
        setTimeout(() => {
            setIsRegister(!isRegister);
            setAnimate(true);
        }, 200);
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
                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 mb-4 dark:bg-primary-900/30 dark:text-primary-400">
                         <span className="material-symbols-outlined text-2xl">
                             {isRegister ? 'person_add' : 'lock_person'}
                         </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">
                        {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
                        {isRegister 
                            ? 'Điền thông tin bên dưới để bắt đầu hành trình tài chính thông minh.' 
                            : 'Nhập email của bạn để đăng nhập vào tài khoản.'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div className="space-y-2 animate-fade-in">
                            <Label htmlFor="name">Họ và tên</Label>
                            <Input 
                                id="name" 
                                type="text" 
                                placeholder="Nguyễn Văn A" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

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
                            {!isRegister && (
                                <button type="button" className="text-xs font-bold text-primary-600 hover:underline dark:text-primary-400">
                                    Quên mật khẩu?
                                </button>
                            )}
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

                    {isRegister && (
                        <div className="space-y-2 animate-fade-in">
                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                            <Input 
                                id="confirmPassword" 
                                type="password" 
                                placeholder="••••••••" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    
                    <Button type="submit" className="w-full mt-2" size="lg">
                        {isRegister ? 'Đăng ký miễn phí' : 'Đăng nhập'}
                    </Button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button type="button" variant="outline" onClick={() => login('google@gmail.com')} className="h-11">
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </Button>
                        <Button type="button" variant="outline" onClick={() => login('facebook@gmail.com')} className="h-11">
                            <svg className="mr-2 h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </Button>
                    </div>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400">
                            {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
                        </span>
                        <button 
                            type="button"
                            onClick={toggleMode}
                            className="font-bold text-primary-600 hover:underline dark:text-primary-400"
                        >
                            {isRegister ? 'Đăng nhập ngay' : 'Đăng ký miễn phí'}
                        </button>
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
