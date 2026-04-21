"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ExpenseCategory, Category } from '@/types';
import { cardApi, categoryApi } from '@/services/api';

// Profile definitions — only reference category names, actual data comes from API
const profiles: Record<string, { label: string; icon: string; color: string; categoryNames: string[] }> = {
    student: {
        label: 'Sinh viên',
        icon: 'school',
        color: 'text-emerald-500',
        categoryNames: ['Ăn uống', 'Siêu thị'],
    },
    worker: {
        label: 'Người đi làm',
        icon: 'work',
        color: 'text-primary-500',
        categoryNames: ['Ăn uống', 'Siêu thị', 'Du lịch', 'Di chuyển'],
    },
    family: {
        label: 'Gia đình',
        icon: 'family_restroom',
        color: 'text-blue-500',
        categoryNames: ['Ăn uống', 'Siêu thị', 'Giáo dục', 'Y tế'],
    },
    business: {
        label: 'Doanh nghiệp',
        icon: 'business',
        color: 'text-teal-500',
        categoryNames: ['Ăn uống', 'Siêu thị', 'Du lịch', 'Di chuyển', 'Mua sắm', 'Online'],
    },
};

const analysisSteps = [
    "Đang tổng hợp dữ liệu chi tiêu...",
    "Phân tích thói quen mua sắm của bạn...",
    "Quét dữ liệu 50+ thẻ tín dụng hàng đầu...",
    "Tính toán tỷ lệ hoàn tiền tối ưu...",
    "Đang tạo đề xuất cá nhân hóa..."
];

