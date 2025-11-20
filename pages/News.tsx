import React from 'react';
import { Header } from '../components/Header';
import { NewsArticle } from '../types';

const articles: NewsArticle[] = [
  {
    id: '1',
    category: 'Phân Tích',
    title: 'Top 5 thẻ tín dụng hoàn tiền tốt nhất 2023',
    excerpt: 'Khám phá các loại thẻ tín dụng mang lại tỷ lệ hoàn tiền cao nhất cho mọi danh mục chi tiêu phổ biến.',
    author: 'Minh Anh',
    date: '15/10/2023',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDskxyBtlwBe1s_CueBRb3LEaiwoLe5rnkklLjrlWp4hSjgZF6-4on-4kIABmEj2QVyqCRasB3d8shoSVt0Vst7Eg8X8Nlw23zHBXB00aTVLiEeQ_tEYaCcTtBv-Ze7dHCFTf7HlF4BKW7An4-Jl3eXU9R8v2-Tx4ffUcEXPkrM2ovFWM1dwSaCQ6nIsUqwx8Y48R8XBRWmze7BZWJFDCP2hvDiUmWWSw9_VxfjNLPLgJ5CRklKQqpPEvogsHA_qhVA3ABPkpAdleoo'
  },
  {
    id: '2',
    category: 'Mẹo & Thủ Thuật',
    title: 'Làm thế nào để tăng hạn mức tín dụng của bạn?',
    excerpt: 'Các chiến lược hiệu quả và những lưu ý quan trọng giúp bạn dễ dàng được ngân hàng chấp thuận tăng hạn mức.',
    author: 'Quốc Trung',
    date: '12/10/2023',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASUs7mk1q3beQmWm8JIbGFc9YvjsHzLFwi0xpIbkl9U-HhmIQ4yYiMkSV7ImG8BAzIJwVZI11SBxXpjRYt6m6YZuS6xeh0267oTJOr4T1D6MdUF1kCY4PpTlsvu33h-LP2ebhzfhdxqJncHZYOLeM6SFxtZtA1R8xyh8UW3vqBO7CcU5bA9no1USUXSJCV67Zd00c5ICW0Se7QsgxYyJM-T2J5wK4JCTpXuhs2Yi39EkZao_5RZf9r3XMjcfdcCIkpoAWZ8bHYlLdD'
  },
  {
    id: '3',
    category: 'Tin Tức Ngành',
    title: 'Xu hướng thanh toán không tiếp xúc và tương lai',
    excerpt: 'Sự phát triển của công nghệ thanh toán và ảnh hưởng của nó đến cách chúng ta sử dụng thẻ tín dụng hàng ngày.',
    author: 'Hà Trang',
    date: '10/10/2023',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8U7WtcLDi0ydI_RvBVWNepqsRGtKKz_tTzcF9B02qtRdBYcnJRI8YZMI2RPP_fubiYp_7td28VCctGXkUky3FyrYD6AiK3JBIRB2NKCt4q_UMGv3c4YTt7RfgVR50azi0WQOxUbdD32RUbSpv3El4KZCbErD7Hv5FFh-FlXB32HzbePTY7FFWD8gyvAorBnKh5uNcWC_ul84VxOaZBmCUZ3Z7yQGTugpmk9Pwme5uSykKBlbN-Lc3I4aaevhDrDd8BwNpugaeLia4'
  },
  {
    id: '4',
    category: 'Hướng Dẫn',
    title: 'Tận dụng điểm thưởng du lịch từ thẻ tín dụng',
    excerpt: 'Hướng dẫn chi tiết cách tích lũy và sử dụng điểm thưởng để có những chuyến du lịch miễn phí hoặc chi phí thấp.',
    author: 'An Nhiên',
    date: '08/10/2023',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcX26pex-KzL9vZJKnyr4vm_W5OXMYVb8R0BJFbrPN1W9iLIxjP4hIX-UFYaKPBTppL_ie3hlghr7he4cFIR-p6gw4vmpO1YteumqU80DlXiBuQEc0dcewAm_8j_8Ffvz1w-a4oVfyQLeOML5tNK9lgP2r7o_fqYBxZ1xrAWohE8hi4cdM4QhNOiqFCAEG8f_3M0fXaF5Z0xR6vYu0ZVUIaL2FXwSRbXSpFpYS_7E-apeVAHDr6PaNn1EX63EI2QmV7gawA8JT02A2'
  },
  {
    id: '5',
    category: 'So Sánh',
    title: 'Thẻ Visa vs. Mastercard: Nên chọn loại nào?',
    excerpt: 'Phân tích ưu và nhược điểm của hai mạng lưới thanh toán thẻ phổ biến nhất thế giới để bạn có lựa chọn phù hợp.',
    author: 'Bảo Lâm',
    date: '05/10/2023',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM9fKvXSrNLOKZU2ZU7lLMRr1NJReI35TLBX80BmahzsnSbtv2tlYvC7J0UEl3KQ4_fBojIEIs0W2PitTavEGBBnjqk2pet9GUQqBprf8MB6a9ScPt3mFDcDI7ThvLG0Mv0zZnr96K8AYRsgkgpnwM7ll77L22KMdi0b5Tm2QoyzTeF221IK_zMMxqQ1HWSxLLx4NhZK7zKBf27-6TF-p6L6SsUQSLzM_SV0EEHYdClIFGTcwaTigcziSiJqkD4TpJr9RKE87BjwRh'
  },
  {
    id: '6',
    category: 'Tài Chính Cá Nhân',
    title: 'Xây dựng điểm tín dụng tốt cho người mới bắt đầu',
    excerpt: 'Những bước đi đầu tiên và các thói quen tài chính thông minh để xây dựng một lịch sử tín dụng vững chắc.',
    author: 'Thu Thảo',
    date: '02/10/2023',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3FLkx9YmQGGvYdu72Iu1OdxFAWUCmFfhMct1qF430BbxOfedxevstqHoVQO_kEMS8Vje13_zcLU1zUDVjkdLQtRaAYVRYscO-kMPLQrGhITaLfEf4SyCrHxHFXqGfYsVLYQK1-SBRW0cGuzRKbmXMeRLdGXs55MtJXFB5ypIanohbjGRckVZRz6_BWrBmNPdl7Y9ohJ-qovyjhELg7S4VNxpnrWSrz7Qpjgf8wePYZJrdN78X-OQtW4pzVuUCLyklxW9uj_5qN0Hi'
  }
];

