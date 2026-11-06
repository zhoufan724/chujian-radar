/**
 * 初见雷达 · Cloudflare Worker
 *
 * 作用：
 *   1. 把通义千问的 API Key 藏在服务端，浏览器永远拿不到
 *   2. 校验兑换码，一码一次（或一码多次，创建时指定）
 *   3. 原样转发请求，客户端完全按 OpenAI 兼容格式调用
 *
 * 路由：
 *   POST /api/verify            校验兑换码
 *   POST /v1/chat/completions   转发到百炼（body 里必须带 code）
 *   POST /api/codes             生成兑换码（需要 x-admin-token）
 */

const DASHSCOPE = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉 I O 0 1，避免抄错

function corsHeaders(env, request) {
  const origin = env.ALLOW_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,content-type,x-admin-token',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function genCode() {
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[buf[i] % ALPHABET.length];
  return `CJR-${s.slice(0, 4)}-${s.slice(4)}`;
}

const key = (code) => 'code:' + String(code).trim().toUpperCase();

async function readCode(env, code) {
  if (!code) return null;
  return env.CODES.get(key(code), 'json');
}

async function handleVerify(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ valid: false, reason: 'bad_request' }, 400, cors);
  }
  const rec = await readCode(env, body.code);
  if (!rec) return json({ valid: false, reason: 'not_found' }, 200, cors);

  const max = rec.max || 1;
  const used = rec.used || 0;
  const remaining = Math.max(0, max - used);
  return json({ valid: remaining > 0, remaining, reason: remaining > 0 ? 'ok' : 'exhausted' }, 200, cors);
}

async function handleChat(request, env, cors) {
  const raw = await request.text();
  if (raw.length > 4_000_000) return json({ error: { message: '图片太大了' } }, 413, cors);

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: { message: '请求格式不对' } }, 400, cors);
  }

  const codeKey = key(body.code);
  const rec = await readCode(env, body.code);
  if (!rec) {
    return json({ error: { message: '兑换码无效，请检查是否输入正确' }, type: 'invalid_code' }, 403, cors);
  }

  const max = rec.max || 1;
  const used = rec.used || 0;
  if (used >= max) {
    return json({ error: { message: '这个兑换码已经用完了' }, type: 'code_exhausted' }, 403, cors);
  }

  delete body.code;
  body.model = env.MODEL || 'qwen3-vl-plus';

  const upstream = await fetch(DASHSCOPE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const text = await upstream.text();

  // 只有真正成功了才扣次数，避免用户因为网络问题白丢一次
  if (upstream.ok) {
    await env.CODES.put(
      codeKey,
      JSON.stringify({ ...rec, used: used + 1, lastUsedAt: Date.now() }),
    );
  }

  return new Response(text, {
    status: upstream.status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function handleAdmin(request, env, cors) {
  if (!env.ADMIN_TOKEN || request.headers.get('x-admin-token') !== env.ADMIN_TOKEN) {
    return json({ error: 'unauthorized' }, 401, cors);
  }
  let body = {};
  try {
    body = await request.json();
  } catch {
    /* 用默认值 */
  }
  const count = Math.min(Math.max(parseInt(body.count, 10) || 1, 1), 200);
  const max = Math.min(Math.max(parseInt(body.max, 10) || 1, 1), 10);
  const note = String(body.note || '').slice(0, 80);

  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = genCode();
    await env.CODES.put(
      key(code),
      JSON.stringify({ max, used: 0, createdAt: Date.now(), note }),
    );
    codes.push(code);
  }
  return json({ codes, max }, 200, cors);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(env, request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === '/api/verify' && request.method === 'POST') {
      return handleVerify(request, env, cors);
    }
    if (url.pathname === '/api/codes' && request.method === 'POST') {
      return handleAdmin(request, env, cors);
    }
    if (url.pathname.endsWith('/chat/completions') && request.method === 'POST') {
      return handleChat(request, env, cors);
    }
    if (url.pathname === '/' || url.pathname === '/health') {
      return json({ ok: true, service: 'chujian-radar-proxy' }, 200, cors);
    }

    return json({ error: 'not found' }, 404, cors);
  },
};
