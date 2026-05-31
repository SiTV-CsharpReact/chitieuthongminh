from pymongo import MongoClient

client = MongoClient('mongodb://127.0.0.1:27017')
db = client['ChiTieuThongMinh']
col = db['credit_cards']

# Remove the previous fake ones
del_result = col.delete_many({"BankName": "Ngan Hang Ao"})
print(f"Deleted {del_result.deleted_count} previous fake cards.")

real_cards = [
    {
        "Name": "Thẻ tín dụng Cake Freedom",
        "Bank": "cake",
        "BankName": "Cake by VPBank",
        "BankLogo": "https://img.icons8.com/color/48/cake-bank.png",
        "ImageUrl": "https://cake.vn/wp-content/uploads/2023/12/Freedom-card.png",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 0.0,
        "MinSalary": 0.0,
        "CashbackRules": [
            {"Category": "Ăn uống", "Percentage": 20.0, "CapAmount": 1000000.0},
            {"Category": "Siêu thị", "Percentage": 20.0, "CapAmount": 1000000.0},
            {"Category": "Du lịch", "Percentage": 20.0, "CapAmount": 1000000.0},
            {"Category": "Tất cả", "Percentage": 0.2, "CapAmount": None}
        ],
        "Description": "Hoàn tiền 20% (tối đa 1 triệu/tháng) cho nhóm danh mục yêu thích: Ăn uống, Đi lại - Du lịch, hoặc Tiện ích. Đổi danh mục linh hoạt mỗi quý.",
        "Benefits": ["Hoàn 20% danh mục ưu tiên", "Miễn phí thường niên trọn đời", "Không cần chứng minh thu nhập"],
        "CreditLimit": "Lên tới 100.000.000 VNĐ",
        "InterestRate": "33.6%/năm"
    },
    {
        "Name": "Thẻ tín dụng VIB Super Card",
        "Bank": "vib",
        "BankName": "VIB",
        "BankLogo": "https://img.icons8.com/color/48/vib.png",
        "ImageUrl": "https://www.vib.com.vn/wps/wcm/connect/vib/dfd1cdb3-85e6-42fb-afc7-fdb9c313a532/supercard.png?MOD=AJPERES&CACHEID=ROOTWORKSPACE.Z18_5B041180N8F150Q7V5Q52L0000-dfd1cdb3-85e6-42fb-afc7-fdb9c313a532-oS1d.B6",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 899000.0,
        "MinSalary": 15000000.0,
        "CashbackRules": [
            {"Category": "Mua sắm", "Percentage": 15.0, "CapAmount": 1000000.0},
            {"Category": "Ăn uống", "Percentage": 15.0, "CapAmount": 1000000.0},
            {"Category": "Du lịch", "Percentage": 15.0, "CapAmount": 1000000.0},
            {"Category": "Tất cả", "Percentage": 0.1, "CapAmount": None}
        ],
        "Description": "Thẻ tín dụng VIB Super Card hoàn tiền 15% tùy chọn các lĩnh vực: Mua sắm, Du lịch, Ăn uống... (Tối đa 1.000.000 VNĐ/tháng). Có thể tự thiết kế tính năng thẻ qua app MyVIB.",
        "Benefits": ["Hoàn tiền 15% tự chọn lĩnh vực", "Tự chọn ngày sao kê", "Tự thiết kế số thẻ"],
        "CreditLimit": "Lên tới 600.000.000 VNĐ",
        "InterestRate": "35.88%/năm"
    },
    {
        "Name": "Thẻ tín dụng VIB Cash Back",
        "Bank": "vib",
        "BankName": "VIB",
        "BankLogo": "https://img.icons8.com/color/48/vib.png",
        "ImageUrl": "https://www.vib.com.vn/wps/wcm/connect/vib/12066d78-fb57-4183-b78b-bebc3bc83a15/cash-back.png?MOD=AJPERES&CACHEID=ROOTWORKSPACE.Z18_5B041180N8F150Q7V5Q52L0000-12066d78-fb57-4183-b78b-bebc3bc83a15-ozmXk.Q",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 899000.0,
        "MinSalary": 15000000.0,
        "CashbackRules": [
            {"Category": "Y tế", "Percentage": 10.0, "CapAmount": 1500000.0},
            {"Category": "Giáo dục", "Percentage": 10.0, "CapAmount": 1500000.0},
            {"Category": "Bảo hiểm", "Percentage": 10.0, "CapAmount": 1500000.0},
            {"Category": "Ăn uống", "Percentage": 5.0, "CapAmount": 1500000.0},
            {"Category": "Giải trí", "Percentage": 5.0, "CapAmount": 1500000.0},
            {"Category": "Tất cả", "Percentage": 0.1, "CapAmount": None}
        ],
        "Description": "Hoàn tới 24 triệu đồng/năm (1,5 triệu/tháng). Hoàn tới 10% cho nhóm Y tế, Giáo dục, Bảo hiểm, hoặc 5% cho Ẩm thực, Giải trí, Viễn thông.",
        "Benefits": ["Hoàn tới 24 triệu/năm", "Hoàn tiền tự động vào tài khoản", "Trả góp 0% tại nhiều đối tác"],
        "CreditLimit": "Lên tới 600.000.000 VNĐ",
        "InterestRate": "33.5%/năm"
    },
    {
        "Name": "Thẻ tín dụng VPBank StepUp",
        "Bank": "vpbank",
        "BankName": "VPBank",
        "BankLogo": "https://img.icons8.com/color/48/vpbank.png",
        "ImageUrl": "https://www.vpbank.com.vn/-/media/vpbank-latest/cards/step-up.png",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 499000.0,
        "MinSalary": 7000000.0,
        "CashbackRules": [
            {"Category": "Mua sắm online", "Percentage": 15.0, "CapAmount": 600000.0},
            {"Category": "Ăn uống", "Percentage": 5.0, "CapAmount": 300000.0},
            {"Category": "Xem phim", "Percentage": 5.0, "CapAmount": 300000.0},
            {"Category": "Tất cả", "Percentage": 0.3, "CapAmount": None}
        ],
        "Description": "Dành cho giới trẻ năng động. Hoàn 15% cho Mua sắm online, Grab, Gojek, Be. Hoàn 5% Ẩm thực và Xem phim (Tối đa 600k/tháng).",
        "Benefits": ["Hoàn 15% mua sắm trực tuyến", "Hoàn tiền lên tới 7.2 triệu/năm", "Tặng bảo hiểm giao dịch gian lận"],
        "CreditLimit": "Lên tới 500.000.000 VNĐ",
        "InterestRate": "34.8%/năm"
    },
    {
        "Name": "Thẻ tín dụng HSBC Visa Platinum Cashback",
        "Bank": "hsbc",
        "BankName": "HSBC",
        "BankLogo": "https://img.icons8.com/color/48/hsbc.png",
        "ImageUrl": "https://www.hsbc.com.vn/content/dam/hsbc/vn/images/credit-cards/visa-platinum-cashback/card-face.jpg",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 800000.0,
        "MinSalary": 15000000.0,
        "CashbackRules": [
            {"Category": "Siêu thị", "Percentage": 8.0, "CapAmount": 200000.0},
            {"Category": "Giáo dục", "Percentage": 1.0, "CapAmount": None},
            {"Category": "Bảo hiểm", "Percentage": 1.0, "CapAmount": None},
            {"Category": "Tất cả", "Percentage": 1.0, "CapAmount": None}
        ],
        "Description": "Hoàn tiền lên đến 8% cho chi tiêu siêu thị và tạp hoá khi nhận lương qua HSBC, hoặc 6% cho khách hàng thông thường. Hoàn 1% không giới hạn cho Giáo dục và Bảo hiểm.",
        "Benefits": ["Hoàn 8% đi siêu thị", "Tự động cộng tiền vào tài khoản thẻ", "Hoàn 1% không giới hạn các danh mục khác"],
        "CreditLimit": "Lên tới 800.000.000 VNĐ",
        "InterestRate": "31.2%/năm"
    },
    {
        "Name": "Thẻ tín dụng Shinhan Bank Visa Platinum",
        "Bank": "shinhan",
        "BankName": "Shinhan Bank",
        "BankLogo": "https://img.icons8.com/color/48/shinhan-bank.png",
        "ImageUrl": "https://shinhan.com.vn/public/uploads/2019/12/1577785311_visa-platinum.png",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 1100000.0,
        "MinSalary": 20000000.0,
        "CashbackRules": [
            {"Category": "Ẩm thực", "Percentage": 5.0, "CapAmount": 500000.0},
            {"Category": "Tất cả", "Percentage": 0.4, "CapAmount": None}
        ],
        "Description": "Thẻ tích luỹ điểm thưởng Shinhan Point 5% cho Ẩm thực cuối tuần và 0.4% cho mọi chi tiêu khác. Điểm thưởng có thể quy đổi thành tiền mặt.",
        "Benefits": ["Tích điểm thưởng 5% Ẩm thực cuối tuần", "Tặng 1 món chính tại nhà hàng cao cấp", "Bảo hiểm du lịch toàn cầu"],
        "CreditLimit": "Lên tới 1.000.000.000 VNĐ",
        "InterestRate": "28.5%/năm"
    },
    {
        "Name": "Thẻ tín dụng UOB YOLO",
        "Bank": "uob",
        "BankName": "UOB",
        "BankLogo": "https://img.icons8.com/color/48/uob.png",
        "ImageUrl": "https://www.uob.com.vn/personal/cards/credit-cards/yolo/images/yolo-card.png",
        "Link": "#",
        "RegisterUrl": "#",
        "AnnualFee": 0.0,
        "MinSalary": 10000000.0,
        "CashbackRules": [
            {"Category": "Giải trí", "Percentage": 10.0, "CapAmount": 500000.0},
            {"Category": "Di chuyển", "Percentage": 10.0, "CapAmount": 500000.0},
            {"Category": "Tất cả", "Percentage": 0.1, "CapAmount": None}
        ],
        "Description": "Dòng thẻ thiết kế riêng cho giải trí, hoàn tiền 10% tại Grab, Be, Spotify, Netflix, CGV.",
        "Benefits": ["Miễn phí thường niên trọn đời (có đk)", "Hoàn 10% di chuyển và giải trí", "Thẻ ảo sử dụng ngay lập tức"],
        "CreditLimit": "Lên tới 300.000.000 VNĐ",
        "InterestRate": "33.0%/năm"
    }
]

# Insert cards
result = col.insert_many(real_cards)
print(f"Inserted {len(result.inserted_ids)} real cards.")
