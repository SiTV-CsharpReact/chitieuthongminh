
import React, { useState, useEffect } from 'react';
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

const availableIcons = [
  'shopping_cart', 'restaurant', 'shopping_bag', 'flight', 
  'receipt_long', 'movie', 'directions_car', 'pets', 
  'school', 'fitness_center', 'health_and_safety', 'home', 
  'child_care', 'sports_esports', 'local_cafe', 'local_gas_station',
  'checkroom', 'local_hospital', 'smartphone', 'wifi'
];

const analysisSteps = [
  "Đang tổng hợp dữ liệu chi tiêu...",
  "Phân tích thói quen mua sắm của bạn...",
  "Quét dữ liệu 50+ thẻ tín dụng hàng đầu...",
  "Tính toán tỷ lệ hoàn tiền tối ưu...",
  "Đang tạo đề xuất cá nhân hóa..."
];

const InputExpenses: React.FC = () => {
  const [categories, setCategories] = useState<ExpenseCategory[]>(initialCategories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState(availableIcons[0]);
  
  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const navigate = useNavigate();

  const toggleEdit = (id: string) => {
    setCategories(categories.map(c => 
      c.id === id ? { ...c, isEditing: !c.isEditing } : c
    ));
  };

  const updateAmount = (id: string, val: string) => {
    const rawValue = val.replace(/\D/g, '');
    const num = parseInt(rawValue, 10) || 0;
    
    setCategories(categories.map(c => 
      c.id === id ? { ...c, amount: num } : c
    ));
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    
    const newId = `cat_${Date.now()}`;
    const newCategory: ExpenseCategory = {
      id: newId,
      name: newCatName,
      icon: newCatIcon,
      amount: 0,
      isEditing: true 
    };
    
    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    setNewCatName('');
    setNewCatIcon(availableIcons[0]);
  };

  const handleAnalyzeAndNavigate = () => {
    setIsAnalyzing(true);
    setCurrentStep(0);
    
    // Simulate analysis steps
    const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
            if (prev < analysisSteps.length - 1) return prev + 1;
            return prev;
        });
    }, 800);

    // Navigate after 4 seconds
    setTimeout(() => {
        clearInterval(stepInterval);
        navigate('/recommendations');
    }, 4000);
  };

  const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <>
      <Header transparent />
      <div className="relative min-h-screen flex flex-col">
        {/* Header Gradient */}
        <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-primary-100/50 to-slate-50 dark:from-primary-900/10 dark:to-slate-950 -z-10"></div>
        
        <main className="flex-grow px-4 sm:px-8 pt-28 pb-16">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50 mb-4">
                Nhập Chi Tiêu Hàng Tháng
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
                Cung cấp thông tin chi tiêu để nhận được đề xuất thẻ tín dụng tốt nhất cho bạn.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800">
              <div className="space-y-8">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6 last:border-0 last:pb-0 animate-fade-in-up">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                        <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                      </div>
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    </div>

                    {cat.isEditing ? (
                       <div className="relative w-40 sm:w-56 group">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-medium group-focus-within:text-primary-500 transition-colors">VND</span>
                        <input 
                          className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 pl-14 pr-4 text-right font-bold text-slate-900 dark:text-white placeholder:text-slate-300 focus:border-primary-500 dark:focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-0 transition-all outline-none"
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
                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${cat.amount > 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'}`}
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
              
              {/* Total Row */}
              <div className="flex items-center justify-between border-t-2 border-slate-100 dark:border-slate-800 pt-6 mt-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg">
                    <span className="material-symbols-outlined text-2xl">functions</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white">Tổng chi tiêu</span>
                </div>
                <div className="text-xl font-black text-primary-600 dark:text-primary-400">
                    {totalAmount.toLocaleString()} VND
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-dashed border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-4 text-base font-bold text-slate-500 dark:text-slate-400 transition-all hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Thêm danh mục khác
                </button>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <button 
                onClick={handleAnalyzeAndNavigate}
                className="group flex w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-primary-500 h-16 px-10 text-lg font-bold text-white transition-all shadow-xl shadow-primary-500/30 hover:bg-primary-600 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/40"
              >
                Xem đề xuất thẻ
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </main>

        {/* Add Category Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
            <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 transform transition-all scale-100">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Thêm danh mục mới</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tên danh mục</label>
                  <input 
                    type="text"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-primary-500"
                    placeholder="VD: Mua sắm online, Xăng xe..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Biểu tượng</label>
                  <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableIcons.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewCatIcon(icon)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${newCatIcon === icon ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      >
                        <span className="material-symbols-outlined text-xl">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleAddCategory}
                  className="flex-1 rounded-xl bg-primary-500 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-600 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newCatName.trim()}
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-500">
            <div className="flex flex-col items-center text-center p-8 max-w-lg">
                {/* Animated Icon */}
                <div className="relative mb-10">
                    <div className="absolute inset-0 rounded-full bg-primary-500 blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl ring-4 ring-primary-500/20">
                        <span className="material-symbols-outlined text-5xl text-primary-500 animate-pulse">auto_awesome</span>
                    </div>
                    {/* Orbiting particles */}
                    <div className="absolute top-0 left-0 h-full w-full animate-spin-slow">
                        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50"></div>
                    </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    AI đang phân tích
                </h2>
                
                {/* Animated Text Steps */}
                <div className="h-8 mb-8">
                    <p className="text-lg font-medium text-primary-600 dark:text-primary-400 animate-fade-in key={currentStep}">
                        {analysisSteps[currentStep]}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 animate-progress-loading rounded-full"></div>
                </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default InputExpenses;
