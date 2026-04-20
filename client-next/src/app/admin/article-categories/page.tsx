"use client";

import React, { useEffect, useState } from 'react';
import { articleCategoryApi } from '@/services/api';
import { ArticleCategory } from '@/types';

export default function AdminArticleCategoriesPage() {
    const [categories, setCategories] = useState<ArticleCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ArticleCategory | null>(null);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3b82f6');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await articleCategoryApi.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch article categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category?: ArticleCategory) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
            setSlug(category.slug);
            setDescription(category.description || '');
            setColor(category.color || '#3b82f6');
        } else {
            setEditingCategory(null);
            setName('');
            setSlug('');
            setDescription('');
            setColor('#3b82f6');
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            const data: ArticleCategory = { name, slug, description, color };
            if (editingCategory?.id) {
                await articleCategoryApi.update(editingCategory.id, data);
            } else {
                await articleCategoryApi.create(data);
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Lỗi lưu danh mục');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xoá chuyên mục này?')) return;
        try {
            await articleCategoryApi.delete(id);
            fetchCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50 uppercase">
                        Chuyên Mục Tin Tức
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                        Quản lý hệ thống phân loại và sắp xếp các bài viết trên Zenith News ({categories.length} chuyên mục)
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2 hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span> Thêm Mới
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center text-slate-500 dark:text-slate-400 animate-pulse flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-4xl animate-spin">sync</span>
                        <p className="font-black uppercase tracking-widest text-[10px]">Đang đồng bộ hóa dữ liệu...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400/80 uppercase text-[10px] font-black tracking-[0.2em]">
                                    <th className="px-8 py-5 w-[25%] uppercase">Thông tin Chuyên MụC</th>
                                    <th className="px-8 py-5 w-[20%] uppercase">Đường dẫn tĩnh (Slug)</th>
                                    <th className="px-8 py-5 w-[35%] uppercase">Mô Tả Tiêu Biểu</th>
                                    <th className="px-8 py-5 w-[10%] text-center">Định danh màu</th>
                                    <th className="px-8 py-5 w-[10%] text-right font-sans">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-mono text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                                {cat.slug}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 font-medium italic">
                                                {cat.description || '-'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="inline-flex items-center gap-2 group/color">
                                                <div className="w-6 h-6 rounded-lg shadow-sm border border-white dark:border-slate-700" style={{ backgroundColor: cat.color }}></div>
                                                <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover/color:opacity-100 transition-opacity uppercase">{cat.color}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                                >
                                                    <span className="material-symbols-outlined text-xl">edit_square</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id!)}
                                                    className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <span className="material-symbols-outlined text-6xl">category</span>
                                                <p className="font-bold uppercase tracking-widest text-xs">Phân loại trống</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">
                                {editingCategory ? 'Sửa Chuyên Mục' : 'Thêm Chuyên Mục'}
                            </h3>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Tên Chuyên Mục</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!editingCategory) {
                                            setSlug(e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                                        }
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Đường Dẫn (Slug)</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full px-4 py-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Định danh màu sắc</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-14 h-14 rounded-2xl cursor-pointer border-0 p-0 shadow-sm bg-white dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden"
                                    />
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="flex-1 px-4 py-3 font-mono text-xs bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mô Tả Tiêu Biểu</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium italic"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 gap-4 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 font-bold transition-colors uppercase text-[11px] tracking-widest"
                            >
                                Hủy Bỏ
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all uppercase text-[11px] tracking-widest"
                            >
                                Lưu Thay Đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
