import type { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { siteConfig, isPublicMode } from '../config';

const KEY = 'cjr:settings:v1';

/**
 * 如果构建时注入了 VITE_PUBLIC_ENDPOINT（自建代理），
 * 站点默认就走代理，访客不需要填任何 Key。
 */
function publicDefaults(): Settings | null {
  const endpoint = import.meta.env?.VITE_PUBLIC_ENDPOINT;
  if (!endpoint) return null;
  return {
    provider: 'custom',
    baseUrl: endpoint,
    model: import.meta.env?.VITE_PUBLIC_MODEL || 'qwen3-vl-plus',
    key: '',
  };
}

export function loadSettings(): Settings {
  let saved: Partial<Settings> = {};
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) saved = JSON.parse(raw) || {};
  } catch {
    /* ignore */
  }

  // 公开售卖模式：endpoint / model 一律以 config.js 为准，只保留用户自己的兑换码
  if (isPublicMode()) {
    return {
      ...DEFAULT_SETTINGS,
      provider: 'custom',
      baseUrl: siteConfig.endpoint,
      model: siteConfig.model,
      key: '',
      code: saved.code || '',
    };
  }

  return { ...DEFAULT_SETTINGS, ...saved, ...(publicDefaults() ?? {}) };
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function hasKey(s: Settings): boolean {
  if (s.provider === 'custom') return Boolean(s.baseUrl && s.baseUrl.trim());
  return Boolean(s.key && s.key.trim().length > 8);
}
