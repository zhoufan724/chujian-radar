import type { Report, SceneFit, Settings } from '../types';
import { RADAR_ORDER } from '../types';

export const PROVIDERS = {
  dashscope: {
    id: 'dashscope',
    name: '阿里云百炼 · 通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: ['qwen3-vl-plus', 'qwen3-vl-max', 'qwen-vl-max-latest', 'qwen-vl-plus-latest'],
    hint: '推荐 qwen3-vl-plus：中文表达细腻，人脸细节读得准，性价比高。',
    console: 'https://bailian.console.aliyun.com/?tab=model#/api-key',
  },
  zhipu: {
    id: 'zhipu',
    name: '智谱 · GLM-4.5V',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: ['glm-4.5v', 'glm-4v-plus', 'glm-4v-flash'],
    hint: '注册最简单（手机号即可），有免费额度。注意：该接口可能不支持浏览器直连，失败请改用通义千问或自建代理。',
    console: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  custom: {
    id: 'custom',
    name: '自定义（OpenAI 兼容）',
    endpoint: '',
    models: [],
    hint: '填入任意 OpenAI 兼容的 chat/completions 地址，例如你自己的代理。',
    console: '',
  },
} as const;

const SYSTEM_PROMPT = `你是一个很会看人的朋友。你说话直接、具体、有点幽默，不堆形容词，也不写散文。别人把照片给你，你看三秒，说出一句让他愣一下的话。

## 语言三条铁律

**1. 说人话。** 短句。一句话尽量不超过 25 个字。可以用「其实」「说实话」「你这种人」开头。
✓ 你看起来像那种，别人问"你怎么想"时先说"都行"，回头却把事做到最好的人。
✗ 你如一扇未被推开的玻璃门，透光，却需主动靠近才知内里温度。

**2. 不许编。** 照片里没有的场景、地点、天气、动作、对话，一律不许出现。不写"夜色里""站在花坛前""低头走过"。你只能描述这张脸上看得见的东西，和它给人的感觉。
✓ 你的表情是收着的，笑起来也只有眼睛在动。
✗ 他站在夜色里的花坛前，不笑不语。

**3. 不装。** 禁用这些词：仿佛、如同、像是、透光、内里、质感、韵味、勾勒、镌刻、流淌、诗、画卷、底片、灵魂、令人、使人。
不写"有种…的感觉"。要么直接说"你让人觉得…"，要么干脆"你…"。

## 标签必须能认领

类型名：当代人会用来形容自己的词，严格 4-6 个字。
✓ 慢热的靠谱型、低电量社牛、体面的疏离、钝感力在线、沉默的扛事人、清醒的恋爱脑
✗ 沉静的都市观察者、未定义可塑型、低温的定海针

tags：小红书里真的会出现的词，每个 # 加 2-5 个字。
✓ #慢热 #边界感强 #社交电量低 #高敏感 #钝感力 #内耗型 #情绪稳定
✗ #椅构感人格 #暗色适配型 #未显影人格

## 输出格式

只输出一个 JSON 对象，不要 markdown 代码块，不要任何解释。结构：

{
  "archetype": {
    "name": "4-6 字的类型名，必须是当代人会用来形容自己的词",
    "en": "两到四个英文单词，直译即可，不用硬凑",
    "rarity": 12,
    "keywords": ["三个具体的外观描述，2-5 字，如：轮廓清晰、眼神收着、笑点低"]
  },
  "verdict": "判词，20-35 字，必须用「你」。口语，具体，能被单独摘出来发朋友圈",
  "radar": [
    {"label": "亲和力", "score": 72, "note": "为什么是这个分，8-16 字，要指回照片"},
    {"label": "可靠感", "score": 80, "note": "..."},
    {"label": "记忆点", "score": 66, "note": "..."},
    {"label": "能量感", "score": 58, "note": "..."},
    {"label": "松弛感", "score": 74, "note": "..."},
    {"label": "神秘感", "score": 61, "note": "..."}
  ],
  "gaze": [
    {"scene": "电梯里擦肩而过", "thought": "陌生人心里冒出的第一句话，14-26 字，口语"},
    {"scene": "会议室第一次照面", "thought": "..."},
    {"scene": "朋友的饭局上被介绍", "thought": "..."}
  ],
  "evidence": [
    {"feature": "照片里真实可见的细节，10-22 字", "impression": "这个细节让人产生什么印象，18-30 字"},
    {"feature": "...", "impression": "..."},
    {"feature": "...", "impression": "..."}
  ],
  "misread": {
    "theyThink": "别人最容易误会你的一点，18-28 字",
    "actually": "你其实是这样，18-30 字，温柔但不煽情，让人觉得被说中"
  },
  "amplify": ["一个具体做法，20-30 字，具体到发型/领口/配色/表情/姿态", "...", "..."],
  "avoid": ["一个具体做法，20-30 字", "..."],
  "scenes": [
    {"name": "面试 / 汇报", "fit": "高", "tip": "18-28 字"},
    {"name": "相亲 / 初识", "fit": "中", "tip": "..."},
    {"name": "见客户 / 谈判", "fit": "高", "tip": "..."},
    {"name": "陌生社交局", "fit": "低", "tip": "..."}
  ],
  "shareLine": "分享卡上的一句第一人称金句，14-22 字",
  "tags": ["#标签1", "#标签2", "#标签3"]
}

## 分寸

- **全文第二人称「你」。禁止出现「他」「她」。**
- 不推测年龄、职业、收入、健康、民族、宗教、性取向。不做面相命理。不评价身材。
- radar 六个维度严格用给定 label 和顺序。分数 55-95，必须形成层次：2 个 80 以上、2 个 60-75、其余居中。全高等于没信息。
- 低分不是缺点，是"这个维度不是你的主战场"。note 要写出这种从容。
- 照片里有多人，只分析最居中/最清晰的那位，不要提其他人。
- 照片模糊、遮挡、没有清晰人脸，返回 {"error": "简短说明"}，不要硬编。
`;

type Ctx = { occasion?: string; misread?: string; want?: string };

const USER_PROMPT = (ctx: Ctx) => {
  const lines = ['请分析这张照片，输出这个人的第一印象报告。', ''];
  if (ctx.occasion) lines.push(`这张照片的场合：${ctx.occasion}。措辞贴近这个场景，但不要生硬复述。`);
  if (ctx.misread) lines.push(`用户自述最常被误解成「${ctx.misread}」。misread 这一段要围绕这个来写。`);
  if (ctx.want) lines.push(`用户希望给人的印象是「${ctx.want}」。可以在 amplify 里给一条通往这个印象的具体做法。`);
  if (lines.length > 2) lines.push('');
  lines.push('再提醒一次：先看，再写。不编场景，不写比喻，用口语。只输出 JSON。');
  return lines.join('\n');
};

function extractJson(text: string): unknown {
  let s = text.trim();
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('模型没有返回可解析的 JSON');
  return JSON.parse(s.slice(start, end + 1));
}

function num(v: unknown, fallback: number, min = 0, max = 100): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v.trim() : fallback;
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/** 把模型返回的不稳定结构，收敛成前端可以放心渲染的结构 */
export function normalizeReport(raw: any): Report {
  if (!raw || typeof raw !== 'object') throw new Error('返回内容不是对象');
  if (raw.error) throw new Error(str(raw.error, '这张照片暂时无法分析'));

  const arc = raw.archetype ?? {};
  const keywords = arr<string>(arc.keywords).map((k) => str(k)).filter(Boolean).slice(0, 3);

  const radarRaw = arr<any>(raw.radar);
  const radar = RADAR_ORDER.map((label) => {
    const hit =
      radarRaw.find((r) => str(r?.label).replace(/\s/g, '') === label) ??
      radarRaw.find((r) => {
        const l = str(r?.label).replace(/\s/g, '');
        return l.includes(label) || label.includes(l);
      });
    return {
      label,
      score: num(hit?.score, 70, 40, 99),
      note: str(hit?.note, '这个维度构成了你印象里的底色。'),
    };
  });

  const scenes: SceneFit[] = arr<any>(raw.scenes)
    .map((s) => ({
      name: str(s?.name),
      fit: (['高', '中', '低'].includes(str(s?.fit)) ? str(s?.fit) : '中') as SceneFit['fit'],
      tip: str(s?.tip),
    }))
    .filter((s) => s.name)
    .slice(0, 4);

  const report: Report = {
    archetype: {
      name: str(arc.name, '未被命名的第一印象'),
      en: str(arc.en, 'The Unnamed'),
      rarity: num(arc.rarity, 15, 1, 49),
      keywords: keywords.length ? keywords : ['克制', '耐看', '有距离'],
    },
    verdict: str(raw.verdict, '你给人的第一印象，是一句没说完的话。'),
    radar,
    gaze: arr<any>(raw.gaze)
      .map((g) => ({ scene: str(g?.scene), thought: str(g?.thought) }))
      .filter((g) => g.scene && g.thought)
      .slice(0, 3),
    evidence: arr<any>(raw.evidence)
      .map((e) => ({ feature: str(e?.feature), impression: str(e?.impression) }))
      .filter((e) => e.feature && e.impression)
      .slice(0, 4),
    misread: {
      theyThink: str(raw.misread?.theyThink, '你的克制，容易被读成不好接近。'),
      actually: str(raw.misread?.actually, '你只是需要一点时间，才会把门打开。'),
    },
    amplify: arr<string>(raw.amplify).map((s) => str(s)).filter(Boolean).slice(0, 3),
    avoid: arr<string>(raw.avoid).map((s) => str(s)).filter(Boolean).slice(0, 2),
    scenes: scenes.length
      ? scenes
      : [
          { name: '面试 / 汇报', fit: '高', tip: '把语速放慢一点，你的稳会被看见。' },
          { name: '相亲 / 初识', fit: '中', tip: '先问对方一个问题，比先介绍自己更有用。' },
          { name: '见客户 / 谈判', fit: '高', tip: '开场直接给结论，你的可信度会立刻成立。' },
          { name: '陌生社交局', fit: '低', tip: '不必强行热场，找一个一对一的位置就好。' },
        ],
    shareLine: str(raw.shareLine, '我不急着被喜欢，我在等被看懂。'),
    tags: arr<string>(raw.tags).map((s) => str(s)).filter(Boolean).slice(0, 4),
  };

  if (!report.gaze.length) {
    report.gaze = [
      { scene: '电梯里擦肩而过', thought: '这个人看起来不太需要被搭话。' },
      { scene: '会议室第一次照面', thought: '先别急着开口，听她怎么说。' },
      { scene: '朋友的饭局上被介绍', thought: '她好像比这场合更安静一点。' },
    ];
  }
  if (!report.verdict) report.verdict = '你给人的第一印象，是一句没说完的话。';

  return report;
}

async function callOnce(settings: Settings, imageDataUrl: string, ctx: Ctx, jsonMode: boolean) {
  const preset = PROVIDERS[settings.provider];
  const endpoint = settings.provider === 'custom' ? settings.baseUrl : preset.endpoint;
  if (!endpoint) throw new Error('还没有填写 API 地址');
  if (!settings.key && settings.provider !== 'custom') throw new Error('还没有填写 API Key');

  const body: Record<string, unknown> = {
    model: settings.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageDataUrl } },
          { type: 'text', text: USER_PROMPT(ctx) },
        ],
      },
    ],
    temperature: 0.9,
    max_tokens: 2600,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };
  // 走自建代理时，用兑换码换通行证
  if (settings.code) body.code = settings.code;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.key ? { Authorization: `Bearer ${settings.key}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e: any) {
    clearTimeout(timer);
    if (e?.name === 'AbortError') throw new Error('等待超时了，网络可能不太稳定，再试一次？');
    throw new Error('连不上模型服务，请检查网络或 API 地址');
  }
  clearTimeout(timer);

  const text = await res.text();
  if (!res.ok) {
    let msg = `请求失败（${res.status}）`;
    try {
      const j = JSON.parse(text);
      msg = j?.error?.message || j?.message || j?.error || msg;
    } catch {
      /* ignore */
    }
    if (res.status === 401) msg = 'API Key 不对或已失效，去设置里重新填一下';
    if (res.status === 403)
      msg = `没有权限调用这个模型（403）：${msg}。请到百炼控制台确认该模型已开通、账号已完成实名认证。`;
    if (res.status === 429) msg = '请求太频繁或额度用完了，稍后再试';
    if (res.status === 400 && jsonMode) throw new Error('__retry_no_json__');
    throw new Error(typeof msg === 'string' ? msg : `请求失败（${res.status}）`);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('模型返回了无法识别的内容');
  }

  const content = data?.choices?.[0]?.message?.content;
  const flat =
    typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content.map((c: any) => c?.text ?? '').join('')
        : '';
  if (!flat) throw new Error('模型没有返回内容');

  return extractJson(flat);
}

export async function analyzeImage(
  settings: Settings,
  imageDataUrl: string,
  ctx: Ctx,
): Promise<Report> {
  let raw: unknown;
  try {
    raw = await callOnce(settings, imageDataUrl, ctx, true);
  } catch (e: any) {
    const msg = String(e?.message || '');
    // JSON 模式不被支持，或模型吐出了不可解析的内容 → 去掉该参数再试一次
    if (msg === '__retry_no_json__' || msg.includes('JSON')) {
      raw = await callOnce(settings, imageDataUrl, ctx, false);
    } else {
      throw e;
    }
  }

  return normalizeReport(raw);
}

/** 校验兑换码（只在代理模式下用） */
export async function verifyCode(endpoint: string, code: string) {
  const base = endpoint.replace(/\/v1\/chat\/completions\/?$/, '');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(`${base}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error('验证服务暂时不可用，稍后再试');
    return (await res.json()) as { valid: boolean; remaining?: number; reason?: string };
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('连接超时：网络到不了服务器，换个网络试试');
    throw new Error('连不上服务器，检查一下网络再试');
  } finally {
    clearTimeout(timer);
  }
}

