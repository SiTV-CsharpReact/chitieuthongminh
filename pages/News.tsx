import React, { useState } from 'react';
import { Header } from '../components/Header';

interface FeaturedArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  highlight?: boolean;
}

interface NewsArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  time: string;
  imageUrl: string;
}

const featuredArticles: FeaturedArticle[] = [
  {
    id: 'f1',
    title: 'Phân tích: Top 5 thẻ tín dụng hoàn tiền tốt nhất Quý 4',
    excerpt: 'Một bài phân tích sâu về các loại thẻ hoàn tiền hàng đầu hiện nay.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDskxyBtlwBe1s_CueBRb3LEaiwoLe5rnkklLjrlWp4hSjgZF6-4on-4kIABmEj2QVyqCRasB3d8shoSVt0Vst7Eg8X8Nlw23zHBXB00aTVLiEeQ_tEYaCcTtBv-Ze7dHCFTf7HlF4BKW7An4-Jl3eXU9R8v2-Tx4ffUcEXPkrM2ovFWM1dwSaCQ6nIsUqwx8Y48R8XBRWmze7BZWJFDCP2hvDiUmWWSw9_VxfjNLPLgJ5CRklKQqpPEvogsHA_qhVA3ABPkpAdleoo',
    highlight: true
  },
  {
    id: 'f2',
    title: 'Xu hướng mới: Thanh toán không tiếp xúc và tác động đến ưu đãi thẻ',
    excerpt: 'Khám phá công nghệ thanh toán mới và ảnh hưởng của nó.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA8U7WtcLDi0ydI_RvBVWNepqsRGtKKz_tTzcF9B02qtRdBYcnJRI8YZMI2RPP_fubiYp_7td28VCctGXkUky3FyrYD6AiK3JBIRB2NKCt4q_UMGv3c4YTt7RfgVR50azi0WQOxUbdD32RUbSpv3El4KZCbErD7Hv5FFh-FlXB32HzbePTY7FFWD8gyvAorBnKh5uNcWC_ul84VxOaZBmCUZ3Z7yQGTugpmk9Pwme5uSykKBlbN-Lc3I4aaevhDrDd8BwNpugaeLia4',
    highlight: false
  },
  {
    id: 'f3',
    title: 'Cập nhật: Ngân hàng XYZ thay đổi chính sách phí thường niên',
    excerpt: 'Thông tin quan trọng về thay đổi chính sách từ một ngân hàng lớn.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM9fKvXSrNLOKZU2ZU7lLMRr1NJReI35TLBX80BmahzsnSbtv2tlYvC7J0UEl3KQ4_fBojIEIs0W2PitTavEGBBnjqk2pet9GUQqBprf8MB6a9ScPt3mFDcDI7ThvLG0Mv0zZnr96K8AYRsgkgpnwM7ll77L22KMdi0b5Tm2QoyzTeF221IK_zMMxqQ1HWSxLLx4NhZK7zKBf27-6TF-p6L6SsUQSLzM_SV0EEHYdClIFGTcwaTigcziSiJqkD4TpJr9RKE87BjwRh',
    highlight: false
  }
];

