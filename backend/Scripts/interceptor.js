const { chromium } = require('playwright');

async function intercept() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('request', request => {
    if (request.url().includes('/api/search') && request.method() === 'POST') {
      console.log('--- FOUND SEARCH API ---');
      console.log('URL:', request.url());
      console.log('Headers:', request.headers());
      console.log('PostData:', request.postData());
    }
  });

  await page.goto('https://www.vib.com.vn/vn/promotion/vib-world', { waitUntil: 'networkidle' });
  await page.waitForTimeout(10000); // Give it time to load dynamic data
  await browser.close();
}

intercept();
