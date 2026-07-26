import React from 'react';
import { s } from '../lib/helpers';

export default function HistoryScreen({ v }) {
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; margin-bottom:14px;')}>Every completed session in the current program.</div>
      {v.historyEmpty && (
        <div style={s('text-align:center; padding:30px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:16px;')}>
          <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>No sessions logged yet</div>
          <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px;')}>Complete a session to see it here</div>
        </div>
      )}
      <div style={s('display:flex; flex-direction:column; gap:12px;')}>
        {v.historyEntries.map((h, i) => (
          <div key={i} style={s('background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:16px; box-shadow:var(--shadow);')}>
            <div style={s('display:flex; align-items:center; justify-content:space-between;')}>
              <span style={s('font-size:14px; font-weight:800; color:var(--text);')}>{h.title}</span>
              <span style={s("font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--accent);")}>{h.volume}</span>
            </div>
            <div style={s('font-size:11.5px; color:var(--muted); font-weight:600; margin-top:2px;')}>{h.dateLabel}</div>
            <div style={s('margin-top:10px; display:flex; flex-direction:column;')}>
              {h.exercises.map((ex, j) => (
                <div key={j} style={s(`display:flex; align-items:center; justify-content:space-between; padding:7px 0; border-bottom:1px solid ${ex.divider};`)}>
                  <span style={s('font-size:12.5px; font-weight:600; color:var(--text); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{ex.name}</span>
                  <span style={s("font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--muted); font-weight:600;")}>{ex.scheme}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
