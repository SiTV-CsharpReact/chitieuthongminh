import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { articleApi } from '../services/api';
import { Article } from '../types';

const News: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    fetchArticles();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const data = await articleApi.getAll();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filters = ['Tất cả', ...new Set(articles.map(a => a.category))];

  const filteredArticles = activeFilter === 'Tất cả'
    ? articles
    : articles.filter(article => article.category === activeFilter);

  const [currentSlide, setCurrentSlide] = useState(0);

  // Featured articles logic: top 4 for slider
  const featuredArticles = articles.slice(0, 4);
  const regularArticles = articles.slice(4);

  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredArticles.length]);

  const displayArticles = activeFilter === 'Tất cả' ? regularArticles : filteredArticles;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500 flex flex-col">
      <Header transparent={!scrolled} />

      <main className="flex-grow">
        {isLoading && articles.length === 0 ? (
          <div className="h-[85vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            {/* Full-width Immersive Slider Section */}
            {featuredArticles.length > 0 && (
              <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden flex items-center group">
                
                {featuredArticles.map((article, idx) => (
                    <div 
                        key={article.id} 
                        className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <img
                          src={article.coverImage || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=2000'}
                          alt={article.title}
                          className="w-full h-full object-cover scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                        
                        <div className="absolute inset-0 z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-20 flex items-center">
                          <div className={`max-w-2xl transition-all duration-1000 transform ${idx === currentSlide ? 'translate-y-0 opacity-100 delay-300' : 'translate-y-8 opacity-0'}`}>
                              <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 rounded-full bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">
                                  {article.category}
                                </span>
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                                  {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                                </span>
                              </div>
                              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight line-clamp-3">
                                {article.title}
                              </h1>
                              <p className="text-lg text-slate-300 mb-8 leading-relaxed font-medium line-clamp-3">
                                {article.excerpt}
                              </p>
                              <div className="flex flex-wrap gap-4">
                                <button
                                  onClick={() => navigate(`/news/${article.id}`)}
                                  className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-primary-500/25 hover:scale-105 active:scale-95 group flex items-center gap-2"
                                >
                                  ĐỌC BÀI VIẾT
                                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                                </button>
                              </div>
                          </div>
                        </div>
                    </div>
                ))}
                
                {/* Navigation Arrows */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 flex justify-between px-4 sm:px-10 lg:px-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <button onClick={() => setCurrentSlide(p => p === 0 ? featuredArticles.length - 1 : p - 1)} className="pointer-events-auto w-12 h-12 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                        <span className="material-symbols-outlined">chevron_left</span>
                     </button>
                     <button onClick={() => setCurrentSlide(p => (p + 1) % featuredArticles.length)} className="pointer-events-auto w-12 h-12 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                        <span className="material-symbols-outlined">chevron_right</span>
                     </button>
                </div>
                
                {/* Dots Navigation */}
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {featuredArticles.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-primary-500' : 'w-2 bg-white/30 hover:bg-white/50'}`} />
                    ))}
                </div>

                <div className="absolute bottom-16 right-16 z-20 hidden xl:flex flex-col items-end gap-3 translate-y-0 hover:-translate-y-2 transition-transform duration-700">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <span className="material-symbols-outlined">trending_up</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang thịnh hành</p>
                      <p className="text-sm font-black text-white">+2.4K Lượt đọc</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-30 pb-24 mt-12">

              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Mới nhất</h2>

                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                      {filters.map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all
                                                        ${activeFilter === filter
                              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 px-6'
                              : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    {displayArticles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => navigate(`/news/${article.id}`)}
                        className="group cursor-pointer flex flex-col transition-all"
                      >
                        <div className="relative rounded-[2rem] overflow-hidden mb-5 aspect-[16/10] bg-slate-200 dark:bg-slate-800">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                          {article.createdAt ? new Date(article.createdAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3 leading-[1.3] group-hover:text-primary-500 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    ))}
                  </div>

                  {displayArticles.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">article</span>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Không tìm thấy bài viết nào phù hợp</p>
                    </div>
                  )}
                </div>

                <aside className="w-full lg:w-80 space-y-8">
                  <div className="bg-slate-900 dark:bg-white p-8 rounded-[2.5rem] text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-500 rounded-full opacity-20 transition-transform duration-700 group-hover:scale-150"></div>
                    <h3 className="text-xl font-black mb-4 relative z-10 leading-tight">Đăng ký nhận <br /> Ưu đãi VIP</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-medium relative z-10">Nhận thông báo sớm nhất về các đợt hoàn tiền khủng và thẻ mới ra mắt.</p>
                    <div className="space-y-3 relative z-10">
                      <input type="email" placeholder="Email của bạn..." className="w-full bg-slate-800 dark:bg-slate-100 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none" />
                      <button className="w-full bg-primary-500 text-white rounded-xl py-3 text-xs font-bold hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20">ĐĂNG KÝ NGAY</button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Trending Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {['#HoanTien', '#Fintech', '#Saving', '#CreditCard', '#Travel', '#Cashback'].map(tag => (
                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-primary-500 cursor-pointer transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-300">article</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Chưa có tin tức nào</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Chúng tôi đang cập nhật những tin tức tài chính mới nhất. Quay lại sau nhé!</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 py-12 px-6 sm:px-10 lg:px-16 text-center">
        <div className="bg-white/5 h-px w-full max-w-7xl mx-auto mb-12"></div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">© 2026 ZENITH NEWS • CHI TIÊU THÔNG MINH</p>
      </footer>
    </div>
  );
};

export default News;