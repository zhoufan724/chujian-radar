// 把 index.html 里的每张图导出成 PNG
// 用法：node render.js
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'out');
const NAMES = {
  m1: '主图1-封面',
  m2: '主图2-不打分',
  m3: '主图3-八个部分',
  m4: '主图4-印象卡',
  m5: '主图5-使用方式',
  d1: '详情1-痛点',
  d2: '详情2-是什么',
  d3: '详情3-报告结构',
  d4: '详情4-判词',
  d5: '详情5-误读',
  d6: '详情6-使用说明',
};

fs.mkdirSync(OUT, { recursive: true });
// 没装 Playwright 自带浏览器时，可用 CHROME_PATH 指定本机 Chromium
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(DIR, 'index.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

for (const [id, name] of Object.entries(NAMES)) {
  const el = page.locator('#' + id);
  await el.screenshot({ path: path.join(OUT, name + '.png') });
  const box = await el.boundingBox();
  console.log('✓', name, Math.round(box.width) + '×' + Math.round(box.height));
}

await browser.close();
