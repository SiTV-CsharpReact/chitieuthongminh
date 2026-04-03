import React, { useState, useEffect } from 'react';
import { articleApi, categoryApi } from '../services/api';
import { Article, Category } from '../types';
import { Editor } from '@tinymce/tinymce-react';

const AdminArticles: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentArticle, setCurrentArticle] = useState<Partial<Article>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        parentCategory: '',
        subCategory: '',
        author: 'Admin',
        coverImage: '',
        imageDescription: '',
        seoDescription: '',
        seoKeywords: '',
        status: 'draft',
        publishedAt: new Date().toISOString().slice(0, 16),
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [articlesData, categoriesData] = await Promise.all([
                articleApi.getAll(),
                categoryApi.getAll()
            ]);
            setArticles(articlesData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/([^0-9a-z-\s])/g, '')
            .replace(/(\s+)/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setCurrentArticle(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const handleSave = async (status: 'published' | 'draft') => {
        if (!currentArticle.title || !currentArticle.slug) return;

        setIsSaving(true);
        const articleToSave = { ...currentArticle, status } as Article;

        try {
            if (articleToSave.id) {
                await articleApi.update(articleToSave.id, articleToSave);
            } else {
                await articleApi.create(articleToSave);
            }
            await fetchData();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save article:', error);
            alert('Lỗi khi lưu bài viết');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setCurrentArticle({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            category: '',
            parentCategory: '',
            subCategory: '',
            author: 'Admin',
            coverImage: '',
            imageDescription: '',
            seoDescription: '',
            seoKeywords: '',
            status: 'draft',
            publishedAt: new Date().toISOString().slice(0, 16),
        });
    };

    const handleEdit = (article: Article) => {
        setCurrentArticle({
            ...article,
            publishedAt: article.publishedAt ? article.publishedAt.slice(0, 16) : new Date().toISOString().slice(0, 16)
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
        try {
            await articleApi.delete(id);
            await fetchData();
        } catch (error) {
            console.error('Failed to delete article:', error);
        }
    };

    return (
        <div className="p-4 lg:p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-manrope">Quản lý bài viết</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Hệ thống Zenith News CMS Professional</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-[11px] transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 group active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
                    VIẾT BÀI MỚI
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Bài viết</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Chuyên mục</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Ngày tạo</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Trạng thái</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {articles.map(article => (
                                    <tr key={article.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                                                    {article.coverImage && <img src={article.coverImage} className="w-full h-full object-cover" alt="" />}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">{article.title}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">/{article.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                            {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${article.status === 'published' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                                                }`}>
                                                {article.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleEdit(article)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 rounded-lg transition-all">
                                                    <span className="material-symbols-outlined text-[18px]">edit_square</span>
                                                </button>
                                                <button onClick={() => handleDelete(article.id!)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Editor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-[1400px] h-full lg:h-auto lg:max-h-[92vh] overflow-hidden lg:rounded-[1.5rem] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 animate-scale-up">

                        {/* Header (More Compact) */}
                        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
                            <div className="flex flex-col">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white font-manrope tracking-tight leading-tight">
                                    {currentArticle.id ? 'Hiệu chỉnh bài viết' : 'Tạo bài viết mới'}
                                </h2>
                                <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">Zenith CMS Pro v3.0 - Optimized Interface</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all">
                                <span className="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>

                        {/* Body - Two Columns (Reduced Spacing) */}
                        <div className="flex-grow overflow-y-auto px-8 py-6 flex flex-col lg:flex-row gap-6 scrollbar-hide pb-28 lg:pb-32">

                            {/* Left Column: Content Core (68%) */}
                            <div className="flex-grow space-y-5 lg:w-[68%]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Tiêu đề bài viết</label>
                                        <input
                                            type="text"
                                            value={currentArticle.title}
                                            onChange={handleTitleChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                            placeholder="Nhập tiêu đề..."
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Đường dẫn SEO (Slug)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={currentArticle.slug}
                                                onChange={(e) => setCurrentArticle(prev => ({ ...prev, slug: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-bold text-slate-400 dark:text-slate-500 focus:ring-1 focus:ring-emerald-500/10 transition-all outline-none pl-4"
                                                placeholder="url-seo-bai-viet"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 dark:text-slate-600 text-sm">link</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Ảnh đại diện (Hero Image)</label>
                                    <div className="group relative aspect-[21/9] w-full rounded-3xl bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden border-spacing-4">
                                        {currentArticle.coverImage ? (
                                            <div className="absolute inset-0">
                                                <img src={currentArticle.coverImage} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <span className="text-white font-black text-[10px] tracking-[0.2em] bg-emerald-500 px-4 py-1.5 rounded-lg">THAY ĐỔI ẢNH</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center p-4">
                                                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 group-hover:scale-110 transition-all shadow-sm">
                                                    <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                                                </div>
                                                <p className="text-slate-900 dark:text-white font-black text-xs tracking-tight">Thêm ảnh đại diện</p>
                                                <p className="text-slate-400 dark:text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1.5">1200x630 (Tỉ lệ 1.91:1)</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col lg:flex-row gap-3 pt-1">
                                        <div className="flex-grow">
                                            <input
                                                type="text"
                                                value={currentArticle.coverImage}
                                                onChange={(e) => setCurrentArticle(prev => ({ ...prev, coverImage: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-[10px] font-mono text-slate-400 focus:ring-1 focus:ring-emerald-500/20 outline-none"
                                                placeholder="URL ảnh: https://..."
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            value={currentArticle.imageDescription}
                                            onChange={(e) => setCurrentArticle(prev => ({ ...prev, imageDescription: e.target.value }))}
                                            className="lg:w-1/3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-[10px] font-bold text-slate-500 focus:ring-1 focus:ring-emerald-500/20 outline-none"
                                            placeholder="Mô tả ảnh (Alt-text)..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-1">
                                    <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Nội dung chi tiết</label>
                                    <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm ring-4 ring-slate-50 dark:ring-slate-800/30">
                                        <Editor
                                            apiKey="aphctm8r1sl59i06kav1u5rfuluhfwym72l7qm5tb635xytp"
                                            onEditorChange={(content) => setCurrentArticle(prev => ({ ...prev, content }))}
                                            value={currentArticle.content}
                                            init={{
                                                height: 480,
                                                menubar: true,
                                                plugins: [
                                                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                ],
                                                toolbar: 'undo redo | blocks | ' +
                                                    'bold italic forecolor | alignleft aligncenter ' +
                                                    'alignright alignjustify | bullist numlist | ' +
                                                    'removeformat | image media help',
                                                content_style: `
                                                    body { 
                                                        font-family:Manrope,Inter,sans-serif; 
                                                        font-size:15px; 
                                                        line-height: 1.6; 
                                                        background-color: ${document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff'}; 
                                                        color: ${document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#334155'}; 
                                                        padding: 1.5rem;
                                                    }
                                                    h1, h2, h3 { font-family: Manrope, sans-serif; font-weight: 800; color: ${document.documentElement.classList.contains('dark') ? '#f8fafc' : '#1e293b'}; }
                                                    a { color: #10b981; text-decoration: underline; }
                                                `,
                                                skin: (document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide'),
                                                content_css: (document.documentElement.classList.contains('dark') ? 'dark' : 'default'),
                                                branding: false,
                                                promotion: false,
                                                statusbar: false,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Taxonomy & SEO (Compact) */}
                            <div className="lg:w-[32%] space-y-5">
                                {/* Metadata Card */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-50 dark:border-slate-700/50">
                                        <span className="material-symbols-outlined text-emerald-500 scale-90">assignment_turned_in</span>
                                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">Thông tin xuất bản</h3>
                                    </div>

                                    <div className="space-y-3.5">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Ngày giờ lên sóng</label>
                                            <input
                                                type="datetime-local"
                                                value={currentArticle.publishedAt}
                                                onChange={e => setCurrentArticle(prev => ({ ...prev, publishedAt: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                                            />
                                        </div>

                                        <div className="space-y-2.5 pt-1">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Chuyên mục chính</label>
                                                <select
                                                    value={currentArticle.parentCategory || ''}
                                                    onChange={e => setCurrentArticle(prev => ({ ...prev, parentCategory: e.target.value, category: e.target.value }))}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                                                >
                                                    <option value="">Chọn Root...</option>
                                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Chuyên mục phụ</label>
                                                <select
                                                    value={currentArticle.subCategory || ''}
                                                    onChange={e => setCurrentArticle(prev => ({ ...prev, subCategory: e.target.value }))}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                                                >
                                                    <option value="">Chọn Branch...</option>
                                                    <option value="EDITORIAL">EDITORIAL</option>
                                                    <option value="MARKET ANALYSIS">PHÂN TÍCH THỊ TRƯỜNG</option>
                                                    <option value="TIPS & TRICKS">MẸO & THỦ THUẬT</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SEO Optimizer Card */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
                                    <div className="flex items-center gap-2 pb-3 border-b border-slate-50 dark:border-slate-700/50">
                                        <span className="material-symbols-outlined text-emerald-500 scale-90">troubleshoot</span>
                                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">Tối ưu SEO</h3>
                                    </div>

                                    <div className="space-y-3.5">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Metadata Excerpt</label>
                                                <span className="text-[8px] font-black text-emerald-500">{(currentArticle.seoDescription?.length || 0)}/160</span>
                                            </div>
                                            <textarea
                                                value={currentArticle.seoDescription}
                                                onChange={e => setCurrentArticle(prev => ({ ...prev, seoDescription: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-600 dark:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none h-24"
                                                placeholder="Mô tả SEO..."
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Tags & Keywords</label>
                                            <textarea
                                                value={currentArticle.seoKeywords}
                                                onChange={e => setCurrentArticle(prev => ({ ...prev, seoKeywords: e.target.value }))}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[11px] font-medium text-slate-600 dark:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none h-16"
                                                placeholder="finance, spending..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optimized Action Bar (Reduced Height) */}
                        <div className="fixed bottom-0 left-0 w-full h-20 flex items-center justify-between px-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl z-50 border-t border-slate-100 dark:border-slate-800 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all duration-300 font-manrope font-bold uppercase tracking-widest text-[10px]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                    ĐÓNG
                                </button>
                                <button
                                    onClick={resetForm}
                                    className="flex items-center gap-1.5 px-4 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 font-manrope font-bold uppercase tracking-widest text-[10px]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                                    NHẬP LẠI
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsPreviewOpen(true)}
                                    className="flex items-center gap-1.5 px-5 py-2.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-all duration-300 font-manrope font-bold uppercase tracking-widest text-[10px]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    XEM TRƯỚC
                                </button>
                                <button
                                    onClick={() => handleSave('draft')}
                                    className="flex items-center gap-1.5 px-5 py-2.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 font-manrope font-bold uppercase tracking-widest text-[10px]"
                                >
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    LƯU NHÁP
                                </button>
                                <button
                                    onClick={() => handleSave('published')}
                                    disabled={isSaving}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 py-3 flex items-center gap-2 hover:brightness-105 shadow-lg shadow-emerald-500/20 transition-all duration-300 font-manrope font-black uppercase tracking-widest text-[11px] active:scale-95 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                                    XUẤT BẢN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal Overlay (Compact) */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 lg:p-8 animate-fade-in">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsPreviewOpen(false)}></div>
                    <div className="relative bg-white dark:bg-slate-950 w-full max-w-[900px] h-full overflow-y-auto rounded-3xl shadow-2xl flex flex-col animate-scale-up border border-slate-200 dark:border-slate-800">
                        <div className="sticky top-0 right-0 p-4 flex justify-end z-20">
                            <button onClick={() => setIsPreviewOpen(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-lg">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <div className="px-8 lg:px-16 pb-16 prose dark:prose-invert max-w-none">
                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.25em] mb-3">Zenith News - Chế độ xem trước</div>
                            <h1 className="font-manrope font-black text-3xl lg:text-4xl mb-6 leading-tight text-slate-900 dark:text-white">{currentArticle.title || 'Tiêu đề bài viết'}</h1>
                            {currentArticle.coverImage && (
                                <div className="aspect-[21/9] rounded-2xl overflow-hidden mb-8 shadow-2xl border border-slate-100 dark:border-slate-800">
                                    <img src={currentArticle.coverImage} className="w-full h-full object-cover" alt="" />
                                </div>
                            )}
                            <div
                                className="text-base leading-relaxed text-slate-600 dark:text-slate-400 font-medium"
                                dangerouslySetInnerHTML={{ __html: currentArticle.content || '<p>Chưa có nội dung soạn thảo...</p>' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminArticles;