export default function InputExpensesPage() {
    const searchParams = useSearchParams();
    const profileKey = searchParams.get('profile') || 'worker';
    const profile = profiles[profileKey] || profiles['worker'];

    // All admin categories from API
    const [allAdminCategories, setAllAdminCategories] = useState<Category[]>([]);
    const [isPageLoading, setIsPageLoading] = useState(true);

    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Admin categories filtered for modal
    const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Salary State
    const [salary, setSalary] = useState<number>(0);
    const [isEditingSalary, setIsEditingSalary] = useState<boolean>(true);

    const router = useRouter();

    // Fetch all admin categories on page load and build initial categories
    useEffect(() => {
        setIsPageLoading(true);
        categoryApi.getAll()
            .then(data => {
                setAllAdminCategories(data);

                // Build initial categories from profile by matching admin category names
                const matched: ExpenseCategory[] = [];
                for (const catName of profile.categoryNames) {
                    const adminCat = data.find(c => c.name.toLowerCase() === catName.toLowerCase());
                    if (adminCat) {
                        matched.push({
                            id: adminCat.id || `cat_${Date.now()}_${matched.length}`,
                            name: adminCat.name,
                            icon: adminCat.icon || 'category',
                            amount: 0,
                            isEditing: matched.length === 0,
                        });
                    }
                }

                // Fallback: if API returned nothing, use profile names with default icons
                if (matched.length === 0) {
                    profile.categoryNames.forEach((name, i) => {
                        matched.push({
                            id: `fallback_${i}`,
                            name,
                            icon: 'category',
                            amount: 0,
                            isEditing: i === 0,
                        });
                    });
                }

                setCategories(matched);
            })
            .catch(err => {
                console.error('Failed to load categories:', err);
                // Fallback to profile names
                setCategories(profile.categoryNames.map((name, i) => ({
                    id: `fallback_${i}`,
                    name,
                    icon: 'category',
                    amount: 0,
                    isEditing: i === 0,
                })));
            })
            .finally(() => setIsPageLoading(false));
    }, [profileKey]);

    // Filter admin categories for modal (exclude already added ones)
    const modalCategories = useMemo(() => {
        const existingNames = categories.map(c => c.name.toLowerCase());
        return allAdminCategories.filter(c => !existingNames.includes(c.name.toLowerCase()));
    }, [allAdminCategories, categories]);

    const toggleEdit = (id: string) => {
        setCategories(categories.map(c =>
            c.id === id ? { ...c, isEditing: !c.isEditing } : c
        ));
    };

    const updateAmount = (id: string, val: string) => {
        const rawValue = val.replace(/\D/g, '');
        const num = parseInt(rawValue, 10) || 0;

        setCategories(categories.map(c =>
            c.id === id ? { ...c, amount: num } : c
        ));
    };

    const updateSalary = (val: string) => {
        const rawValue = val.replace(/\D/g, '');
        const num = parseInt(rawValue, 10) || 0;
        setSalary(num);
    };

    const handleSelectAdminCategory = (adminCat: Category) => {
        const newCategory: ExpenseCategory = {
            id: adminCat.id || `cat_${Date.now()}`,
            name: adminCat.name,
            icon: adminCat.icon || 'category',
            amount: 0,
            isEditing: true
        };

        setCategories([...categories, newCategory]);
        setShowAddModal(false);
    };

    const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

    const handleAnalyzeAndNavigate = async () => {
        setIsAnalyzing(true);
        setCurrentStep(0);

        // Find category with highest spending for recommendation logic
        const topCategory = [...categories].sort((a, b) => b.amount - a.amount)[0];

        try {
            await cardApi.saveSpending({
                amount: totalAmount,
                salary: salary,
                category: topCategory?.name || 'Tất cả',
                incomeLevel: salary >= 30000000 ? 'High' : salary >= 10000000 ? 'Medium' : 'Low',
                creditScoreRange: 'Good',
                date: new Date().toISOString()
            });
        } catch (e) {
            console.error("Failed to save spending:", e);
        }

        const stepInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < analysisSteps.length - 1) return prev + 1;
                return prev;
            });
        }, 800);

        setTimeout(() => {
            clearInterval(stepInterval);
            // In Next.js, we pass state via searchParams since useRouter doesn't support location state
            router.push(`/recommendations?spending=${totalAmount}&salary=${salary}&topCategory=${encodeURIComponent(topCategory?.name || 'Tất cả')}`);
        }, 4000);
    };

    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Header Gradient */}
            <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-primary-100/50 to-slate-50 dark:from-primary-900/10 dark:to-slate-950 -z-10"></div>

            <main className="flex-grow px-4 sm:px-8 pt-18 pb-16">
                <div className="mx-auto max-w-3xl">
                    {/* Back button */}
                    <Link
                        href="/#category-section"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors mb-8 group"
                    >
                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Quay lại chọn đối tượng
                    </Link>

                    {/* Header with profile badge */}
                    <div className="text-center mb-12">
                        {/* Profile badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 animate-fade-in">
                            <span className={`material-symbols-outlined text-xl ${profile.color}`}>{profile.icon}</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile.label}</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50 mb-4 uppercase">
                            Nhập khoản Chi Tiêu Hàng Tháng
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
                            Cung cấp thông tin chi tiêu để nhận được đề xuất thẻ tín dụng tốt nhất cho bạn.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
                        {/* Salary Input */}
                        <div className="mb-8 pb-8 border-b-2 border-dashed border-slate-100 dark:border-slate-800">
                            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">Lương Hàng Tháng (Cơ Sở Phân Tích)</label>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20 text-green-500">
                                        <span className="material-symbols-outlined text-2xl">payments</span>
                                    </div>
                                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Lương của bạn</span>
                                </div>
                                {isEditingSalary ? (
                                    <div className="relative w-40 sm:w-56 group">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-medium group-focus-within:text-green-500 transition-colors">VND</span>
                                        <input
                                            className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 pl-14 pr-4 text-right font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:border-green-500 dark:focus:border-green-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-0 transition-all outline-none"
                                            placeholder="0"
                                            type="text"
                                            value={salary > 0 ? salary.toLocaleString() : ''}
                                            onChange={(e) => updateSalary(e.target.value)}
                                            onBlur={() => setIsEditingSalary(salary === 0)}
                                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingSalary(false)}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingSalary(true)}
                                        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                        {salary.toLocaleString()} VND
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-8">
                            {isPageLoading ? (
                                // Skeleton loading
                                Array.from({ length: profile.categoryNames.length }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                                            <div className="w-24 h-5 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                                        </div>
                                        <div className="w-28 h-10 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                                    </div>
                                ))
                            ) : (
                            categories.map((cat) => (
                                <div key={cat.id} className="relative flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0 animate-fade-in-up group/cat">
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                                            <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                            {/* Tooltip on hover */}
                                            <div className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover/cat:opacity-100 pointer-events-none transition-opacity duration-200 shadow-lg z-10">
                                                {cat.name}
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                                    </div>

                                    {cat.isEditing ? (
                                        <div className="relative w-40 sm:w-56 group">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-medium group-focus-within:text-primary-500 transition-colors">VND</span>
                                            <input
                                                className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 pl-14 pr-4 text-right font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:border-primary-500 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-0 transition-all outline-none"
                                                placeholder="0"
                                                type="text"
                                                value={cat.amount > 0 ? cat.amount.toLocaleString() : ''}
                                                onChange={(e) => updateAmount(cat.id, e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => toggleEdit(cat.id)}
                                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${cat.amount > 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'}`}
                                        >
                                            {cat.amount > 0 ? (
                                                <>
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                    {cat.amount.toLocaleString()} VND
                                                </>
                                            ) : (
                                                'Nhập số tiền'
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))
                            )}
                        </div>

                        {/* Total Row */}
                        <div className="flex items-center justify-between border-t-2 border-slate-100 dark:border-slate-800 pt-6 mt-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 dark:white text-white dark:text-slate-900 shadow-lg">
                                    <span className="material-symbols-outlined text-2xl">functions</span>
                                </div>
                                <span className="text-xl font-black text-slate-900 dark:text-white">Tổng chi tiêu</span>
                            </div>
                            <div className="text-xl font-black text-primary-600 dark:text-primary-400">
                                {totalAmount.toLocaleString()} VND
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-dashed border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-4 text-base font-bold text-slate-500 dark:text-slate-400 transition-all hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                            >
                                <span className="material-symbols-outlined">add_circle</span>
                                Thêm danh mục khác
                            </button>
                        </div>
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={handleAnalyzeAndNavigate}
                            className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-primary-500 h-16 px-10 text-lg font-bold text-white transition-all shadow-xl shadow-primary-500/30 hover:bg-primary-600 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/40"
                        >
                            Xem đề xuất thẻ
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Add Category Modal — fetched from Admin */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 transform transition-all scale-100 animate-scale-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thêm danh mục</h3>
                            <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Chọn danh mục chi tiêu từ hệ thống để thêm vào bảng tính của bạn.</p>

                        {isPageLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium text-slate-400">Đang tải danh mục...</span>
                            </div>
                        ) : modalCategories.length === 0 ? (
                            <div className="text-center py-10">
                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2 block">check_circle</span>
                                <p className="text-sm font-bold text-slate-400">Bạn đã thêm tất cả danh mục có sẵn!</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-hide">
                                {modalCategories.map((adminCat) => (
                                    <button
                                        key={adminCat.id}
                                        onClick={() => handleSelectAdminCategory(adminCat)}
                                        onMouseEnter={() => setHoveredCatId(adminCat.id || null)}
                                        onMouseLeave={() => setHoveredCatId(null)}
                                        className="relative w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 dark:hover:border-primary-500/30 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group/item"
                                    >
                                        {/* Color dot */}
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110"
                                            style={{ backgroundColor: adminCat.color + '20' }}
                                        >
                                            <span className="material-symbols-outlined text-xl" style={{ color: adminCat.color }}>
                                                {adminCat.icon || 'category'}
                                            </span>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{adminCat.name}</span>
                                        </div>
                                        <span className="material-symbols-outlined text-lg text-slate-300 dark:text-slate-600 group-hover/item:text-primary-500 transition-colors">add_circle</span>

                                        {/* Tooltip */}
                                        {hoveredCatId === adminCat.id && (
                                            <div className="absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold whitespace-nowrap shadow-lg z-20 animate-fade-in">
                                                Thêm &quot;{adminCat.name}&quot; vào chi tiêu
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* AI Analysis Loading Overlay */}
            {isAnalyzing && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-500 animate-fade-in">
                    <div className="flex flex-col items-center text-center p-8 max-w-lg">
                        <div className="relative mb-10">
                            <div className="absolute inset-0 rounded-full bg-primary-500 blur-3xl opacity-20 animate-pulse"></div>
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl ring-4 ring-primary-500/20">
                                <span className="material-symbols-outlined text-5xl text-primary-500 animate-pulse">auto_awesome</span>
                            </div>
                            <div className="absolute top-0 left-0 h-full w-full animate-spin-slow">
                                <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-primary-50 shadow-lg shadow-primary-500/50 border border-primary-500"></div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase">
                            AI đang phân tích
                        </h2>

                        <div className="h-8 mb-8">
                            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {analysisSteps[currentStep]}
                            </p>
                        </div>

                        <div className="w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 animate-progress-loading rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
