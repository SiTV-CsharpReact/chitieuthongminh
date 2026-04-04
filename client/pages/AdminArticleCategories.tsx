import React, { useEffect, useState } from 'react';
import { articleCategoryApi } from '../services/api';
import { ArticleCategory } from '../types';

const AdminArticleCategories: React.FC = () => {
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
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
                        Chuyên Mục Tin Tức
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Quản lý phân loại bài viết và tin tức ({categories.length} chuyên mục)
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined">add</span> Thêm Mới
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400 animate-pulse">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider">
                                    <th className="p-5 w-[20%]">Chuyên MụC</th>
                                    <th className="p-5 w-[20%]">Slug</th>
                                    <th className="p-5 w-[40%]">Mô Tả</th>
                                    <th className="p-5 w-[10%] text-center">Màu Sắc</th>
                                    <th className="p-5 w-[10%] text-right">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-5 font-bold text-slate-900 dark:text-slate-100">{cat.name}</td>
                                        <td className="p-5 font-mono text-sm text-slate-500 dark:text-slate-400">{cat.slug}</td>
                                        <td className="p-5 text-sm text-slate-600 dark:text-slate-400">{cat.description || '-'}</td>
                                        <td className="p-5 text-center">
                                            <div className="inline-block w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: cat.color }}></div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id!)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-500">
                                            Chưa có chuyên mục nào.
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                                {editingCategory ? 'Sửa Chuyên Mục' : 'Thêm Chuyên Mục Mới'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Chuyên Mục</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (!editingCategory) {
                                            // auto slugify
                                            setSlug(e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Đường Dẫn (Slug)</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full px-4 py-2 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Mã Màu</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="flex-1 px-4 py-2 font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Mô Tả Tiêu Biểu</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 gap-3 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-bold transition-colors"
                            >
                                Hủy Bỏ
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                            >
                                Lưu Thay Đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminArticleCategories;
