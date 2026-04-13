/**
 * VIB Promotions Scraper - Playwright Edition
 * Dùng trình duyệt thật để bypass Akamai bot protection
 * 
 * Usage: node scraper-playwright.js
 * Output: JSON array of promotions to stdout
 */

const { chromium } = require('playwright');

const API_SEARCH = 'https://www.vib.com.vn/promotion/api/search';
const API_DETAIL = 'https://www.vib.com.vn/promotion/api/detail';

async function run() {
  let browser;
  try {
    // Mở browser thật (headless) để bypass Akamai
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'vi-VN'
    });

    const page = await context.newPage();

    // Bước 1: Truy cập trang VIB để lấy cookies & vượt challenge
    console.error('[1/4] Đang mở trang VIB để vượt Akamai challenge...');
    await page.goto('https://www.vib.com.vn/vn/promotion/vib-world', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    // Chờ thêm để challenge hoàn tất
    await page.waitForTimeout(5000);

    // Bước 2: Gọi API search promotions (browser đã có cookies hợp lệ)
    console.error('[2/4] Đang gọi API tìm kiếm ưu đãi...');
    const searchBody = {
      cateId: "3,1,2,75,76,",
      keyword: "",
      pageNum: 1,
      pageSize: "50",
      status: "A",
      language: "vi-VN",
      flatOutstanding: 1
    };

    const searchResponse = await page.evaluate(async (params) => {
      const res = await fetch(params.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(params.body)
      });
      return await res.json();
    }, { url: API_SEARCH, body: searchBody });

    if (searchResponse['sec-cp-challenge']) {
      console.error('⚠️  Vẫn bị challenge, thử chờ thêm...');
      await page.waitForTimeout(10000);
      // Thử lại
      const retryResponse = await page.evaluate(async (params) => {
        const res = await fetch(params.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(params.body)
        });
        return await res.json();
      }, { url: API_SEARCH, body: searchBody });

      if (retryResponse['sec-cp-challenge'] || !retryResponse.data) {
        console.error('❌ Không thể bypass Akamai sau 2 lần thử.');
        process.exit(2);
      }
      searchResponse.data = retryResponse.data;
    }

    console.error('Raw searchResponse:', JSON.stringify(searchResponse).slice(0, 500));
    let items = [];
    if (searchResponse.data && Array.isArray(searchResponse.data)) {
        items = searchResponse.data;
    } else if (searchResponse.data && Array.isArray(searchResponse.data.content)) {
        items = searchResponse.data.content;
    } else if (Array.isArray(searchResponse)) {
        items = searchResponse;
    }
    console.error(`[3/4] Tìm thấy ${items.length} ưu đãi. Đang lấy chi tiết...`);

    // Bước 3: Lấy chi tiết từng promotion
    const results = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const detail = await page.evaluate(async (params) => {
          const res = await fetch(`${params.apiDetail}?promotionId=${params.proId}&lang=vi-VN`);
          return await res.json();
        }, { apiDetail: API_DETAIL, proId: item.proId });

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
          Title: item.proNameVn || '',
          ImageUrl: item.imageVn || '',
          DiscountRate: item.infoContent1Vn || '',
          Description: pInfo.infoExt1 || '',
          StartDate: item.effectDate || '',
          ValidUntil: item.expireDate || '',
          SourceUrl: `https://www.vib.com.vn/vn/promotion/vib-world/detail?promotionId=${item.proId}`,
          CategoryTab: categoryName
        });

        // Log tiến độ
        if ((i + 1) % 5 === 0) {
          console.error(`   ... đã xử lý ${i + 1}/${items.length}`);
        }
      } catch (e) {
        // Skip failed items
        console.error(`   ⚠️  Lỗi item ${i}: ${e.message}`);
      }
    }

    // Bước 4: Output kết quả
    console.error(`[4/4] ✅ Hoàn tất! Cào được ${results.length} ưu đãi.`);
    console.log(JSON.stringify(results, null, 2));

  } catch (error) {
    console.error(`❌ Lỗi: ${error.message}`);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

run();
