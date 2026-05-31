import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

response = requests.get('https://rcgv.vn/the-tin-dung/', headers=headers)
print("Status Code:", response.status_code)

soup = BeautifulSoup(response.text, 'html.parser')
cards = soup.find_all('div', class_=lambda c: c and 'card' in c.lower())
print("Found card-like divs:", len(cards))

for idx, card in enumerate(cards[:5]):
    print(f"--- Card {idx} ---")
    print(card.text.strip()[:200])

# Also check if there's any Next.js data or JSON in script tags
scripts = soup.find_all('script')
for script in scripts:
    if script.string and 'window.__NEXT_DATA__' in script.string:
        print("Found Next.js data!")
    elif script.string and 'cards' in script.string.lower():
        print("Found 'cards' in a script tag.")
