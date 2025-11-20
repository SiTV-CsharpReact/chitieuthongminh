import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

const personas = [
  {
    id: 'student',
    title: 'Sinh viên',
    description: 'Bạn là sinh viên đang tìm kiếm chiếc thẻ đầu tiên để xây dựng lịch sử tín dụng.',
    icon: 'school',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    activeBorder: 'border-emerald-500'
  },
  {
    id: 'worker',
    title: 'Người đi làm',
    description: 'Bạn đã có thu nhập ổn định và muốn tối ưu hóa chi tiêu hàng ngày.',
    icon: 'work',
    color: 'text-primary-600',
    bg: 'bg-primary-100',
    activeBorder: 'border-primary-500',
    featured: true
  },
  {
    id: 'family',
    title: 'Gia đình',
    description: 'Bạn đang tìm kiếm các ưu đãi tốt nhất cho chi tiêu của cả gia đình.',
    icon: 'family_restroom',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    activeBorder: 'border-blue-500'
  }
];

const Welcome: React.FC = () => {
  return (
    <>
      <Header transparent />
      <main className="flex-grow flex flex-col justify-center min-h-screen relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-50/80 to-transparent -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
              Chào mừng bạn đến với <br className="hidden sm:block" />
              <span className="text-primary-500">Chi tiêu thông minh</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed text-slate-600">
              Hãy cho chúng tôi biết bạn là ai để nhận được đề xuất thẻ tín dụng phù hợp nhất với nhu cầu và phong cách sống của bạn.
            </p>
          </div>

          <div className="mx-auto grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-3">
            {personas.map((persona) => (
              <div 
                key={persona.id} 
                className={`flex flex-col overflow-hidden rounded-3xl bg-white text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${persona.featured ? 'shadow-xl ring-2 ring-primary-500 scale-105 z-10' : 'border border-slate-200 shadow-md'}`}
              >
                <div className="flex-1 p-8 flex flex-col items-center">
                  <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${persona.bg} ${persona.color} mb-8 transition-transform duration-300 group-hover:scale-110`}>
                    <span className="material-symbols-outlined text-5xl">{persona.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{persona.title}</h3>
                  <p className="text-base text-slate-500 leading-relaxed">{persona.description}</p>
                </div>
                <div className="bg-slate-50 p-6 border-t border-slate-100">
                  <Link 
                    to="/input"
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold text-white transition-all shadow-lg shadow-primary-500/20 hover:opacity-90 ${persona.featured ? 'bg-primary-500 hover:bg-primary-600' : 'bg-slate-800 hover:bg-slate-900'}`}
                  >
                    Chọn loại thẻ này
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Welcome;