const allArticles: NewsArticle[] = [
  {
    id: '1',
    category: 'Mẹo & Thủ thuật',
    title: 'Hướng dẫn chọn thẻ tín dụng du lịch cho người mới bắt đầu',
    excerpt: 'Tìm hiểu các yếu tố quan trọng khi chọn thẻ du lịch, từ phí chuyển đổi ngoại tệ đến bảo hiểm du lịch.',
    time: '3 ngày trước',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcX26pex-KzL9vZJKnyr4vm_W5OXMYVb8R0BJFbrPN1W9iLIxjP4hIX-UFYaKPBTppL_ie3hlghr7he4cFIR-p6gw4vmpO1YteumqU80DlXiBuQEc0dcewAm_8j_8Ffvz1w-a4oVfyQLeOML5tNK9lgP2r7o_fqYBxZ1xrAWohE8hi4cdM4QhNOiqFCAEG8f_3M0fXaF5Z0xR6vYu0ZVUIaL2FXwSRbXSpFpYS_7E-apeVAHDr6PaNn1EX63EI2QmV7gawA8JT02A2'
  },
  {
    id: '2',
    category: 'Phân tích chuyên sâu',
    title: 'So sánh chi tiết lãi suất và phí của thẻ Visa và Mastercard',
    excerpt: 'Một cái nhìn sâu sắc về cấu trúc phí và lãi suất của hai mạng lưới thanh toán phổ biến nhất.',
    time: '4 ngày trước',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsySNzIVaNIfAJgXFJ_b9NGJCccPQWpkeaJ48aJr2vus5GZ55pt8wavT8Htiw2zA9CK8UgXOYIxHgseWZ_ihN0wgiC8Yp6wO2jQYy7fpc7IrxqK00__Eu4wgkwD8YN61H8mVhkVvmmzYPz2vszyCxUUhNEYgspc5s5GLnXroq3VBRDsDQgxRgyKRpDj0r0CroaJs9wiG487V2m4vJa-dbVi2QV-m177Aqqr_LoWKV3hSXkvssypADp6VY_SVDgrVgz_ih_UHMBPcJn'
  },
  {
    id: '3',
    category: 'Tin tức thị trường',
    title: 'Báo cáo thị trường thẻ tín dụng tháng 11/2023',
    excerpt: 'Tổng hợp những diễn biến và số liệu đáng chú ý trong tháng vừa qua trên thị trường thẻ tín dụng.',
    time: '5 ngày trước',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASUs7mk1q3beQmWm8JIbGFc9YvjsHzLFwi0xpIbkl9U-HhmIQ4yYiMkSV7ImG8BAzIJwVZI11SBxXpjRYt6m6YZuS6xeh0267oTJOr4T1D6MdUF1kCY4PpTlsvu33h-LP2ebhzfhdxqJncHZYOLeM6SFxtZtA1R8xyh8UW3vqBO7CcU5bA9no1USUXSJCV67Zd00c5ICW0Se7QsgxYyJM-T2J5wK4JCTpXuhs2Yi39EkZao_5RZf9r3XMjcfdcCIkpoAWZ8bHYlLdD'
  },
  {
    id: '4',
    category: 'Mẹo & Thủ thuật',
    title: '5 sai lầm cần tránh khi sử dụng thẻ tín dụng lần đầu',
    excerpt: 'Những lỗi phổ biến mà người mới dùng thẻ thường mắc phải và cách phòng tránh.',
    time: '1 tuần trước',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3FLkx9YmQGGvYdu72Iu1OdxFAWUCmFfhMct1qF430BbxOfedxevstqHoVQO_kEMS8Vje13_zcLU1zUDVjkdLQtRaAYVRYscO-kMPLQrGhITaLfEf4SyCrHxHFXqGfYsVLYQK1-SBRW0cGuzRKbmXMeRLdGXs55MtJXFB5ypIanohbjGRckVZRz6_BWrBmNPdl7Y9ohJ-qovyjhELg7S4VNxpnrWSrz7Qpjgf8wePYZJrdN78X-OQtW4pzVuUCLyklxW9uj_5qN0Hi'
  },
  {
    id: '5',
    category: 'Xu hướng',
    title: 'Cách tận dụng điểm thưởng để tối đa hóa lợi ích',
    excerpt: 'Bí quyết đổi điểm thưởng lấy vé máy bay, phòng khách sạn hoặc tiền mặt một cách hiệu quả nhất.',
    time: '1 tuần trước',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCM9fKvXSrNLOKZU2ZU7lLMRr1NJReI35TLBX80BmahzsnSbtv2tlYvC7J0UEl3KQ4_fBojIEIs0W2PitTavEGBBnjqk2pet9GUQqBprf8MB6a9ScPt3mFDcDI7ThvLG0Mv0zZnr96K8AYRsgkgpnwM7ll77L22KMdi0b5Tm2QoyzTeF221IK_zMMxqQ1HWSxLLx4NhZK7zKBf27-6TF-p6L6SsUQSLzM_SV0EEHYdClIFGTcwaTigcziSiJqkD4TpJr9RKE87BjwRh'
  },
  {
    id: '6',
    category: 'Tin tức thị trường',
    title: 'Đánh giá thẻ tín dụng mới ra mắt của Ngân hàng ABC',
    excerpt: 'Review chi tiết về các tính năng, ưu đãi và biểu phí của dòng thẻ mới nhất trên thị trường.',
    time: '2 tuần trước',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2lH_-lWuZz7UFElO8jYWV_iQbW_u-NJT9pPFkmzCup0ipTHuvlvkKj0ycVZbKCJXLYSPoy9DURcT2qSWDQ3wBkjDNxMVqU9iJn_Qaww_Xw533pwvLze94lYs5V4R0c_xYXZ_JMXu6eBUBoJu8DveFIWD3gA4Up2VW6uY7RXVa7Y4l__g8AIkK_UIkZXCNbwMId6-KHdAYEHYVU7bkM2Dkrjkk7MUzM0ePHON-pYTxH8ciP_8R8rFYjnjrP6Ibm423gxwNZyNwV1Hp'
  }
];

const filters = ['Tất cả', 'Tin tức thị trường', 'Phân tích chuyên sâu', 'Xu hướng', 'Mẹo & Thủ thuật'];

const News: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const filteredArticles = activeFilter === 'Tất cả' 
    ? allArticles 
    : allArticles.filter(article => article.category === activeFilter);

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 pb-16">
        <div className="mx-auto max-w-7xl">
          
          {/* Featured Section */}
          <div className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-8">
              Tin tức & Phân tích nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <div key={article.id} className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3 leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow line-clamp-3">
                      {article.excerpt}
                    </p>
                    <button className={`w-full rounded-xl py-3 text-sm font-bold transition-all
                      ${article.highlight 
                        ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/25' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Đọc thêm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Discover Section */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
              Khám phá nội dung
            </h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-all
                    ${activeFilter === filter
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <div key={article.id} className="group cursor-pointer">
                  <div className="rounded-2xl overflow-hidden mb-4 h-52 bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center text-xs font-medium text-slate-400 dark:text-slate-500">
                    <span>{article.category}</span>
                    <span className="mx-2 text-slate-300 dark:text-slate-700">•</span>
                    <span>{article.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredArticles.length === 0 && (
               <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                    <span className="material-symbols-outlined text-3xl">article</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Không tìm thấy bài viết</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Vui lòng chọn danh mục khác.</p>
               </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
};

export default News;