"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function AboutPage() {
    return (
        <main className="flex-grow">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 px-6 mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-16">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="z-10 lg:w-1/2">
                    <span className="text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-[0.2em] mb-4 block text-sm">
                        Hành trình tài chính
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                        Về CredBack
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl leading-relaxed">
                        Tại CredBack, chúng tôi kết nối bạn với những giải pháp thẻ tín dụng hoàn tiền tối ưu nhất. Chúng tôi là nền tảng tiên phong trong việc giới thiệu và so sánh các sản phẩm tài chính thế hệ mới, giúp bạn dễ dàng đưa ra quyết định tiêu dùng thông minh và làm chủ hành trình tài chính của mình.
                    </p>
                    <div className="mt-8 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50 max-w-xl text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                        <span className="font-bold text-primary-600 dark:text-primary-400 mr-1">Lưu ý:</span>
                        Chúng tôi là nền tảng giới thiệu và so sánh sản phẩm tài chính, không phải ngân hàng. Việc phê duyệt thẻ phụ thuộc hoàn toàn vào quy định và thẩm định của tổ chức phát hành thẻ.
                    </div>
                </div>
                <div className="lg:w-1/2 relative flex justify-center items-center">
                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[3rem] p-16 rotate-3 shadow-2xl shadow-primary-500/10 transition-transform hover:rotate-0 duration-500 flex items-center justify-center w-3/4 aspect-square">
                        <Logo className="w-full h-full text-primary-500 drop-shadow-2xl opacity-90 hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl p-6 rounded-2xl hidden md:block z-20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary-600 dark:text-primary-400">trending_up</span>
                            </div>
                            <div>
                                <div className="text-slate-900 dark:text-white font-black text-2xl">50+</div>
                                <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Thẻ Tín Dụng</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sứ mệnh & Tầm nhìn */}
            <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-8 md:gap-12">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border-l-4 border-l-primary-500 shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
                        <span className="material-symbols-outlined text-primary-500 text-4xl mb-6">rocket_launch</span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Sứ mệnh</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Trở thành cầu nối tin cậy giữa người tiêu dùng và các định chế tài chính, mang đến công cụ phân tích dữ liệu thông minh để giúp khách hàng tối ưu hóa mọi khoản chi tiêu qua thẻ.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border-l-4 border-l-primary-500 shadow-lg shadow-slate-200/50 dark:shadow-none hover:-translate-y-1 transition-transform duration-300">
                        <span className="material-symbols-outlined text-primary-500 text-4xl mb-6">visibility</span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Tầm nhìn</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Xây dựng hệ sinh thái tài chính cá nhân lớn mạnh nhất, nơi mọi quyết định mở thẻ hay thanh toán đều được định hướng một cách minh bạch, an toàn và tối đa hóa đặc quyền.
                        </p>
                    </div>
                </div>
            </section>

            {/* Giá trị cốt lõi */}
            <section className="py-24 mx-auto max-w-7xl px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Giá trị cốt lõi</h2>
                    <div className="h-1 w-20 bg-primary-500 rounded-full mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Item 1 */}
                    <div className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary-500/5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-all">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-primary-500 text-3xl transition-colors">shield_with_heart</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-3">Uy tín & An toàn</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Bảo mật thông tin khách hàng là nền tảng. Chúng tôi chỉ đề xuất những sản phẩm uy tín từ các ngân hàng đối tác chính thức được cấp phép.
                        </p>
                    </div>
                    {/* Item 2 */}
                    <div className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary-500/5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-all">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-primary-500 text-3xl transition-colors">grid_view</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-3">Minh bạch</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Mọi thông tin về lãi suất, phí thường niên và điều kiện hoàn tiền đều được bóc tách và trình bày một cách đơn giản, dễ đối chiếu nhất.
                        </p>
                    </div>
                    {/* Item 3 */}
                    <div className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-3xl hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary-500/5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-all">
                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-primary-500 text-3xl transition-colors">lightbulb</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-3">Thông minh</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                            Ứng dụng thuật toán AI để phân tích thói quen tiêu dùng cá nhân, từ đó đề xuất đúng dòng thẻ đem lại tỷ lệ hoàn tiền cao nhất cho bạn.
                        </p>
                    </div>
                </div>
            </section>

            {/* Đội ngũ */}

        </main>
    );
}
