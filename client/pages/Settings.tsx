
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserSettings } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Settings: React.FC = () => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security' | 'notifications'>('profile');
  
  // Settings State
  const [settings, setSettings] = useState<UserSettings>({
      notifications: { email: true, push: true, promotions: false },
      security: { twoFactor: false },
      preferences: { language: 'vi', currency: 'VND' }
  });

  // If not authenticated, show simplified view prompting login
  if (!isAuthenticated || !user) {
      return (
          <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16">
               <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-2">
                        <span className="material-symbols-outlined text-5xl">lock</span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">Yêu cầu đăng nhập</h2>
                  <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md">
                      Vui lòng đăng nhập để truy cập cài đặt cá nhân và quản lý tài khoản của bạn.
                  </p>
                  <Button size="lg" onClick={openLoginModal}>
                      Đăng nhập ngay
                  </Button>
               </div>
          </main>
      );
  }

  const toggleSetting = (category: keyof UserSettings, key: string) => {
      // Simple nested toggle logic
      setSettings(prev => ({
          ...prev,
          [category]: {
              ...prev[category],
              // @ts-ignore
              [key]: !prev[category][key]
          }
      }));
  };

  const menuItems = [
      { id: 'profile', label: 'Hồ sơ', icon: 'person' },
      { id: 'preferences', label: 'Sở thích & Giao diện', icon: 'palette' },
      { id: 'notifications', label: 'Thông báo', icon: 'notifications' },
      { id: 'security', label: 'Bảo mật', icon: 'security' },
  ];

  return (
    <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16">
      <div className="mx-auto max-w-6xl">
        
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50">Cài đặt</h1>
              <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Quản lý tài khoản {user.name}</p>
          </div>
          <Button 
              variant="destructive"
              onClick={logout}
              className="self-start sm:self-auto gap-2"
          >
              <span className="material-symbols-outlined">logout</span>
              Đăng xuất
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          
          {/* Sidebar Menu */}
          <aside className="md:col-span-3">
            <nav className="space-y-2 sticky top-32">
              {menuItems.map((item) => (
                  <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200
                          ${activeTab === item.id 
                              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                          }
                      `}
                  >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      {item.label}
                  </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Panel */}
          <div className="md:col-span-9">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-sm min-h-[500px]">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                  <div className="animate-fade-in space-y-8">
                      <div className="flex items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                          <div className="relative">
                              <img src={user.avatar} alt="Avatar" className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800" />
                              <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md">
                                  <span className="material-symbols-outlined text-sm">edit</span>
                              </Button>
                          </div>
                          <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                              <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
                          </div>
                      </div>

                      <div className="space-y-6 max-w-2xl">
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div className="space-y-2">
                                  <Label>Họ và tên</Label>
                                  <Input type="text" defaultValue={user.name} />
                              </div>
                              <div className="space-y-2">
                                  <Label>Số điện thoại</Label>
                                  <Input type="tel" placeholder="+84" />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label>Bio</Label>
                              <textarea 
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-primary-500" 
                                  rows={3}
                                  placeholder="Giới thiệu ngắn về bạn..."
                              ></textarea>
                          </div>
                          <Button>
                              Lưu thay đổi
                          </Button>
                      </div>
                  </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                  <div className="animate-fade-in space-y-8">
                      <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Giao diện</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Tùy chỉnh giao diện ứng dụng theo ý thích.</p>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                  <span className="material-symbols-outlined">dark_mode</span>
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-200">Chế độ tối (Dark Mode)</span>
                          </div>
                          <button 
                              onClick={toggleTheme}
                              className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors duration-300 ${isDarkMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
                          </button>
                      </div>

                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Ngôn ngữ & Khu vực</h3>
                           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div className="space-y-2">
                                  <Label>Ngôn ngữ</Label>
                                  <div className="relative">
                                    <select className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:text-slate-50 dark:focus-visible:ring-primary-500">
                                        <option value="vi">Tiếng Việt</option>
                                        <option value="en">English</option>
                                    </select>
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <Label>Đơn vị tiền tệ</Label>
                                  <div className="relative">
                                    <select className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:text-slate-50 dark:focus-visible:ring-primary-500">
                                        <option value="VND">VND (₫)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                  </div>
                              </div>
                           </div>
                      </div>
                  </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                  <div className="animate-fade-in space-y-8">
                       <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Cài đặt thông báo</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Chọn loại thông báo bạn muốn nhận.</p>
                      </div>

                      <div className="space-y-4">
                          {[
                              { key: 'email', label: 'Thông báo qua Email', desc: 'Nhận cập nhật về tài khoản và bảo mật.' },
                              { key: 'push', label: 'Thông báo đẩy (Push)', desc: 'Nhận thông báo ngay lập tức trên trình duyệt.' },
                              { key: 'promotions', label: 'Tin tức & Ưu đãi', desc: 'Cập nhật về các thẻ mới và khuyến mãi hot.' }
                          ].map((item) => (
                              <div key={item.key} className="flex items-start justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                  <div>
                                      <span className="block font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                                      <span className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
                                  </div>
                                  <button 
                                      onClick={() => toggleSetting('notifications', item.key)}
                                      // @ts-ignore
                                      className={`mt-1 relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${settings.notifications[item.key] ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                  >
                                      {/* @ts-ignore */}
                                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${settings.notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                  <div className="animate-fade-in space-y-8">
                       <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Bảo mật tài khoản</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Quản lý mật khẩu và xác thực 2 lớp.</p>
                      </div>

                      <div className="max-w-lg space-y-6">
                          <Button variant="outline" className="w-full justify-between h-auto py-4">
                              <div className="text-left">
                                  <span className="block font-bold text-slate-900 dark:text-white">Đổi mật khẩu</span>
                                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản.</span>
                              </div>
                              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                          </Button>

                          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                              <div>
                                  <span className="block font-bold text-slate-700 dark:text-slate-200">Xác thực 2 yếu tố (2FA)</span>
                                  <span className="text-sm text-slate-500 dark:text-slate-400">Tăng cường bảo mật khi đăng nhập.</span>
                              </div>
                              <button 
                                  onClick={() => toggleSetting('security', 'twoFactor')}
                                  className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-300 ${settings.security.twoFactor ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                              >
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'}`}></span>
                              </button>
                          </div>
                      </div>

                      <div className="pt-8 border-t border-red-100 dark:border-red-900/30 mt-8">
                          <h4 className="text-red-600 dark:text-red-400 font-bold mb-2">Vùng nguy hiểm</h4>
                          <Button variant="destructive">
                              Xoá tài khoản
                          </Button>
                      </div>
                  </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
