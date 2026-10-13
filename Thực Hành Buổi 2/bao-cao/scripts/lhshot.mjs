// Chụp phần Performance (điểm + chỉ số) của report Lighthouse user flow. Dùng: node lhshot.mjs <report.html> <out.png>
import puppeteer from 'puppeteer-core';
const [file, out] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1400, height: 2400, deviceScaleFactor: 2 });
await p.goto('file://' + file, { waitUntil: 'networkidle0' });
// Mở report của bước đo (mục thứ 2 trong thanh bên, sau "Summary")
const [step] = await p.$$('xpath/.//*[contains(text(), "Navigation report") or contains(text(), "Timespan report")]');
await step.click();
await p.waitForSelector('#performance .lh-audit-group--metrics', { timeout: 15000 });
await new Promise((r) => setTimeout(r, 1500));
const clip = await p.evaluate(() => {
  const cat = document.querySelector('#performance');
  const parts = [cat.querySelector('.lh-category-header'), cat.querySelector('.lh-audit-group--metrics'), cat.querySelector('.lh-filmstrip-container')].filter(Boolean);
  const top = Math.min(...parts.map((e) => e.getBoundingClientRect().top)) + window.scrollY - 16;
  const bottom = Math.max(...parts.map((e) => e.getBoundingClientRect().bottom)) + window.scrollY + 16;
  const r = cat.getBoundingClientRect();
  return { x: r.left - 8, y: top, width: r.width + 16, height: bottom - top };
});
await p.screenshot({ path: out, clip, captureBeyondViewport: true });
console.log('saved', out, Math.round(clip.width), 'x', Math.round(clip.height));
await b.close();
