import json
import os
import requests
import re
from urllib.parse import urlparse

# Path to the backup JSON
backup_file = 'CreditCards_Backup.json'
# Base directory for saving images
base_dir = 'upload/image'

def sanitize_filename(name):
    # Remove invalid characters for filenames
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    return name.strip()

def download_images():
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

    print(f"Starting to process {len(cards)} cards...")

    for card in cards:
        image_url = card.get('ImageUrl')
        bank_name = card.get('Bank') or card.get('BankName') or 'Unknown'
        card_name = card.get('Name')

        if not image_url or not image_url.startswith('http'):
            skipped += 1
            continue
            
        if not card_name:
            card_name = "Unknown Card"

        bank_name = sanitize_filename(bank_name)
        card_name = sanitize_filename(card_name)

        bank_dir = os.path.join(base_dir, bank_name)
        if not os.path.exists(bank_dir):
            os.makedirs(bank_dir)

        # Get file extension from URL
        parsed_url = urlparse(image_url)
        path = parsed_url.path
        ext = os.path.splitext(path)[1]
        if not ext:
            ext = '.png' # Default extension

        # Some URLs might have query parameters or no extension. Fallback to common extensions if weird
        if len(ext) > 5 or not ext.isalpha():
            ext = '.png'

        file_name = f"{card_name}{ext}"
        file_path = os.path.join(bank_dir, file_name)

        # Skip if already downloaded
        if os.path.exists(file_path):
            skipped += 1
            continue

        print(f"Downloading: {bank_name} - {card_name}")
        try:
            response = requests.get(image_url, stream=True, timeout=10)
            if response.status_code == 200:
                with open(file_path, 'wb') as out_file:
                    for chunk in response.iter_content(chunk_size=8192):
                        out_file.write(chunk)
                downloaded += 1
            else:
                print(f"Failed to download {image_url} (Status: {response.status_code})")
                failed += 1
        except Exception as e:
            print(f"Error downloading {image_url}: {e}")
            failed += 1

    print("-" * 30)
    print(f"Finished! Downloaded: {downloaded}, Skipped: {skipped}, Failed: {failed}")

if __name__ == '__main__':
    download_images()
