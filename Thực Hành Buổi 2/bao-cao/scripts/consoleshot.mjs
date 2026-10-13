// Mở Chrome có giao diện + DevTools tab Console, thao tác thêm / hoàn thành / xoá, chụp DevTools sau mỗi thao tác
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const [url, outDir, profileDir] = process.argv.slice(2);
fs.mkdirSync(path.join(profileDir, 'Default'), { recursive: true });
fs.writeFileSync(
  path.join(profileDir, 'Default', 'Preferences'),
  JSON.stringify({
    devtools: {
      preferences: { 'panel-selectedTab': '"console"', currentDockState: '"bottom"' },
      synced_preferences_sync_disabled: { 'panel-selectedTab': '"console"', currentDockState: '"bottom"' },
    },
    translate: { enabled: false },
  }),
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: false,
  userDataDir: profileDir,
  defaultViewport: null,
  ignoreDefaultArgs: ['--enable-automation'],
  args: ['--auto-open-devtools-for-tabs', '--window-size=1800,1100', '--window-position=40,40', '--no-first-run', '--no-default-browser-check', '--disable-features=Translate,TranslateUI', '--lang=vi'],
});
const [page] = await browser.pages();
page.on('dialog', (d) => d.accept());
await page.goto(url, { waitUntil: 'networkidle0' });
await page.waitForFunction(() => document.querySelectorAll('li.task:not(.task--skeleton)').length >= 8);
const dtTarget = await browser.waitForTarget((t) => t.url().startsWith('devtools://'), { timeout: 15000 });
const devtools = await dtTarget.asPage();
await sleep(1500);
await devtools.click('pierce/#tab-console').catch(() => {});
await sleep(800);
const winId = execFileSync('osascript', ['-l', 'JavaScript', path.join(import.meta.dirname, 'winid.js'), String(browser.process().pid)]).toString().trim();
console.log('window', winId);

async function shot(name) {
  await sleep(1000);
  // Đưa danh sách bài tập vào khung nhìn, mở rộng object "action" của nhóm log mới nhất
  await page.evaluate(() => document.querySelector('#list-heading').scrollIntoView());
  const previews = await devtools.$$('pierce/.console-object-preview');
  if (previews.length >= 2) await previews[1].click();
  await sleep(800);
  // Chụp nguyên cửa sổ Chrome (trang + DevTools Console), không có bóng đổ
  execFileSync('screencapture', ['-x', '-o', `-l${winId}`, path.join(outDir, `${name}.png`)]);
  console.log('saved', name);
}

await page.evaluate(() => console.clear());
await page.type('#subject', 'Lập trình Web nâng cao');
await page.type('#title', 'Chụp console redux-logger');
await page.evaluate(() => {
  const el = document.querySelector('#deadline');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, '2026-10-20');
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.click('button[type=submit]');
await shot('1-them');

await page.evaluate(() => console.clear());
await page.click('li.task:first-child .task__check input');
await shot('2-hoan-thanh');

await page.evaluate(() => console.clear());
await page.click('li.task:first-child button[aria-label^="Xoá"]');
await shot('3-xoa');

await browser.close();
