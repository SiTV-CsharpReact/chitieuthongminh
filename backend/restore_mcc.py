import os
from pymongo import MongoClient

def main():
    client = MongoClient('mongodb://127.0.0.1:27017')
    db = client['ChiTieuThongMinh']
    
    # Original MCC mapping from Seed file mapped to New Category Names
    mcc_mapping = {
        "Ăn uống": ["5811", "5812", "5813", "5814"],
        "Siêu thị": ["5411", "5422", "5499", "5300"],
        "Du lịch & Lưu trú": ["3000", "3001", "3005", "3007", "3008", "3010", "3350", "4511", "4722", "7011", "3501", "3502", "3503", "3504", "3509", "3512"],
        "Mua sắm & Thời trang": ["5311", "5611", "5621", "5631", "5641", "5651", "5661", "5691", "5941", "5942", "5999", "5945"],
        "Di chuyển": ["5541", "5542", "4121", "4111", "4131", "4789", "5533", "7531", "7534", "7538", "7542"], # Giao thông/Xăng + Ô tô/Bảo dưỡng
        "Giải trí": ["7832", "7922", "7999", "7997", "7941", "7991"],
        "Y tế & Sức khỏe": ["8011", "8021", "8042", "8043", "8062", "8099", "5912"],
        "Thanh toán hóa đơn & Tiện ích": ["4900", "4814", "4899", "4812"],
        "Giáo dục": ["8211", "8220", "8241", "8244", "8249", "8299"],
        "Spa & Làm đẹp": ["7230", "7298", "7297"],
        "Dịch vụ kinh doanh": ["7311", "7333", "7399", "8999", "7349", "7372"]
    }
    
    updated = 0
    for cat_name, codes in mcc_mapping.items():
        result = db.Categories.update_one(
            {"Name": cat_name},
            {"$set": {"MccCodes": codes}}
        )
        if result.modified_count > 0:
            print(f"Khôi phục thành công {len(codes)} MCC cho danh mục: {cat_name}")
            updated += 1
            
    print(f"Tổng cộng đã cập nhật MCC cho {updated} danh mục mới.")

if __name__ == "__main__":
    main()
