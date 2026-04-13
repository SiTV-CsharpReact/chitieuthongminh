const https = require('https');

const API_SEARCH = 'https://www.vib.com.vn/promotion/api/search';
const API_DETAIL = 'https://www.vib.com.vn/promotion/api/detail';

const HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Content-Type': 'application/json',
  'Origin': 'https://www.vib.com.vn',
  'Referer': 'https://www.vib.com.vn/vn/promotion/vib-world',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
  'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin'
};

async function post(url, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: HEADERS
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
          try {
              resolve(JSON.parse(data));
          } catch (e) {
              reject(new Error(`Failed to parse JSON: ${data.substring(0, 100)}`));
          }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function get(url) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: HEADERS
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(new Error(`Failed to parse JSON: ${data.substring(0, 100)}`));
            }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

async function run() {
  try {
    const searchBody = {
      cateId: "3,1,2,75,76,",
      keyword: "",
      pageNum: 1,
      pageSize: "24",
      status: "A",
      language: "vi-VN",
      flatOutstanding: 1
    };

    const searchResult = await post(API_SEARCH, searchBody);
    
    // Debug logging
    if (searchResult['sec-cp-challenge']) {
        // console.error('Challenge detected');
        process.exit(2);
    }

    if (!searchResult.data) {
        // console.error('No data returned', JSON.stringify(searchResult));
        process.exit(1);
    }
    
    const items = searchResult.data || [];
    const results = [];
    for (const item of items) {
       try {
           const detail = await get(`${API_DETAIL}?promotionId=${item.proId}&lang=vi-VN`);
           const meta = detail.data;
           if (!meta) continue;

           const pInfo = meta.promotionInfo || {};
           
           // Category Mapping
           let categoryName = "VIB Deals";
           const catList = meta.categoryList || [];
           const firstCateId = item.cateId?.split(';')[0];
           const match = catList.find(c => c.id == firstCateId);
           if (match) categoryName = match.name;

           results.push({
             Title: item.proNameVn,
             ImageUrl: item.imageVn,
             DiscountRate: item.infoContent1Vn,
             Description: pInfo.infoExt1 || "",
             StartDate: item.effectDate,
             ValidUntil: item.expireDate,
             SourceUrl: `https://www.vib.com.vn/vn/promotion/vib-world/detail?promotionId=${item.proId}`,
             CategoryTab: categoryName
           });
       } catch (e) {
           // Skip if individual detail fail
       }
    }
    console.log(JSON.stringify(results));
  } catch (error) {
    process.exit(1);
  }
}

run();
