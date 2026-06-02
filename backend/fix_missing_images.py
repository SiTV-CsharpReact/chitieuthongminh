import os
import difflib
import urllib.parse
from pymongo import MongoClient

def get_best_match(target_name, available_files):
    # Remove extensions for matching
    files_no_ext = {os.path.splitext(f)[0]: f for f in available_files if f.endswith(('.png', '.jpg', '.jpeg', '.webp'))}
    
    # Try difflib
    matches = difflib.get_close_matches(target_name, files_no_ext.keys(), n=1, cutoff=0.3)
    if matches:
        return files_no_ext[matches[0]]
    
    # Try subset match
    target_clean = target_name.replace('-', '').replace(' ', '').lower()
    for fname, orig_f in files_no_ext.items():
        fname_clean = fname.replace('-', '').replace(' ', '').lower()
        if fname_clean in target_clean or target_clean in fname_clean:
            return orig_f
            
    return None

def main():
    client = MongoClient('mongodb://127.0.0.1:27017')
    db = client['ChiTieuThongMinh']
    
    base_dir = '/Users/sivan/chitieuthongminh/backend/upload/image'
    
    fixed = 0
    missing = 0
    
    cards = list(db.CreditCards.find({}, {'Name': 1, 'ImageUrl': 1, 'Bank': 1, 'BankName': 1}))
    for c in cards:
        url = c.get('ImageUrl')
        if not url:
            continue
            
        parts = url.split('/upload/image/')
        if len(parts) == 2:
            domain_part = parts[0]
            rel_path = parts[1]
            file_path = os.path.join(base_dir, rel_path)
            file_path = urllib.parse.unquote(file_path)
            
            if not os.path.exists(file_path):
                # The file is missing. Let's find the correct file in the bank folder.
                rel_parts = rel_path.split('/', 1)
                bank_folder = rel_parts[0]
                
                bank_dir = os.path.join(base_dir, bank_folder)
                
                # Sometime the bank folder case might be different in the DB URL vs actual filesystem
                # Let's find the actual bank folder ignoring case
                actual_bank_folder = bank_folder
                if not os.path.exists(bank_dir):
                    for d in os.listdir(base_dir):
                        if d.lower() == bank_folder.lower() and os.path.isdir(os.path.join(base_dir, d)):
                            actual_bank_folder = d
                            bank_dir = os.path.join(base_dir, actual_bank_folder)
                            break

                if not os.path.exists(bank_dir):
                    print(f"Bank directory not found: {bank_dir}")
                    missing += 1
                    continue
                    
                available_files = [f for f in os.listdir(bank_dir) if os.path.isfile(os.path.join(bank_dir, f))]
                
                # Target name to match against (use card name or filename from url)
                target_name = c.get('Name').lower()
                
                best_file = get_best_match(target_name, available_files)
                if best_file:
                    new_url = f"{domain_part}/upload/image/{actual_bank_folder}/{best_file}"
                    db.CreditCards.update_one({'_id': c['_id']}, {'$set': {'ImageUrl': new_url}})
                    print(f"FIXED: {c.get('Name')} -> {new_url}")
                    fixed += 1
                else:
                    print(f"COULD NOT FIX: {c.get('Name')}")
                    missing += 1

    print(f"\\nFixed: {fixed}, Still Missing: {missing}")

if __name__ == "__main__":
    main()
