"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/types';
import { cardApi } from '@/services/api';
import { CardItem } from '@/components/CardItem';
import { useCompare } from '@/context/CompareContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CardCashbackBreakdown, CategorySpending } from '@/types';
import { useCategoryContext } from '@/context/CategoryContext';
import { Logo } from '@/components/Logo';
import { cleanCardName, generateSlug, getFallbackBankLogo } from '@/lib/utils';
import { PortraitCardVisual } from '@/components/PortraitCardVisual';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const personas = [
  { id: 'student', title: 'Sinh viên', desc: 'Bắt đầu hành trình tài chính thông minh', icon: 'school' },
  { id: 'worker', title: 'Người đi làm', desc: 'Tối ưu chi tiêu, tận hưởng ưu đãi xứng đáng', icon: 'work' },
  { id: 'family', title: 'Gia đình', desc: 'Quản lý chi tiêu gia đình hiệu quả', icon: 'family_restroom' },
  { id: 'business', title: 'Doanh nghiệp', desc: 'Giải pháp tài chính linh hoạt cho doanh nghiệp', icon: 'business' },
];

const interestTags = ['Tất cả', 'Siêu thị', 'Mua sắm', 'Du lịch', 'Ẩm thực', 'Bảo hiểm', 'Giáo dục', 'Online', 'Miễn phí thường niên'];

