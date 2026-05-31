"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ────────────────────────────────────────────────
   DATA
   ──────────────────────────────────────────────── */

const architectureLayers = [
  {
    id: 'frontend',
    label: 'Frontend',
    icon: 'web',
    color: 'from-sky-500 to-blue-600',
    accent: 'sky',
    items: ['Next.js 16', 'React 19', 'TypeScript 5', 'Tailwind CSS 4'],
  },
  {
    id: 'backend',
    label: 'Backend API',
    icon: 'dns',
    color: 'from-violet-500 to-purple-600',
    accent: 'violet',
    items: ['ASP.NET Core 8', 'C#', 'REST API', 'Swagger / OpenAPI'],
  },
  {
    id: 'data',
    label: 'Database',
    icon: 'storage',
    color: 'from-emerald-500 to-green-600',
    accent: 'emerald',
    items: ['MongoDB', 'Docker Compose', 'NoSQL Document Store'],
  },
  {
    id: 'ai',
    label: 'AI & Algorithms',
    icon: 'psychology',
    color: 'from-amber-500 to-orange-600',
    accent: 'amber',
    items: ['ID3 Decision Tree', 'NLP Intent Detection', 'Rule-based Chatbot', 'Scoring Engine'],
  },
];

const technologies = [
  {
    category: 'Frontend Framework',
    name: 'Next.js 16 + React 19',
    icon: 'code',
    gradient: 'from-[#0070f3] to-[#00a6ff]',
    description:
      'Framework React thế hệ mới với App Router, Server Components và Turbopack. Hỗ trợ SSR/SSG giúp tối ưu SEO và tốc độ tải trang.',
    features: [
      'App Router với Layout lồng nhau',
      'Server & Client Components',
      'Dynamic routing cho trang thẻ chi tiết',
      'Tối ưu SEO tự động',
    ],
    badge: 'Core',
  },
  {
    category: 'Ngôn ngữ Frontend',
    name: 'TypeScript 5',
    icon: 'terminal',
    gradient: 'from-[#3178c6] to-[#235a97]',
    description:
      'Superset của JavaScript với hệ thống kiểu tĩnh mạnh mẽ, giúp phát hiện lỗi sớm, tăng khả năng bảo trì và cải thiện trải nghiệm phát triển.',
    features: [
      'Type-safe API calls với interface',
      'Generic types cho components',
      'Strict null checks',
      'IDE auto-completion nâng cao',
    ],
    badge: 'Language',
  },
  {
    category: 'Styling',
    name: 'Tailwind CSS 4 + Shadcn UI',
    icon: 'palette',
    gradient: 'from-[#06b6d4] to-[#0891b2]',
    description:
      'Utility-first CSS framework kết hợp component library Shadcn UI tạo giao diện premium với dark mode, glassmorphism và micro-animations.',
    features: [
      'Design System với CSS variables',
      'Dark mode tự động',
      'Responsive hoàn toàn',
      'Component library Shadcn UI',
    ],
    badge: 'UI/UX',
  },
  {
    category: 'Backend Framework',
    name: 'ASP.NET Core 8 (C#)',
    icon: 'cloud',
    gradient: 'from-[#512bd4] to-[#7b3ff2]',
    description:
      'Web API hiệu năng cao với kiến trúc RESTful, hỗ trợ Dependency Injection, JWT Authentication và Swagger documentation tự động.',
    features: [
      'RESTful API với 13 Controllers',
      'JWT Bearer Authentication',
      'Google OAuth 2.0 Login',
      'Swagger UI tự động',
    ],
    badge: 'Core',
  },
  {
    category: 'Cơ sở dữ liệu',
    name: 'MongoDB + Docker',
    icon: 'database',
    gradient: 'from-[#00ed64] to-[#00684a]',
    description:
      'NoSQL Document Database linh hoạt, triển khai qua Docker Compose. Lưu trữ dữ liệu thẻ tín dụng, người dùng, chi tiêu và lịch sử chat.',
    features: [
      'Document-oriented storage',
      'Docker Compose deployment',
      'MongoDB Driver 3.7 cho .NET',
      'Flexible schema cho dữ liệu thẻ',
    ],
    badge: 'Data',
  },
  {
    category: 'AI Chatbot',
    name: 'NLP Chatbot Engine',
    icon: 'smart_toy',
    gradient: 'from-[#f59e0b] to-[#d97706]',
    description:
      'Chatbot tư vấn tài chính thông minh với 11 intent detection patterns, hỗ trợ tiếng Việt. Tự động gợi ý thẻ, so sánh và tra cứu theo ngữ cảnh.',
    features: [
      'Regex-based Intent Detection',
      'Multi-turn Conversation',
      'Card Recommendation Engine',
      'Quick Reply Suggestions',
    ],
    badge: 'AI',
  },
  {
    category: 'Thuật toán gợi ý',
    name: 'ID3 Decision Tree',
    icon: 'account_tree',
    gradient: 'from-[#ef4444] to-[#dc2626]',
    description:
      'Thuật toán cây quyết định ID3 phân tích đa tiêu chí: danh mục chi tiêu, mức lương, thu nhập và điểm tín dụng để xếp hạng thẻ phù hợp nhất.',
    features: [
      'Category Matching với trọng số',
      'Salary Bracket Scoring',
      'Income Level Analysis',
      'Credit Score Ranking',
    ],
    badge: 'Algorithm',
  },
  {
    category: 'Web Scraper',
    name: 'Bank Card Scraper',
    icon: 'travel_explore',
    gradient: 'from-[#8b5cf6] to-[#6d28d9]',
    description:
      'Hệ thống thu thập dữ liệu thẻ tín dụng tự động từ 17+ ngân hàng Việt Nam. Sử dụng HtmlAgilityPack để parse HTML và trích xuất thông tin.',
    features: [
      'Hỗ trợ 17 ngân hàng VN',
      'HTML parsing với HtmlAgilityPack',
      'Next.js SSR data extraction',
      'Auto-enrich từ detail pages',
    ],
    badge: 'Automation',
  },
  {
    category: 'Xác thực',
    name: 'JWT + Google OAuth',
    icon: 'lock',
    gradient: 'from-[#10b981] to-[#059669]',
    description:
      'Hệ thống xác thực đa lớp: JWT Bearer tokens cho API authentication, Google OAuth 2.0 cho đăng nhập nhanh, BCrypt cho mã hóa mật khẩu.',
    features: [
      'JWT Token với 7 ngày expiry',
      'Google OAuth 2.0 Integration',
      'BCrypt password hashing',
      'Role-based Authorization',
    ],
    badge: 'Security',
  },
  {
    category: 'Quản lý Media',
    name: 'File Manager System',
    icon: 'perm_media',
    gradient: 'from-[#ec4899] to-[#db2777]',
    description:
      'Hệ thống quản lý ảnh tích hợp với khả năng upload, tìm kiếm, di chuyển và tổ chức file theo thư mục. Hỗ trợ Vietnamese filename sanitization.',
    features: [
      'Drag & Drop Upload',
      'Folder tree navigation',
      'Vietnamese filename slugify',
      'Storage monitoring (5GB limit)',
    ],
    badge: 'Feature',
  },
  {
    category: 'Data Visualization',
    name: 'Recharts + Analytics',
    icon: 'bar_chart',
    gradient: 'from-[#6366f1] to-[#4f46e5]',
    description:
      'Thư viện biểu đồ React cho phân tích chi tiêu trực quan. Hỗ trợ nhiều loại chart: Bar, Line, Pie, Area cho dashboard phân tích tài chính.',
    features: [
      'Biểu đồ chi tiêu theo tháng',
      'Phân tích danh mục spending',
      'Interactive tooltips',
      'Responsive chart layout',
    ],
    badge: 'Analytics',
  },
  {
    category: 'Rich Text Editor',
    name: 'TinyMCE React',
    icon: 'edit_note',
    gradient: 'from-[#0ea5e9] to-[#0284c7]',
    description:
      'WYSIWYG editor mạnh mẽ tích hợp cho module quản lý bài viết và tin tức trong Admin CMS. Hỗ trợ định dạng phong phú và media embedding.',
    features: [
      'Rich text formatting',
      'Image embedding',
      'Admin article management',
      'HTML output cho SEO',
    ],
    badge: 'CMS',
  },
];

