const http2 = require('http2');
const { URL } = require('url');

const API_SEARCH = 'https://www.vib.com.vn/promotion/api/search';

const HEADERS = {
  ':method': 'POST',
  ':path': '/promotion/api/search',
  ':authority': 'www.vib.com.vn',
  ':scheme': 'https',
  'accept': 'application/json, text/plain, */*',
  'content-type': 'application/json',
  'origin': 'https://www.vib.com.vn',
  'referer': 'https://www.vib.com.vn/vn/promotion/vib-world',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'x-requested-with': 'XMLHttpRequest',
  'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin'
};

function postH2(urlStr, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = http2.connect(url.origin, {
        settings: {
            enablePush: false,
            initialWindowSize: 65535,
            maxConcurrentStreams: 100
        }
    });

    client.on('error', (err) => reject(err));

    const req = client.request({
      ...HEADERS,
      'content-length': Buffer.byteLength(JSON.stringify(body))
    });

    let data = '';
    req.on('response', (headers) => {
      // console.log('Response Status:', headers[':status']);
    });

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      client.close();
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        resolve({ error: 'Parse Error', raw: data.substring(0, 500) });
      }
    });

    req.on('error', (err) => {
        client.close();
        reject(err);
    });

    req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  try {
    const body = {
      cateId: "3,1,2,75,76,",
      keyword: "",
      pageNum: 1,
      pageSize: "5",
      status: "A",
      language: "vi-VN",
      flatOutstanding: 1
    };
    const result = await postH2(API_SEARCH, body);
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error(e);
  }
}

test();