/** 设置弹窗里的「测试连接」 */
export async function pingModel(settings: Settings): Promise<string> {
  const preset = PROVIDERS[settings.provider];
  const endpoint = settings.provider === 'custom' ? settings.baseUrl : preset.endpoint;
  if (!endpoint) throw new Error('还没有填写 API 地址');
  if (!settings.key && settings.provider !== 'custom') throw new Error('还没有填写 API Key');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(settings.key ? { Authorization: `Bearer ${settings.key}` } : {}),
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [{ role: 'user', content: '回复两个字：收到' }],
      max_tokens: 16,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = '';
    try {
      const j = JSON.parse(text);
      const raw = j?.error?.message || j?.message || j?.error?.code || j?.code || '';
      detail = typeof raw === 'string' ? raw : JSON.stringify(raw);
    } catch {
      /* ignore */
    }
    if (res.status === 401) throw new Error(`Key 无效或已失效（401）${detail ? '：' + detail : ''}`);
    if (res.status === 403)
      throw new Error(
        `没有权限（403）${detail ? '：' + detail : ''}。请确认：① 百炼「模型广场」里该模型已开通；② 账号已完成实名认证；③ 如果你的 Key 来自国际站，接口地址要用 dashscope-intl。`,
      );
    if (res.status === 429) throw new Error(`额度用完或请求太频繁（429）${detail ? '：' + detail : ''}`);
    throw new Error(`连接失败（${res.status}）${detail ? '：' + detail : ''}`);
  }
  try {
    const j = JSON.parse(text);
    const c = j?.choices?.[0]?.message?.content;
    return `连接成功 · ${settings.model}${c ? ` · ${String(c).slice(0, 12)}` : ''}`;
  } catch {
    return `连接成功 · ${settings.model}`;
  }
}
