import React from 'react';
import { s } from '../lib/helpers';

export default function ProgramScreen({ v }) {
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; line-height:1.5; margin-bottom:14px;')}>Your recurring weekly split. Edits here repeat every week.</div>
      <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:4px 16px; box-shadow:var(--shadow);')}>
        {v.programDays.map((pd) => (
          <div key={pd.key} onClick={pd.tap} style={s(`display:flex; align-items:center; gap:13px; padding:13px 0; border-bottom:1px solid ${pd.divider}; cursor:pointer; transition:transform .12s cubic-bezier(.34,1.56,.64,1);`)}>
            <span style={s(`width:40px; height:40px; flex:none; border-radius:50%; background:${pd.tint}; border:${pd.iconBorder}; display:flex; align-items:center; justify-content:center;`)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={pd.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={pd.iconPath}></path></svg>
            </span>
            <div style={s('flex:1; min-width:0;')}>
              <div style={s(`font-size:13.5px; font-weight:700; color:${pd.nameColor};`)}>{pd.full}</div>
              <div style={s(`font-size:11.5px; color:${pd.subColor}; font-weight:500;`)}>{pd.sub}</div>
            </div>
            <span style={s(`display:${pd.chevronDisplay}; color:var(--muted); font-size:18px;`)}>›</span>
            <span style={s(`display:${pd.addDisplay}; align-items:center; color:var(--accent); font-size:11.5px; font-weight:800; letter-spacing:.02em;`)}>Add +</span>
          </div>
        ))}
      </div>
      <button onClick={v.openHistory} style={s('width:100%; margin-top:16px; border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; font-size:13.5px; font-weight:700; color:var(--text); padding:13px 0; border-radius:13px;')}>Session History</button>
      <button onClick={v.sendToArchive} style={s('width:100%; margin-top:10px; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:13.5px; font-weight:800; padding:13px 0; border-radius:13px;')}>Send to Archive</button>
    </div>
  );
}
