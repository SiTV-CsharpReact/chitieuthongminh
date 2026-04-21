import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-[#050a12] border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

                {/* Brand & Socials */}
                <div className="space-y-6">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/20 transition-transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[24px]">savings</span>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black tracking-tight text-white">CredBack</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary-500">Hoàn tiền cực đã</p>
                        </div>
                    </Link>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        Nền tảng phân tích tài chính thông minh giúp bạn tìm ra loại thẻ tín dụng tối ưu nhất cho phong cách sống của mình.
                    </p>
                    <div className="flex gap-4">
                        {['facebook', 'chat', 'alternate_email', 'share'].map((icon, idx) => (
                            <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-300">
                                <span className="material-symbols-outlined text-xl">{icon}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Khám phá</h4>
                    <ul className="space-y-4">
                        {[
                            { label: 'Trang chủ', path: '/' },
                            // { label: 'Đề xuất thẻ', path: '/recommendations' },
                            { label: 'Tin tức', path: '/news' },
                            { label: 'Cài đặt', path: '/settings' }
                        ].map((link) => (
                            <li key={link.path}>
                                <Link href={link.path} className="text-slate-400 hover:text-primary-500 text-sm font-medium transition-colors">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Hỗ trợ</h4>
                    <ul className="space-y-4">
                        {['Điều khoản sử dụng', 'Chính sách bảo mật', 'Câu hỏi thường gặp', 'Liên hệ'].map((item) => (
                            <li key={item}>
                                <a href="#" className="text-slate-400 hover:text-primary-500 text-sm font-medium transition-colors">
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter */}
                <div className="space-y-6">
                    <h4 className="text-white font-bold uppercase tracking-widest text-xs">Stay Updated</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Nhận tin tức mới nhất về các ưu đãi thẻ tín dụng và mẹo CredBack.
                    </p>
                    <div className="relative group">
                        <input
                            type="email"
                            placeholder="Email của bạn"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all backdrop-blur-sm"
                        />
                        <button className="absolute right-2 top-2 bottom-2 px-4 bg-primary-500 rounded-xl text-xs font-black uppercase text-white hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                            Gửi
                        </button>
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-slate-500 text-xs font-medium">
                    © {new Date().getFullYear()} CredBack. Tất cả quyền được bảo lưu.
                </p>
                <div className="flex gap-8">
                    <a href="#" className="text-slate-500 hover:text-white text-xs font-medium transition-colors">Privacy Policy</a>
                    <a href="#" className="text-slate-500 hover:text-white text-xs font-medium transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};
