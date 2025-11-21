
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { CardItem } from '../components/CardItem';
import { Card } from '../types';
import { useCompare } from '../context/CompareContext';
import { Button } from '../components/ui/button';

const mockCards: Card[] = [
  {
    id: 'vpbank-stepup',
    bankName: 'VPBank',
    bankLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_jTvjRN5bCAXkS5-W4fCvaKDKdcMAwbn3Y8C3Y5I1_KCGsgSNdRqIVBYZiKBM2M_WiicRyC-A3v3xSA_aQjuMeEjavdO58Z9MzukaaF03MAahaDfd6Kw6Q_wlDnx6mrqjY4DaJBBk6mvKSC_FcvdYj53XRiLezvjPKCiIkI8k5PiUzqzgZnK1w87w971kaRVS23D2Uz0RtpvNg-8Be_yXPTSHgGmRLfuVxIUiUdN6Zwn6QvsUdBbevFZbfYCkoNkZ5Bhc8s-PeNN9',
    name: 'VPBank StepUP',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3stPn7feWNJ1BrnWyVPbCNE7JruRX8xSWedHlGUtk1L3wYCOfo6slieggrpIiB3y1DuhKRYVjqf9cuyiRJNRKM7EY9pd1_HsQJGsZI_AmGGRQCJe42wqd3XVIxmC7IcbPr1x8wCDCwYQbPFiVdB0beziRc4_ohjun9MKJvLRUjmc2ppNBsTCZbo3gBrcPHfejRF__4SfHknoJBy-MqXMsNGlbOCiqYb76gUoPmgsOr9T-KyQdyZhpZj0k89Viseuw6X1-lU0GrIo4',
    description: 'Hoàn tiền đến 15% cho mua sắm online, ăn uống và xem phim. Lựa chọn hàng đầu cho giới trẻ năng động.',
    annualFee: '600.000 VND',
    annualFeeNum: 600000,
    cashbackEstimate: '350.000 VND/tháng',
    cashbackNum: 350000,
    tags: ['Cashback', 'Online'],
    isBest: true,
    creditLimit: '500.000.000 VND',
    interestRate: '2.99%/tháng',
    categories: []
  },
  {
    id: 'techcombank-style',
    bankName: 'Techcombank',
    bankLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFtdONBHroe2NyZL8vwRV6e-1caA_std_a45grqRvS4uTPzqSHhaGJu8EfnahrUoI56YmXf3hEtL6RRI2ECNYlPYFUNveAOl4m6jnIEOHEwdRHrXTrglTaFOy6dIbpXPRq-ZBAK8xtp_p_uNkE7HCaqnvqnaArLiQf6GU0k5RlcqMhDC18LJBIIKVgJZraOqRzpHzyx9QwpbHrnnmM84iSc2ZhXB0SO5dboZSACHevEuiCN6r_l7O0jp5B27n7085ZINso4jTTBLpG',
    name: 'Techcombank Style',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsySNzIVaNIfAJgXFJ_b9NGJCccPQWpkeaJ48aJr2vus5GZ55pt8wavT8Htiw2zA9CK8UgXOYIxHgseWZ_ihN0wgiC8Yp6wO2jQYy7fpc7IrxqK00__Eu4wgkwD8YN61H8mVhkVvmmzYPz2vszyCxUUhNEYgspc5s5GLnXroq3VBRDsDQgxRgyKRpDj0r0CroaJs9wiG487V2m4vJa-dbVi2QV-m177Aqqr_LoWKV3hSXkvssypADp6VY_SVDgrVgz_ih_UHMBPcJn',
    description: 'Hoàn tiền không giới hạn cho mọi chi tiêu, đặc biệt ưu đãi tại các nhà hàng cao cấp và dịch vụ spa.',
    annualFee: '999.000 VND',
    annualFeeNum: 999000,
    cashbackEstimate: '310.000 VND/tháng',
    cashbackNum: 310000,
    tags: ['Lifestyle', 'Dining'],
    creditLimit: '300.000.000 VND',
    interestRate: '2.6%/tháng',
    categories: []
  },
  {
    id: 'vib-online-plus',
    bankName: 'VIB',
    bankLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHj6MSPrGLZ-YUmWJhZOkMmzSOMIOIOZSlB3dfTEuL0ZPvgFXJl4o--itDervL1cO6HoBjFx54UxYm-_EUnVXzi52nlev3TJIMLInLxxSz4P7qSeVcF5Gg5r5idEMMBuuTO5A6r874mPSrCPaUJvxZJ7xX8XqlFZgcN28tQi5uTvheSFjgl2qpAYFjwI3rcApQ-J-smwB9UtiYoi-EnvCMUjMf7mSJ1j3ZC49YgenvscvyKZaRirnpIfxDxoVx692cu8uq1cS7wIPv',
    name: 'VIB Online Plus 2in1',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2lH_-lWuZz7UFElO8jYWV_iQbW_u-NJT9pPFkmzCup0ipTHuvlvkKj0ycVZbKCJXLYSPoy9DURcT2qSWDQ3wBkjDNxMVqU9iJn_Qaww_Xw533pwvLze94lYs5V4R0c_xYXZ_JMXu6eBUBoJu8DveFIWD3gA4Up2VW6uY7RXVa7Y4l__g8AIkK_UIkZXCNbwMId6-KHdAYEHYVU7bkM2Dkrjkk7MUzM0ePHON-pYTxH8ciP_8R8rFYjnjrP6Ibm423gxwNZyNwV1Hp',
    description: 'Tích hợp thẻ tín dụng và thẻ thanh toán. Hoàn tiền vượt trội cho các giao dịch trực tuyến.',
    annualFee: 'Miễn phí năm đầu',
    annualFeeNum: 0,
    cashbackEstimate: '280.000 VND/tháng',
    cashbackNum: 280000,
    tags: ['Online', 'Tech'],
    creditLimit: '200.000.000 VND',
    interestRate: '2.8%/tháng',
    categories: []
  }
];

