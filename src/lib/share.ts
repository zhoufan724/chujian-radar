import type { Report } from '../types';
import { SITE_NAME, SITE_URL } from '../config';

const W = 1080;
const H = 1440;

const INK = '#F4F1EA';
const MUTED = '#8B8880';
const GOLD = '#D9A55B';
const CORAL = '#E2654A';

const SERIF = '"Songti SC","Noto Serif SC","Source Han Serif SC",STSong,serif';
const SANS = '"PingFang SC","HarmonyOS Sans SC","Noto Sans SC","Microsoft YaHei",system-ui,sans-serif';

function spaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  align: 'left' | 'right' = 'left',
) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, chars.length - 1);
  let cx = align === 'right' ? x - total : x;
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + spacing;
  });
  return total;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const ch of [...text]) {
    if (ch === '\n') {
      lines.push(cur);
      cur = '';
      continue;
    }
    const test = cur + ch;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function wrapBalanced(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const first = wrap(ctx, text, maxWidth);
  if (first.length <= 1) return first;
  const total = ctx.measureText(text).width;
  const charW = ctx.measureText('中').width;
  const target = Math.min(maxWidth, total / first.length + charW);
  const balanced = wrap(ctx, text, target);
  return balanced.length === first.length ? balanced : first;
}

function radar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  report: Report,
) {
  const n = report.radar.length;
  const angle = (i: number) => -Math.PI / 2 + (i * Math.PI * 2) / n;

  // 网格
  for (let ring = 1; ring <= 4; ring++) {
    const rr = (r * ring) / 4;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = angle(i);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = ring === 4 ? 'rgba(244,241,234,0.16)' : 'rgba(244,241,234,0.07)';
    ctx.lineWidth = ring === 4 ? 1.4 : 1;
    ctx.stroke();
  }

  // 轴线
  for (let i = 0; i < n; i++) {
    const a = angle(i);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.strokeStyle = 'rgba(244,241,234,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 数据多边形
  const pts = report.radar.map((item, i) => {
    const a = angle(i);
    const rr = (Math.max(0, Math.min(100, item.score)) / 100) * r;
    return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
  });

  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, 'rgba(217,165,91,0.30)');
  grad.addColorStop(1, 'rgba(226,101,74,0.16)');

  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // 顶点与标签
  ctx.font = `300 19px ${SANS}`;
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();

    const a = angle(i);
    const lx = cx + Math.cos(a) * (r + 46);
    const ly = cy + Math.sin(a) * (r + 46);
    const cos = Math.cos(a);
    ctx.textAlign = Math.abs(cos) < 0.25 ? 'center' : cos > 0 ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = MUTED;
    ctx.fillText(report.radar[i].label, lx, ly - 12);
    ctx.fillStyle = GOLD;
    ctx.font = `400 20px ${SANS}`;
    ctx.fillText(String(report.radar[i].score), lx, ly + 12);
    ctx.font = `300 19px ${SANS}`;
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

export async function renderShareCard(report: Report): Promise<HTMLCanvasElement> {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法生成图片');

  // 背景
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H);
  bg.addColorStop(0, '#0A0B0F');
  bg.addColorStop(0.55, '#0D0E14');
  bg.addColorStop(1, '#13151C');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.82, H * 0.12, 0, W * 0.82, H * 0.12, 620);
  glow.addColorStop(0, 'rgba(217,165,91,0.10)');
  glow.addColorStop(1, 'rgba(217,165,91,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.1, H * 0.88, 0, W * 0.1, H * 0.88, 560);
  glow2.addColorStop(0, 'rgba(226,101,74,0.07)');
  glow2.addColorStop(1, 'rgba(226,101,74,0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // 外框
  ctx.strokeStyle = 'rgba(244,241,234,0.10)';
  ctx.lineWidth = 1;
  ctx.strokeRect(40.5, 40.5, W - 81, H - 81);

  // 四角
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  const corners: [number, number, number, number][] = [
    [40, 40, 1, 1],
    [W - 40, 40, -1, 1],
    [40, H - 40, 1, -1],
    [W - 40, H - 40, -1, -1],
  ];
  corners.forEach(([x, y, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * 34, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * 34);
    ctx.stroke();
  });

  // 顶部字标
  ctx.fillStyle = GOLD;
  ctx.font = `500 20px ${SANS}`;
  spaced(ctx, SITE_NAME, 80, 104, 8);
  ctx.fillStyle = MUTED;
  ctx.font = `300 12px ${SANS}`;
  spaced(ctx, 'FIRST IMPRESSION RADAR', W - 80, 102, 3.2, 'right');

  // 顶部分隔线
  const lineGrad = ctx.createLinearGradient(80, 0, W - 80, 0);
  lineGrad.addColorStop(0, 'rgba(217,165,91,0.45)');
  lineGrad.addColorStop(1, 'rgba(244,241,234,0.04)');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(80, 132, W - 160, 1);

  // 类型名
  ctx.fillStyle = MUTED;
  ctx.font = `300 15px ${SANS}`;
  spaced(ctx, '你的第一印象类型', 80, 214, 4);

  ctx.fillStyle = INK;
  ctx.font = `500 82px ${SERIF}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(report.archetype.name, 78, 316);

  ctx.fillStyle = GOLD;
  ctx.font = `300 23px ${SANS}`;
  spaced(ctx, report.archetype.en.toUpperCase(), 82, 366, 6);

  ctx.fillStyle = MUTED;
  ctx.font = `300 21px ${SANS}`;
  ctx.fillText(report.archetype.keywords.join('   ·   '), 82, 424);

  // 雷达
  radar(ctx, W / 2, 690, 178, report);

  // 分隔线
  ctx.fillStyle = 'rgba(244,241,234,0.10)';
  ctx.fillRect(80, 968, W - 160, 1);

  // 判词
  ctx.fillStyle = MUTED;
  ctx.font = `300 13px ${SANS}`;
  spaced(ctx, '判 词', 80, 1012, 3);

  ctx.fillStyle = INK;
  ctx.font = `400 39px ${SERIF}`;
  const lines = wrapBalanced(ctx, report.verdict, W - 160).slice(0, 3);
  lines.forEach((line, i) => ctx.fillText(line, 78, 1080 + i * 56));

  // 金句
  const baseY = 1080 + lines.length * 56 + 26;
  ctx.fillStyle = GOLD;
  ctx.fillRect(80, baseY - 26, 2, 34);
  ctx.fillStyle = MUTED;
  ctx.font = `300 22px ${SANS}`;
  ctx.fillText(report.shareLine, 98, baseY);

  // 稀有度
  ctx.fillStyle = 'rgba(244,241,234,0.42)';
  ctx.font = `300 17px ${SANS}`;
  ctx.fillText(`这种第一印象在人群中约占 ${report.archetype.rarity}%`, 80, baseY + 62);

  // 页脚
  ctx.fillStyle = 'rgba(244,241,234,0.28)';
  ctx.font = `300 14px ${SANS}`;
  ctx.fillText(SITE_URL, 80, H - 76);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(217,165,91,0.55)';
  spaced(ctx, report.tags.slice(0, 3).join('  '), W - 80, H - 76, 1, 'right');
  ctx.textAlign = 'left';

  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('生成图片失败'))), 'image/png');
  });
}

export async function downloadCard(report: Report) {
  const canvas = await renderShareCard(report);
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `初见雷达-${report.archetype.name}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
