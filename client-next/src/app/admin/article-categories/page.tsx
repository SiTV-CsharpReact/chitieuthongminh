"use client";

import React, { useEffect, useState } from 'react';
import { articleCategoryApi, articleApi } from '@/services/api';
import { ArticleCategory } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminButton from '@/components/Admin/AdminButton';
import AdminTable, { AdminTableColumn } from '@/components/Admin/AdminTable';

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

    const handleSync = async () => {
        try {
            setLoading(true);
            const articles = await articleApi.getAll();
            const existingCats = await articleCategoryApi.getAll();
            const existingCatNames = existingCats.map(c => c.name);

            const distinctCatNames = [...new Set(articles.map(a => a.category).filter(c => c))];
            
            const colors = ['#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#06b6d4', '#ec4899'];
            
            for(let name of distinctCatNames) {
                if(!existingCatNames.includes(name)) {
                     const color = colors[Math.floor(Math.random() * colors.length)];
                     await articleCategoryApi.create({
                         name,
                         slug: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
                         color,
                         description: 'Chuyên mục tự động đồng bộ từ bài viết'
                     });
                }
            }
            await fetchCategories();
        } catch (error) {
            console.error(error);
            alert('Lỗi đồng bộ');
            setLoading(false);
        }
    };

    const columns: AdminTableColumn<ArticleCategory>[] = [
        {
            header: 'Thông tin Chuyên MụC',
            key: 'name',
            width: '25%',
            render: (cat) => (
                <div className="flex items-center gap-4">
                    <div className="w-2 h-8 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{cat.name}</span>
                </div>
            )
        },
        {
            header: 'Đường dẫn tĩnh (Slug)',
            key: 'slug',
            width: '20%',
            render: (cat) => (
                <span className="font-mono text-[11px] bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    {cat.slug}
                </span>
            )
        },
        {
            header: 'Mô Tả Tiêu Biểu',
            key: 'description',
            width: '35%',
            render: (cat) => (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 font-medium italic">
                    {cat.description || '-'}
                </p>
            )
        },
        {
            header: 'Định danh màu',
            key: 'color',
            width: '10%',
            align: 'center',
            render: (cat) => (
                <div className="inline-flex items-center gap-2 group/color">
                    <div className="w-6 h-6 rounded-lg shadow-sm border border-white dark:border-slate-700" style={{ backgroundColor: cat.color }}></div>
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover/color:opacity-100 transition-opacity uppercase">{cat.color}</span>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fade-in transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Chuyên Mục Tin Tức</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Quản lý hệ thống phân loại và sắp xếp các bài viết trên CredBack News ({categories.length} chuyên mục)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <AdminButton
                        variant="outline"
                        onClick={handleSync}
                        icon="sync"
                    >
                        ĐỒNG BỘ TỪ BÀI VIẾT
                    </AdminButton>
                    <AdminButton
                        onClick={() => handleOpenModal()}
                        icon="add"
                    >
                        Thêm Mới
                    </AdminButton>
                </div>
            </div>

            <AdminTable
                columns={columns}
                data={categories}
                isLoading={loading}
                onEdit={handleOpenModal}
                onDelete={(cat) => handleDelete(cat.id!)}
                emptyMessage="Phân loại trống"
            />

            {/* Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-md bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-slate-200 dark:border-slate-800 p-0 gap-0 shadow-2xl">
                    <DialogHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-left shrink-0">
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-50 uppercase tracking-tight">
                            {editingCategory ? 'Sửa Chuyên Mục' : 'Thêm Chuyên Mục'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[80vh] overflow-y-auto scrollbar-hide flex flex-col">
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
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 gap-4 flex justify-end shrink-0">
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
                </DialogContent>
            </Dialog>
        </div>
    );
}
