import json
import os
import requests
import re
from urllib.parse import urlparse

# Path to the backup JSON
backup_file = 'CreditCards_Backup.json'
# Base directory for saving logos
base_dir = 'upload/logo'

def sanitize_filename(name):
    # Remove invalid characters for filenames
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    return name.strip()

def download_logos():
    if not os.path.exists(backup_file):
        print(f"Error: {backup_file} not found.")
        return

    with open(backup_file, 'r', encoding='utf-8') as f:
        cards = json.load(f)

    if not os.path.exists(base_dir):
        os.makedirs(base_dir)

    downloaded = 0
    failed = 0
    skipped = 0

    print(f"Starting to process bank logos from {len(cards)} cards...")
    
    # Use a set to keep track of banks we've already downloaded logos for
    processed_banks = set()

    for card in cards:
        logo_url = card.get('BankLogo')
        bank_name = card.get('Bank') or card.get('BankName') or 'Unknown'

        bank_name = sanitize_filename(bank_name)

        if not logo_url or not logo_url.startswith('http'):
            continue
            
        # If we already downloaded the logo for this bank, skip
        if bank_name.lower() in processed_banks:
            continue

        # Get file extension from URL
        parsed_url = urlparse(logo_url)
        path = parsed_url.path
        ext = os.path.splitext(path)[1]
        if not ext:
            ext = '.png' # Default extension

        # Some URLs might have query parameters or no extension. Fallback to common extensions if weird
        if len(ext) > 5 or not ext.isalpha():
            ext = '.png'

        file_name = f"{bank_name}_logo{ext}"
        file_path = os.path.join(base_dir, file_name)

        processed_banks.add(bank_name.lower())

        # Skip if already downloaded
        if os.path.exists(file_path):
            skipped += 1
            continue

        print(f"Downloading Logo for: {bank_name}")
        try:
            response = requests.get(logo_url, stream=True, timeout=10)
            if response.status_code == 200:
                with open(file_path, 'wb') as out_file:
                    for chunk in response.iter_content(chunk_size=8192):
                        out_file.write(chunk)
                downloaded += 1
            else:
                print(f"Failed to download {logo_url} (Status: {response.status_code})")
                failed += 1
        except Exception as e:
            print(f"Error downloading {logo_url}: {e}")
            failed += 1

    print("-" * 30)
    print(f"Finished! Downloaded logos: {downloaded}, Skipped (Already exist): {skipped}, Failed: {failed}")

if __name__ == '__main__':
    download_logos()
