import React, { useState } from 'react';
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const [name, setName] = useState('Nguyễn Văn A');
  const [email, setEmail] = useState('nguyenvana@email.com');
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16">
        <div className="mx-auto max-w-5xl">
          
          <div className="mb-12">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50">Cài đặt</h1>
            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Quản lý thông tin tài khoản và sở thích của bạn.</p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            
            {/* Sidebar */}
            <aside className="md:col-span-3">
              <nav className="space-y-1 sticky top-32">
                <a href="#" className="flex items-center gap-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-sm font-bold text-primary-700 dark:text-primary-400 transition-colors">
                  <span className="material-symbols-outlined text-xl">person</span>
                  Hồ sơ
                </a>
                <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200">
                  <span className="material-symbols-outlined text-xl">favorite</span>
                  Sở thích
                </a>
                <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200">
                  <span className="material-symbols-outlined text-xl">security</span>
                  Bảo mật
                </a>
                <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200">
                  <span className="material-symbols-outlined text-xl">notifications</span>
                  Thông báo
                </a>
              </nav>
            </aside>

            {/* Main Content */}
            <div className="md:col-span-9 space-y-8">
              
              {/* Personal Info */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Thông tin cá nhân</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cập nhật thông tin của bạn tại đây.</p>
                
                <div className="mt-8 space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="name">Họ và tên</label>
                    <input 
                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-3 px-4" 
                        id="name" 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300" htmlFor="email">Địa chỉ email</label>
                    <input 
                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-3 px-4" 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-end">
                  <button className="rounded-xl bg-primary-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/20">
                    Lưu thay đổi
                  </button>
                </div>
              </div>

              {/* Appearance */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">Giao diện</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chọn giao diện sáng hoặc tối cho ứng dụng.</p>
                
                <div className="mt-8 flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Giao diện tối</span>
                  <button 
                    onClick={toggleTheme}
                    className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-red-800 dark:text-red-400">Xoá tài khoản</h3>
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xoá vĩnh viễn.</p>
                
                <div className="mt-8 flex justify-end">
                  <button className="rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-lg shadow-red-500/20">
                    Xoá tài khoản
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;