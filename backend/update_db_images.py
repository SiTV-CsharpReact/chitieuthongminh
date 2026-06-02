import os
import re
from pymongo import MongoClient

def sanitize_filename(name):
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    return name.strip()

client = MongoClient('mongodb://127.0.0.1:27017')
db = client['ChiTieuThongMinh']
collection = db['CreditCards']

base_dir = '/Users/sivan/chitieuthongminh/backend/upload/image'

cards = collection.find()
updated_count = 0

for card in cards:
    bank_raw = card.get('Bank') or card.get('BankName') or 'Unknown'
    card_name_raw = card.get('Name', 'Unknown Card')
    
    bank_name = sanitize_filename(bank_raw)
    card_name = sanitize_filename(card_name_raw)
    
    # Update ImageUrl
    bank_dir = os.path.join(base_dir, bank_name)
    new_image_url = None
    if os.path.exists(bank_dir):
        # Find the matching file in the folder (ignoring extension)
        for f in os.listdir(bank_dir):
            if os.path.isfile(os.path.join(bank_dir, f)) and f.startswith(card_name):
                new_image_url = f"http://localhost:5001/upload/image/{bank_name}/{f}"
                break
    
    # Update BankLogo
    new_logo_url = None
    logo_dir = os.path.join(bank_dir, 'logo')
    if os.path.exists(logo_dir):
        for f in os.listdir(logo_dir):
            if f.endswith('.png'):
                new_logo_url = f"http://localhost:5001/upload/image/{bank_name}/logo/{f}"
                break
    
    update_data = {}
    if new_image_url and card.get('ImageUrl') != new_image_url:
        update_data['ImageUrl'] = new_image_url
    if new_logo_url and card.get('BankLogo') != new_logo_url:
        update_data['BankLogo'] = new_logo_url
        
    if update_data:
        collection.update_one({'_id': card['_id']}, {'$set': update_data})
        updated_count += 1

print(f"Successfully updated image URLs for {updated_count} cards in the database.")
