import { useCallback, useEffect, useState } from 'react';
import { Upload } from './components/Upload';
import { Analyzing } from './components/Analyzing';
import { ReportView } from './components/ReportView';
import { SettingsModal } from './components/SettingsModal';
import { ShareModal } from './components/ShareModal';
import type { Report, Settings } from './types';
import { loadSettings, saveSettings, hasKey } from './lib/storage';
import { analyzeImage } from './lib/ai';
import { fileToCompressedDataUrl } from './lib/image';
import { DEMO_REPORT } from './lib/demo';
import { buildShareUrl, decodeReport } from './lib/shareLink';
import { SITE_NAME, SITE_SLOGAN } from './config';

type Screen = 'upload' | 'analyzing' | 'report';

export default function App() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [occasion, setOccasion] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [copied, setCopied] = useState(false);

  // 打开带 #r= 的链接时，直接还原一份报告
  useEffect(() => {
    const m = window.location.hash.match(/^#r=(.+)$/);
    if (!m) return;
    const r = decodeReport(m[1]);
    if (r) {
      setReport(r);
      setShared(true);
      setScreen('report');
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [screen]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setPhoto(dataUrl);
    } catch (e: any) {
      setError(e?.message || '图片读取失败，换一张试试');
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!photo) {
      setError('先选一张照片吧');
      return;
    }
    if (!hasKey(settings)) {
      setError('还差一步：填入 API Key 后就能开始分析');
      setSettingsOpen(true);
      return;
    }
    setError(null);
    setScreen('analyzing');
    try {
      const r = await analyzeImage(settings, photo, occasion || undefined);
      setReport(r);
      setShared(false);
      setIsDemo(false);
      setScreen('report');
    } catch (e: any) {
      setScreen('upload');
      setError(e?.message || '分析失败了，稍后再试一次');
    }
  }, [photo, settings, occasion]);

  const handleDemo = useCallback(() => {
    setError(null);
    setReport(DEMO_REPORT);
    setShared(false);
    setIsDemo(true);
    setScreen('report');
  }, []);

  const restart = useCallback(() => {
    setScreen('upload');
    setReport(null);
    setShared(false);
    setIsDemo(false);
    setPhoto(null);
    setOccasion('');
    setError(null);
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const copyLink = useCallback(async () => {
    if (!report) return;
    const url = buildShareUrl(report);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }, [report]);

  return (
    <div className="app">
      <div className="shell">
        <header className="topbar">
          <button
            type="button"
            className="brand"
            onClick={restart}
            aria-label="回到首页"
          >
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="13" stroke="#D9A55B" strokeOpacity=".35" strokeWidth="1" />
              <circle cx="16" cy="16" r="7" stroke="#D9A55B" strokeOpacity=".7" strokeWidth="1" />
              <path d="M16 16L25 9" stroke="#E2654A" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="16" cy="16" r="1.6" fill="#E2654A" />
            </svg>
            <span>
              {SITE_NAME}
              <em>{SITE_SLOGAN}</em>
            </span>
          </button>

          <button type="button" className="icon-btn gear" onClick={() => setSettingsOpen(true)} aria-label="设置">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7.5h9M17.5 7.5H20M4 16.5h2.5M11 16.5h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="15" cy="7.5" r="2.4" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="8.5" cy="16.5" r="2.4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </header>

        <main>
          {screen === 'upload' && (
            <Upload
              photo={photo}
              occasion={occasion}
              onFile={handleFile}
              onOccasion={setOccasion}
              onAnalyze={handleAnalyze}
              onDemo={handleDemo}
              onOpenSettings={() => setSettingsOpen(true)}
              error={error}
              hasKey={hasKey(settings)}
              busy={false}
            />
          )}

          {screen === 'analyzing' && <Analyzing preview={photo} onCancel={() => setScreen('upload')} />}

          {screen === 'report' && report && (
            <ReportView
              report={report}
              shared={shared}
              demo={isDemo}
              onRestart={restart}
              onShare={() => setShareOpen(true)}
              onCopyLink={copyLink}
              copied={copied}
            />
          )}
        </main>

        <footer className="footer">
          <span>{SITE_NAME}</span>
          <span className="dot">·</span>
          <span>AI 第一印象实验室</span>
          <span className="dot">·</span>
          <span>报告仅供自我观察，不定义你</span>
        </footer>
      </div>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={(s) => {
          setSettings(s);
          saveSettings(s);
          setError(null);
        }}
      />

      <ShareModal
        open={shareOpen}
        report={report}
        onClose={() => setShareOpen(false)}
        onCopyLink={copyLink}
        copied={copied}
      />
    </div>
  );
}
