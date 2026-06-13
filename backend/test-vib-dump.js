const { chromium } = require('playwright-core');
const fs = require('fs');

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
  
  // Auto-click "Xem thêm" and scroll to load more
  for (let i = 0; i < 3; i++) {
      try {
          const buttons = await page.$$("button:has-text('Xem thêm'), button:has-text('Hiển thị thêm'), a:has-text('Xem thêm')");
          for (let btn of buttons) {
              if (await btn.isVisible()) {
                  await btn.click();
                  await page.waitForTimeout(2000);
              }
          }
      } catch (e) {}
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForTimeout(2000);
  }
  
  const html = await page.content();
  fs.writeFileSync('vib-dump.html', html);
  console.log("Dumped vib-dump.html. Length:", html.length);
  
  await browser.close();
})();
