import { useEffect, useState } from 'react';
import type { Report } from '../types';
import { renderShareCard } from '../lib/share';

interface Props {
  open: boolean;
  report: Report | null;
  onClose: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

export function ShareModal({ open, report, onClose, onCopyLink, copied }: Props) {
  const [src, setSrc] = useState<string>('');
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    if (!open || !report) return;
    let alive = true;
    setSrc('');
    setErr('');
    renderShareCard(report)
      .then((canvas) => {
        if (alive) setSrc(canvas.toDataURL('image/png'));
      })
      .catch((e) => {
        if (alive) setErr(e?.message || '生成图片失败');
      });
    return () => {
      alive = false;
    };
  }, [open, report]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !report) return null;

  const download = () => {
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `初见雷达-${report.archetype.name}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal share-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2>你的印象卡</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <div className="card-preview">
          {err ? (
            <div className="status status-err">{err}</div>
          ) : src ? (
            <img src={src} alt="印象卡" />
          ) : (
            <div className="card-loading">正在生成…</div>
          )}
        </div>

        <p className="card-tip">手机上可长按图片保存到相册。</p>

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onCopyLink}>
            {copied ? '链接已复制' : '复制分享链接'}
          </button>
          <button type="button" className="btn-primary compact" onClick={download} disabled={!src}>
            保存图片
          </button>
        </div>
      </div>
    </div>
  );
}
