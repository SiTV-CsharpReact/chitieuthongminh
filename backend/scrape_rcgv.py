import requests
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json'
}

response = requests.get('https://rcgv.vn/wp-json/nex/v1/cards', headers=headers)
data = response.json()

print(type(data))
if isinstance(data, dict):
    print("Keys:", list(data.keys()))
    if 'data' in data:
        cards = data['data']
        print(f"Number of cards: {len(cards)}")
        with open('sample_rcgv.json', 'w', encoding='utf-8') as f:
            json.dump(cards[:2], f, ensure_ascii=False, indent=2)
else:
    print(f"Number of items: {len(data)}")
    with open('sample_rcgv.json', 'w', encoding='utf-8') as f:
        json.dump(data[:2], f, ensure_ascii=False, indent=2)
