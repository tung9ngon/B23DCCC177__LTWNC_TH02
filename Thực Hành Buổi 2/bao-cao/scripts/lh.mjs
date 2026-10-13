// Lighthouse user flow. Dùng: node lh.mjs <url> <label> <runs> <outdir>
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
import { startFlow } from 'lighthouse';

const [url, label, runsArg, outDir] = process.argv.slice(2);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (lhr) => {
  const a = lhr.audits;
  const num = (id) => (a[id] && a[id].numericValue != null ? Math.round(a[id].numericValue * 1000) / 1000 : null);
  return {
    score: lhr.categories.performance?.score ?? null,
    throttling: lhr.configSettings.throttlingMethod,
    formFactor: lhr.configSettings.formFactor,
    fcp: num('first-contentful-paint'),
    lcp: num('largest-contentful-paint'),
    tbt: num('total-blocking-time'),
    cls: num('cumulative-layout-shift'),
    si: num('speed-index'),
    inp: num('interaction-to-next-paint'),
    domSize: (JSON.stringify(a['dom-size-insight'] ?? {}).match(/"totalElements":(\d+)/) || [])[1] ?? null,
    mainThread: num('mainthread-work-breakdown'),
  };
};

const results = [];
for (let run = 1; run <= Number(runsArg); run++) {
  // 1) Navigation: tải trang và bấm "Tạo 10.000 bài tập mẫu" ngay khi nút xuất hiện
  let browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  let page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    const t = setInterval(() => {
      const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Tạo 10.000'));
      if (b) { clearInterval(t); b.click(); }
    }, 20);
  });
  let flow = await startFlow(page, { name: `${label} navigation` });
  await flow.navigate(url);
  let fr = await flow.createFlowResult();
  const nav = pick(fr.steps[0].lhr);
  // Xác nhận nút đã được bấm trong lúc tải: tab "Tất cả" phải đếm được 10008 bài
  nav.itemsAfterLoad = await page.evaluate(() => document.querySelector('.segmented__count')?.textContent);
  fs.writeFileSync(`${outDir}/${label}-navigation-run${run}.html`, await flow.generateReport());
  await browser.close();

  // 2) Timespan: bấm tạo 10.000 bài rồi gõ "bài" vào ô tìm kiếm
  browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelectorAll('li.task:not(.task--skeleton)').length >= 8);
  flow = await startFlow(page, { name: `${label} timespan` });
  await flow.startTimespan();
  const [btn] = await page.$$('xpath/.//button[contains(., "Tạo 10.000")]');
  await btn.click();
  await page.waitForFunction(() => document.querySelector('.segmented__count')?.textContent === '10008', { timeout: 120000 });
  await sleep(1000);
  await page.click('#search');
  await page.keyboard.type('bài', { delay: 150 });
  await sleep(1500);
  await flow.endTimespan();
  fr = await flow.createFlowResult();
  const span = pick(fr.steps[0].lhr);
  fs.writeFileSync(`${outDir}/${label}-timespan-run${run}.html`, await flow.generateReport());
  await browser.close();

  results.push({ run, nav, span });
  console.error(`${label} run ${run}:`, JSON.stringify({ nav, span }));
}
fs.writeFileSync(`${outDir}/${label}-lighthouse.json`, JSON.stringify(results, null, 2));
