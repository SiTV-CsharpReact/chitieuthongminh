import os
import re
from pymongo import MongoClient
from urllib.parse import unquote

# Vietnamese char maps
VIETNAMESE_MAP = {
    'a': 'áàảãạăắằẳẵặâấầẩẫậ',
    'd': 'đ',
    'e': 'éèẻẽẹêếềểễệ',
    'i': 'íìỉĩị',
    'o': 'óòỏõọôốồổỗộơớờởỡợ',
    'u': 'úùủũụưứừửữự',
    'y': 'ýỳỷỹỵ',
}

def remove_accents(text):
    text = str(text)
    for non_accent, accents in VIETNAMESE_MAP.items():
        for accent in accents:
            text = text.replace(accent, non_accent)
            text = text.replace(accent.upper(), non_accent.upper())
    return text

def to_seo_friendly(filename):
    # Split extension
    name, ext = os.path.splitext(filename)
    
    # Remove accents
    name = remove_accents(name)
    
    # Lowercase
    name = name.lower()
    
    # Replace non-alphanumeric chars with hyphens
    name = re.sub(r'[^a-z0-9]+', '-', name)
    
    # Remove leading/trailing hyphens
    name = name.strip('-')
    
    return name + ext

def main():
    client = MongoClient('mongodb://127.0.0.1:27017')
    db = client['ChiTieuThongMinh']
    collection = db['CreditCards']

    base_dir = '/Users/sivan/chitieuthongminh/backend/upload/image'
    
    if not os.path.exists(base_dir):
        print(f"Directory {base_dir} not found.")
        return

    # Track how many files were renamed
    files_renamed = 0
    # Track how many DB records were updated
    db_updated = 0

    # 1. Traverse all bank folders and rename files
    # Dictionary to keep mapping from old_url to new_url to easily update DB
    url_mapping = {}

    for bank_folder in os.listdir(base_dir):
        bank_path = os.path.join(base_dir, bank_folder)
        if not os.path.isdir(bank_path):
            continue
            
        for f in os.listdir(bank_path):
            old_file_path = os.path.join(bank_path, f)
            if not os.path.isfile(old_file_path) or f.startswith('.'):
                continue
                
            new_f = to_seo_friendly(f)
            if new_f != f:
                new_file_path = os.path.join(bank_path, new_f)
                
                # Check if new file already exists (to avoid overwrite conflicts)
                if not os.path.exists(new_file_path):
                    os.rename(old_file_path, new_file_path)
                    print(f"Renamed: {bank_folder}/{f} -> {new_f}")
                    files_renamed += 1
                else:
                    # If it already exists, just use it and remove the old one if it's a different file
                    if old_file_path.lower() != new_file_path.lower(): # Case insensitive filesystem check
                        try:
                           os.remove(old_file_path)
                           print(f"Removed old (duplicate): {bank_folder}/{f}")
                        except Exception as e:
                           pass
                
                # Add to mapping (note: the database stores URL encoded paths, or plain paths depending on the scrape)
                # The DB format is usually http://localhost:5000/upload/image/BankName/Filename.png
                # So we just map the old filename to the new filename for this bank
                
                # Create encoded and unencoded version for robust matching
                old_encoded = f.replace(" ", "%20") 
                
                url_mapping[f"{bank_folder}/{f}"] = f"{bank_folder}/{new_f}"
                url_mapping[f"{bank_folder}/{old_encoded}"] = f"{bank_folder}/{new_f}"

    # 2. Update Database
    cards = collection.find()
    for card in cards:
        image_url = card.get('ImageUrl')
        if not image_url:
            continue
            
        # Example: http://localhost:5000/upload/image/VPBank/Th%E1%BA%BB%20t%C3%ADn%20d%E1%BB%A5ng.png
        # We need to extract the part after /upload/image/
        parts = image_url.split('/upload/image/')
        if len(parts) == 2:
            domain_part = parts[0]
            relative_part = parts[1] # e.g. VPBank/Thẻ tín dụng.png
            
            # URL decode the relative part to match our file system names
            decoded_relative = unquote(relative_part)
            
            # Split bank and filename
            rel_parts = decoded_relative.split('/', 1)
            if len(rel_parts) == 2:
                bank_name = rel_parts[0]
                filename = rel_parts[1]
                
                new_filename = to_seo_friendly(filename)
                
                if new_filename != filename:
                    new_image_url = f"{domain_part}/upload/image/{bank_name}/{new_filename}"
                    
                    collection.update_one(
                        {'_id': card['_id']},
                        {'$set': {'ImageUrl': new_image_url}}
                    )
                    db_updated += 1
                    print(f"Updated DB for card {card.get('Name')}")

    print(f"\n--- Summary ---")
    print(f"Files renamed: {files_renamed}")
    print(f"DB records updated: {db_updated}")

if __name__ == "__main__":
    main()