const Recommendations: React.FC = () => {
  const { selectedCards, clearCompare } = useCompare();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="flex-grow pt-32 px-4 pb-16 sm:px-8 md:px-16 lg:px-24 xl:px-40 bg-slate-50 dark:bg-[#0f0f0f] min-h-screen">
        <div className="mx-auto max-w-5xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50 mb-2">
                Đề xuất dành riêng cho bạn
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl">
                Chúng tôi tìm thấy <strong className="text-primary-500">3 thẻ</strong> phù hợp nhất với hồ sơ chi tiêu của bạn.
                </p>
            </div>
            <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    Sắp xếp: Phù hợp nhất
                </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="rounded-3xl bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 p-5 mb-10 shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-lg">filter_list</span>
                    Bộ lọc tìm kiếm
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Bank Filter */}
                    <div className="relative group min-w-fit">
                        <select className="appearance-none bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none cursor-pointer transition-all">
                            <option>Tất cả ngân hàng</option>
                            <option>VPBank</option>
                            <option>Techcombank</option>
                            <option>VIB</option>
                            <option>HSBC</option>
                            <option>Citibank</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-slate-400">expand_more</span>
                    </div>

                    {/* Card Type Filter */}
                    <div className="relative group min-w-fit">
                        <select className="appearance-none bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none cursor-pointer transition-all">
                            <option>Loại thẻ</option>
                            <option>Hoàn tiền (Cashback)</option>
                            <option>Tích điểm (Rewards)</option>
                            <option>Du lịch (Travel)</option>
                            <option>Rút tiền mặt</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-slate-400">expand_more</span>
                    </div>

                    {/* Income Filter */}
                    <div className="relative group min-w-fit">
                        <select className="appearance-none bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none cursor-pointer transition-all">
                            <option>Thu nhập yêu cầu</option>
                            <option>Dưới 10 triệu</option>
                            <option>10 - 20 triệu</option>
                            <option>20 - 50 triệu</option>
                            <option>Trên 50 triệu</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-slate-400">expand_more</span>
                    </div>

                    {/* Network Filter */}
                    <div className="relative group min-w-fit">
                        <select className="appearance-none bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none cursor-pointer transition-all">
                            <option>Tổ chức thẻ</option>
                            <option>Visa</option>
                            <option>Mastercard</option>
                            <option>JCB</option>
                            <option>American Express</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-slate-400">expand_more</span>
                    </div>

                    {/* Fee Filter */}
                    <div className="relative group min-w-fit">
                        <select className="appearance-none bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none cursor-pointer transition-all">
                            <option>Phí thường niên</option>
                            <option>Miễn phí trọn đời</option>
                            <option>Miễn phí năm đầu</option>
                            <option>Dưới 1 triệu</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-slate-400">expand_more</span>
                    </div>
                    
                     {/* Offer Filter */}
                     <div className="relative group min-w-fit">
                        <select className="appearance-none bg-slate-50 dark:bg-slate-800/50 text-sm font-bold text-slate-700 dark:text-slate-200 pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none cursor-pointer transition-all">
                            <option>Ưu đãi đặc biệt</option>
                            <option>Trả góp 0%</option>
                            <option>Phòng chờ sân bay</option>
                            <option>Bảo hiểm du lịch</option>
                            <option>Quà tặng mở thẻ</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg pointer-events-none text-slate-400">expand_more</span>
                    </div>
                </div>
            </div>
          </div>

          {/* List Layout for Horizontal Cards */}
          <div className="flex flex-col gap-6 pb-20">
            {mockCards.map(card => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 mb-20 flex items-center justify-center">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-8 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm">
              Hiển thị thêm 5 thẻ khác
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>

        </div>

        {/* Floating Comparison Bar */}
        <div 
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40 transition-all duration-500 ease-in-out ${selectedCards.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
        >
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900 dark:bg-white p-4 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-200 dark:ring-slate-800">
                <div className="flex items-center gap-3 pl-2">
                    <div className="flex items-center -space-x-3">
                        {selectedCards.map((card) => (
                            <div key={card.id} className="h-10 w-10 rounded-full border-2 border-slate-900 dark:border-white overflow-hidden bg-white">
                                <img src={card.image} alt={card.name} className="h-full w-full object-cover" />
                            </div>
                        ))}
                        {Array.from({ length: Math.max(0, 3 - selectedCards.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-10 w-10 rounded-full border-2 border-slate-900 dark:border-white bg-slate-800 dark:bg-slate-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{i + 1 + selectedCards.length}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white dark:text-slate-900">Đã chọn {selectedCards.length}/3</span>
                        <button onClick={clearCompare} className="text-xs text-slate-400 dark:text-slate-500 hover:underline text-left">Xóa tất cả</button>
                    </div>
                </div>
                <Button 
                    onClick={() => navigate('/compare')}
                    className="rounded-xl bg-primary-500 text-white hover:bg-primary-600 px-6"
                >
                    So sánh ngay
                </Button>
            </div>
        </div>

      </main>
    </>
  );
};

export default Recommendations;
