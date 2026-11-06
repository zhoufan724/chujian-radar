// 报告数据结构 —— 全站唯一的真相来源
export interface RadarItem {
  label: string;
  score: number;
  note: string;
}

export interface GazeScene {
  scene: string;
  thought: string;
}

export interface Evidence {
  feature: string;
  impression: string;
}

export interface SceneFit {
  name: string;
  fit: '高' | '中' | '低';
  tip: string;
}

export interface Report {
  archetype: {
    name: string;
    en: string;
    rarity: number;
    keywords: string[];
  };
  verdict: string;
  radar: RadarItem[];
  gaze: GazeScene[];
  evidence: Evidence[];
  misread: {
    theyThink: string;
    actually: string;
  };
  amplify: string[];
  avoid: string[];
  scenes: SceneFit[];
  shareLine: string;
  tags: string[];
  meta?: {
    model?: string;
    at?: number;
    occasion?: string;
  };
}

export const RADAR_ORDER = ['亲和力', '可靠感', '记忆点', '能量感', '松弛感', '神秘感'];

export type Settings = {
  provider: 'dashscope' | 'zhipu' | 'custom';
  model: string;
  key: string;
  baseUrl: string;
  /** 兑换码（公开售卖模式下使用） */
  code?: string;
};

export const DEFAULT_SETTINGS: Settings = {
  provider: 'dashscope',
  model: 'qwen3-vl-plus',
  key: '',
  baseUrl: '',
  code: '',
};
