import os
from pymongo import MongoClient

client = MongoClient('mongodb://127.0.0.1:27017')
db = client['ChiTieuThongMinh']
collection = db['CreditCards']

cards = collection.find()
updated_count = 0

for card in cards:
    update_data = {}
    
    img_url = card.get('ImageUrl')
    if img_url and 'http://localhost:5001' in img_url:
        update_data['ImageUrl'] = img_url.replace('http://localhost:5001', 'http://localhost:5000')
        
    logo_url = card.get('BankLogo')
    if logo_url and 'http://localhost:5001' in logo_url:
        update_data['BankLogo'] = logo_url.replace('http://localhost:5001', 'http://localhost:5000')
        
    if update_data:
        collection.update_one({'_id': card['_id']}, {'$set': update_data})
        updated_count += 1

print(f"Fixed ports for {updated_count} cards in the database.")
