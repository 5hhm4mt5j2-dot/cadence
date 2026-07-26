import React from 'react';
import { s } from '../lib/helpers';

export function CardioDbScreen({ v }) {
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; line-height:1.5; margin-bottom:14px;')}>Browse cardio activities by type. Add any to a day — as its own cardio day or a finisher after strength.</div>
      <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:4px 16px; box-shadow:var(--shadow);')}>
        {v.cardioTypes.map((ct, i) => (
          <div key={i} onClick={ct.open} style={s(`display:flex; align-items:center; justify-content:space-between; padding:15px 0; border-bottom:1px solid ${ct.divider}; cursor:pointer;`)}>
            <div style={s('display:flex; flex-direction:column;')}>
              <span style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>{ct.label}</span>
              <span style={s('font-size:11.5px; font-weight:500; color:var(--muted); margin-top:2px;')}>{ct.count}</span>
            </div>
            <span style={s('color:var(--muted); font-size:18px;')}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardioDbDetailScreen({ v }) {
  const cd = v.cardioDetail;
  return (
    <div style={s('padding:14px 16px 28px;')}>
      {cd.hasItems && (
        <div style={s('display:flex; flex-direction:column; gap:10px;')}>
          {cd.list.map((a, i) => (
            <div key={i} style={s('background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:14px 15px; box-shadow:var(--shadow);')}>
              <div style={s('display:flex; align-items:baseline; justify-content:space-between; gap:10px;')}>
                <div style={s('font-size:14px; font-weight:700; color:var(--text);')}>{a.name}</div>
                <div style={s("font-family:'JetBrains Mono',monospace; font-size:11.5px; font-weight:700; color:var(--accent); flex:none;")}>{a.durLabel}</div>
              </div>
              <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:5px; line-height:1.45;')}>{a.description}</div>
              <div style={s('display:flex; align-items:center; gap:6px; margin-top:8px;')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 12h11M6.5 17.5h11"></path></svg>
                <span style={s('font-size:11.5px; color:var(--muted); font-weight:600;')}>{a.equipment}</span>
              </div>
              <button onClick={a.addToProgram} style={s('margin-top:13px; width:100%; border:1px solid var(--accent); background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--accent); padding:9px 0; border-radius:11px;')}>+ Add to Program</button>
            </div>
          ))}
        </div>
      )}
      {cd.empty && (
        <div style={s('text-align:center; padding:30px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:16px;')}>
          <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>No activities here</div>
        </div>
      )}
    </div>
  );
}
