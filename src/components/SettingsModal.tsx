import { useEffect, useState } from 'react';
import type { Settings } from '../types';
import { PROVIDERS } from '../lib/ai';
import { pingModel } from '../lib/ai';

interface Props {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (s: Settings) => void;
}

export function SettingsModal({ open, settings, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<{ kind: 'idle' | 'ok' | 'err' | 'busy'; msg: string }>({
    kind: 'idle',
    msg: '',
  });

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setStatus({ kind: 'idle', msg: '' });
    }
  }, [open, settings]);

  if (!open) return null;

  const preset = PROVIDERS[draft.provider];
  const isCustom = draft.provider === 'custom';

  const changeProvider = (id: Settings['provider']) => {
    const p = PROVIDERS[id];
    setDraft({ ...draft, provider: id, model: p.models[0] ?? draft.model });
    setStatus({ kind: 'idle', msg: '' });
  };

  const test = async () => {
    setStatus({ kind: 'busy', msg: '正在连接…' });
    try {
      const msg = await pingModel(draft);
      setStatus({ kind: 'ok', msg });
    } catch (e: any) {
      setStatus({ kind: 'err', msg: e?.message || '连接失败' });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2>连接 AI 模型</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <p className="modal-desc">
          Key 只保存在你这台设备的浏览器里，不会上传到本站服务器。换设备或清理浏览器数据后需要重新填写。
        </p>

        <div className="provider-tabs">
          {(Object.keys(PROVIDERS) as Settings['provider'][]).map((id) => (
            <button
              key={id}
              type="button"
              className={`provider-tab ${draft.provider === id ? 'is-on' : ''}`}
              onClick={() => changeProvider(id)}
            >
              {PROVIDERS[id].name}
            </button>
          ))}
        </div>

        {isCustom ? (
          <label className="field">
            <span>API 地址（OpenAI 兼容）</span>
            <input
              type="url"
              placeholder="https://your-proxy.com/v1/chat/completions"
              value={draft.baseUrl}
              onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
            />
          </label>
        ) : (
          <label className="field">
            <span>模型</span>
            <select value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })}>
              {preset.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        )}

        {isCustom && (
          <label className="field">
            <span>模型名称</span>
            <input
              type="text"
              placeholder="qwen3-vl-plus"
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
            />
          </label>
        )}

        <label className="field">
          <span>API Key</span>
          <div className="key-row">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="sk-..."
              spellCheck={false}
              autoComplete="off"
              value={draft.key}
              onChange={(e) => setDraft({ ...draft, key: e.target.value.trim() })}
            />
            <button type="button" className="key-toggle" onClick={() => setShowKey((v) => !v)}>
              {showKey ? '隐藏' : '显示'}
            </button>
          </div>
        </label>

        {!isCustom && (
          <p className="field-hint">
            {preset.hint}
            {preset.console && (
              <>
                {' '}
                <a href={preset.console} target="_blank" rel="noreferrer">
                  去控制台拿 Key ↗
                </a>
              </>
            )}
          </p>
        )}

        {status.kind !== 'idle' && (
          <div className={`status status-${status.kind}`}>{status.msg}</div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={test} disabled={status.kind === 'busy'}>
            测试连接
          </button>
          <button
            type="button"
            className="btn-primary compact"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
