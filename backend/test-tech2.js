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
  
  // Find promotion links that have images inside them
  const cards = await page.$$eval('a', as => as.filter(a => a.querySelector('img') && a.href.includes('/uu-dai')).map(a => a.outerHTML));
  console.log("Techcombank image links:", cards.length);
  if (cards.length > 0) console.log("Example:", cards[0].substring(0, 500));
  
  await browser.close();
})();