const stats = [
  { value: '17+', label: 'Ngân hàng hỗ trợ', icon: 'account_balance' },
  { value: '13', label: 'API Controllers', icon: 'api' },
  { value: '8', label: 'Backend Services', icon: 'hub' },
  { value: '11', label: 'AI Intents', icon: 'psychology' },
];

/* ────────────────────────────────────────────────
   ANIMATION HOOK
   ──────────────────────────────────────────────── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ────────────────────────────────────────────────
   COMPONENT
   ──────────────────────────────────────────────── */

export default function TechnologiesPage() {
  const [activeTech, setActiveTech] = useState<number | null>(null);
  const heroObs = useInView();
  const archObs = useInView();
  const gridObs = useInView();
  const statsObs = useInView();

  return (
    <div className="bg-white dark:bg-[#050a12] text-slate-900 dark:text-white min-h-screen transition-colors duration-500">

      {/* ═══════ HERO ═══════ */}
      <section
        ref={heroObs.ref}
        className="relative overflow-hidden pt-16 pb-24"
      >
        {/* bg blobs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

        <div className={`max-w-5xl mx-auto px-6 text-center transition-all duration-1000 ${heroObs.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            Technology Stack
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
            Công nghệ đằng sau{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-emerald-400 to-sky-500">
              CredBack
            </span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Khám phá bộ công nghệ hiện đại mà chúng tôi sử dụng để xây dựng nền tảng tư vấn thẻ tín dụng thông minh — từ frontend đến backend, từ AI đến web scraping.
          </p>

          {/* mini stats row */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center gap-3 transition-all duration-700 ${heroObs.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${300 + i * 120}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-500 text-xl">{s.icon}</span>
                </div>
                <div className="text-left">
                  <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ARCHITECTURE OVERVIEW ═══════ */}
      <section
        ref={archObs.ref}
        className="py-20 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className={`text-center mb-14 transition-all duration-700 ${archObs.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-3xl font-black mb-3">Kiến trúc hệ thống</h2>
            <p className="text-slate-500 dark:text-slate-400">Kiến trúc 3 lớp + module AI tích hợp</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {architectureLayers.map((layer, i) => (
              <div
                key={layer.id}
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-7 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-500 hover:-translate-y-1 ${archObs.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* gradient top bar */}
                <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r ${layer.color} opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${layer.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-white text-2xl">{layer.icon}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">{layer.label}</h3>
                <ul className="space-y-2">
                  {layer.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* flow arrows (desktop only) */}
          <div className="hidden lg:flex items-center justify-center gap-2 mt-8 text-slate-400 dark:text-slate-600">
            <span className="text-xs font-bold tracking-wider uppercase">Client</span>
            <span className="material-symbols-outlined text-primary-500 animate-slide-right">arrow_forward</span>
            <span className="text-xs font-bold tracking-wider uppercase">API</span>
            <span className="material-symbols-outlined text-primary-500 animate-slide-right">arrow_forward</span>
            <span className="text-xs font-bold tracking-wider uppercase">Database</span>
            <span className="material-symbols-outlined text-amber-500 ml-6">sync_alt</span>
            <span className="text-xs font-bold tracking-wider uppercase ml-2">AI Engine</span>
          </div>
        </div>
      </section>

      {/* ═══════ TECHNOLOGY GRID ═══════ */}
      <section ref={gridObs.ref} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className={`text-center mb-14 transition-all duration-700 ${gridObs.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-3xl font-black mb-3">Công nghệ chi tiết</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Tổng quan 12 công nghệ và module cốt lõi được sử dụng trong dự án
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {technologies.map((tech, i) => {
              const isOpen = activeTech === i;
              return (
                <div
                  key={tech.name}
                  onClick={() => setActiveTech(isOpen ? null : i)}
                  className={`group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-500 overflow-hidden ${
                    isOpen
                      ? 'border-primary-500/60 shadow-xl shadow-primary-500/10 ring-1 ring-primary-500/20'
                      : 'border-slate-100 dark:border-slate-800 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5'
                  } ${gridObs.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${(i % 6) * 80}ms` }}
                >
                  <div className="p-6">
                    {/* header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tech.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <span className="material-symbols-outlined text-white text-xl">{tech.icon}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full">
                        {tech.badge}
                      </span>
                    </div>

                    {/* title */}
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      {tech.category}
                    </p>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">
                      {tech.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {tech.description}
                    </p>

                    {/* expand indicator */}
                    <div className="flex items-center gap-1.5 mt-4 text-primary-500 text-xs font-bold">
                      <span>{isOpen ? 'Thu gọn' : 'Xem chi tiết'}</span>
                      <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* expandable features */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Tính năng nổi bật
                      </p>
                      <ul className="space-y-2">
                        {tech.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <span className="material-symbols-outlined text-primary-500 text-[16px] mt-0.5 flex-shrink-0">
                              check_circle
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ STATS BANNER ═══════ */}
      <section
        ref={statsObs.ref}
        className="py-20 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50"
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className={`text-center mb-12 transition-all duration-700 ${statsObs.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <h2 className="text-3xl font-black mb-3">Quy mô dự án</h2>
            <p className="text-slate-500 dark:text-slate-400">Những con số ấn tượng phía sau CredBack</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '12+', label: 'Công nghệ sử dụng', icon: 'layers', color: 'from-sky-500 to-blue-600' },
              { value: '50+', label: 'Thẻ tín dụng', icon: 'credit_card', color: 'from-emerald-500 to-green-600' },
              { value: '8', label: 'Modules chính', icon: 'view_module', color: 'from-violet-500 to-purple-600' },
              { value: '617', label: 'Dòng code AI Chatbot', icon: 'code', color: 'from-amber-500 to-orange-600' },
            ].map((item, i) => (
              <div
                key={item.label}
                className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ${statsObs.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <span className="material-symbols-outlined text-white text-2xl">{item.icon}</span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{item.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto">
            Khám phá ngay nền tảng CredBack — nơi công nghệ hiện đại gặp gỡ tài chính thông minh.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="flex items-center gap-2 px-8 py-4 bg-primary-500 rounded-2xl font-bold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all hover:-translate-y-0.5"
            >
              Khám phá thẻ tín dụng
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white dark:bg-white/10 rounded-2xl font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/20 transition-all"
            >
              Về chúng tôi
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
