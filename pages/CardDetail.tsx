import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CashbackCategory } from '../types';

const CardDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for the specific card view (VIB Cash Back styled)
  const cardDetails = {
    name: 'VIB Cash Back',
    subtitle: 'Hoàn tiền không giới hạn',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv4wBR4brqyRtfyAQY_SkJXKxZB2aMYFzZADNEu2CIdbkU6agrA6Iw8gHxpa9JsEEFUFnx17jBmijnd8tYPq2KoBgj0FQ56hh38x9wZf3rIo1UxmCWYcSmNZAjqjL-jIHV1V0FSSXzJHvYfZURZydgRxXkqw1jWUVevlsh1ILlWE1JdejGzrGlgf1ejXXdvhQaScSaJj-aESXYKQC1se-SqnJmKV62wQCWDVR93ElRebeEcVT1DWlGEYjhsE5sxit8UPYhNRMEULYF',
    annualFee: '899,000 VND',
    creditLimit: '50,000,000 VND',
    interestRate: '2.49%/tháng',
    totalCashback: '670,000 VND / tháng',
    categories: [
      { name: 'Ăn uống', icon: 'restaurant', rate: 10, amount: '+ 300,000 VND', color: 'text-green-600', bgColor: 'bg-green-50', border: 'border-green-200', iconColor: 'text-green-500', raw: 300000 },
      { name: 'Đi chợ', icon: 'shopping_cart', rate: 5, amount: '+ 250,000 VND', color: 'text-blue-600', bgColor: 'bg-blue-50', border: 'border-blue-200', iconColor: 'text-blue-500', raw: 250000 },
      { name: 'Du lịch', icon: 'flight', rate: 3, amount: '+ 120,000 VND', color: 'text-purple-600', bgColor: 'bg-purple-50', border: 'border-purple-200', iconColor: 'text-purple-500', raw: 120000 },
    ]
  };

  const chartData = cardDetails.categories.map(c => ({
    name: c.name,
    value: c.raw,
    color: c.iconColor.replace('text-', '') // Simplification for mockup, normally use actual hex
  }));
  
  const COLORS = ['#22c55e', '#3b82f6', '#a855f7'];

  return (
    <>
      <Header transparent={false} />
      <main className="flex-grow pt-28 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-10">
            <button 
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
                <span className="material-symbols-outlined mr-1 text-lg">arrow_back</span>
                Quay lại
            </button>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900">
              Chi Tiết Thẻ Tín Dụng
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Khám phá lợi ích và ưu đãi độc quyền của thẻ được đề xuất cho bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Left Column: Card Info */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sticky top-28">
                <div className="flex flex-col items-center">
                  <div className="relative w-64 mb-8 group perspective">
                     <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full transform translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <img 
                        alt={cardDetails.name} 
                        className="relative w-full -rotate-6 transform transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 shadow-2xl rounded-xl" 
                        src={cardDetails.image} 
                     />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900">{cardDetails.name}</h2>
                  <p className="text-slate-500 font-medium mt-1">{cardDetails.subtitle}</p>
                  
                  <div className="mt-8 w-full space-y-4 border-t border-slate-100 pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Phí thường niên</span>
                      <span className="font-bold text-slate-900">{cardDetails.annualFee}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Hạn mức tín dụng</span>
                      <span className="font-bold text-slate-900">{cardDetails.creditLimit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Lãi suất</span>
                      <span className="font-bold text-slate-900">{cardDetails.interestRate}</span>
                    </div>
                  </div>

                  <div className="mt-8 flex w-full flex-col gap-3">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 h-12 px-6 text-base font-bold text-white transition-all shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30 active:scale-95">
                        Mở thẻ ngay
                    </button>
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 h-12 px-6 text-base font-bold text-slate-600 transition-colors hover:bg-slate-200">
                        Lưu lại
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Details & Chart */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm h-full flex flex-col">
                <h3 className="text-xl font-bold text-slate-900">Hoàn Tiền Theo Danh Mục Chi Tiêu</h3>
                <p className="text-slate-500 mt-1">Dựa trên chi tiêu hàng tháng bạn đã cung cấp.</p>
                
                <div className="mt-8 h-[300px] w-full bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-center">
                   {/* Using Recharts to simulate the visual from Screen 2 */}
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 14, fontWeight: 600, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={30}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>

                <div className="mt-8 space-y-4 flex-grow">
                    {cardDetails.categories.map((cat, idx) => (
                        <div key={idx} className={`flex items-center justify-between rounded-xl p-5 border ${cat.bgColor} ${cat.border} transition-transform hover:scale-[1.01]`}>
                            <div className="flex items-center gap-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white ${cat.iconColor} shadow-sm`}>
                                    <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-lg">{cat.name}</span>
                                    <span className="text-sm text-slate-500 font-medium">Hoàn tiền {cat.rate}%</span>
                                </div>
                            </div>
                            <span className={`text-xl font-bold ${cat.color}`}>{cat.amount}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6 flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Tổng hoàn tiền dự kiến:</span>
                    <span className="text-2xl font-black text-primary-600">{cardDetails.totalCashback}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
};

export default CardDetail;