
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useCompare } from '../context/CompareContext';
import { Button } from '../components/ui/button';

const Compare: React.FC = () => {
  const { selectedCards, removeFromCompare } = useCompare();
  const navigate = useNavigate();

  if (selectedCards.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-grow pt-32 px-4 pb-16 flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-6">
                    <span className="material-symbols-outlined text-4xl">compare_arrows</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-2">Chưa chọn thẻ nào</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">Vui lòng quay lại trang đề xuất và chọn ít nhất 1 thẻ để so sánh.</p>
                <Button onClick={() => navigate('/recommendations')} size="lg">
                    Quay lại Đề xuất
                </Button>
            </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16 bg-slate-50 dark:bg-[#0f0f0f] min-h-screen">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
                <button 
                    onClick={() => navigate('/recommendations')}
                    className="mb-2 flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                    <span className="material-symbols-outlined mr-1 text-lg">arrow_back</span>
                    Quay lại danh sách
                </button>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50">
                    So sánh thẻ
                </h1>
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
                <div className="grid grid-cols-4 gap-4">
                    
                    {/* Label Column */}
                    <div className="col-span-1 pt-60 space-y-0">
                        {['Phí thường niên', 'Hạn mức tín dụng', 'Lãi suất', 'Hoàn tiền ước tính', 'Ưu đãi nổi bật'].map((label, idx) => (
                            <div key={idx} className={`h-24 flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 ${idx !== 4 ? 'border-b border-slate-200 dark:border-slate-800' : ''}`}>
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Card Columns */}
                    {selectedCards.map((card) => (
                        <div key={card.id} className="col-span-1 flex flex-col">
                            {/* Card Header */}
                            <div className="relative rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-4 flex flex-col items-center text-center h-60">
                                <button 
                                    onClick={() => removeFromCompare(card.id)}
                                    className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                                <div className="h-24 w-auto aspect-[1.58/1] mb-4 rounded-lg shadow-md overflow-hidden">
                                    <img src={card.image} alt={card.name} className="h-full w-full object-cover" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1">{card.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{card.bankName}</p>
                            </div>

                            {/* Specs */}
                            <div className="rounded-2xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 shadow-sm px-6">
                                <div className="h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                                    <span className="font-bold text-slate-900 dark:text-white">{card.annualFee}</span>
                                </div>
                                <div className="h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                                    <span className="font-bold text-slate-900 dark:text-white">{card.creditLimit}</span>
                                </div>
                                <div className="h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                                    <span className="font-bold text-slate-900 dark:text-white">{card.interestRate}</span>
                                </div>
                                <div className="h-24 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                                    <span className="font-black text-primary-600 dark:text-primary-400 text-lg">~{card.cashbackNum.toLocaleString()} đ</span>
                                </div>
                                <div className="h-24 flex items-center justify-center text-center py-2">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{card.description}</p>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="mt-6">
                                <Button className="w-full">Mở thẻ ngay</Button>
                            </div>
                        </div>
                    ))}

                    {/* Add Placeholder if less than 3 cards */}
                    {selectedCards.length < 3 && (
                        <div className="col-span-1 pt-60 flex flex-col items-center">
                            <button 
                                onClick={() => navigate('/recommendations')}
                                className="w-full h-full min-h-[400px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all gap-4"
                            >
                                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">add</span>
                                </div>
                                <span className="font-bold">Thêm thẻ</span>
                            </button>
                        </div>
                    )}

                </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
};

export default Compare;