const whyUs = [
  { icon: 'language', title: '100% Online', desc: 'Đăng ký hoàn toàn online, nhận thẻ tại nhà' },
  { icon: 'bolt', title: 'Phê duyệt nhanh', desc: 'Chỉ từ 5 phút, có kết quả tức thì' },
  { icon: 'verified_user', title: 'Bảo mật tuyệt đối', desc: 'Thông tin được bảo mật theo chuẩn quốc tế' },
  { icon: 'support_agent', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ tư vấn luôn sẵn sàng giúp đỡ bạn' },
];

export default function HomePage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState('Tất cả');
  const [selectedInterest, setSelectedInterest] = useState('Tất cả');
  const [sortBy, setSortBy] = useState('Phù hợp với bạn');
  const [cashbackRange, setCashbackRange] = useState([0, 16]);
  const [feeFilter, setFeeFilter] = useState('Tất cả');
  const [selectedAudience, setSelectedAudience] = useState<string>('Tất cả');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    bank: true,
    audience: true,
    category: true,
    fee: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [creditLimit, setCreditLimit] = useState([0, 2000]);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedCards: compareCards, isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { getCategoryColor } = useCategoryContext();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const results = await cardApi.getAll();
        setCards(results);
      } catch (e) {
        console.error("Failed to fetch cards:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const normalizeBankName = (name: string | undefined | null) => {
    if (!name) return '';
    const lower = name.trim().toLowerCase();
    if (lower === 'vpbank') return 'VPBank';
    if (lower === 'vib') return 'VIB';
    if (lower === 'tpbank') return 'TPBank';
    if (lower === 'techcombank') return 'Techcombank';
    if (lower === 'sacombank') return 'Sacombank';
    if (lower === 'vietcombank') return 'Vietcombank';
    if (lower === 'mbbank' || lower === 'mb') return 'MBBank';
    if (lower === 'hsbc') return 'HSBC';
    if (lower === 'bidv') return 'BIDV';
    if (lower === 'msb') return 'MSB';
    if (lower === 'acb') return 'ACB';
    if (lower === 'ocb') return 'OCB';
    if (lower === 'shb') return 'SHB';
    if (lower === 'uob') return 'UOB';
    if (lower === 'hdbank') return 'HDBank';
    if (lower === 'standard chartered') return 'Standard Chartered';
    if (lower === 'shinhan' || lower === 'shinhan bank') return 'Shinhan Bank';
    return lower.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const banks = Array.from(new Set(cards.map(c => normalizeBankName(c.bankName)))).filter(Boolean).sort();
  const audiences = ['Tất cả', 'Sinh viên', 'Người đi làm', 'Gia đình', 'Doanh nghiệp'];
  const filterCategories = ['Tất cả', ...Array.from(new Set(cards.flatMap(c => c.cashbackRules?.map(r => r.category) || []))).filter(Boolean).filter(c => c !== 'Tất cả')];
  const fees = ['Tất cả', 'Miễn phí', 'Dưới 500.000đ', '500.000đ - 1.000.000đ', 'Trên 1.000.000đ'];

  const filteredCards = cards.filter(card => {
    // Bank Filter
    const matchBank = selectedBank === 'Tất cả' || normalizeBankName(card.bankName) === selectedBank;

    // Audience Filter
    const matchAudience = selectedAudience === 'Tất cả' || (card.tags && card.tags.includes(selectedAudience));

    // Fee Filter
    let matchFee = true;
    if (feeFilter === 'Miễn phí') {
      matchFee = card.annualFee === 0;
    } else if (feeFilter === 'Dưới 500.000đ') {
      matchFee = card.annualFee > 0 && card.annualFee < 500000;
    } else if (feeFilter === '500.000đ - 1.000.000đ') {
      matchFee = card.annualFee >= 500000 && card.annualFee <= 1000000;
    } else if (feeFilter === 'Trên 1.000.000đ') {
      matchFee = card.annualFee > 1000000;
    }

    // Category Filter
    const matchCategory = selectedCategories.length === 0 || (card.cashbackRules && card.cashbackRules.some(r => selectedCategories.includes(r.category)));

    // Search Filter
    const matchSearch = searchTerm === '' || card.name.toLowerCase().includes(searchTerm.toLowerCase()) || (card.bankName && card.bankName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Interest Filter
    let matchInterest = true;
    if (selectedInterest !== 'Tất cả') {
      const s = selectedInterest.toLowerCase();
      matchInterest = (card.tags && card.tags.some(t => t.toLowerCase().includes(s))) ||
        (card.description && card.description.toLowerCase().includes(s)) ||
        (card.benefits && card.benefits.some(b => b.toLowerCase().includes(s))) ||
        (card.cashbackRules && card.cashbackRules.some(r => r.category.toLowerCase().includes(s))) ||
        (card.name.toLowerCase().includes(s));
    }

    return matchBank && matchAudience && matchFee && matchCategory && matchSearch && matchInterest;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCards = filteredCards.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [selectedBank, feeFilter, selectedAudience, selectedCategories, searchTerm, pageSize, selectedInterest]);

  const scrollToCards = () => {
    document.getElementById('cards-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-[#050a12] text-slate-900 dark:text-white min-h-screen transition-colors duration-500">
      <main className="flex flex-col overflow-x-hidden">

        {/* ===== HERO SECTION ===== */}
        <section className="relative bg-gradient-to-b from-primary-50 via-white to-white dark:from-primary-900/10 dark:via-[#050a12] dark:to-[#050a12] pt-10 pb-20">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                <span className="text-slate-900 dark:text-white">Tìm thẻ tín dụng</span><br />
                <span className="text-primary-500 italic">phù hợp với bạn</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Trả lời vài câu hỏi đơn giản để chúng tôi gợi ý thẻ tín dụng tốt nhất dành riêng cho bạn.
              </p>

              {/* 3 Steps */}
              <div className="flex items-center gap-6 justify-center lg:justify-start text-sm">
                {[
                  { num: 1, text: 'Chọn đối tượng của bạn' },
                  { num: 2, text: 'Chọn nhu cầu & ưu tiên' },
                  { num: 3, text: 'Xem thẻ gợi ý & đăng ký dễ dàng' },
                ].map((step) => (
                  <div key={step.num} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{step.num}</div>
                    <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">{step.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link href="/input" className="flex items-center gap-2 px-8 py-4 bg-primary-500 rounded-2xl font-bold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all hover:-translate-y-0.5">
                  Bắt đầu chọn thẻ
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </Link>
                <button onClick={scrollToCards} className="px-8 py-4 bg-white dark:bg-white/10 rounded-2xl font-bold text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/20 transition-all">
                  Xem tất cả thẻ
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3 justify-center lg:justify-start pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400"><strong className="text-slate-700 dark:text-white">10.000+</strong> khách hàng đã tìm được thẻ phù hợp</span>
              </div>
            </div>

            {/* Right - Card Visual */}
            <div className="flex-1 relative flex justify-center items-center min-h-[380px] max-w-[550px]">
              <div className="relative w-64 h-40 md:w-80 md:h-48">
                {/* Back card */}
                <div className="absolute -top-4 -left-6 w-full h-full bg-slate-800 rounded-2xl shadow-xl opacity-40 -rotate-6"></div>
                {/* Front card */}
                <div className="relative w-full h-full bg-gradient-to-br from-[#c5e17a] to-[#7ec758] rounded-2xl shadow-2xl overflow-hidden z-10">
                  <div className="p-6 h-full flex flex-col justify-between text-black">
                    <div className="flex justify-between items-start">
                      <span className="font-black text-2xl tracking-tighter italic">MΔX</span>
                      <span className="text-xs font-bold opacity-60">VISA</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="w-10 h-7 bg-black/10 rounded-md shadow-inner"></div>
                      <span className="font-bold text-[10px] uppercase tracking-widest opacity-50">Visa Platinum</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute top-0 right-0 bg-white dark:bg-slate-800 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-2 z-20 animate-float">
                <span className="material-symbols-outlined text-primary-500">percent</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Hoàn tiền</p>
                  <p className="text-xs text-primary-500 font-black">đến 5%</p>
                </div>
              </div>
              <div className="absolute top-1/4 -right-4 bg-white dark:bg-slate-800 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-2 z-20" style={{ animationDelay: '1s' }}>
                <span className="material-symbols-outlined text-blue-500">money_off</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Trả góp</p>
                  <p className="text-xs text-blue-500 font-black">0% lãi suất</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-0 bg-white dark:bg-slate-800 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-2 z-20">
                <span className="material-symbols-outlined text-amber-500">account_balance_wallet</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Hạn mức</p>
                  <p className="text-xs text-amber-500 font-black">đến 1 tỷ</p>
                </div>
              </div>
              <div className="absolute top-1/3 -left-4 bg-white dark:bg-slate-800 shadow-lg rounded-2xl px-4 py-3 flex items-center gap-2 z-20">
                <span className="material-symbols-outlined text-emerald-500">verified</span>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Miễn phí</p>
                  <p className="text-xs text-emerald-500 font-black">thường niên</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== PERSONA SECTION ===== */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Chọn đối tượng của bạn</h2>
              <p className="text-slate-500 dark:text-slate-400">Chọn đúng đối tượng để chúng tôi gợi ý thẻ phù hợp nhất</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {personas.map((p) => (
                <Link key={p.id} href={`/input?profile=${p.id}`}
                  className="group bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary-500 text-3xl">{p.icon}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{p.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== INTEREST TAGS ===== */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Bạn quan tâm điều gì nhất?</h2>
              <p className="text-slate-500 dark:text-slate-400">Chọn 1 hoặc nhiều nhu cầu để nhận gợi ý chính xác hơn</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {interestTags.map((tag) => (
                <button key={tag} onClick={() => {
                  setSelectedInterest(tag);
                  scrollToCards();
                }}
                  className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${selectedInterest === tag
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CARD LISTING WITH SIDEBAR ===== */}
        <section id="cards-section" className="py-16 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Sidebar Filters */}
              <aside className="lg:w-72 flex-shrink-0">
                <div className="sticky top-24">
                  <div className="bg-white dark:bg-[#0c1425] rounded-3xl border border-slate-200/50 dark:border-slate-800 p-6 pt-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 pt-3 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-vp-green/15 flex items-center justify-center text-vp-green">
                          <span className="material-symbols-outlined !text-[20px]">filter_alt</span>
                        </div>
                        <h3 className="font-bold text-[17px] text-slate-900 dark:text-white tracking-wide">Bộ lọc</h3>
                      </div>
                      <button onClick={() => { setSelectedBank('Tất cả'); setFeeFilter('Tất cả'); setSelectedAudience('Tất cả'); setSelectedCategories([]); setSearchTerm(''); }} className="text-[13px] text-vp-green hover:text-vp-green/80 flex items-center gap-1.5 font-semibold transition-colors">
                        Xóa bộ lọc <span className="material-symbols-outlined !text-[16px]">refresh</span>
                      </button>
                    </div>

                    <div className="pt-4 space-y-6">
                      {/* Bank Filter */}
                      <div>
                        <div className="flex items-center justify-between mb-4 cursor-pointer group select-none" onClick={() => toggleSection('bank')}>
                          <h4 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Ngân hàng</h4>
                          <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${expandedSections.bank ? 'rotate-0' : 'rotate-180'}`}>expand_less</span>
                        </div>
                        <div className={`space-y-1 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar ${expandedSections.bank ? 'block' : 'hidden'}`}>
                          <div onClick={() => setSelectedBank('Tất cả')} className="flex items-center justify-between cursor-pointer py-1.5 group">
                            <div className="flex items-center gap-3">
                              <span className={`w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 transition-all ${selectedBank === 'Tất cả' ? 'bg-green-300 dark:bg-green-400 text-green-900 dark:text-green-950 shadow-sm' : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-green-400/50'}`}>
                                {selectedBank === 'Tất cả' && <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 800" }}>check</span>}
                              </span>
                              <span className="material-symbols-outlined text-vp-green text-[20px]">account_balance</span>
                              <span className="text-[15px] text-slate-700 dark:text-slate-300">Tất cả ngân hàng</span>
                            </div>
                            <span className={`text-[13px] ${selectedBank === 'Tất cả' ? 'text-vp-green font-semibold' : 'text-slate-400'}`}>{cards.length}</span>
                          </div>
                          {banks.map(bank => {
                            const matchingCard = cards.find(c => normalizeBankName(c.bankName) === bank);
                            const bankLogo = matchingCard?.bankLogo || getFallbackBankLogo(bank);
                            const count = cards.filter(c => normalizeBankName(c.bankName) === bank).length;
                            return (
                              <div key={bank} onClick={() => setSelectedBank(bank)} className="flex items-center justify-between cursor-pointer py-1.5 group">
                                <div className="flex items-center gap-3">
                                  <span className={`w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0 transition-all ${selectedBank === bank ? 'bg-green-300 dark:bg-green-400 text-green-900 dark:text-green-950 shadow-sm' : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-green-400/50'}`}>
                                    {selectedBank === bank && <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 800" }}>check</span>}
                                  </span>
                                  {bankLogo ? (
                                    <img src={bankLogo} alt={bank} className="h-5 w-6 object-contain flex-shrink-0 dark:bg-white/90 dark:rounded dark:px-0.5" />
                                  ) : (
                                    <span className="material-symbols-outlined text-slate-400 text-[20px] flex-shrink-0">credit_card</span>
                                  )}
                                  <span className="text-[15px] text-slate-700 dark:text-slate-300 truncate">{bank}</span>
                                </div>
                                <span className={`text-[13px] ${selectedBank === bank ? 'text-vp-green font-semibold' : 'text-slate-400'}`}>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <hr className="border-slate-100 dark:border-slate-800" />

                      {/* Target Audience Filter */}
                      <div>
                        <div className="flex items-center justify-between mb-4 cursor-pointer group select-none" onClick={() => toggleSection('audience')}>
                          <h4 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Phân loại đối tượng</h4>
                          <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${expandedSections.audience ? 'rotate-0' : 'rotate-180'}`}>expand_less</span>
                        </div>
                        <div className={`${expandedSections.audience ? 'flex' : 'hidden'} flex-wrap gap-1.5`}>
                          {audiences.map(aud => (
                            <button
                              key={aud}
                              onClick={() => setSelectedAudience(aud)}
                              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${selectedAudience === aud
                                ? 'bg-vp-green/10 text-vp-green border-vp-green'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-vp-green/50 hover:text-vp-green'
                                }`}
                            >
                              {aud}
                            </button>
                          ))}
                        </div>
                      </div>

                      <hr className="border-slate-100 dark:border-slate-800" />

                      {/* Category Filter */}
                      <div>
                        <div className="flex items-center justify-between mb-4 cursor-pointer group select-none" onClick={() => toggleSection('category')}>
                          <h4 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Danh mục hoàn tiền</h4>
                          <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${expandedSections.category ? 'rotate-0' : 'rotate-180'}`}>expand_less</span>
                        </div>
                        <div className={`${expandedSections.category ? 'flex' : 'hidden'} flex-wrap gap-1.5 max-h-[185px] overflow-y-auto pr-1 custom-scrollbar`}>
                          {filterCategories.map(cat => {
                            const isSelected = cat === 'Tất cả' ? selectedCategories.length === 0 : selectedCategories.includes(cat);
                            return (
                              <button
                                key={cat}
                                onClick={() => {
                                  if (cat === 'Tất cả') {
                                    setSelectedCategories([]);
                                  } else {
                                    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${isSelected
                                  ? 'bg-vp-green/10 text-vp-green border-vp-green'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-vp-green/50 hover:text-vp-green'
                                  }`}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <hr className="border-slate-100 dark:border-slate-800" />

                      {/* Fee Filter */}
                      <div>
                        <div className="flex items-center justify-between mb-4 cursor-pointer group select-none" onClick={() => toggleSection('fee')}>
                          <h4 className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Phí thường niên</h4>
                          <span className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-300 ${expandedSections.fee ? 'rotate-0' : 'rotate-180'}`}>expand_less</span>
                        </div>
                        <div className={`${expandedSections.fee ? 'flex' : 'hidden'} flex-wrap gap-1.5`}>
                          {fees.map(fee => (
                            <button
                              key={fee}
                              onClick={() => setFeeFilter(fee)}
                              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all border ${feeFilter === fee
                                ? 'bg-vp-green/10 text-vp-green border-vp-green'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-vp-green/50 hover:text-vp-green'
                                }`}
                            >
                              {fee}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </aside>

              {/* Card Results */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chúng tôi tìm thấy <strong className="text-slate-900 dark:text-white">{filteredCards.length} thẻ</strong> phù hợp với bạn
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Page Size */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium hidden sm:inline">Hiển thị</span>
                      <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                        className="text-sm bg-white dark:bg-[#0c1425] border border-slate-200/50 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-vp-green/50"
                      >
                        {[6, 9, 12, 24].map(n => (
                          <option key={n} value={n}>{n} thẻ</option>
                        ))}
                      </select>
                    </div>
                    {/* Sort */}
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm bg-white dark:bg-[#0c1425] border border-slate-200/50 dark:border-slate-800 rounded-xl px-4 py-2 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-vp-green/50"
                    >
                      <option>Phù hợp với bạn</option>
                      <option>Hoàn tiền cao nhất</option>
                      <option>Phí thấp nhất</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 animate-pulse">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4"></div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded mb-2"></div>
                        <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                      </div>
                    ))
                  ) : paginatedCards.length > 0 ? (
                    paginatedCards.map(card => {
                      const topRule = card.cashbackRules?.reduce((best, r) => r.percentage > (best?.percentage || 0) ? r : best, card.cashbackRules[0]);
                      return (
                        <div key={card.id} className={`group bg-white dark:bg-[#0c1425] rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_20px_40px_rgba(0,177,79,0.04)] dark:hover:shadow-[0_20px_40px_rgba(0,177,79,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col ${card.id && isInCompare(card.id)
                          ? 'border-vp-green ring-1 ring-vp-green'
                          : 'border-slate-200/60 dark:border-slate-800/80 hover:border-vp-green/60 dark:hover:border-vp-green/50'
                          }`}>
                          {/* Header: Bank + Badge */}
                          <div className="flex items-center justify-between px-5 pt-5 pb-3">
                            <div className="flex items-center gap-2">
                              {(card.bankLogo || getFallbackBankLogo(card.bankName)) && <img src={card.bankLogo || getFallbackBankLogo(card.bankName)!} alt={card.bankName} className="h-5 object-contain dark:bg-white/90 dark:rounded dark:px-1 dark:py-0.5" />}
                            </div>
                            <div className="px-3 py-1.5 rounded-full border border-vp-green/50 text-vp-green text-xs font-medium flex items-center gap-1.5 glow-green bg-vp-green/10 select-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-vp-green animate-pulse"></span>
                              Phù hợp với bạn
                            </div>
                          </div>

                          {/* Card Name */}
                          <div className="px-5 pb-4">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{cleanCardName(card.name)}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">{card.bankName}</p>
                          </div>

                          {/* Card Image */}
                          <div className="px-5 pb-4">
                            <div className="relative w-full aspect-[1.6/1] rounded-xl overflow-hidden border border-slate-100/70 dark:border-slate-800/80 shadow-md group-hover:shadow-lg transition-shadow">
                              <PortraitCardVisual imageUrl={card.imageUrl} name={card.name} />
                            </div>
                          </div>

                          {/* Stats Row Container */}
                          <div className="grid grid-cols-3 gap-1 py-2.5 mx-5 mb-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100/80 dark:border-slate-800/40">
                            <div className="text-center">
                              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Hoàn tiền ↑</p>
                              <p className="text-sm text-vp-green font-black">{topRule ? `${topRule.percentage}%` : 'N/A'}</p>
                            </div>
                            <div className="text-center border-x border-slate-200/50 dark:border-slate-800/50">
                              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Phí thường niên</p>
                              <p className="text-[10px] font-black text-slate-900 dark:text-white">{card.annualFee === 0 ? 'Miễn phí năm đầu' : `${(card.annualFee / 1000).toFixed(0)}K`}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Hoàn tối đa</p>
                              <p className="text-sm font-black text-vp-green">
                                {card.maxCashbackPerMonth ? `${(card.maxCashbackPerMonth / 1000).toLocaleString('vi-VN')}K/th` : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {card.minSpendForCashback ? (
                            <div className="mx-5 mb-4 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 flex items-center justify-center gap-1.5 text-sky-700 dark:text-sky-300">
                              <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                              <span className="text-[11px] font-bold">Chi tiêu tối thiểu: {(card.minSpendForCashback / 1000000).toLocaleString('vi-VN')} Tr/tháng</span>
                            </div>
                          ) : null}

                          {/* Category Tags */}
                          <div className="px-5 pb-3">
                            {(() => {
                              const cardCategoriesWithPercentage = Array.from(new Set(card.cashbackRules?.map(r => r.category)))
                                .filter(Boolean)
                                .map(catName => {
                                  const rulesForCat = card.cashbackRules?.filter(r => r.category === catName) || [];
                                  const maxPercentage = Math.max(...rulesForCat.map(r => r.percentage));
                                  return { name: catName, percentage: maxPercentage };
                                });

                              // Removed hardcoded tagColors array as we are using backend colors now

                              const allTags = [
                                ...cardCategoriesWithPercentage.map((cat, idx) => ({ type: 'category' as const, data: cat, idx })),
                                ...(card.tags || []).map((tag, idx) => ({ type: 'tag' as const, data: tag, idx }))
                              ];

                              if (allTags.length === 0) return null;

                              let currentLength = 0;
                              let MAX_TAGS = 0;
                              for (let i = 0; i < allTags.length; i++) {
                                const textLength = allTags[i].type === 'category' ? (allTags[i].data as { name: string }).name.length : (allTags[i].data as string).length;
                                if (currentLength + textLength > 25 && MAX_TAGS > 0) {
                                  break;
                                }
                                currentLength += textLength + 5;
                                MAX_TAGS++;
                                if (MAX_TAGS >= 2) break;
                              }
                              if (allTags.length > 0 && MAX_TAGS === 0) MAX_TAGS = 1;

                              const visibleTags = allTags.slice(0, MAX_TAGS);
                              const hiddenTags = allTags.slice(MAX_TAGS);

                              return (
                                <div className="flex flex-nowrap items-center gap-2 overflow-hidden max-w-full">
                                  {visibleTags.map((item) => {
                                    if (item.type === 'category') {
                                      const cat = item.data as { name: string; percentage: number };
                                      const hexColor = getCategoryColor(cat.name);
                                      return (
                                        <div key={`cat-${item.idx}`} className="inline-flex items-center rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/40 overflow-hidden shrink-0 max-w-full shadow-sm">
                                          <div className="flex items-center pl-2 pr-1.5 py-1 min-w-0">
                                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mr-1.5" style={{ backgroundColor: hexColor }}></span>
                                            <span className="text-[10.5px] font-bold truncate" style={{ color: hexColor }}>
                                              {cat.name}
                                            </span>
                                          </div>
                                          <div className="pl-1.5 pr-2 py-1 border-l border-slate-200/80 dark:border-slate-800/80 flex-shrink-0 flex items-center justify-center bg-white/50 dark:bg-black/20">
                                            <span className="text-[10.5px] font-black leading-none mb-[1px]" style={{ color: hexColor }}>
                                              {cat.percentage}%
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    } else {
                                      const tag = item.data;
                                      return (
                                        <div key={`tag-${item.idx}`} className="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 shrink-0 max-w-full min-w-0">
                                          <span className="text-[10px] text-slate-400 flex-shrink-0 mr-1">●</span>
                                          <span className="text-[10px] font-medium truncate">{tag}</span>
                                        </div>
                                      );
                                    }
                                  })}

                                  {hiddenTags.length > 0 && (
                                    <TooltipProvider delay={100}>
                                      <Tooltip>
                                        <TooltipTrigger className="flex items-center justify-center px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0">
                                          <span className="text-[12px] font-medium">+{hiddenTags.length}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="flex flex-col gap-2 p-2 bg-white dark:bg-[#0c1425] border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl z-50">
                                          {hiddenTags.map((item) => {
                                            if (item.type === 'category') {
                                              const cat = item.data as { name: string; percentage: number };
                                              const hexColor = getCategoryColor(cat.name);
                                              return (
                                                <div key={`hidden-cat-${item.idx}`} className={`inline-flex items-center justify-between rounded-full border overflow-hidden shrink-0 w-full`} style={{ borderColor: `${hexColor}60`, backgroundColor: `${hexColor}15` }}>
                                                  <div className="flex items-center px-2 py-1 min-w-0">
                                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mr-1.5`} style={{ backgroundColor: hexColor }}></span>
                                                    <span className={`text-[11px] font-bold truncate`} style={{ color: hexColor }}>
                                                      {cat.name}
                                                    </span>
                                                  </div>
                                                  <div className={`px-2 py-1 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-l flex-shrink-0`} style={{ borderColor: `${hexColor}60` }}>
                                                    <span className={`text-[11px] font-black`} style={{ color: hexColor }}>
                                                      {cat.percentage}%
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            } else {
                                              const tag = item.data;
                                              return (
                                                <div key={`hidden-tag-${item.idx}`} className="inline-flex items-center px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 w-full">
                                                  <span className="text-[11px] text-slate-400 flex-shrink-0 mr-1.5">●</span>
                                                  <span className="text-[11px] font-medium truncate">{tag}</span>
                                                </div>
                                              );
                                            }
                                          })}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Benefits preview */}
                          <div className="px-5 pb-4 flex-grow">
                            <ul className="space-y-1.5">
                              {(card.benefits || []).slice(0, 2).map((b, i) => (
                                <li key={i} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                  <span className="material-symbols-outlined text-vp-green !text-sm flex-shrink-0">check_circle</span>
                                  <span className="line-clamp-1">{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex items-center gap-2 px-5 pb-5 mt-auto">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!card.id) return;
                                if (isInCompare(card.id)) {
                                  removeFromCompare(card.id);
                                } else {
                                  addToCompare(card);
                                }
                              }}
                              className={`flex items-center justify-center w-11 h-11 rounded-xl border flex-shrink-0 transition-colors ${card.id && isInCompare(card.id)
                                ? 'bg-vp-green/10 border-vp-green text-vp-green'
                                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-200/60 dark:border-slate-700/50 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                              title={card.id && isInCompare(card.id) ? "Bỏ chọn" : "So sánh thẻ"}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {card.id && isInCompare(card.id) ? 'check_box' : 'compare_arrows'}
                              </span>
                            </button>
                            <Link href={`/card/${generateSlug(card.name)}`} className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/50 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                              Chi tiết
                            </Link>
                            {card.registerUrl ? (
                              <a href={card.registerUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-vp-green hover:bg-vp-green/90 text-sm font-bold text-white shadow-md shadow-vp-green/10 hover:shadow-vp-green/20 active:scale-95 transition-all">
                                Đăng ký
                              </a>
                            ) : (
                              <Link href={`/card/${generateSlug(card.name)}`} className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-vp-green hover:bg-vp-green/90 text-sm font-bold text-white shadow-md shadow-vp-green/10 hover:shadow-vp-green/20 active:scale-95 transition-all">
                                Đăng ký
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">search_off</span>
                      <p className="text-slate-500 dark:text-slate-400 font-bold">Không tìm thấy thẻ phù hợp.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {!loading && filteredCards.length > pageSize && (
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400 font-medium">
                      Trang {safePage}/{totalPages} · Hiển thị {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredCards.length)} / {filteredCards.length} thẻ
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage <= 1}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">chevron_left</span>
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          typeof p === 'string' ? (
                            <span key={`dots-${idx}`} className="w-9 h-9 flex items-center justify-center text-xs text-slate-400">…</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${p === safePage
                                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                                : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 hover:border-primary-300'
                                }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage >= totalPages}
                        className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 hover:border-primary-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== COMPARE CTA ===== */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">So sánh các thẻ bạn thích</h2>
                <p className="text-slate-500 dark:text-slate-400">Chọn từ 2-3 thẻ để so sánh chi tiết các ưu đãi và phí</p>
              </div>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`relative w-20 h-28 rounded-2xl flex items-center justify-center transition-all overflow-hidden ${compareCards[i] ? 'ring-2 ring-primary-500 bg-[#080d1a] shadow-[0_0_15px_rgba(0,177,79,0.2)]' : 'border-2 border-dashed border-slate-200 dark:border-slate-700'
                    }`}>
                    {compareCards[i] ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <PortraitCardVisual imageUrl={compareCards[i].imageUrl} name={compareCards[i].name} roundedClass="rounded-[6px]" />
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">add</span>
                    )}
                  </div>
                ))}
                {compareCards.length >= 2 && (
                  <Link href="/compare" className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all">
                    Bắt đầu so sánh ({compareCards.length})
                    <span className="material-symbols-outlined">compare_arrows</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== WHY CREDBACK ===== */}
        {/* <section className="py-20 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-12">Vì sao chọn CredBack?</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {whyUs.map((item) => (
                <div key={item.title} className="text-center group">
                  <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary-500 text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

      </main>
    </div>
  );
}
