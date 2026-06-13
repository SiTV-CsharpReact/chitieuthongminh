const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ 
      executablePath: '/Users/sivan/Library/Caches/ms-playwright/chromium-1105/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  await page.goto('https://techcombank.com/khach-hang-ca-nhan/uu-dai', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  // Find promotion link URLs
  const links = await page.$$eval('a', as => Array.from(new Set(as.map(a => a.href).filter(h => h.includes('techcombank.com/khach-hang-ca-nhan/uu-dai/')))));
  console.log("Techcombank promo links:", links.length);
  console.log("Samples:", links.slice(0, 5));
  
  await browser.close();
})();
