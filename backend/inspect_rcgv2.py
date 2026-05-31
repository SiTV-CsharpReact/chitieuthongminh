import requests
from bs4 import BeautifulSoup
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

response = requests.get('https://rcgv.vn/the-tin-dung/', headers=headers)
soup = BeautifulSoup(response.text, 'html.parser')

scripts = soup.find_all('script')
for idx, script in enumerate(scripts):
    if script.string and 'cards' in script.string.lower():
        print(f"--- Script {idx} ---")
        print(script.string[:500])
        print("...")
        
        # Try to find something that looks like JSON or an array
        # This is just a heuristic
        match = re.search(r'var\s+\w+\s*=\s*(\[.*?\]);', script.string, re.DOTALL)
        if match:
            print("Found array variable!")
            print(match.group(1)[:200])
