// Đếm số lần render từng component (giống React DevTools Profiler) bằng hook __REACT_DEVTOOLS_GLOBAL_HOOK__
// Dùng: node renders.mjs <url> <runs>
import puppeteer from 'puppeteer-core';

const [url, runsArg = '3'] = process.argv.slice(2);
const RUNS = Number(runsArg);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const hookStub = () => {
  const bench = { commits: [], last: 0 };
  window.__bench = bench;
  const nameOf = (f) => {
    const t = f.type;
    if (!t) return null;
    return t.displayName || t.name || (t.type && (t.type.displayName || t.type.name)) || (t.render && t.render.name) || null;
  };
  // tag 0 FunctionComponent, 1 ClassComponent, 11 ForwardRef, 14 MemoComponent, 15 SimpleMemoComponent
  const COMPONENT_TAGS = new Set([0, 1, 11, 15]);
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    renderers: new Map(),
    supportsFiber: true,
    isDisabled: false,
    inject(renderer) {
      const id = this.renderers.size + 1;
      this.renderers.set(id, renderer);
      return id;
    },
    checkDCE() {},
    onScheduleFiberRoot() {},
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
    onCommitFiberRoot(_id, root) {
      const counts = {};
      const stack = [root.current];
      while (stack.length) {
        const f = stack.pop();
        // Fiber được xử lý trong lần render này VÀ thực sự chạy hàm render (không bị memo/bailout bỏ qua)
        if (COMPONENT_TAGS.has(f.tag) && f.actualStartTime >= bench.last && (f.flags & 1) === 1) {
          const n = nameOf(f);
          if (n) counts[n] = (counts[n] || 0) + 1;
        }
        if (f.sibling) stack.push(f.sibling);
        if (f.child) stack.push(f.child);
      }
      bench.commits.push({ duration: root.current.actualDuration, counts });
      bench.last = performance.now();
    },
  };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function snapshot(page) {
  return page.evaluate(() => {
    const commits = window.__bench.commits;
    window.__bench.commits = [];
    const total = {};
    for (const c of commits) for (const [k, v] of Object.entries(c.counts)) total[k] = (total[k] || 0) + v;
    const durations = commits.map((c) => c.duration);
    return {
      commits: commits.length,
      cardRenders: total.AssignmentCard || 0,
      components: total,
      maxCommitMs: durations.length ? Math.max(...durations) : 0,
      totalCommitMs: durations.reduce((a, b) => a + b, 0),
      domNodes: document.getElementsByTagName('*').length,
      cardsInDom: document.querySelectorAll('li.task:not(.task--skeleton)').length,
    };
  });
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--window-size=1280,900'] });
const results = [];
for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(hookStub);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelectorAll('li.task:not(.task--skeleton)').length >= 8);
  await sleep(500);
  await snapshot(page); // bỏ các commit lúc tải trang

  await page.click('.theme-toggle');
  await sleep(500);
  const theme = await snapshot(page);
  await page.click('.theme-toggle'); // trả về theme cũ
  await sleep(300);
  await snapshot(page);

  const [stressBtn] = await page.$$('xpath/.//button[contains(., "Tạo 10.000")]');
  await stressBtn.click();
  await page.waitForFunction(() => document.querySelector('.segmented__count')?.textContent === '10008', { timeout: 60000 });
  await sleep(1500);
  const stress = await snapshot(page);

  await page.click('#search');
  await page.keyboard.type('bài', { delay: 150 });
  await sleep(1500);
  const typing = await snapshot(page);
  const matched = await page.evaluate(() => document.querySelectorAll('li.task').length);

  results.push({ run, theme, stress, typing, matchedInDom: matched });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
