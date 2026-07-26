import React from 'react';
import { s } from '../lib/helpers';

export function ArchiveScreen({ v }) {
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; margin-bottom:14px;')}>Past weeks &amp; completed sessions with logged volume.</div>
      <div style={s('display:flex; flex-direction:column; gap:12px;')}>
        {v.archiveWeeks.map((w, i) => (
          <div key={i} style={s('position:relative; border-radius:18px; overflow:hidden;')}>
            <div style={s('position:absolute; inset:0; background:#EF4444; display:flex; align-items:center; justify-content:flex-end; padding-right:18px;')}>
              <button onClick={w.deleteNow} style={s('border:none; background:transparent; color:#fff; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:0 6px;')}>Delete</button>
            </div>
            <div onClick={w.open} onTouchStart={w.onTouchStart} onTouchMove={w.onTouchMove} onTouchEnd={w.onTouchEnd} style={s(`position:relative; background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:16px; box-shadow:var(--shadow); cursor:pointer; transform:translateX(${w.dx}); transition:transform .15s ease;`)}>
              <div style={s('display:flex; align-items:center; justify-content:space-between;')}>
                <span style={s('font-size:14px; font-weight:800; color:var(--text);')}>{w.label}</span>
                <span style={s('color:var(--muted); font-size:18px;')}>›</span>
              </div>
              <div style={s('display:flex; align-items:baseline; gap:8px; margin-top:8px;')}>
                <span style={s("font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700; color:var(--accent); letter-spacing:-.02em;")}>{w.volume}</span>
                <span style={s('font-size:12px; color:var(--muted); font-weight:600;')}>{w.count} sessions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArchiveDetailScreen({ v }) {
  const ad = v.ad;
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:20px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{ad.label}</div>
      <div style={s('display:flex; align-items:baseline; gap:8px; margin-top:4px;')}>
        <span style={s("font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--accent);")}>{ad.volume}</span>
        <span style={s('font-size:12px; color:var(--muted); font-weight:600;')}>total · {ad.count} sessions</span>
      </div>
      <button onClick={v.exportArchivePdf} style={s('width:100%; margin-top:14px; border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; font-size:13px; font-weight:700; color:var(--text); padding:11px 0; border-radius:12px;')}>Export PDF</button>
      <div style={s('display:flex; flex-direction:column; gap:12px; margin-top:16px;')}>
        {ad.sessions.map((se, i) => (
          <div key={i} style={s('background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:16px; box-shadow:var(--shadow);')}>
            <div style={s('display:flex; align-items:center; justify-content:space-between;')}>
              <span style={s('font-size:14px; font-weight:800; color:var(--text);')}>{se.title}</span>
              <span style={s("font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--accent);")}>{se.volume}</span>
            </div>
            {se.hasDate && (
              <div style={s('font-size:11px; color:var(--muted); font-weight:600; margin-top:2px;')}>{se.dateLabel}</div>
            )}
            <div style={s('margin-top:10px; display:flex; flex-direction:column;')}>
              {se.exercises.map((ex, j) => (
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
