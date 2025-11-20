import React from 'react';
import { Header } from '../components/Header';
import { CardItem } from '../components/CardItem';
import { Card } from '../types';

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
  return (
    <>
      <Header />
      <main className="flex-grow pt-32 px-4 pb-16 sm:px-8 md:px-16 lg:px-24 xl:px-40">
        <div className="mx-auto max-w-[1440px]">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 mb-3">
              Đề xuất thẻ tín dụng dành cho bạn
            </h1>
            <p className="text-lg font-normal text-slate-500 max-w-2xl mx-auto">
              Dựa trên chi tiêu hàng tháng, đây là những thẻ tốt nhất giúp bạn tối ưu hóa dòng tiền.
            </p>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-10">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 items-end">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="bank-filter">Ngân hàng</label>
                <div className="relative">
                    <select className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-4 pr-8 text-sm font-semibold text-slate-700 focus:border-primary-500 focus:bg-white focus:ring-primary-500" id="bank-filter">
                    <option>Tất cả</option>
                    <option>VPBank</option>
                    <option>Techcombank</option>
                    <option>VIB</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                    </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="type-filter">Loại thẻ</label>
                <div className="relative">
                    <select className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-4 pr-8 text-sm font-semibold text-slate-700 focus:border-primary-500 focus:bg-white focus:ring-primary-500" id="type-filter">
                    <option>Tất cả</option>
                    <option>Cashback</option>
                    <option>Travel</option>
                    <option>Rewards</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="fee-filter">Phí thường niên</label>
                <div className="relative">
                    <select className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-4 pr-8 text-sm font-semibold text-slate-700 focus:border-primary-500 focus:bg-white focus:ring-primary-500" id="fee-filter">
                    <option>Tất cả</option>
                    <option>Miễn phí</option>
                    <option>&lt; 1 triệu</option>
                    <option>&gt; 1 triệu</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="offer-filter">Ưu đãi</label>
                <div className="relative">
                    <select className="w-full appearance-none rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-4 pr-8 text-sm font-semibold text-slate-700 focus:border-primary-500 focus:bg-white focus:ring-primary-500" id="offer-filter">
                    <option>Tất cả</option>
                    <option>Hoàn tiền</option>
                    <option>Trả góp 0%</option>
                    <option>Phòng chờ</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                    </div>
                </div>
              </div>

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/20 active:scale-95">
                <span className="material-symbols-outlined text-lg">filter_alt</span>
                Lọc kết quả
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mockCards.map(card => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>

          {/* Load More */}
          <div className="mt-16 flex items-center justify-center">
            <button className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-8 py-3 text-base font-bold text-slate-600 transition-all hover:border-primary-500 hover:text-primary-600 hover:shadow-md">
              Tải thêm
              <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>

        </div>
      </main>
    </>
  );
};

export default Recommendations;