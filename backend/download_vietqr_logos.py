import os
import requests
import json
from difflib import SequenceMatcher

base_dir = 'upload/image'

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def download_vietqr_logos():
    # 1. Get bank list from VietQR API
    try:
        print("Fetching bank list from VietQR...")
        response = requests.get('https://api.vietqr.io/v2/banks', timeout=10)
        response.raise_for_status()
        banks_data = response.json().get('data', [])
    except Exception as e:
        print(f"Error fetching from VietQR: {e}")
        return

    # Create a mapping of simplified bank names to logo URLs
    vietqr_logos = {}
    for bank in banks_data:
        short_name = bank.get('shortName', '').lower().replace(' ', '').replace('-', '')
        code = bank.get('code', '').lower().replace(' ', '').replace('-', '')
        logo_url = bank.get('logo')
        
        if logo_url:
            vietqr_logos[short_name] = logo_url
            vietqr_logos[code] = logo_url

    # Specific hardcoded mappings for better accuracy
    mappings = {
        'vietcombank': 'vcb',
        'techcombank': 'tcb',
        'tpbank': 'tpb',
        'vpbank': 'vpb',
        'sacombank': 'sacombank',
        'vib': 'vib',
        'hdbank': 'hdbank',
        'eximbank': 'eximbank',
        'mb': 'mb',
        'acb': 'acb',
        'agribank': 'agribank',
        'bidv': 'bidv',
        'shinhan-bank': 'shinhan',
        'woori-bank': 'woori',
        'ocb': 'ocb',
        'shb': 'shb',
        'msb': 'msb',
        'ncb': 'ncb',
        'seabank': 'seabank',
        'kbank': 'kbank',
        'abbank': 'abbank',
        'bac-a-bank': 'bacabank',
        'bvbank': 'bvbank',
        'cake-by-vpbank': 'cake',
        'lpbank': 'lpbank',
        'nama-bank': 'namabank',
        'vietbank': 'vietbank',
        'vietinbank': 'vietinbank'
    }

    if not os.path.exists(base_dir):
        print(f"Directory {base_dir} not found.")
        return

    # 2. Iterate through folders in upload/image
    folders = [f for f in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, f))]
    
    downloaded = 0
    failed = 0

    print(f"Found {len(folders)} bank folders. Starting download...")

    for folder in folders:
        # Create logo folder
        logo_dir = os.path.join(base_dir, folder, 'logo')
        if not os.path.exists(logo_dir):
            os.makedirs(logo_dir)

        # Determine the best logo URL to fetch
        clean_folder_name = folder.lower()
        search_key = mappings.get(clean_folder_name, clean_folder_name.replace('-', ''))
        
        logo_url = vietqr_logos.get(search_key)
        
        # If not found directly, try basic fallback guessing with CDN
        if not logo_url:
            # Try upper case of mapping
            fallback_code = search_key.upper()
            logo_url = f"https://cdn.vietqr.io/img/{fallback_code}.png"

        # Try to download
        file_path = os.path.join(logo_dir, f"{search_key.upper()}.png")
        
        # if os.path.exists(file_path):
        #     continue

        print(f"Downloading logo for {folder} from {logo_url}")
        try:
            res = requests.get(logo_url, stream=True, timeout=5)
            if res.status_code == 200:
                # Check if it's actually an image (not an HTML 404 page)
                content_type = res.headers.get('content-type', '')
                if 'image' in content_type:
                    with open(file_path, 'wb') as f:
                        for chunk in res.iter_content(8192):
                            f.write(chunk)
                    downloaded += 1
                else:
                    print(f"  -> Failed: Not an image ({content_type})")
                    failed += 1
            else:
                print(f"  -> Failed with status {res.status_code}")
                failed += 1
        except Exception as e:
            print(f"  -> Error: {e}")
            failed += 1

    print("-" * 30)
    print(f"Finished! Downloaded: {downloaded}, Failed: {failed}")

if __name__ == '__main__':
    download_vietqr_logos()
