const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ 
      executablePath: '/Users/sivan/Library/Caches/ms-playwright/chromium-1105/chrome-mac/Chromium.app/Contents/MacOS/Chromium',
      args: ['--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  await context.addInitScript("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");
  
  const page = await context.newPage();
  await page.goto('https://www.vib.com.vn/vn/promotion/vib-world', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  const links = await page.$$eval('a', as => as.map(a => a.href).filter(h => h.includes('promotion/')));
  console.log(Array.from(new Set(links)));
  
  await browser.close();
})();
