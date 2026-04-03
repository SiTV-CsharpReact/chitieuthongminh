import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { articleApi } from '../services/api';
import { Article } from '../types';

const ArticleDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 100);
        window.addEventListener('scroll', handleScroll);
        if (id) fetchArticle(id);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [id]);

    const fetchArticle = async (articleId: string) => {
        setIsLoading(true);
        try {
            const data = await articleApi.getById(articleId);
            setArticle(data);
        } catch (error) {
            console.error('Failed to fetch article:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Không tìm thấy bài viết</h1>
                <button
                    onClick={() => navigate('/news')}
                    className="bg-primary-500 text-white px-8 py-3 rounded-xl font-black text-xs"
                >
                    QUAY LẠI TIN TỨC
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 font-sans transition-colors duration-500 flex flex-col">
            <Header transparent={!scrolled} />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                    <img
                        src={article.coverImage}
                        className="w-full h-full object-cover"
                        alt={article.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 max-w-4xl mx-auto px-6 py-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
                                {article.category}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                            {article.title}
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <article className="max-w-4xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-lg">
                            {article.author?.[0] || 'A'}
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{article.author || 'Admin'}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Zenith Finance Analyst</p>
                        </div>
                    </div>

                    <div
                        className="prose prose-lg dark:prose-invert max-w-none 
                                    prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                                    prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed
                                    prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:border prose-img:border-slate-100 dark:prose-img:border-slate-800"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    <div className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <button
                            onClick={() => navigate('/news')}
                            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary-500 transition-colors uppercase tracking-[0.2em]"
                        >
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            Quay lại tin tức
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chia sẻ:</span>
                            <div className="flex gap-2">
                                {['facebook', 'twitter', 'linkedin'].map(social => (
                                    <button key={social} className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary-500 transition-all">
                                        <span className="material-symbols-outlined text-[18px]">share</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </article>
            </main>

            <footer className="bg-slate-900 py-12 px-6 sm:px-10 lg:px-16 text-center">
                <div className="bg-white/5 h-px w-full max-w-7xl mx-auto mb-12"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">© 2026 ZENITH NEWS • CHI TIÊU THÔNG MINH</p>
            </footer>
        </div>
    );
};

export default ArticleDetail;
