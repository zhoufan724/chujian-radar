import { useRef, useState } from 'react';

const OCCASIONS = ['日常', '工作', '正式', '休闲'];

interface Props {
  photo: string | null;
  occasion: string;
  onFile: (file: File) => void;
  onOccasion: (v: string) => void;
  onAnalyze: () => void;
  onDemo: () => void;
  onOpenSettings: () => void;
  error: string | null;
  hasKey: boolean;
  busy: boolean;
}

export function Upload({
  photo,
  occasion,
  onFile,
  onOccasion,
  onAnalyze,
  onDemo,
  onOpenSettings,
  error,
  hasKey,
  busy,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const pick = () => inputRef.current?.click();

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

      {error && <div className="error-box">{error}</div>}

      <button type="button" className="btn-primary" onClick={onAnalyze} disabled={!photo || busy}>
        <span>{photo ? '开始扫描' : '先选一张照片'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="alt-actions">
        <button type="button" className="link-btn" onClick={onDemo}>
          先看一份示例报告 →
        </button>
        {!hasKey && (
          <button type="button" className="link-btn muted" onClick={onOpenSettings}>
            填入 API Key
          </button>
        )}
      </div>

      <p className="footnote">
        照片会被发送到你选择的大模型服务商用于本次分析，本站不存储、不上传任何图片到第三方服务器。
        AI 生成内容仅供自我观察与娱乐参考。18 岁以下请在监护人指导下使用。
      </p>
    </div>
  );
}
