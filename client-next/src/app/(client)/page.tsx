"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/types';
import { cardApi } from '@/services/api';
import { CardItem } from '@/components/CardItem';
import { useCompare } from '@/context/CompareContext';
import { Logo } from '@/components/Logo';
import { cleanCardName } from '@/lib/utils';
import { PortraitCardVisual } from '@/components/PortraitCardVisual';

const personas = [
  { id: 'student', title: 'Sinh viên', desc: 'Bắt đầu hành trình tài chính thông minh', icon: 'school' },
  { id: 'worker', title: 'Người đi làm', desc: 'Tối ưu chi tiêu, tận hưởng ưu đãi xứng đáng', icon: 'work' },
  { id: 'family', title: 'Gia đình', desc: 'Quản lý chi tiêu gia đình hiệu quả', icon: 'family_restroom' },
  { id: 'business', title: 'Doanh nghiệp', desc: 'Giải pháp tài chính linh hoạt cho doanh nghiệp', icon: 'business' },
];

const interestTags = ['Hoàn tiền', 'Du lịch', 'Trả góp 0%', 'Hạn mức cao', 'Tiêu dùng hàng ngày', 'Không phí', 'Khác'];

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
  const [selectedInterest, setSelectedInterest] = useState('Hoàn tiền');
  const [sortBy, setSortBy] = useState('Phù hợp với bạn');
  const [cashbackRange, setCashbackRange] = useState([0, 16]);
  const [feeFilter, setFeeFilter] = useState('Tất cả');
  const [creditLimit, setCreditLimit] = useState([0, 2000]);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedCards: compareCards } = useCompare();

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

  const banks = Array.from(new Set(cards.map(c => c.bankName)));

  const filteredCards = cards.filter(card => {
    if (selectedBank !== 'Tất cả' && card.bankName !== selectedBank) return false;
    if (feeFilter === 'Miễn phí' && card.annualFee > 0) return false;
    if (feeFilter === 'Dưới 500.000đ' && card.annualFee >= 500000) return false;
    if (feeFilter === '500.000đ - 1.000.000đ' && (card.annualFee < 500000 || card.annualFee > 1000000)) return false;
    if (feeFilter === 'Trên 1.000.000đ' && card.annualFee <= 1000000) return false;
    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCards.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCards = filteredCards.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [selectedBank, feeFilter, selectedInterest, pageSize]);

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
                <button key={tag} onClick={() => setSelectedInterest(tag)}
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
                <div className="bg-white dark:bg-[#0c1425] rounded-3xl border border-slate-200/50 dark:border-slate-800 p-6 sticky top-24 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Bộ lọc</h3>
                    <button onClick={() => { setSelectedBank('Tất cả'); setFeeFilter('Tất cả'); }} className="text-xs text-red-400 font-bold hover:underline">Xóa bộ lọc</button>
                  </div>

                  {/* Bank Filter */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Ngân hàng</h4>
                    <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                      <div onClick={() => setSelectedBank('Tất cả')} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedBank === 'Tất cả' ? 'bg-vp-green border-vp-green' : 'border-slate-300 dark:border-slate-600'}`}>
                          {selectedBank === 'Tất cả' && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                        </span>
                        <span className="material-symbols-outlined text-vp-green text-[18px]">account_balance</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Tất cả ngân hàng</span>
                      </div>
                      {banks.map(bank => {
                        const bankLogo = cards.find(c => c.bankName === bank)?.bankLogo;
                        return (
                          <div key={bank} onClick={() => setSelectedBank(bank)} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedBank === bank ? 'bg-vp-green border-vp-green' : 'border-slate-300 dark:border-slate-600'}`}>
                              {selectedBank === bank && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                            </span>
                            {bankLogo ? (
                              <img src={bankLogo} alt={bank} className="h-5 w-6 object-contain flex-shrink-0 dark:bg-white/90 dark:rounded dark:px-0.5" />
                            ) : (
                              <span className="material-symbols-outlined text-slate-400 text-[18px] flex-shrink-0">credit_card</span>
                            )}
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{bank}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fee Filter */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Phí thường niên</h4>
                    <div className="space-y-1">
                      {['Tất cả', 'Miễn phí', 'Dưới 500.000đ', '500.000đ - 1.000.000đ', 'Trên 1.000.000đ'].map(fee => (
                        <label key={fee} onClick={() => setFeeFilter(fee)} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${feeFilter === fee ? 'border-vp-green' : 'border-slate-300 dark:border-slate-600'}`}>
                            {feeFilter === fee && <span className="w-2 h-2 rounded-full bg-vp-green"></span>}
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{fee}</span>
                        </label>
                      ))}
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
                        <div key={card.id} className="group bg-white dark:bg-[#0c1425] rounded-2xl border border-slate-200/60 dark:border-slate-800/80 hover:border-vp-green/60 dark:hover:border-vp-green/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_20px_40px_rgba(0,177,79,0.04)] dark:hover:shadow-[0_20px_40px_rgba(0,177,79,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                          {/* Header: Bank + Badge */}
                          <div className="flex items-center justify-between px-5 pt-5 pb-3">
                            <div className="flex items-center gap-2">
                              {card.bankLogo && <img src={card.bankLogo} alt={card.bankName} className="h-5 object-contain dark:bg-white/90 dark:rounded dark:px-1 dark:py-0.5" />}
                            </div>
                            <div className="px-3 py-1.5 rounded-full border border-vp-green/50 text-vp-green text-xs font-medium flex items-center gap-1.5 glow-green bg-vp-green/10 select-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-vp-green animate-pulse"></span>
                              Phù hợp với bạn
                            </div>
                          </div>

                          {/* Card Name */}
                          <div className="px-5 pb-3">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{cleanCardName(card.name)}</h3>
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

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 px-5 pb-5">
                            <Link href={`/card/${card.id}`} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/50 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                              Xem chi tiết
                            </Link>
                            {card.registerUrl ? (
                              <a href={card.registerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-vp-green hover:bg-vp-green/90 text-sm font-bold text-white shadow-md shadow-vp-green/10 hover:shadow-vp-green/20 active:scale-95 transition-all">
                                Đăng ký ngay
                              </a>
                            ) : (
                              <Link href={`/card/${card.id}`} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-vp-green hover:bg-vp-green/90 text-sm font-bold text-white shadow-md shadow-vp-green/10 hover:shadow-vp-green/20 active:scale-95 transition-all">
                                Đăng ký ngay
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
                <p className="text-slate-500 dark:text-slate-400">Chọn từ 2-4 thẻ để so sánh chi tiết các ưu đãi và phí</p>
              </div>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-20 h-28 rounded-2xl border-2 border-dashed flex items-center justify-center transition-all ${compareCards[i] ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'
                    }`}>
                    {compareCards[i] ? (
                      <img src={compareCards[i].imageUrl} alt={compareCards[i].name} className="w-full h-full object-cover rounded-xl" />
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
        <section className="py-20 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800/50">
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
        </section>

      </main>
    </div>
  );
}
