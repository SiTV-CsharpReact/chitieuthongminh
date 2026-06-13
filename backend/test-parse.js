const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('vib-dump.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

// 1. Find links
const selectors = "a:has(img), a:has(div[style*='background-image']), a:has(div.backgroundImgOnContainingDiv)";
const links = document.querySelectorAll(selectors);
console.log("Total matched links:", links.length);

let count = 0;
for (const link of links) {
    let href = link.getAttribute('href') || "";
    if (!href || href === '#' || href === '/') continue;
    let lowerHref = href.toLowerCase();
    
    let looksLikePromo = lowerHref.includes('promo') || lowerHref.includes('uu-dai') || lowerHref.includes('offer') || lowerHref.includes('deal') || lowerHref.includes('campaign');
    if (!looksLikePromo) continue;
    
    let img = link.querySelector('img');
    let title = link.getAttribute('title');
    if (!title && img) title = img.getAttribute('alt');
    if (!title) title = link.textContent.trim();
    
    if (!title) continue;
    let lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('tìm hiểu thêm') || lowerTitle.includes('xem chi tiết')) continue;
    
    console.log("- Found:", title.replace(/\s+/g, ' ').substring(0, 50));
    count++;
}
console.log("Total extracted:", count);
