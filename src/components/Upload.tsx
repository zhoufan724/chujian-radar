import { useEffect, useRef, useState } from 'react';
import { verifyCode } from '../lib/ai';

const OCCASIONS = ['日常', '工作', '正式', '休闲'];
const MISREAD = ['高冷', '没主见', '难接近', '太强势', '太随和'];
const WANT = ['可靠', '有趣', '有距离感', '亲和', '有主见'];

type GateState = 'idle' | 'checking' | 'ok' | 'error';

interface Props {
  photo: string | null;
  occasion: string;
  onFile: (file: File) => void;
  onOccasion: (v: string) => void;
  misread: string;
  want: string;
  onMisread: (v: string) => void;
  onWant: (v: string) => void;
  onAnalyze: () => void;
  onDemo: () => void;
  onOpenSettings: () => void;
  error: string | null;
  hasKey: boolean;
  busy: boolean;
  publicMode: boolean;
  gateRequired: boolean;
  initialCode: string;
  endpoint: string;
  onCode: (code: string) => void;
}

export function Upload({
  photo,
  occasion,
  onFile,
  onOccasion,
  misread,
  want,
  onMisread,
  onWant,
  onAnalyze,
  onDemo,
  onOpenSettings,
  error,
  hasKey,
  busy,
  publicMode,
  gateRequired,
  initialCode,
  endpoint,
  onCode,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [gate, setGate] = useState<GateState>(initialCode ? 'checking' : 'idle');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [gateMsg, setGateMsg] = useState('');

  const pick = () => inputRef.current?.click();

  const unlock = async (raw: string) => {
    const v = raw.trim().toUpperCase();
    if (!v) return;
    setGate('checking');
    setGateMsg('');
    try {
      const r = await verifyCode(endpoint, v);
      if (r.valid) {
        setGate('ok');
        setRemaining(r.remaining ?? null);
        onCode(v);
      } else {
        setGate('error');
        setRemaining(null);
        setGateMsg(r.reason === 'exhausted' ? '这个兑换码已经用完了' : '兑换码无效，请检查一下');
        onCode('');
      }
    } catch (e: any) {
      setGate('error');
      setGateMsg(e?.message || '验证失败，稍后再试');
      onCode('');
    }
  };

  // 回访用户：带着旧兑换码进来，先静默校验一次
  useEffect(() => {
    if (gateRequired && initialCode) {
      unlock(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ready = gateRequired ? gate === 'ok' : publicMode ? true : hasKey;
  const ctaText = !photo ? '先选一张照片' : gateRequired && gate !== 'ok' ? '先输入兑换码' : '开始扫描';

  return (
    <div className="upload">
      <div className="hero">
        <div className="eyebrow">第一印象测评 · FIRST IMPRESSION</div>
        <h1>
          陌生人见你的第一眼，
          <br />
          看见了什么？
        </h1>
        <p className="sub">
          上传一张照片，AI 会推演陌生人在三秒内形成的印象——
          不是打分排名，而是告诉你：你身上哪一部分会先亮起来，又最容易被误读成什么。
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />

      <div
        className={`dropzone ${drag ? 'is-drag' : ''} ${photo ? 'has-photo' : ''}`}
        onClick={pick}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick()}
      >
        {photo ? (
          <>
            <img src={photo} alt="已选择的照片" className="preview" />
            <div className="preview-mask">
              <span>点击更换照片</span>
            </div>
          </>
        ) : (
          <div className="drop-inner">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 15v2.5A2.5 2.5 0 006.5 20h11a2.5 2.5 0 002.5-2.5V15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <p className="drop-title">上传一张正脸照</p>
            <p className="drop-hint">光线均匀 · 无遮挡 · 单人出镜</p>
          </div>
        )}
      </div>

      <div className="chips">
        <span className="chips-label">这张照片的场合</span>
        {OCCASIONS.map((o) => (
          <button
            key={o}
            type="button"
            className={`chip ${occasion === o ? 'is-on' : ''}`}
            onClick={() => onOccasion(occasion === o ? '' : o)}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="chips">
        <span className="chips-label">最常被误解成</span>
        {MISREAD.map((o) => (
          <button
            key={o}
            type="button"
            className={`chip ${misread === o ? 'is-on' : ''}`}
            onClick={() => onMisread(misread === o ? '' : o)}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="chips">
        <span className="chips-label">想给人的印象</span>
        {WANT.map((o) => (
          <button
            key={o}
            type="button"
            className={`chip ${want === o ? 'is-on' : ''}`}
            onClick={() => onWant(want === o ? '' : o)}
          >
            {o}
          </button>
        ))}
      </div>

      {gateRequired && (
        <div className={`gate ${gate === 'ok' ? 'is-ok' : ''}`}>
          {gate === 'ok' ? (
            <div className="gate-ok">
              <span className="gate-dot" />
              <span>
                已解锁{remaining !== null ? ` · 还可使用 ${remaining} 次` : ''}
              </span>
              <button
                type="button"
                className="link-btn muted"
                onClick={() => {
                  setGate('idle');
                  setCode('');
                  setRemaining(null);
                  onCode('');
                }}
              >
                换一个
              </button>
            </div>
          ) : (
            <>
              <div className="gate-row">
                <input
                  className="gate-input"
                  placeholder="输入兑换码，例如 CJR-8H3K-2M9P"
                  value={code}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && unlock(code)}
                />
                <button
                  type="button"
                  className="gate-btn"
                  onClick={() => unlock(code)}
                  disabled={gate === 'checking' || !code.trim()}
                >
                  {gate === 'checking' ? '验证中…' : '解锁'}
                </button>
              </div>
              {gate === 'error' && <p className="gate-msg">{gateMsg}</p>}
              {gate === 'checking' && <p className="gate-msg dim">正在校验兑换码…</p>}
            </>
          )}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      <button type="button" className="btn-primary" onClick={onAnalyze} disabled={!photo || busy || !ready}>
        <span>{ctaText}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="alt-actions">
        <button type="button" className="link-btn" onClick={onDemo}>
          先看一份示例报告 →
        </button>
        {!publicMode && !hasKey && (
          <button type="button" className="link-btn muted" onClick={onOpenSettings}>
            填入 API Key
          </button>
        )}
      </div>

      <p className="footnote">
        照片只会被发送到用于分析的 AI 模型服务，本站不存储、不留存任何图片。
        AI 生成内容仅供自我观察与娱乐参考。18 岁以下请在监护人指导下使用。
      </p>
    </div>
  );
}
