import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await b.newPage();
await p.setViewport({ width: 1280, height: 900 });
const lines = [];
let capture = false;
const summarize = (v) => {
  if (v && v.assignments) {
    const a = v.assignments;
    const first = a.items[0];
    return `{ assignments: { items: [${a.items.length} bài; bài đầu: "${first.title}", completed: ${first.completed}], filter: '${a.filter}', status: '${a.status}', error: ${a.error} } }`;
  }
  return JSON.stringify(v);
};
let chain = Promise.resolve();
p.on('console', (m) => { if (capture) chain = chain.then(() => handle(m)); });
async function handle(m) {
  const type = m.type();
  const parts = [];
  for (const h of m.args()) {
    let v;
    try { v = await h.jsonValue(); } catch { v = '[object]'; }
    parts.push(v);
  }
  // redux-logger: arg đầu là chuỗi có %c, các arg tiếp theo là CSS → bỏ CSS
  const out = [];
  let skip = 0;
  parts.forEach((v) => {
    if (skip > 0) { skip--; return; }
    if (typeof v === 'string') { skip = (v.match(/%c/g) || []).length; out.push(v.replace(/%c/g, '').trim()); }
    else out.push(summarize(v));
  });
  lines.push(`[${type}] ${out.join(' ')}`);
}
p.on('dialog', (d) => d.accept());
await p.goto(process.argv[2], { waitUntil: 'networkidle0' });
await p.waitForFunction(() => document.querySelectorAll('li.task:not(.task--skeleton)').length >= 8);
await new Promise((r) => setTimeout(r, 500));
capture = true;
await p.type('#subject', 'Lập trình Web nâng cao');
await p.type('#title', 'Đo hiệu năng redux-logger');
await p.evaluate(() => {
  const el = document.querySelector('#deadline');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '2026-10-20');
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
await p.click('button[type=submit]');
await new Promise((r) => setTimeout(r, 400));
await p.click('input[type=checkbox][aria-label], li.task:first-child .task__check input');
await new Promise((r) => setTimeout(r, 400));
await p.click('li.task:first-child button[aria-label^="Xoá"]');
await new Promise((r) => setTimeout(r, 600));
await chain;
console.log(lines.join('\n'));
await b.close();
