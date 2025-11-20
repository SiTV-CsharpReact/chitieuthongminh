import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ExpenseCategory } from '../types';

const initialCategories: ExpenseCategory[] = [
  { id: 'grocery', name: 'Đi chợ & Tạp hoá', icon: 'shopping_cart', amount: 0, isEditing: false },
  { id: 'dining', name: 'Ăn uống & Nhà hàng', icon: 'restaurant', amount: 0, isEditing: true },
  { id: 'shopping', name: 'Mua sắm', icon: 'shopping_bag', amount: 0, isEditing: false },
  { id: 'travel', name: 'Di chuyển & Du lịch', icon: 'flight', amount: 0, isEditing: false },
  { id: 'bills', name: 'Hoá đơn & Tiện ích', icon: 'receipt_long', amount: 0, isEditing: false },
  { id: 'entertainment', name: 'Giải trí', icon: 'movie', amount: 0, isEditing: false },
];

const InputExpenses: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>(initialCategories);
  const navigate = useNavigate();

  const toggleEdit = (id: string) => {
    setCategories(categories.map(c => 
      c.id === id ? { ...c, isEditing: !c.isEditing } : c
    ));
  };

  const updateAmount = (id: string, val: string) => {
    const num = parseInt(val.replace(/,/g, ''), 10) || 0;
    setCategories(categories.map(c => 
      c.id === id ? { ...c, amount: num } : c
    ));
  };

  return (
    <>
      <Header transparent />
      <div className="relative min-h-screen flex flex-col">
        {/* Header Gradient */}
        <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-primary-100/50 to-slate-50 -z-10"></div>
        
        <main className="flex-grow px-4 sm:px-8 pt-28 pb-16">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 mb-4">
                Nhập Chi Tiêu Hàng Tháng
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
                Cung cấp thông tin chi tiêu để nhận được đề xuất thẻ tín dụng tốt nhất cho bạn.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
              <div className="space-y-8">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between border-b border-slate-100 pb-6 last:border-0 last:pb-0 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
                        <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                      </div>
                      <span className="text-lg font-bold text-slate-800">{cat.name}</span>
                    </div>

                    {cat.isEditing ? (
                       <div className="relative w-40 sm:w-56 group">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-medium group-focus-within:text-primary-500 transition-colors">VND</span>
                        <input 
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3 pl-14 pr-4 text-right font-bold text-slate-900 placeholder:text-slate-300 focus:border-primary-500 focus:bg-white focus:ring-0 transition-all outline-none"
                          placeholder="0" 
                          type="text"
                          value={cat.amount > 0 ? cat.amount.toLocaleString() : ''}
                          onChange={(e) => updateAmount(cat.id, e.target.value)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => toggleEdit(cat.id)}
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${cat.amount > 0 ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'}`}
                      >
                        {cat.amount > 0 ? (
                           <>
                            <span className="material-symbols-outlined text-lg">edit</span>
                            {cat.amount.toLocaleString()} VND
                           </>
                        ) : (
                            'Nhập số tiền'
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-dashed border-slate-200">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-base font-bold text-slate-500 transition-all hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50">
                  <span className="material-symbols-outlined">add_circle</span>
                  Thêm danh mục khác
                </button>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <button 
                onClick={() => navigate('/recommendations')}
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-primary-500 h-16 px-10 text-lg font-bold text-white transition-all shadow-xl shadow-primary-500/30 hover:bg-primary-600 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/40"
              >
                Xem đề xuất thẻ
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default InputExpenses;