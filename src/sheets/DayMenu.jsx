import React from 'react';
import { s } from '../lib/helpers';

export default function DayMenu({ v }) {
  const dm = v.dm;
  return (
    <>
      <div data-lt-backdrop onClick={dm.close} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:58;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:59; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 26px; max-height:92%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 14px;')}></div>

        {dm.confirmOpen && (
          <div style={s('text-align:center; padding:8px 6px 2px;')}>
            <div style={s('font-size:19px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{dm.confirmTitle}</div>
            <div style={s('font-size:13px; color:var(--muted); font-weight:500; line-height:1.55; margin-top:9px;')}>{dm.confirmBody}</div>
            <div style={s('display:flex; gap:10px; margin-top:22px;')}>
              <button onClick={dm.confirmCancel} style={s('flex:1; border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; font-size:13.5px; font-weight:700; color:var(--text); padding:13px 0; border-radius:13px;')}>Cancel</button>
              <button onClick={dm.confirmYes} style={s('flex:1; border:none; cursor:pointer; background:#EF4444; color:#fff; font-family:inherit; font-size:13.5px; font-weight:800; padding:13px 0; border-radius:13px;')}>Clear &amp; convert</button>
            </div>
          </div>
        )}

        {dm.menuOpen && (
          <>
            <div style={s('font-size:20px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{dm.full}</div>
            <div style={s(`font-size:12.5px; font-weight:700; color:${dm.currentColor}; margin-top:2px;`)}>{dm.currentLabel}</div>

            {dm.hasPeek && (
              <>
                <div style={s('margin-top:12px; background:var(--surface-2); border:1px solid var(--border); border-radius:14px; padding:4px 14px;')}>
                  {dm.peekItems.map((pk, i) => (
                    <div key={i} style={s('display:flex; align-items:center; justify-content:space-between; gap:10px; padding:9px 0;')}>
                      <span style={s('font-size:12.5px; font-weight:700; color:var(--text);')}>{pk.name}</span>
                      <span style={s("font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600; color:var(--muted); flex:none;")}>{pk.detail}</span>
                    </div>
                  ))}
                </div>
                {dm.peekDone && (
                  <div style={s('margin-top:8px; font-size:11px; font-weight:800; color:var(--accent); text-transform:uppercase; letter-spacing:.05em;')}>✓ Completed</div>
                )}
              </>
            )}

            <div style={s('display:flex; gap:6px; margin-top:16px; background:var(--surface-2); border:1px solid var(--border); border-radius:12px; padding:4px;')}>
              <button onClick={dm.setOnce} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:9px 0; border-radius:9px; background:${dm.onceBg}; color:${dm.onceColor};`)}>{dm.onceLabel}</button>
              <button onClick={dm.setEvery} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:9px 0; border-radius:9px; background:${dm.everyBg}; color:${dm.everyColor};`)}>{dm.everyLabel}</button>
            </div>

            <div style={s('display:flex; flex-direction:column; gap:9px; margin-top:16px;')}>
              {dm.changeOptions.map((o, i) => (
                <button key={i} onClick={o.pick} style={s(`display:flex; align-items:center; gap:13px; text-align:left; border:${o.rowBorder}; background:var(--surface-2); cursor:pointer; font-family:inherit; padding:13px 15px; border-radius:15px; transition:transform .12s cubic-bezier(.34,1.56,.64,1);`)}>
                  <span style={s(`width:38px; height:38px; flex:none; border-radius:50%; background:${o.tint}; display:flex; align-items:center; justify-content:center;`)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={o.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={o.icon}></path></svg>
                  </span>
                  <div style={s('flex:1; min-width:0;')}>
                    <div style={s('font-size:14px; font-weight:800; color:var(--text);')}>{o.label}</div>
                    <div style={s('font-size:11.5px; color:var(--muted); font-weight:500;')}>{o.desc}</div>
                  </div>
                  <span style={s(`display:${o.badgeDisplay}; align-items:center; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:${o.color}; background:${o.tint}; padding:4px 9px; border-radius:999px;`)}>Current</span>
                  <span style={s(`display:${o.chevDisplay}; color:var(--muted); font-size:18px;`)}>›</span>
                </button>
              ))}

              {dm.showAddActivity && (
                <button onClick={dm.addActivity} style={s('display:flex; align-items:center; gap:13px; text-align:left; border:1px solid var(--accent); background:var(--accent-soft); cursor:pointer; font-family:inherit; padding:13px 15px; border-radius:15px; transition:transform .12s cubic-bezier(.34,1.56,.64,1);')}>
                  <span style={s('width:38px; height:38px; flex:none; border-radius:50%; background:var(--surface); display:flex; align-items:center; justify-content:center; color:var(--accent); font-size:22px; line-height:1;')}>+</span>
                  <div style={s('flex:1; min-width:0;')}>
                    <div style={s('font-size:14px; font-weight:800; color:var(--text);')}>Add activity to today</div>
                    <div style={s('font-size:11.5px; color:var(--muted); font-weight:500;')}>Append a finisher — keeps what's here</div>
                  </div>
                  <span style={s('color:var(--accent); font-size:18px;')}>›</span>
                </button>
              )}

              {dm.showAddEmpty && (
                <button onClick={dm.addActivity} style={s('display:flex; align-items:center; gap:13px; text-align:left; border:1px solid var(--accent); background:var(--accent-soft); cursor:pointer; font-family:inherit; padding:13px 15px; border-radius:15px; transition:transform .12s cubic-bezier(.34,1.56,.64,1);')}>
                  <span style={s('width:38px; height:38px; flex:none; border-radius:50%; background:var(--surface); display:flex; align-items:center; justify-content:center; color:var(--accent); font-size:22px; line-height:1;')}>+</span>
                  <div style={s('flex:1; min-width:0;')}>
                    <div style={s('font-size:14px; font-weight:800; color:var(--text);')}>Add an activity</div>
                    <div style={s('font-size:11.5px; color:var(--muted); font-weight:500;')}>Pick a lift, cardio or sport</div>
                  </div>
                  <span style={s('color:var(--accent); font-size:18px;')}>›</span>
                </button>
              )}
            </div>

            {dm.showMove && (
              <button onClick={dm.moveToDay} style={s('display:flex; align-items:center; gap:13px; text-align:left; width:100%; margin-top:9px; border:1px solid var(--border); background:var(--surface-2); cursor:pointer; font-family:inherit; padding:13px 15px; border-radius:15px; transition:transform .12s cubic-bezier(.34,1.56,.64,1);')}>
                <span style={s('width:38px; height:38px; flex:none; border-radius:50%; background:var(--surface); display:flex; align-items:center; justify-content:center; color:var(--text);')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
                </span>
                <div style={s('flex:1; min-width:0;')}>
                  <div style={s('font-size:14px; font-weight:800; color:var(--text);')}>Move to another day</div>
                  <div style={s('font-size:11.5px; color:var(--muted); font-weight:500;')}>Shift this session — source becomes a rest day</div>
                </div>
                <span style={s('color:var(--muted); font-size:18px;')}>›</span>
              </button>
            )}

            <button onClick={dm.close} style={s('width:100%; margin-top:14px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:13px; font-weight:700; color:var(--muted); padding:8px 0;')}>Close</button>
          </>
        )}
      </div>
    </>
  );
}
