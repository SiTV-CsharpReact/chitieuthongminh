"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { cardApi } from '@/services/api';
import { Card } from '@/types';
import { cleanCardName, getFallbackBankLogo } from '@/lib/utils';
import { PortraitCardVisual } from '@/components/PortraitCardVisual';
import CardItem from '@/components/CardItem';

interface CardDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function CardDetailPage({ params }: CardDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDarkMode } = useTheme();
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, isOwned, addOwnedCard, removeOwnedCard } = useFavorites();
  const [card, setCard] = useState<Card | null>(null);
  const [relatedCards, setRelatedCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardId, setCardId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const spendingAmount = Number(searchParams.get('spending')) || 10000000;
  const topCategory = searchParams.get('topCategory') || 'Ăn uống';

  useEffect(() => {
    params.then(p => setCardId(p.slug));
  }, [params]);

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) return;
      try {
        setLoading(true);
        const data = await cardApi.getById(cardId);

        // Calculate estimated cashback for this card
        const matchingRule = data.cashbackRules.find(r =>
          topCategory.toLowerCase().includes(r.category.toLowerCase()) ||
          r.category.toLowerCase().includes(topCategory.toLowerCase())
        );

        const generalRule = data.cashbackRules.find(r =>
          r.category === 'Tất cả' || r.category === 'All'
        );

        const rate = matchingRule ? matchingRule.percentage : (generalRule ? generalRule.percentage : 0);
        const ruleCap = matchingRule ? matchingRule.capAmount : (generalRule ? generalRule.capAmount : undefined);
        let cashbackAmount = (spendingAmount * rate) / 100;
        if (ruleCap && cashbackAmount > ruleCap) cashbackAmount = ruleCap;
        if (data.maxCashbackPerMonth && cashbackAmount > data.maxCashbackPerMonth) cashbackAmount = data.maxCashbackPerMonth;

        setCard({ ...data, cashbackAmount });

        // Fetch related cards
        try {
          const allCards = await cardApi.getAll();
          
          // Lấy danh mục hoàn tiền chính (cao nhất, trừ "Tất cả")
          const mainCategories = data.cashbackRules
            .filter(r => !['all', 'tất cả'].includes(r.category.toLowerCase()))
            .sort((a, b) => b.percentage - a.percentage)
            .map(r => r.category.toLowerCase());

          let related = [];
          if (mainCategories.length > 0) {
            const primaryCat = mainCategories[0];
            related = allCards.filter(c => 
              c.id !== data.id && 
              c.cashbackRules.some(r => r.category.toLowerCase() === primaryCat)
            ).sort((a, b) => {
              const aRate = a.cashbackRules.find(r => r.category.toLowerCase() === primaryCat)?.percentage || 0;
              const bRate = b.cashbackRules.find(r => r.category.toLowerCase() === primaryCat)?.percentage || 0;
              return bRate - aRate;
            }).slice(0, 8);
          }

          if (related.length < 4) {
            const others = allCards.filter(c => c.id !== data.id && !related.find(r => r.id === c.id)).slice(0, 8 - related.length);
            setRelatedCards([...related, ...others]);
          } else {
            setRelatedCards(related);
          }
        } catch (err) {
          console.error("Failed to fetch related cards", err);
        }
      } catch (e) {
        console.error("Failed to fetch card details:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId, spendingAmount, topCategory]);

  useEffect(() => {
    if (isModalOpen && card?.registerUrl && qrRef.current) {
      import('qr-code-styling').then(({ default: QRCodeStyling }) => {
        qrRef.current!.innerHTML = '';

        const qrCode = new QRCodeStyling({
          width: 260,
          height: 260,
          data: card.registerUrl,
          image: "/logo.svg", // Dùng logo component SVG vừa lưu
          qrOptions: {
            errorCorrectionLevel: 'M' // Giảm mức độ sửa lỗi để mã QR bớt dày đặc (ít chấm hơn)
          },
          dotsOptions: {
            color: "#000000", // Màu đen cho các chấm QR
            type: "rounded"
          },
          cornersSquareOptions: {
            color: "#18181b",
            type: "extra-rounded"
          },
          imageOptions: {
            crossOrigin: "anonymous",
            margin: 8,
            imageSize: 0.4
          }
        });

        qrCode.append(qrRef.current!);
      });
    }
  }, [isModalOpen, card?.registerUrl]);

  if (loading) {
    return (
      <div className="pt-40 text-center animate-pulse">
        <p className="text-slate-400 font-bold uppercase tracking-widest">Đang tải thông tin chi tiết...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="pt-40 text-center">
        <p className="text-slate-500 font-bold">Không tìm thấy thông tin thẻ.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary-500 font-bold">Quay lại</button>
      </div>
    );
  }

  // Pre-calculate chart data based on card rules and spending
  const rawChartData = card.cashbackRules.map(rule => {
    let rawAmount = (spendingAmount * rule.percentage) / 100;
    let isCategoryCapped = false;
    if (rule.capAmount && rawAmount >= rule.capAmount) {
      rawAmount = rule.capAmount;
      isCategoryCapped = true;
    }
    return {
      name: rule.category,
      value: rawAmount,
      percentage: rule.percentage,
      capAmount: rule.capAmount,
      isCategoryCapped
    };
  }).slice(0, 5);

  const totalValue = rawChartData.reduce((sum, item) => sum + item.value, 0);
  const monthlyEstimate = card.maxCashbackPerMonth ? Math.min(totalValue, card.maxCashbackPerMonth) : totalValue;

  const chartData = rawChartData.map(item => ({
    ...item,
    proportion: totalValue > 0 ? Math.round((item.value / totalValue) * 100) : 0
  }));

  const getCategoryStyle = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('ăn uống') || lower.includes('nhà hàng') || lower.includes('ẩm thực') || lower.includes('dining')) {
      return { icon: 'restaurant', color: '#f59e0b' }; // Orange
    }
    if (lower.includes('mua sắm') || lower.includes('thời trang') || lower.includes('siêu thị')) {
      return { icon: 'shopping_cart', color: '#a855f7' }; // Purple
    }
    if (lower.includes('online') || lower.includes('sàn thương mại') || lower.includes('thương mại điện tử')) {
      return { icon: 'language', color: '#3b82f6' }; // Blue
    }
    if (lower.includes('du lịch') || lower.includes('đặt vé') || lower.includes('khách sạn') || lower.includes('lưu trú') || lower.includes('vé máy bay')) {
      return { icon: 'flight', color: '#0ea5e9' }; // Sky
    }
    if (lower.includes('di chuyển') || lower.includes('grab') || lower.includes('taxi') || lower.includes('phương tiện')) {
      return { icon: 'local_taxi', color: '#eab308' }; // Yellow
    }
    if (lower.includes('y tế') || lower.includes('sức khỏe') || lower.includes('bảo hiểm')) {
      return { icon: 'medical_services', color: '#ef4444' }; // Red
    }
    if (lower.includes('giáo dục') || lower.includes('học phí') || lower.includes('trường học')) {
      return { icon: 'school', color: '#8b5cf6' }; // Violet
    }
    if (lower.includes('tất cả') || lower.includes('all')) {
      return { icon: 'public', color: '#22c55e' }; // Green
    }
    if (lower.includes('giải trí') || lower.includes('xem phim')) {
      return { icon: 'movie', color: '#ec4899' }; // Pink
    }
    return { icon: 'payments', color: '#64748b' }; // Slate
  };

  const tooltipStyle = {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
    color: isDarkMode ? '#f8fafc' : '#0f172a'
  };

  return (
    <main className="flex-grow pt-10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16 min-h-screen bg-slate-50 dark:bg-[#0f0f0f]">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined mr-1 text-lg">arrow_back</span>
            Quay lại
          </button>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50">
            Chi Tiết Thẻ Tín Dụng
          </h1>
          <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
            Khám phá lợi ích và ưu đãi độc quyền của {card.bankName}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* Left Column: Card Info */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] p-8 shadow-sm lg:sticky lg:top-28">
              <div className="flex flex-col items-center">
                <div className="relative w-4/5 sm:w-2/3 lg:w-3/4 mx-auto mb-6 group perspective">
                  <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full transform translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-full aspect-[1.58/1] rounded-xl overflow-hidden shadow-xl -rotate-2 transform transition-all duration-500 group-hover:rotate-0 group-hover:scale-105">
                    <PortraitCardVisual imageUrl={card.imageUrl} name={card.name} />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 text-center">{cleanCardName(card.name)}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {(card.bankLogo || getFallbackBankLogo(card.bankName)) && (
                    <img src={card.bankLogo || getFallbackBankLogo(card.bankName)!} alt={card.bankName} className="h-5 object-contain dark:bg-white/90 dark:rounded dark:px-1 dark:py-0.5" />
                  )}
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{card.bankName}</p>
                </div>

                <div className="mt-8 w-full space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Phí thường niên</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{card.annualFee?.toLocaleString()} VND</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Hạn mức từ</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{card.creditLimit || '20,000,000 VND'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Lãi suất</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{card.interestRate || '1.5 - 2.5%/tháng'}</span>
                  </div>
                </div>

                <div className="mt-8 flex w-full flex-col gap-3">
                  <button
                    onClick={() => {
                      if (card.registerUrl) {
                        setIsModalOpen(true);
                      } else {
                        alert("Thẻ này hiện chưa có đường dẫn đăng ký.");
                      }
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 h-12 px-6 text-base font-bold text-white transition-all shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30 active:scale-95"
                  >
                    Mở thẻ ngay
                  </button>

                  {/* Favorite & Owned Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        if (!isAuthenticated) { openLoginModal(); return; }
                        const savedCard = { id: card.id!, name: card.name, imageUrl: card.imageUrl || '', bankName: card.bankName, bankLogo: card.bankLogo || getFallbackBankLogo(card.bankName) || '', annualFee: card.annualFee, savedAt: '' };
                        isFavorite(card.id!) ? removeFavorite(card.id!) : addFavorite(savedCard);
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-bold transition-all ${isFavorite(card.id!)
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-red-500 hover:border-red-300 dark:hover:border-red-800'}`}
                    >
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isFavorite(card.id!) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      {isFavorite(card.id!) ? 'Đã thích' : 'Yêu thích'}
                    </button>
                    <button
                      onClick={() => {
                        if (!isAuthenticated) { openLoginModal(); return; }
                        const savedCard = { id: card.id!, name: card.name, imageUrl: card.imageUrl || '', bankName: card.bankName, bankLogo: card.bankLogo || getFallbackBankLogo(card.bankName) || '', annualFee: card.annualFee, savedAt: '' };
                        isOwned(card.id!) ? removeOwnedCard(card.id!) : addOwnedCard(savedCard);
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl h-11 text-sm font-bold transition-all ${isOwned(card.id!)
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-primary-500 hover:border-primary-300 dark:hover:border-primary-800'}`}
                    >
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isOwned(card.id!) ? "'FILL' 1" : "'FILL' 0" }}>wallet</span>
                      {isOwned(card.id!) ? 'Đang sở hữu' : 'Tôi có thẻ này'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Hoàn Tiền Theo Danh Mục Chi Tiêu</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Dựa trên chi tiêu {spendingAmount?.toLocaleString()}đ hàng tháng.</p>

              <div className="mt-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Left side: Chart */}
                <div className="w-full md:w-5/12 h-[320px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#334155" : "#e2e8f0"} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11, fontWeight: 700, fill: isDarkMode ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                        contentStyle={tooltipStyle}
                        itemStyle={{ color: isDarkMode ? '#cbd5e1' : '#475569', fontWeight: 500 }}
                        labelStyle={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                        formatter={(value: any) => [Number(value || 0).toLocaleString() + ' VND', 'Tối đa']}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCategoryStyle(entry.name).color} />
                        ))}
                        <LabelList dataKey="proportion" position="right" formatter={(val: any) => `${val}%`} fill={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} fontWeight="bold" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Right side: Categories */}
                <div className="w-full md:w-7/12 flex flex-col gap-3">
                  {chartData.map((item, idx) => {
                    const style = getCategoryStyle(item.name);
                    return (
                    <div key={idx} className={`flex items-center justify-between rounded-xl p-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#18181b] shadow-sm transition-transform hover:scale-[1.02] hover:border-primary-200 dark:hover:border-primary-900/50`}>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm`} style={{ backgroundColor: `${style.color}20`, color: style.color }}>
                          <span className="material-symbols-outlined text-xl">
                            {style.icon}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-50 text-base">{item.name}</span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            Hoàn {item.percentage}%
                            {/* {item.isCategoryCapped && <span className="text-orange-500 ml-1">(Chạm mốc tối đa danh mục)</span>} */}
                          </span>
                        </div>
                      </div>
                      <span className={`text-lg font-bold text-slate-900 dark:text-slate-100`}>
                        + {Math.floor(item.value).toLocaleString()} <span className="text-sm font-medium text-slate-500">đ</span>
                      </span>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-between items-center text-right">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Tổng tiền tích lũy một năm:</span>
                <span className="text-2xl font-black text-primary-600 dark:text-primary-400">~ {(monthlyEstimate * 12).toLocaleString()} VND</span>
              </div>
            </div>

            {card.welcomeOffer && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 p-8 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-xl">redeem</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-50">Quà Chào Mừng Mở Thẻ</h3>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap relative z-10">
                  {card.welcomeOffer}
                </p>
              </div>
            )}

            {/* Benefits Section */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Đặc Quyền Nổi Bật</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {card.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <span className="material-symbols-outlined text-primary-500">check_circle</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Related Cards Section */}
        {relatedCards.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Thẻ Cùng Danh Mục</h3>
            <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory custom-scrollbar">
              {relatedCards.map((relatedCard, idx) => (
                <Link 
                  key={relatedCard.id || idx} 
                  href={`/card/${relatedCard.id}`}
                  className="snap-start shrink-0 w-[240px] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#18181b] p-4 shadow-sm hover:shadow-lg hover:border-primary-500/50 transition-all group hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-[1.58/1] rounded-xl overflow-hidden shadow-sm mb-4">
                    <PortraitCardVisual imageUrl={relatedCard.imageUrl} name={relatedCard.name} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-2 leading-tight min-h-[40px] group-hover:text-primary-500 transition-colors">
                    {cleanCardName(relatedCard.name)}
                  </h4>
                  <div className="flex items-center gap-2 mt-auto pt-3">
                    {(relatedCard.bankLogo || getFallbackBankLogo(relatedCard.bankName)) && (
                      <img src={relatedCard.bankLogo || getFallbackBankLogo(relatedCard.bankName)!} alt={relatedCard.bankName} className="h-4 object-contain dark:bg-white/90 dark:rounded px-0.5" />
                    )}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{relatedCard.bankName}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="relative w-full max-w-md p-8 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <h3 className="text-2xl font-bold text-primary-500 text-center mb-8 mt-2">
              Quét mã để mở thẻ ngay
            </h3>

            <div className="flex justify-center mb-8">
              <div className="bg-white p-3 rounded-3xl shadow-xl border border-slate-100 dark:border-none relative flex items-center justify-center min-h-[280px] min-w-[280px]">
                <div ref={qrRef} />
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-center text-[15px] leading-relaxed font-medium mb-10 max-w-[280px] mx-auto">
              Sử dụng camera điện thoại hoặc ứng dụng để quét mã QR.
            </p>

            <div className="flex justify-center">
              <a
                href={card.registerUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsModalOpen(false)}
                className="text-primary-500 hover:text-primary-400 font-bold text-sm flex items-center gap-1 transition-colors"
              >
                Tiếp tục đăng ký trên trình duyệt web
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
