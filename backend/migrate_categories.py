import os
from pymongo import MongoClient

def main():
    client = MongoClient('mongodb://127.0.0.1:27017')
    db = client['ChiTieuThongMinh']
    
    # 1. Define new categories
    new_categories = [
        {"Name": "Bảo hiểm", "Color": "#3b82f6", "Icon": "health_and_safety"},
        {"Name": "Siêu thị", "Color": "#10b981", "Icon": "shopping_cart"},
        {"Name": "Di chuyển", "Color": "#f59e0b", "Icon": "local_taxi"},
        {"Name": "Y tế & Sức khỏe", "Color": "#ef4444", "Icon": "medical_services"},
        {"Name": "Giáo dục", "Color": "#8b5cf6", "Icon": "school"},
        {"Name": "Giải trí", "Color": "#ec4899", "Icon": "movie"},
        {"Name": "Ăn uống", "Color": "#f97316", "Icon": "restaurant"},
        {"Name": "Du lịch & Lưu trú", "Color": "#0ea5e9", "Icon": "flight"},
        {"Name": "Mua sắm & Thời trang", "Color": "#a855f7", "Icon": "checkroom"},
        {"Name": "Fitness & Phòng tập", "Color": "#14b8a6", "Icon": "fitness_center"},
        {"Name": "Sản phẩm số & Dịch vụ số", "Color": "#6366f1", "Icon": "devices"},
        {"Name": "Spa & Làm đẹp", "Color": "#f43f5e", "Icon": "spa"},
        {"Name": "Sàn thương mại điện tử", "Color": "#84cc16", "Icon": "storefront"},
        {"Name": "Thanh toán hóa đơn & Tiện ích", "Color": "#06b6d4", "Icon": "receipt_long"},
        {"Name": "Dịch vụ kinh doanh", "Color": "#64748b", "Icon": "business_center"},
        {"Name": "Tất cả chi tiêu", "Color": "#64748b", "Icon": "all_inclusive"}
    ]
    
    # Drop existing categories and insert new ones
    print("Xóa các danh mục cũ...")
    db.Categories.delete_many({})
    print(f"Chèn {len(new_categories)} danh mục mới...")
    db.Categories.insert_many(new_categories)
    
    # 2. Map existing CashbackRules
    mapping = {
        "Mua sắm": "Mua sắm & Thời trang",
        "Du lịch": "Du lịch & Lưu trú",
        "Vé máy bay": "Du lịch & Lưu trú",
        "Online": "Sàn thương mại điện tử",
        "Di chuyển": "Di chuyển",
        "Giao thông/Xăng": "Di chuyển",
        "Ô tô/Bảo dưỡng": "Di chuyển",
        "Y tế": "Y tế & Sức khỏe",
        "Sức khỏe y tế": "Y tế & Sức khỏe",
        "Sức khỏe": "Fitness & Phòng tập",
        "Chăm sóc cá nhân": "Spa & Làm đẹp",
        "Thanh toán hóa đơn": "Thanh toán hóa đơn & Tiện ích",
        "Hóa đơn/Tiện ích": "Thanh toán hóa đơn & Tiện ích",
        "Tất cả": "Tất cả chi tiêu"
    }
    
    cards = list(db.CreditCards.find())
    updated_count = 0
    
    for card in cards:
        rules = card.get('CashbackRules', [])
        modified = False
        
        for rule in rules:
            old_cat = rule.get('Category', '')
            if old_cat in mapping:
                rule['Category'] = mapping[old_cat]
                modified = True
            elif old_cat == "Ăn uống" or old_cat == "Siêu thị" or old_cat == "Giáo dục" or old_cat == "Giải trí" or old_cat == "Dịch vụ kinh doanh":
                pass # Giữ nguyên
            elif old_cat:
                pass # Các danh mục khác (nếu có)
                
        if modified:
            db.CreditCards.update_one({'_id': card['_id']}, {'$set': {'CashbackRules': rules}})
            updated_count += 1
            
    print(f"Đã cập nhật {updated_count} thẻ tín dụng để map sang danh mục mới.")

if __name__ == "__main__":
    main()
