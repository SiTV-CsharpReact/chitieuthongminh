import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const NumberTicker: React.FC<{ value: number, duration?: number, prefix?: string, suffix?: string }> = ({ value, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{prefix}{count.toLocaleString('vi-VN')}{suffix}</span>;
};

const personas = [
  {
    id: 'student',
    title: 'Sinh viên',
    description: 'Bạn là sinh viên đang tìm kiếm chiếc thẻ đầu tiên để xây dựng lịch sử tín dụng.',
    icon: 'school',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    borderColor: 'group-hover:border-emerald-500/50',
    btnClass: 'bg-slate-800 hover:bg-emerald-500',
  },
  {
    id: 'worker',
    title: 'Người đi làm',
    description: 'Bạn đã có thu nhập ổn định và muốn tối ưu hóa chi tiêu hàng ngày.',
    icon: 'work',
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
    borderColor: 'border-primary-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    btnClass: 'bg-primary-500 shadow-lg shadow-primary-500/20 hover:bg-primary-600',
  },
  {
    id: 'family',
    title: 'Gia đình',
    description: 'Bạn đang tìm kiếm các ưu đãi tốt nhất cho chi tiêu của cả gia đình.',
    icon: 'family_restroom',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    borderColor: 'group-hover:border-blue-500/50',
    btnClass: 'bg-slate-800 hover:bg-blue-500',
  },
  {
    id: 'business',
    title: 'Doanh nghiệp',
    description: 'Bạn là chủ doanh nghiệp cần giải pháp quản lý tài chính và tối ưu dòng tiền.',
    icon: 'business',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
    borderColor: 'group-hover:border-teal-500/50',
    btnClass: 'bg-slate-800 hover:bg-teal-500',
  }
];

const Welcome: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('worker');

  const scrollToCategories = () => {
    const section = document.getElementById('category-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white dark:bg-[#050a12] text-slate-900 dark:text-white min-h-screen selection:bg-primary-500/30 transition-colors duration-500">
      <Header transparent />

      <main className="flex flex-col items-center overflow-x-hidden">
        {/* Full-Screen Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-6 max-w-7xl w-full">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 w-full">
            <div className="flex-[1.2] text-center md:text-left">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 tracking-tighter leading-[1.1]">
                <div className="flex flex-wrap justify-center md:justify-start gap-x-3 mb-2">
                  {['Chào', 'mừng', 'bạn', 'đến', 'với'].map((word, i) => (
                    <span
                      key={i}
                      className="opacity-0 animate-blur-fade-in inline-block text-slate-700 dark:text-slate-400"
                      style={{ animationDelay: `${200 + i * 100}ms` }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <span className="relative inline-block mt-2">
                  <span className="text-gradient-shimmer hero-text-glow inline-block opacity-0 animate-blur-fade-in [animation-delay:800ms]">
                    Chi tiêu thông minh
                  </span>
                  <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent scale-x-0 animate-[scaleUp_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards] [animation-delay:1800ms] origin-center opacity-50">
                    <div className="absolute inset-0 animated-underline-gradient"></div>
                  </div>
                </span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto md:mx-0 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards] [animation-delay:1200ms]">
                Hãy cho chúng tôi biết bạn là ai để nhận được đề xuất thẻ tín dụng phù hợp nhất với nhu cầu và phong cách sống của bạn.
              </p>
              <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-4 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards] [animation-delay:1600ms]">
                <button
                  onClick={scrollToCategories}
                  className="px-8 py-4 bg-primary-500 rounded-full font-bold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-400 transition-all transform hover:-translate-y-1"
                >
                  Khám phá ngay
                </button>
                <button className="px-8 py-4 bg-slate-100 dark:bg-white/10 rounded-full font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 backdrop-blur-sm hover:bg-slate-200 dark:hover:bg-white/20 transition-all">Xem ưu đãi</button>
              </div>
            </div>

            <div className="flex-1 flex justify-center items-center relative h-[350px] md:h-[450px] w-full max-w-[550px]">
              <div className="animate-float relative w-full h-full flex items-center justify-center">
                {/* Card Stack */}
                <div className="relative w-48 h-92 md:w-56 md:h-80 -rotate-12 transform translate-x-12 translate-y-8 bg-slate-200 dark:bg-slate-900 rounded-[24px] border border-white/10 shadow-2xl overflow-hidden opacity-40">
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div className="w-10 h-7 bg-slate-900/10 dark:bg-white/10 rounded-md"></div>
                    <span className="text-slate-900 dark:text-white font-bold opacity-20 self-end text-xl">Elite</span>
                  </div>
                </div>
                <div className="absolute w-48 h-92 md:w-56 md:h-80 -rotate-6 transform translate-x-8 translate-y-4 bg-indigo-100 dark:bg-indigo-900 rounded-[24px] border border-white/10 shadow-2xl overflow-hidden opacity-60">
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div className="w-10 h-7 bg-indigo-900/10 dark:bg-white/10 rounded-md"></div>
                    <span className="text-indigo-900 dark:text-white font-bold opacity-20 self-end text-xl">Pro</span>
                  </div>
                </div>
                <div className="absolute w-48 h-92 md:w-56 md:h-80 rotate-0 transform translate-x-4 translate-y-2 bg-emerald-100 dark:bg-emerald-700 rounded-[24px] border border-white/10 shadow-2xl overflow-hidden opacity-80">
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div className="w-10 h-7 bg-emerald-900/10 dark:bg-white/10 rounded-md"></div>
                    <span className="text-emerald-900 dark:text-white font-bold opacity-20 self-end text-xl">Plus</span>
                  </div>
                </div>
                <div className="absolute w-48 h-92 md:w-56 md:h-80 rotate-6 transform bg-gradient-to-br from-[#c5e17a] to-[#a8c75a] rounded-[24px] border border-white/20 shadow-2xl overflow-hidden text-black group hover:scale-105 transition-transform duration-500 cursor-pointer z-20">
                  <div className="p-6 h-full flex flex-col justify-between relative">
                    <div className="flex justify-between items-start">
                      <span className="font-black text-3xl tracking-tighter italic">MΔX</span>
                      <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">contactless</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-8 bg-black/10 rounded-lg shadow-inner"></div>
                      <div className="space-y-1">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-black/30"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-black/30"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-black/30"></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-[10px] uppercase tracking-widest opacity-60">Visa Platinum</span>
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full bg-red-500/20 border border-white/20"></div>
                            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-white/20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orbiting Elements with Number Tickers */}
                <div className="floating-badge animate-orbit-slow text-green-400" style={{ top: '15%', right: '5%' }}>
                  <NumberTicker value={500} prefix="+" suffix="k" />
                </div>
                <div className="floating-badge animate-orbit-fast text-cyan-400" style={{ top: '35%', right: '-5%', animationDelay: '0.5s' }}>
                  <NumberTicker value={15} suffix="%" />
                </div>
                <div className="floating-badge animate-orbit-slow text-white" style={{ bottom: '25%', left: '0%', animationDelay: '1.2s' }}>VNĐ</div>
                <div className="floating-badge animate-orbit-fast text-green-500" style={{ bottom: '10%', right: '10%', animationDelay: '0.8s' }}>
                  <NumberTicker value={1000} prefix="+" suffix="k" />
                </div>
                <div className="floating-badge animate-orbit-slow text-blue-400" style={{ top: '55%', left: '-10%', animationDelay: '2s' }}>
                  <NumberTicker value={20} suffix="%" />
                </div>
                <div className="floating-badge animate-orbit-fast text-yellow-400 font-bold" style={{ top: '5%', right: '20%', animationDelay: '0.2s' }}>đ</div>
              </div>
            </div>
          </div>

          {/* Updated Scroll Down Indicator: Minimalist and elegant */}
          <button
            onClick={scrollToCategories}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 transition-all group z-30"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-slate-500 group-hover:text-primary-400 transition-colors">
              Bắt đầu
            </span>
            <span className="material-symbols-outlined text-slate-400 text-xl animate-bounce group-hover:text-primary-500">expand_more</span>
          </button>
        </section>

        {/* Category Selection Grid */}
        <section id="category-section" className="w-full max-w-7xl px-6 pb-32 pt-20">
          {/* Section Title */}
          <div className="text-center mb-16 opacity-0 animate-[fadeInUp_1s_ease-out_forwards] [animation-delay:200ms]">
            <h3 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent italic">
              Chọn phong cách của bạn
            </h3>
            <p className="text-slate-500 max-w-xl mx-auto text-base">
              Chúng tôi cung cấp các giải pháp tài chính tối ưu, được thiết kế riêng cho từng nhu cầu chi tiêu và phong cách sống.
            </p>
            <div className="w-24 h-1 bg-primary-500/20 mx-auto mt-6 rounded-full overflow-hidden">
              <div className="w-full h-full animated-underline-gradient opacity-60"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {personas.map((persona) => {
              const isActive = activeId === persona.id;
              return (
                <article
                  key={persona.id}
                  onMouseEnter={() => setActiveId(persona.id)}
                  className={`rounded-[40px] p-10 flex flex-col items-center text-center group transition-all duration-500 cursor-pointer border
                    ${isActive ? persona.borderColor : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/20'}
                    ${isActive ? 'lg:scale-105 z-10 shadow-2xl bg-white dark:bg-slate-900/50' : 'scale-100 bg-slate-50 dark:bg-white/5'}
                  `}
                >
                  <div className={`w-20 h-20 ${persona.bg} rounded-3xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <span className={`material-symbols-outlined text-4xl ${persona.color}`}>{persona.icon}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-800 dark:text-white">{persona.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-12 flex-grow">
                    {persona.description}
                  </p>
                  <Link
                    to="/input"
                    className={`w-full py-5 rounded-2xl text-sm font-black flex items-center justify-center gap-3 transition-all duration-300
                      ${isActive ? persona.btnClass : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10'}
                    `}
                  >
                    Chọn loại thẻ này
                    <span className="material-symbols-outlined text-base transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Welcome;