const News: React.FC = () => {
  return (
    <>
      <Header floating />
      <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 pb-16">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl mb-4">
              Khám Phá Tin Tức & Ưu Đãi Thẻ
            </h1>
            <p className="text-lg text-slate-500 font-normal max-w-2xl mx-auto">
              Cập nhật thông tin mới nhất, các mẹo tài chính và các phân tích chuyên sâu về thị trường thẻ tín dụng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.id} className="flex flex-col rounded-2xl bg-white shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
                <div className="relative h-56 w-full overflow-hidden">
                   <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors z-10"></div>
                   <img 
                        alt={article.title} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        src={article.imageUrl} 
                    />
                </div>
                
                <div className="flex flex-grow flex-col p-6">
                  <p className="text-sm font-bold text-primary-600 mb-3 uppercase tracking-wide">{article.category}</p>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 mb-6 line-clamp-3 text-sm leading-relaxed flex-grow">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center text-xs font-medium text-slate-400 pt-4 border-t border-slate-100 mt-auto">
                    <span className="material-symbols-outlined text-base mr-1.5">person</span>
                    <span className="text-slate-600">{article.author}</span>
                    <span className="mx-2">·</span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="rounded-xl bg-primary-500 px-10 py-4 text-base font-bold text-white shadow-xl shadow-primary-500/20 transition-all hover:bg-primary-600 hover:shadow-primary-500/30 hover:-translate-y-0.5">
                Xem thêm bài viết
            </button>
          </div>

        </div>
      </main>
    </>
  );
};

export default News;