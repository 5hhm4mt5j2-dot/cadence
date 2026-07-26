import React from 'react';
import { s } from '../lib/helpers';

export default function QuickAdd({ v }) {
  const qa = v.qa;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeQuickAdd} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:60;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:61; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 26px; max-height:92%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 14px;')}></div>
        <div style={s('display:flex; align-items:center; gap:11px; min-height:30px;')}>
          <button onClick={qa.back} aria-label="Back" style={s(`display:${qa.backDisplay}; border:none; background:var(--surface-2); cursor:pointer; width:30px; height:30px; border-radius:50%; align-items:center; justify-content:center; color:var(--text); font-size:18px; line-height:1; padding:0; flex:none;`)}>‹</button>
          <div style={s('flex:1; min-width:0;')}>
            <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{qa.title}</div>
            <div style={s('font-size:12px; color:var(--muted); font-weight:600; margin-top:1px;')}>{qa.subtitle}</div>
          </div>
        </div>

        {qa.isType && (
          <div style={s('display:flex; flex-direction:column; gap:10px; margin-top:18px;')}>
            {qa.types.map((t, i) => (
              <button key={i} onClick={t.pick} style={s('display:flex; align-items:center; gap:13px; text-align:left; border:1px solid var(--border); background:var(--surface-2); cursor:pointer; font-family:inherit; padding:14px 15px; border-radius:15px; transition:transform .12s cubic-bezier(.34,1.56,.64,1);')}>
                <span style={s(`width:40px; height:40px; flex:none; border-radius:50%; background:${t.tint}; display:flex; align-items:center; justify-content:center;`)}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon}></path></svg>
                </span>
                <div style={s('flex:1; min-width:0;')}>
                  <div style={s('font-size:14.5px; font-weight:800; color:var(--text);')}>{t.label}</div>
                  <div style={s('font-size:11.5px; color:var(--muted); font-weight:500;')}>{t.sub}</div>
                </div>
                <span style={s('color:var(--muted); font-size:18px;')}>›</span>
              </button>
            ))}
          </div>
        )}

        {qa.isBrowseCat && (
          <div style={s('background:var(--surface-2); border:1px solid var(--border); border-radius:16px; padding:0 14px; margin-top:16px;')}>
            {qa.cats.map((c, i) => (
              <button key={i} onClick={c.pick} style={s(`width:100%; text-align:left; display:flex; align-items:center; justify-content:space-between; gap:10px; border:none; background:transparent; cursor:pointer; font-family:inherit; padding:14px 0; border-bottom:1px solid ${c.divider};`)}>
                <span style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>{c.label}</span>
                <span style={s('font-size:11.5px; color:var(--muted); font-weight:600;')}>{c.count} ›</span>
              </button>
            ))}
          </div>
        )}

        {qa.isBrowseList && (
          <>
            <div style={s('display:flex; flex-direction:column; gap:9px; margin-top:16px;')}>
              {qa.list.map((a, i) => (
                <button key={i} onClick={a.pick} style={s('text-align:left; border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; padding:13px 15px; border-radius:14px; box-shadow:var(--shadow); transition:transform .12s cubic-bezier(.34,1.56,.64,1);')}>
                  <div style={s('display:flex; align-items:center; justify-content:space-between; gap:10px;')}>
                    <span style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>{a.name}</span>
                    <span style={s('font-size:11px; color:var(--accent); font-weight:800; flex:none;')}>Select ›</span>
                  </div>
                  <div style={s('font-size:11.5px; color:var(--muted); font-weight:500; margin-top:3px; line-height:1.45;')}>{a.meta}</div>
                </button>
              ))}
            </div>
            {qa.listEmpty && (
              <div style={s('text-align:center; padding:26px 20px; margin-top:14px; background:var(--surface-2); border:1px dashed var(--border); border-radius:14px; font-size:12.5px; color:var(--muted); font-weight:600;')}>Nothing here yet</div>
            )}
          </>
        )}

        {qa.isConfig && (
          <>
            {qa.isLift && (
              <div style={s('display:flex; gap:9px; margin-top:18px;')}>
                <div style={s('flex:1;')}>
                  <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Sets</div>
                  <input type="number" value={qa.sets} onChange={qa.onSets} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                </div>
                <div style={s('flex:1;')}>
                  <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Reps</div>
                  <input type="number" value={qa.reps} onChange={qa.onReps} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                </div>
              </div>
            )}
            {qa.isCardioKind && (
              <>
                <div style={s('margin-top:18px;')}>
                  <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Duration (min)</div>
                  <input type="number" value={qa.duration} onChange={qa.onDuration} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                </div>
                <div style={s('margin-top:16px;')}>
                  <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Intensity</div>
                  <div style={s('display:flex; gap:8px;')}>
                    {qa.intensities.map((it, i) => (
                      <button key={i} onClick={it.pick} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; padding:11px 0; border-radius:11px; background:${it.bg}; color:${it.color};`)}>{it.label}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <button onClick={qa.toRecur} style={s('width:100%; margin-top:22px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Continue</button>
          </>
        )}

        {qa.isRecur && (
          <>
            <div style={s('margin-top:12px; background:var(--surface-2); border:1px solid var(--border); border-radius:14px; padding:13px 15px;')}>
              <div style={s('font-size:11px; color:var(--muted); font-weight:700; text-transform:uppercase; letter-spacing:.05em;')}>Adding</div>
              <div style={s('font-size:15px; font-weight:800; color:var(--text); margin-top:3px;')}>{qa.itemName}</div>
              <div style={s("font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--accent); font-weight:700; margin-top:3px;")}>{qa.configLabel}</div>
            </div>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:20px 0 10px;')}>Add to {qa.dayFull}</div>
            <div style={s('display:flex; flex-direction:column; gap:10px;')}>
              {qa.recurOptions.map((r, i) => (
                <button key={i} onClick={r.pick} style={s(`display:flex; align-items:center; gap:13px; text-align:left; border:2px solid ${r.border}; background:${r.bg}; cursor:pointer; font-family:inherit; padding:14px 15px; border-radius:15px;`)}>
                  <span style={s(`width:22px; height:22px; flex:none; border-radius:50%; border:2px solid ${r.dotBorder}; display:flex; align-items:center; justify-content:center;`)}>
                    <span style={s(`width:9px; height:9px; border-radius:50%; background:${r.dotInner};`)}></span>
                  </span>
                  <div style={s('flex:1; min-width:0;')}>
                    <div style={s('font-size:14px; font-weight:800; color:var(--text);')}>{r.label}</div>
                    <div style={s('font-size:11.5px; color:var(--muted); font-weight:500; margin-top:1px;')}>{r.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={qa.confirm} style={s('width:100%; margin-top:22px; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Confirm</button>
          </>
        )}
      </div>
    </>
  );
}
