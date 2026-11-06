export const SITE_NAME = '初见雷达';
export const SITE_URL = 'zhoufan724.github.io/chujian-radar';
export const SITE_SLOGAN = '你给陌生人的第一印象';

export interface SiteConfig {
  endpoint: string;
  model: string;
  requireCode: boolean;
}

/** 运行时可改的配置，来自 public/config.js，不需要重新构建 */
export const siteConfig: SiteConfig = {
  endpoint: '',
  model: 'qwen3-vl-plus',
  requireCode: true,
};

declare global {
  interface Window {
    CJR_CONFIG?: Partial<SiteConfig>;
  }
}

export async function loadSiteConfig(): Promise<SiteConfig> {
  await new Promise<void>((resolve) => {
    const s = document.createElement('script');
    s.src = `${import.meta.env.BASE_URL}config.js?v=${Date.now()}`;
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
  const c = window.CJR_CONFIG || {};
  siteConfig.endpoint = String(c.endpoint || '').trim();
  siteConfig.model = String(c.model || 'qwen3-vl-plus');
  siteConfig.requireCode = c.requireCode !== false;
  return siteConfig;
}

/** 配了 Worker 就是公开售卖模式：访客用兑换码，不碰 API Key */
export function isPublicMode(): boolean {
  return Boolean(siteConfig.endpoint);
}
