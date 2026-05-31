import requests
import json
import re
from pymongo import MongoClient

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json'
}

client = MongoClient('mongodb://127.0.0.1:27017')
db = client['ChiTieuThongMinh']
col = db['credit_cards']

def extract_percentage(text):
    if not text:
        return 1.0
    matches = re.findall(r'(\d+(?:\.\d+)?)\s*%', text)
    if matches:
        # get max percentage found
        return float(max([float(m) for m in matches]))
    return 1.0

print("Fetching data from https://rcgv.vn/wp-json/nex/v1/cards...")
try:
    response = requests.get('https://rcgv.vn/wp-json/nex/v1/cards', headers=headers, timeout=20)
    data = response.json()
    
    cards = data.get('cards', [])
    banks = data.get('banks', {})
    print(f"Success! Found {len(cards)} cards.")
    
    # Process and insert
    new_docs = []
    
    for c in cards:
        # Check if already exists (prevent duplicates)
        if col.find_one({"Name": c.get("name")}):
            continue
            
        bank_slug = c.get("bankSlug", "")
        bank_info = banks.get(bank_slug, "Unknown Bank")
        bank_logo = "https://img.icons8.com/color/48/bank.png"
        
        benefit_text = c.get("benefit", "")
        percent = extract_percentage(benefit_text)
        
        # Limit to reasonable percentage (e.g., max 30%)
        if percent > 30:
            percent = 1.0
            
        intents = c.get("intents", [])
        rules = []
        
        for intent in intents:
            rules.append({
                "Category": intent,
                "Percentage": percent,
                "CapAmount": None
            })
            
        if not rules:
            rules.append({
                "Category": "Tất cả",
                "Percentage": percent,
                "CapAmount": None
            })
            
        doc = {
            "Name": c.get("name", "Unknown Card"),
            "Bank": bank_slug,
            "BankName": c.get("bank", "Unknown Bank"),
            "BankLogo": bank_logo,
            "ImageUrl": c.get("img", ""),
            "Link": c.get("url", ""),
            "RegisterUrl": "",
            "AnnualFee": float(c.get("feeNum", 0)),
            "MinSalary": 0.0,
            "CashbackRules": rules,
            "Description": benefit_text,
            "Benefits": [c.get("fee", "Miễn phí thường niên")] + [f"Ưu đãi {intent}" for intent in intents[:2]],
            "CreditLimit": "Lên tới 1.000.000.000 VNĐ",
            "InterestRate": "30%/năm"
        }
        
        new_docs.append(doc)
        
    if new_docs:
        result = col.insert_many(new_docs)
        print(f"Successfully inserted {len(result.inserted_ids)} new cards into MongoDB!")
    else:
        print("No new cards to insert.")
        
except Exception as e:
    print(f"Error scraping: {e}")
