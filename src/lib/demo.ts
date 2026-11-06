import type { Report } from '../types';

/** 示例报告：既是设计基准，也是没有 API Key 时的兜底展示 */
export const DEMO_REPORT: Report = {
  archetype: {
    name: '低温的定海针',
    en: 'The Quiet Anchor',
    rarity: 11,
    keywords: ['清冷', '耐看', '有余量'],
  },
  verdict: '你不是第一眼让人喜欢的人，你是第三眼让人放心的人。',
  radar: [
    { label: '亲和力', score: 64, note: '笑意收在眼睛里，要靠近才读得到' },
    { label: '可靠感', score: 88, note: '肩颈打开、视线平稳，像已经想清楚了' },
    { label: '记忆点', score: 71, note: '骨相清晰，轮廓在人群里留得住' },
    { label: '能量感', score: 56, note: '不靠音量存在，安静时反而更清楚' },
    { label: '松弛感', score: 79, note: '没有用力管理的痕迹，头发和领口都自然' },
    { label: '神秘感', score: 83, note: '面部留白多，情绪不外露，留了想象空间' },
  ],
  gaze: [
    { scene: '电梯里擦肩而过', thought: '这个人大概不太喜欢寒暄，但不会为难你。' },
    { scene: '会议室第一次照面', thought: '她还没开口，我已经想听她怎么说了。' },
    { scene: '朋友的饭局上被介绍', thought: '她坐在那儿，像这屋子的一部分，不像客人。' },
  ],
  evidence: [
    {
      feature: '眉峰略高，眉尾收得干净',
      impression: '眼神自带判断力，让人觉得你心里有自己的标准。',
    },
    {
      feature: '面部留白多，五官不挤',
      impression: '情绪不写在脸上，反而让人想多看两眼。',
    },
    {
      feature: '下颌线清晰，颈部舒展',
      impression: '自带一种“站得住”的分量，不轻飘、不讨巧。',
    },
  ],
  misread: {
    theyThink: '你的安静容易被当成疏离，甚至被误认为不好相处。',
    actually: '你只是把热度留给了少数人。真正走进来的人，会觉得你比看上去暖得多。',
  },
  amplify: [
    '把头发别到耳后，露出下颌线——这是你最有说服力的一条线。',
    '穿低饱和的深色，让轮廓先说话，颜色退到后面。',
    '说话时看住对方的眼睛多停半秒，你的可靠感会立刻被接收。',
  ],
  avoid: [
    '别用厚刘海遮住额头和眉峰，那会把你的判断力一起藏起来。',
    '避开高饱和荧光色系，它们会盖过你原本的冷调。',
  ],
  scenes: [
    { name: '面试 / 汇报', fit: '高', tip: '你的稳在第一分钟就成立，开口前先停一拍。' },
    { name: '相亲 / 初识', fit: '中', tip: '对方会慢热，你主动问一句，局面就活了。' },
    { name: '见客户 / 谈判', fit: '高', tip: '先给结论再给理由，你的可信度会翻倍。' },
    { name: '陌生社交局', fit: '低', tip: '不必强行热场，守住一对一的位置更舒服。' },
  ],
  shareLine: '我不急着被喜欢，我在等被看懂。',
  tags: ['#清冷耐看', '#第三眼', '#低饱和气质', '#安静的定海针'],
};

export const DEMO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2f3a"/><stop offset="1" stop-color="#12141a"/></linearGradient></defs><rect width="600" height="750" fill="url(#g)"/><text x="300" y="380" fill="#6b6f7a" font-size="22" font-family="sans-serif" text-anchor="middle">示例照片</text></svg>`,
  );
