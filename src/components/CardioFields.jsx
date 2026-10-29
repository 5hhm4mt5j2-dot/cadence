import { s } from '../lib/helpers';

// The three cardio metrics — distance, time and effort (RPE 1–10) — as one block, shared
// by every place a cardio entry is planned or logged. `c` carries distance/onDistance,
// duration/onDuration and efforts (ten chips with label/bg/color/pick).
export default function CardioFields({ c, compact }) {
  const lbl = 'font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;';
  const inp = "width:100%; border:1px solid var(--border); border-radius:11px; padding:" + (compact ? '8px' : '11px') + " 10px; background:" + (compact ? 'var(--surface)' : 'var(--surface-2)') + "; font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;";
  return (
    <>
      <div style={s('display:flex; gap:9px; margin-top:' + (compact ? '10px' : '12px') + ';')}>
        <div style={s('flex:1;')}>
          <div style={s(lbl)}>Distance (km)</div>
          <input type="number" inputMode="decimal" step="0.1" value={c.distance} onChange={c.onDistance} placeholder="0" aria-label="Distance in km" style={s(inp)} />
        </div>
        <div style={s('flex:1;')}>
          <div style={s(lbl)}>Time (min)</div>
          <input type="number" inputMode="numeric" value={c.duration} onChange={c.onDuration} aria-label="Time in minutes" style={s(inp)} />
        </div>
      </div>
      <div style={s('margin-top:' + (compact ? '10px' : '14px') + ';')}>
        <div style={s(lbl)}>{c.effortLabel || 'Effort (RPE 1–10)'}</div>
        <div style={s('display:flex; gap:4px;')}>
          {c.efforts.map((it, i) => (
            <button key={i} onClick={it.pick} aria-label={'Effort ' + it.label} style={s(`flex:1; min-width:0; border:none; cursor:pointer; font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; padding:9px 0; border-radius:9px; background:${it.bg}; color:${it.color};`)}>{it.label}</button>
          ))}
        </div>
      </div>
    </>
  );
}
