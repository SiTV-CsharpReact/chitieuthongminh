import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

const personas = [
  {
    id: 'student',
    title: 'Sinh viên',
    description: 'Bạn là sinh viên đang tìm kiếm chiếc thẻ đầu tiên để xây dựng lịch sử tín dụng.',
    icon: 'school',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    activeRing: 'ring-emerald-500 dark:ring-emerald-400',
    activeBtn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
  },
  {
    id: 'worker',
    title: 'Người đi làm',
    description: 'Bạn đã có thu nhập ổn định và muốn tối ưu hóa chi tiêu hàng ngày.',
    icon: 'work',
    color: 'text-primary-600 dark:text-primary-400',
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    activeRing: 'ring-primary-500 dark:ring-primary-400',
    activeBtn: 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/30',
  },
  {
    id: 'family',
    title: 'Gia đình',
    description: 'Bạn đang tìm kiếm các ưu đãi tốt nhất cho chi tiêu của cả gia đình.',
    icon: 'family_restroom',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    activeRing: 'ring-blue-500 dark:ring-blue-400',
    activeBtn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30',
  }
];

const Welcome: React.FC = () => {
  const [activeId, setActiveId] = useState<string>('worker');

  return (
    <>
      <Header transparent />
      <main className="flex-grow flex flex-col justify-center min-h-screen relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-50/80 to-transparent dark:from-primary-900/10 dark:to-transparent -z-10"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-6xl mb-6">
              Chào mừng bạn đến với <br className="hidden sm:block" />
              <span className="text-primary-500">Chi tiêu thông minh</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Hãy cho chúng tôi biết bạn là ai để nhận được đề xuất thẻ tín dụng phù hợp nhất với nhu cầu và phong cách sống của bạn.
            </p>
          </div>

          <div 
            className="mx-auto grid max-w-lg gap-8 lg:max-w-none lg:grid-cols-3 items-start"
            onMouseLeave={() => setActiveId('worker')}
          >
            {personas.map((persona) => {
              const isActive = activeId === persona.id;
              return (
                <div 
                  key={persona.id} 
                  onMouseEnter={() => setActiveId(persona.id)}
                  className={`flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-center transition-all duration-300 group cursor-pointer
                    ${isActive 
                      ? `ring-2 ${persona.activeRing} shadow-2xl lg:scale-110 z-10 relative` 
                      : 'border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl scale-100'
                    }
                  `}
                >
                  <div className="flex-1 p-8 flex flex-col items-center">
                    <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${persona.bg} ${persona.color} mb-8 transition-transform duration-300 group-hover:scale-110`}>
                      <span className="material-symbols-outlined text-5xl">{persona.icon}</span>
                    </div>
                    <h3 className={`text-2xl font-bold mb-3 transition-colors ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>{persona.title}</h3>
                    <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">{persona.description}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      to="/input"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold text-white transition-all shadow-lg
                        ${isActive 
                          ? `${persona.activeBtn} hover:-translate-y-1` 
                          : 'bg-slate-800 dark:bg-slate-700 shadow-slate-500/20 dark:shadow-none'
                        }
                      `}
                    >
                      Chọn loại thẻ này
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

export default Welcome;