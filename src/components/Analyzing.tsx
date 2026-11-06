import { useEffect, useState } from 'react';

const STEPS = [
  '正在读取面部轮廓与骨相结构',
  '正在辨认眉眼之间的情绪基调',
  '正在推演陌生人第一眼会落在哪里',
  '正在校准你的印象坐标',
  '正在为这种印象找一个名字',
];

export function Analyzing({ preview, onCancel }: { preview: string | null; onCancel: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 5200);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="analyzing">
      <div className="scan-stage">
        {preview && <img src={preview} alt="" className="scan-photo" />}
        <div className="scan-grid" />
        <div className="scan-sweep" />
        <div className="scan-frame" />
      </div>

      <div className="scan-copy">
        <div className="eyebrow">SCANNING</div>
        <h2>正在读取你留在脸上的信息</h2>
        <ul className="steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i < step ? 'is-done' : i === step ? 'is-active' : ''}>
              <span className="dot" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <p className="scan-tip">通常需要 15–40 秒，请不要关闭页面</p>
        <button type="button" className="link-btn muted" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}
