#!/usr/bin/env node
/**
 * 生成兑换码
 *
 * 用法：
 *   WORKER_URL=https://chujian-radar-proxy.xxx.workers.dev \
 *   ADMIN_TOKEN=你的口令 \
 *   node tools/gen-codes.mjs 10 1
 *
 * 参数：数量 每个码可用次数（默认 10 个，每码 1 次）
 * 结果会追加写入 codes.csv
 */
import fs from 'node:fs';

const url = (process.env.WORKER_URL || '').replace(/\/+$/, '');
const token = process.env.ADMIN_TOKEN || '';
const count = parseInt(process.argv[2] || '10', 10);
const max = parseInt(process.argv[3] || '1', 10);
const note = process.argv[4] || '';

if (!url || !token) {
  console.error('缺少环境变量。示例：\n  WORKER_URL=https://xxx.workers.dev ADMIN_TOKEN=xxx node tools/gen-codes.mjs 10 1');
  process.exit(1);
}

const res = await fetch(`${url}/api/codes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
  body: JSON.stringify({ count, max, note }),
});

if (!res.ok) {
  console.error('生成失败：', res.status, await res.text());
  process.exit(1);
}

const { codes } = await res.json();
const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
const file = 'codes.csv';
if (!fs.existsSync(file)) fs.writeFileSync(file, '兑换码,可用次数,生成时间\n');
fs.appendFileSync(file, codes.map((c) => `${c},${max},${stamp}`).join('\n') + '\n');

console.log(`\n生成 ${codes.length} 个兑换码（每个可用 ${max} 次），已写入 ${file}\n`);
codes.forEach((c) => console.log('  ' + c));
console.log('');
