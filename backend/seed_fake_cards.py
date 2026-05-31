from pymongo import MongoClient
import datetime
import random

client = MongoClient('mongodb://127.0.0.1:27017')
db = client['ChiTieuThongMinh']
col = db['credit_cards']

fake_cards = [
    {
        "Name": "Platinum Cashback Supreme",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2942&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 0.0,
        "MinSalary": 5000000.0,
        "CashbackRules": [
            {"Category": "Ăn uống", "Percentage": 25.0, "CapAmount": 1000000.0},
            {"Category": "Tất cả", "Percentage": 2.0, "CapAmount": None}
        ],
        "Description": "Siêu thẻ hoàn tiền lên tới 25% cho ẩm thực. Không giới hạn đối với mọi chi tiêu khác.",
        "Benefits": ["Hoàn 25% ăn uống", "Miễn phí thường niên trọn đời", "Phòng chờ thương gia sân bay miễn phí"],
        "CreditLimit": "500.000.000 VNĐ",
        "InterestRate": "15%/năm"
    },
    {
        "Name": "Travel Elite Infinite",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1542282088-72c9c2d8ed96?q=80&w=2749&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 500000.0,
        "MinSalary": 10000000.0,
        "CashbackRules": [
            {"Category": "Du lịch", "Percentage": 30.0, "CapAmount": 2000000.0},
            {"Category": "All", "Percentage": 1.5, "CapAmount": None}
        ],
        "Description": "Thẻ dành riêng cho những chuyến đi. Hoàn tiền cực sốc 30% khi đặt vé máy bay và khách sạn.",
        "Benefits": ["Bảo hiểm du lịch 10 tỷ", "Tích dặm bay nhanh gấp 3", "Ưu đãi khách sạn 5 sao"],
        "CreditLimit": "1.000.000.000 VNĐ",
        "InterestRate": "12%/năm"
    },
    {
        "Name": "Shopping Queen Titanium",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1590845947376-2638caa89309?q=80&w=2940&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 200000.0,
        "MinSalary": 7000000.0,
        "CashbackRules": [
            {"Category": "Mua sắm", "Percentage": 20.0, "CapAmount": 1500000.0},
            {"Category": "Siêu thị", "Percentage": 15.0, "CapAmount": 500000.0},
            {"Category": "Mọi chi tiêu", "Percentage": 1.0, "CapAmount": None}
        ],
        "Description": "Sự lựa chọn hoàn hảo cho tín đồ mua sắm. Hoàn tiền 20% khi mua sắm online trên Shopee, Lazada.",
        "Benefits": ["Miễn phí vận chuyển online", "Ưu đãi 50% tại Zara, H&M", "Tích điểm đổi quà siêu tốc"],
        "CreditLimit": "200.000.000 VNĐ",
        "InterestRate": "18%/năm"
    },
    {
        "Name": "Gas & Go Card",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1587320027734-d02f5a54db52?q=80&w=2835&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 0.0,
        "MinSalary": 4000000.0,
        "CashbackRules": [
            {"Category": "Xăng dầu", "Percentage": 10.0, "CapAmount": 500000.0},
            {"Category": "Tất cả", "Percentage": 1.0, "CapAmount": None}
        ],
        "Description": "Tiết kiệm tối đa chi phí đi lại. Hoàn 10% tại mọi trạm xăng trên toàn quốc.",
        "Benefits": ["Hoàn tiền trạm xăng", "Bảo hiểm xe máy miễn phí", "Miễn phí thường niên"],
        "CreditLimit": "50.000.000 VNĐ",
        "InterestRate": "20%/năm"
    },
    {
        "Name": "Health First Platinum",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1584982751601-97d883f510fb?q=80&w=2940&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 300000.0,
        "MinSalary": 8000000.0,
        "CashbackRules": [
            {"Category": "Y tế", "Percentage": 20.0, "CapAmount": 2000000.0},
            {"Category": "Bảo hiểm", "Percentage": 10.0, "CapAmount": 1000000.0},
            {"Category": "All", "Percentage": 1.0, "CapAmount": None}
        ],
        "Description": "Chăm sóc sức khỏe gia đình bạn với ưu đãi hoàn tiền siêu lớn tại bệnh viện, nhà thuốc.",
        "Benefits": ["Hoàn tiền Y tế", "Khám sức khỏe tổng quát miễn phí 1 lần/năm", "Ưu đãi mua bảo hiểm nhân thọ"],
        "CreditLimit": "300.000.000 VNĐ",
        "InterestRate": "16%/năm"
    },
    {
        "Name": "Tech Guru Master",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 0.0,
        "MinSalary": 15000000.0,
        "CashbackRules": [
            {"Category": "Công nghệ", "Percentage": 15.0, "CapAmount": 3000000.0},
            {"Category": "Thanh toán hóa đơn", "Percentage": 5.0, "CapAmount": 500000.0},
            {"Category": "Tất cả", "Percentage": 2.0, "CapAmount": None}
        ],
        "Description": "Thẻ tín dụng dành riêng cho giới công nghệ, hoàn tiền khủng khi mua đồ điện tử và phần mềm.",
        "Benefits": ["Hoàn 15% khi mua Apple, Samsung", "Tặng 1 năm Netflix & Spotify", "Bảo hành mở rộng thêm 1 năm cho đồ điện tử"],
        "CreditLimit": "400.000.000 VNĐ",
        "InterestRate": "14%/năm"
    },
    {
        "Name": "Education Plus",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2922&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 100000.0,
        "MinSalary": 6000000.0,
        "CashbackRules": [
            {"Category": "Giáo dục", "Percentage": 12.0, "CapAmount": 2000000.0},
            {"Category": "Mọi chi tiêu", "Percentage": 1.0, "CapAmount": None}
        ],
        "Description": "Đầu tư cho tương lai với ưu đãi hoàn tiền 12% học phí tại mọi trường học và trung tâm.",
        "Benefits": ["Trả góp 0% học phí lên tới 12 tháng", "Hoàn tiền đóng học phí", "Tặng khóa học Coursera/Udemy hàng năm"],
        "CreditLimit": "150.000.000 VNĐ",
        "InterestRate": "17%/năm"
    },
    {
        "Name": "Family Care Platinum",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2940&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 400000.0,
        "MinSalary": 12000000.0,
        "CashbackRules": [
            {"Category": "Siêu thị", "Percentage": 18.0, "CapAmount": 1500000.0},
            {"Category": "Giáo dục", "Percentage": 8.0, "CapAmount": 1000000.0},
            {"Category": "All", "Percentage": 1.5, "CapAmount": None}
        ],
        "Description": "Trợ thủ đắc lực cho gia đình bạn. Siêu hoàn tiền tại mọi siêu thị Co.opmart, Winmart, Go!.",
        "Benefits": ["Hoàn tiền siêu thị", "Giao hàng miễn phí cuối tuần", "Tặng mã giảm giá Grab/Be cho gia đình"],
        "CreditLimit": "250.000.000 VNĐ",
        "InterestRate": "15%/năm"
    },
    {
        "Name": "GenZ Dynamic",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1616070059530-58c0cf1d08fc?q=80&w=2938&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 0.0,
        "MinSalary": 0.0,
        "CashbackRules": [
            {"Category": "Giải trí", "Percentage": 25.0, "CapAmount": 500000.0},
            {"Category": "Ăn uống", "Percentage": 10.0, "CapAmount": 500000.0},
            {"Category": "Tất cả", "Percentage": 0.5, "CapAmount": None}
        ],
        "Description": "Dành riêng cho giới trẻ GenZ. Không cần chứng minh thu nhập, hoàn tiền thả ga tại rạp phim, quán cafe.",
        "Benefits": ["Mua 1 tặng 1 CGV/Lotte", "Giảm 30% Highlands/Phúc Long", "Thiết kế thẻ dạ quang cực ngầu"],
        "CreditLimit": "20.000.000 VNĐ",
        "InterestRate": "25%/năm"
    },
    {
        "Name": "Diamond Infinite CEO",
        "Bank": "fake-bank",
        "BankName": "Ngan Hang Ao",
        "BankLogo": "https://img.icons8.com/color/48/bank.png",
        "ImageUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2788&auto=format&fit=crop",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 5000000.0,
        "MinSalary": 50000000.0,
        "CashbackRules": [
            {"Category": "Tất cả", "Percentage": 10.0, "CapAmount": None}
        ],
        "Description": "Thẻ quyền lực nhất dành cho giới thượng lưu. Hoàn 10% KHÔNG GIỚI HẠN cho MỌI CHI TIÊU.",
        "Benefits": ["Hoàn tiền 10% mọi lĩnh vực", "Đưa đón sân bay bằng Limousine", "Trợ lý cá nhân toàn cầu 24/7", "Chơi Golf miễn phí 12 lần/năm"],
        "CreditLimit": "2.000.000.000 VNĐ",
        "InterestRate": "9%/năm"
    }
]

# Insert cards
result = col.insert_many(fake_cards)
print(f"Inserted {len(result.inserted_ids)} fake cards.")
