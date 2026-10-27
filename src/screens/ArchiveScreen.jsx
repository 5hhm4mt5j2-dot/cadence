import { s } from '../lib/helpers';

export function ArchiveScreen({ v }) {
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; margin-bottom:14px;')}>Past training programs — the dates they ran, what was in them, and every session logged.</div>
      <div style={s('display:flex; flex-direction:column; gap:12px;')}>
        {v.archiveWeeks.map((w, i) => (
          <div key={i} style={s('position:relative; border-radius:18px; overflow:hidden;')}>
            <div style={s('position:absolute; inset:0; background:#EF4444; display:flex; align-items:center; justify-content:flex-end; padding-right:18px;')}>
              <button onClick={w.deleteNow} style={s('border:none; background:transparent; color:#fff; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:0 6px;')}>Delete</button>
            </div>
            <div onClick={w.open} onTouchStart={w.onTouchStart} onTouchMove={w.onTouchMove} onTouchEnd={w.onTouchEnd} style={s(`position:relative; background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:16px; box-shadow:var(--shadow); cursor:pointer; transform:translateX(${w.dx}); transition:transform .15s ease;`)}>
              <div style={s('display:flex; align-items:center; justify-content:space-between; gap:10px;')}>
                <span style={s('font-size:15px; font-weight:800; color:var(--text); letter-spacing:-.01em; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{w.name}</span>
                <span style={s('color:var(--muted); font-size:18px; flex:none;')}>›</span>
              </div>
              <div style={s('font-size:11.5px; color:var(--muted); font-weight:600; margin-top:3px;')}>{w.range}</div>
              {w.hasExercises && (
                <div style={s('margin-top:9px; padding-top:9px; border-top:1px solid var(--border);')}>
                  <div style={s('font-size:10.5px; font-weight:700; color:var(--faint); text-transform:uppercase; letter-spacing:.06em;')}>{w.exCount}</div>
                  <div style={s('font-size:11.5px; color:var(--muted); font-weight:600; margin-top:3px; line-height:1.45;')}>{w.exLine}</div>
                </div>
              )}
              <div style={s('display:flex; align-items:baseline; gap:8px; margin-top:9px;')}>
                <span style={s("font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:700; color:var(--accent); letter-spacing:-.02em;")}>{w.volume}</span>
                <span style={s('font-size:12px; color:var(--muted); font-weight:600;')}>{w.count} sessions</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {v.archiveEmpty && (
        <div style={s('text-align:center; padding:30px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:16px;')}>
          <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>No archived programs yet</div>
          <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px; line-height:1.5;')}>When you retire a program from Current Program → Send to Archive, it lands here with its full history.</div>
        </div>
      )}
    </div>
  );
}

export function ArchiveDetailScreen({ v }) {
  const ad = v.ad;
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:20px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{ad.name}</div>
      <div style={s('font-size:12px; color:var(--muted); font-weight:600; margin-top:3px;')}>{ad.range}</div>
      <div style={s('display:flex; align-items:baseline; gap:8px; margin-top:6px;')}>
        <span style={s("font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--accent);")}>{ad.volume}</span>
        <span style={s('font-size:12px; color:var(--muted); font-weight:600;')}>total · {ad.count} sessions</span>
      </div>
      <button onClick={v.exportArchivePdf} style={s('width:100%; margin-top:14px; border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; font-size:13px; font-weight:700; color:var(--text); padding:11px 0; border-radius:12px;')}>Export PDF</button>

      {ad.dayGroups.map((g, i) => (
        <div key={i} style={s('margin-top:16px;')}>
          {i === 0 && (
            <div style={s('font-size:11px; font-weight:700; color:var(--faint); text-transform:uppercase; letter-spacing:.06em; margin:0 4px 8px;')}>What was in this program</div>
          )}
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:14px 16px; box-shadow:var(--shadow);')}>
            <div style={s('font-size:13.5px; font-weight:800; color:var(--text);')}>{g.title}</div>
            <div style={s('margin-top:6px;')}>
              {g.exercises.map((ex, j) => (
                <div key={j} style={s(`display:flex; align-items:center; justify-content:space-between; gap:10px; padding:7px 0; border-bottom:1px solid ${ex.divider};`)}>
                  <span style={s('font-size:12.5px; font-weight:600; color:var(--text); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{ex.name}</span>
                  <span style={s("font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--muted); font-weight:600; flex:none;")}>{ex.scheme}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {ad.hasSessions && (
        <div style={s('font-size:11px; font-weight:700; color:var(--faint); text-transform:uppercase; letter-spacing:.06em; margin:20px 4px 8px;')}>Sessions logged</div>
      )}
      <div style={s('display:flex; flex-direction:column; gap:12px;')}>
        {ad.sessions.map((se, i) => (
          <div key={i} style={s('background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:16px; box-shadow:var(--shadow);')}>
            <div style={s('display:flex; align-items:center; justify-content:space-between;')}>
              <span style={s('font-size:14px; font-weight:800; color:var(--text);')}>{se.title}</span>
              <span style={s("font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--accent);")}>{se.volume}</span>
            </div>
            {se.hasDate && (
              <div style={s('font-size:11px; color:var(--muted); font-weight:600; margin-top:2px;')}>{se.dateLabel}</div>
            )}
            {se.hasNotes && (
              <div style={s('font-size:11.5px; color:var(--muted); font-weight:500; margin-top:6px; font-style:italic;')}>{se.notes}</div>
            )}
            <div style={s('margin-top:10px; display:flex; flex-direction:column;')}>
              {se.exercises.map((ex, j) => (
                <div key={j} style={s(`display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding:7px 0; border-bottom:1px solid ${ex.divider};`)}>
                  <span style={s('font-size:12.5px; font-weight:600; color:var(--text); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{ex.name}</span>
                  <span style={s('text-align:right; flex:none; max-width:62%;')}>
                    <span style={s("display:block; font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--text); font-weight:600;")}>{ex.scheme}</span>
                    {!!ex.planned && <span style={s("display:block; font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--faint); font-weight:600; margin-top:1px;")}>{ex.planned}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
