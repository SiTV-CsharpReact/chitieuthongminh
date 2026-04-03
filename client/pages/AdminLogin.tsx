import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const AdminLogin: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const from = location.state?.from?.pathname || "/admin";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            login(email);
            setIsLoading(false);
            navigate(from, { replace: true });
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 p-10 relative overflow-hidden transition-all">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 mb-6 shadow-xl transform -rotate-6">
                            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Portal</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase tracking-[0.2em] text-[10px]">Hệ thống quản trị</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">Email Quản trị</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@spending.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">Mật khẩu</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-base font-black shadow-xl hover:shadow-primary-500/20 transition-all active:scale-[0.98]" disabled={isLoading}>
                            {isLoading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    Đang xác thực...
                                </div>
                            ) : 'Đăng nhập hệ thống'}
                        </Button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
