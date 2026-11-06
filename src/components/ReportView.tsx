import type { Report } from '../types';
import { Radar } from './Radar';

const FIT_CLASS: Record<string, string> = { 高: 'high', 中: 'mid', 低: 'low' };

function Head({ n, title, desc }: { n: string; title: string; desc?: string }) {
  return (
    <div className="section-head">
      <span className="num">{n}</span>
      <div>
        <h3>{title}</h3>
        {desc && <p className="section-desc">{desc}</p>}
      </div>
    </div>
  );
}

interface Props {
  report: Report;
  shared: boolean;
  demo: boolean;
  onRestart: () => void;
  onShare: () => void;
  onCopyLink: () => void;
  copied: boolean;
}

export function ReportView({ report, shared, demo, onRestart, onShare, onCopyLink, copied }: Props) {
  return (
    <div className="report">
      {demo && (
        <div className="shared-banner is-demo">
          <span>示例报告 · 用你自己的照片，才会得到你的那一份</span>
          <button type="button" className="link-btn" onClick={onRestart}>
            开始我的测评 →
          </button>
        </div>
      )}

      {shared && (
        <div className="shared-banner">
          <span>这是一份分享给你的第一印象报告</span>
          <button type="button" className="link-btn" onClick={onRestart}>
            测我自己的 →
          </button>
        </div>
      )}

      <header className="report-hero">
        <div className="eyebrow">你的第一印象类型</div>
        <h1 className="arch-name">{report.archetype.name}</h1>
        <div className="arch-en">{report.archetype.en}</div>
        <div className="keywords">
          {report.archetype.keywords.map((k) => (
            <span key={k}>{k}</span>
          ))}
        </div>
        <div className="rarity">
          <span className="rarity-dot" />
          这种组合在人群中约占 {report.archetype.rarity}%
        </div>
      </header>

      <blockquote className="verdict">
        <p>{report.verdict}</p>
      </blockquote>

      <section className="section">
        <Head n="01" title="印象坐标" desc="六个维度，构成别人感知你的方式。低分不是缺点，只是不是你的主战场。" />
        <div className="radar-wrap">
          <div className="radar-box">
            <Radar items={report.radar} />
          </div>
          <ul className="dims">
            {report.radar.map((d) => (
              <li key={d.label}>
                <div className="dim-top">
                  <span className="dim-label">{d.label}</span>
                  <span className="dim-score">{d.score}</span>
                </div>
                <div className="dim-bar">
                  <i style={{ width: `${d.score}%` }} />
                </div>
                <p className="dim-note">{d.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <Head n="02" title="陌生人的三秒" desc="三个场景，三种第一眼。你会被怎样记住。" />
        <div className="gaze-grid">
          {report.gaze.map((g, i) => (
            <article className="gaze-card" key={g.scene}>
              <span className="gaze-index">0{i + 1}</span>
              <span className="gaze-scene">{g.scene}</span>
              <p>{g.thought}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <Head n="03" title="印象是从哪里来的" desc="每一个判断，都指回照片里一个具体的细节。" />
        <ul className="evidence">
          {report.evidence.map((e) => (
            <li key={e.feature}>
              <span className="ev-feature">{e.feature}</span>
              <span className="ev-arrow" aria-hidden="true">→</span>
              <p className="ev-impression">{e.impression}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <Head n="04" title="最容易被误读的地方" desc="这不是你的错，是第一眼的带宽太窄。" />
        <div className="misread">
          <div className="misread-cell">
            <span className="misread-tag">他们以为</span>
            <p>{report.misread.theyThink}</p>
          </div>
          <div className="misread-cell is-accent">
            <span className="misread-tag">其实</span>
            <p>{report.misread.actually}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <Head n="05" title="放大它，或者收住它" desc="顺着你的天然印象用力，比改变它更省力。" />
        <div className="two-col">
          <div className="col">
            <h4 className="col-title plus">放大</h4>
            <ul className="advice">
              {report.amplify.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="col">
            <h4 className="col-title minus">收住</h4>
            <ul className="advice">
              {report.avoid.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <Head n="06" title="你的场合适配度" desc="同一种印象，在不同的房间里，价格不一样。" />
        <ul className="scenes">
          {report.scenes.map((s) => (
            <li key={s.name}>
              <span className="scene-name">{s.name}</span>
              <span className={`fit fit-${FIT_CLASS[s.fit] ?? 'mid'}`}>{s.fit}</span>
              <p className="scene-tip">{s.tip}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="tag-row">
        {report.tags.map((t) => (
          <span className="tag" key={t}>
            {t}
          </span>
        ))}
      </div>

      <div className="actions">
        <button type="button" className="btn-primary" onClick={onShare}>
          <span>生成印象卡</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 4v12m0 0l-4.5-4.5M12 16l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 18v1.5A1.5 1.5 0 006.5 21h11a1.5 1.5 0 001.5-1.5V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" className="btn-ghost" onClick={onCopyLink}>
          {copied ? '链接已复制' : '复制分享链接'}
        </button>
        <button type="button" className="btn-ghost" onClick={onRestart}>
          再测一次
        </button>
      </div>

      <p className="disclaimer">
        本报告由 AI 根据单张照片生成，只描述「这张照片给人的感觉」，不定义你这个人。
        仅供自我观察与娱乐参考，不构成任何专业建议。
      </p>
    </div>
  );
}
