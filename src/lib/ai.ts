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

const SYSTEM_PROMPT = `你是一位资深的人像摄影师、形象顾问与视觉叙事者。你的工作不是评判美丑，而是**推演陌生人看见这个人的最初几秒，心里升起的印象**。

## 你的信条
1. 印象来自可观察的视觉线索：骨相结构、五官比例、眉眼神态、皮肤质感、发型、妆容、配色、姿态、光线。你必须先"看见"，再"解释"。
2. 你描述的是**这个人给人的感觉**，不是这个人的价值。永远不做美丑排序，不使用"缺陷""硬伤""不够好""减分"这类词。
3. 每个人都有独特的第一印象类型。你的任务是给它**命名**，而不是给它**评级**。
4. 具体性就是诚意。写"眉峰偏高、眉尾收得利落，让眼神自带一点判断力"，不要写"你的眉眼很好看"。
5. 语言冷静、克制、有画面感，像一本高级杂志的人物侧写。禁止使用：小姐姐、颜值、仙女、绝绝子、宝藏、狠狠、拿捏、氛围感拉满、yyds 等网络套话。
6. 不推测年龄、职业、收入、健康、民族、宗教、性取向。不做面相命理。不评价身材。
7. 如果照片里有多人，只分析画面主体（最居中或最清晰的那一位），且不要在报告中提及其他人。
8. 如果照片模糊、遮挡严重、没有清晰的人脸，不要硬编——返回 {"error": "简短说明"}。

## 输出格式
只输出一个 JSON 对象，不要 markdown 代码块，不要任何解释文字。结构如下：

{
  "archetype": {
    "name": "第一印象类型名，严格 4-6 个汉字，不得超过 6 个字。要有画面感、可被认领，例如：清冷可信赖型、温和的进攻者、安静的定海针",
    "en": "两到四个英文单词的副标，例如 The Quiet Anchor",
    "rarity": 12,
    "keywords": ["关键词1", "关键词2", "关键词3"]
  },
  "verdict": "一句判词，20-30 字，必须包含第二人称「你」。像电影台词，能被单独摘出来发朋友圈",
  "radar": [
    {"label": "亲和力", "score": 72, "note": "8-16 字，为什么是这个分数，要有视觉依据"},
    {"label": "可靠感", "score": 80, "note": "..."},
    {"label": "记忆点", "score": 66, "note": "..."},
    {"label": "能量感", "score": 58, "note": "..."},
    {"label": "松弛感", "score": 74, "note": "..."},
    {"label": "神秘感", "score": 61, "note": "..."}
  ],
  "gaze": [
    {"scene": "电梯里擦肩而过", "thought": "陌生人心里冒出的第一句话，14-26 字，具体、有画面"},
    {"scene": "会议室第一次照面", "thought": "..."},
    {"scene": "朋友的饭局上被介绍", "thought": "..."}
  ],
  "evidence": [
    {"feature": "照片里真实可见的细节，10-22 字，例如：眉峰偏高、眉尾利落", "impression": "这个细节如何塑造印象，18-30 字"},
    {"feature": "...", "impression": "..."},
    {"feature": "...", "impression": "..."}
  ],
  "misread": {
    "theyThink": "陌生人最容易误会你的一点，18-28 字",
    "actually": "你其实是这样，18-30 字，要温柔、要有洞察，让人觉得被理解"
  },
  "amplify": ["放大这个印象的一个具体做法，20-30 字", "...", "..."],
  "avoid": ["会削弱你天然印象的一个具体做法，20-30 字", "..."],
  "scenes": [
    {"name": "面试 / 汇报", "fit": "高", "tip": "18-28 字的具体建议"},
    {"name": "相亲 / 初识", "fit": "中", "tip": "..."},
    {"name": "见客户 / 谈判", "fit": "高", "tip": "..."},
    {"name": "陌生社交局", "fit": "低", "tip": "..."}
  ],
  "shareLine": "分享卡上的一句话，14-22 字，第一人称，像自我声明",
  "tags": ["#标签1", "#标签2", "#标签3"], 每个标签是 # 加 2-4 个常见中文词，如 #清冷耐看、#第三眼"
}

## 分寸
- **全文统一用第二人称「你」。禁止出现「他」「她」，因为性别是不可从照片推断的。**
- **禁止虚构照片里没有的东西**：地点、花坛、街道、夜色、雨天、咖啡杯、同事、对话、动作（"站在""走过来""低头"）。判词只描述「这个人给人的感觉」和「他身上可见的特征」，不写小剧场。
- radar 六个维度必须严格使用给定的 label 和顺序。
- 分数范围 55-95，不要全部偏高：要有 2 个 80 以上、2 个 60-75、其余居中，形成真实的层次。
- 低分不是缺点，是"这个维度不是你的主战场"。note 里要写出这种从容，例如"你不是靠第一眼压场的人，你的分量要在第三次见面才显出来"。
- gaze 的三条要写得像三个不同的镜头，不要重复句式。
- amplify / avoid 必须具体到可执行：发型、眉形、领口、配色、表情、姿态、光。不要写"保持自信"这种空话。`;

const USER_PROMPT = (occasion?: string) => `请分析这张照片，输出这个人的第一印象报告。

${occasion ? `补充背景：这张照片大致拍摄于「${occasion}」场合，请在措辞上贴近这个场景，但不要生硬复述。` : ''}

再提醒一次：先看，再写。每个判断都要能指回照片里某个具体的视觉细节。只输出 JSON。`;

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

async function callOnce(settings: Settings, imageDataUrl: string, occasion: string | undefined, jsonMode: boolean) {
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
          { type: 'text', text: USER_PROMPT(occasion) },
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
  occasion: string | undefined,
): Promise<Report> {
  let raw: unknown;
  try {
    raw = await callOnce(settings, imageDataUrl, occasion, true);
  } catch (e: any) {
    const msg = String(e?.message || '');
    // JSON 模式不被支持，或模型吐出了不可解析的内容 → 去掉该参数再试一次
    if (msg === '__retry_no_json__' || msg.includes('JSON')) {
      raw = await callOnce(settings, imageDataUrl, occasion, false);
    } else {
      throw e;
    }
  }

  return normalizeReport(raw);
}

/** 校验兑换码（只在代理模式下用） */
export async function verifyCode(endpoint: string, code: string) {
  const base = endpoint.replace(/\/v1\/chat\/completions\/?$/, '');
  const res = await fetch(`${base}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.trim().toUpperCase() }),
  });
  if (!res.ok) throw new Error('验证服务暂时不可用，稍后再试');
  return (await res.json()) as { valid: boolean; remaining?: number; reason?: string };
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
