import React from 'react';
import { s } from '../lib/helpers';

export default function SessionScreen({ v }) {
  const sx = v.sx;
  return (
    <>
      {v.restState && (
        <div style={s('padding:96px 36px; text-align:center; animation:zenIn .6s cubic-bezier(.22,1,.36,1) both;')}>
          <span style={s('display:inline-flex; width:56px; height:56px; border-radius:50%; background:var(--surface-2); align-items:center; justify-content:center; margin-bottom:20px;')}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13.2A8 8 0 1 1 10.8 4 6.3 6.3 0 0 0 20 13.2z"></path></svg></span>
          <div style={s('font-size:20px; font-weight:800; color:var(--text); letter-spacing:-.02em; line-height:1.35;')}>Rest Day.</div>
          <div style={s('font-size:14.5px; font-weight:600; color:var(--muted); margin-top:7px; line-height:1.5;')}>Recover &amp; Come Back Stronger.</div>
        </div>
      )}
      {v.completionState && (
        <div style={s('padding:96px 36px; text-align:center; animation:zenIn .6s cubic-bezier(.22,1,.36,1) both;')}>
          <span style={s('display:inline-flex; width:56px; height:56px; border-radius:50%; background:var(--accent-soft); align-items:center; justify-content:center; margin-bottom:20px;')}><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span>
          <div style={s('font-size:20px; font-weight:800; color:var(--text); letter-spacing:-.02em; line-height:1.35;')}>{sx.doneTitle}</div>
          <div style={s('font-size:14.5px; font-weight:600; color:var(--muted); margin-top:7px; line-height:1.5;')}>Eat Well &amp; Get Some Rest.</div>
          <button onClick={v.peekSession} style={s('margin-top:28px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; color:var(--faint);')}>View session details</button>
        </div>
      )}
      {v.sessionNormal && (
        <div style={s('padding:12px 16px 28px;')}>
          <div style={s('display:flex; align-items:center; gap:11px;')}>
            <span style={s(`width:44px; height:44px; flex:none; border-radius:13px; background:${sx.tint}; display:flex; align-items:center; justify-content:center;`)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={sx.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={sx.iconPath}></path></svg>
            </span>
            <div style={s('flex:1; min-width:0;')}>
              <div style={s('display:flex; align-items:center; gap:7px;')}>
                <div style={s('font-size:19px; font-weight:800; color:var(--text); letter-spacing:-.02em; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{sx.typeLine}</div>
                <button onClick={v.openTagRename} aria-label="Rename day tag" style={s(`display:${sx.renameDisplay}; flex:none; border:none; background:var(--surface-2); cursor:pointer; width:24px; height:24px; border-radius:8px; align-items:center; justify-content:center; padding:0; color:var(--muted);`)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg></button>
              </div>
              <div style={s('font-size:12px; color:var(--muted); font-weight:600;')}>{sx.dayFull}</div>
            </div>
            <span style={s(`font-size:11.5px; font-weight:700; color:${sx.statusColor}; background:${sx.statusBg}; padding:5px 11px; border-radius:999px;`)}>{sx.statusText}</span>
          </div>

          {/* exercises */}
          <div style={s('display:flex; align-items:center; justify-content:space-between; margin:20px 4px 10px;')}>
            <span style={s('font-size:13px; font-weight:800; color:var(--text);')}>{sx.listLabel}</span>
            <button onClick={v.addExercise} aria-label="Add activity" style={s('width:44px; height:44px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; background:var(--accent); color:#fff; border-radius:50%; padding:0; font-size:20px; line-height:1;')}>+</button>
          </div>

          {sx.hasExercises && (
            <div style={s('display:flex; flex-direction:column; gap:10px;')}>
              {sx.exercises.map((ex, i) => (
                <div key={i} data-sess-card onClick={ex.edit} style={s(`position:relative; background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:14px 15px 14px 10px; box-shadow:${ex.cardShadow}; cursor:pointer; display:flex; align-items:center; gap:10px; transform:translateY(${ex.ty}) scale(${ex.scale}); z-index:${ex.z}; transition:${ex.tyTransition};`)}>
                  <div onTouchStart={ex.handleTouchStart} onTouchMove={ex.handleTouchMove} onTouchEnd={ex.handleTouchEnd} onMouseDown={ex.handleMouseDown} aria-label="Drag to reorder" style={s(`display:${sx.handleDisplay}; flex:none; width:26px; align-self:stretch; align-items:center; justify-content:center; cursor:grab; touch-action:none; color:var(--faint); margin:-14px 0;`)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"></circle><circle cx="15" cy="6" r="1.6"></circle><circle cx="9" cy="12" r="1.6"></circle><circle cx="15" cy="12" r="1.6"></circle><circle cx="9" cy="18" r="1.6"></circle><circle cx="15" cy="18" r="1.6"></circle></svg>
                  </div>
                  <div style={s('flex:1; min-width:0;')}>
                    <div style={s('font-size:14px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{ex.name}</div>
                    <div style={s("font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--muted); font-weight:600; margin-top:3px;")}>{ex.scheme}</div>
                  </div>
                  <div style={s('text-align:right; flex:none;')}>
                    <div style={s("font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--text);")}>{ex.volume}</div>
                    <div style={s('font-size:10px; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:.04em;')}>{ex.volLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {sx.empty && (
            <div data-lt-bounce style={s('text-align:center; padding:30px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:16px;')}>
              <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>{sx.emptyTitle}</div>
              <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px;')}>{sx.emptySub}</div>
            </div>
          )}

          {/* volume total */}
          {sx.showVolume && (
            <div style={s('margin-top:16px; background:var(--accent); border-radius:18px; padding:18px 20px; color:#fff; display:flex; align-items:center; justify-content:space-between;')}>
              <div>
                <div style={s('font-size:11.5px; font-weight:700; opacity:.85; text-transform:uppercase; letter-spacing:.06em;')}>Total session volume</div>
                <div style={s('font-size:12px; opacity:.82; font-weight:500; margin-top:2px;')}>{sx.exCount} exercises</div>
              </div>
              <div style={s("font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; letter-spacing:-.02em;")}>{sx.totalVolume}</div>
            </div>
          )}

          {/* notes */}
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:18px 4px 8px;')}>Notes</div>
          <textarea value={sx.notes} onChange={v.onNotes} placeholder="How did the session feel?" style={s('width:100%; min-height:64px; resize:none; border:1px solid var(--border); border-radius:14px; padding:12px 14px; background:var(--surface); font-family:inherit; font-size:13px; font-weight:500; color:var(--text); outline:none;')}></textarea>

          {/* start workout */}
          {sx.showStart && (
            <button onClick={v.startWorkout} style={s('width:100%; margin-top:16px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:15px 0; border-radius:14px; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform .1s ease;')}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5-13-7.5z"></path></svg>{sx.startLabel}</button>
          )}

          {/* actions */}
          <div style={s('display:flex; gap:9px; margin-top:16px;')}>
            <button onClick={v.openMoveSession} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); font-family:inherit; font-size:13.5px; font-weight:700; padding:13px 0; border-radius:13px;')}>Move lift</button>
            <button onClick={v.toggleComplete} style={s(`flex:1.4; border:none; cursor:pointer; background:${sx.completeBg}; color:${sx.completeFg}; font-family:inherit; font-size:13.5px; font-weight:800; padding:13px 0; border-radius:13px; display:flex; align-items:center; justify-content:center; gap:7px;`)}><span style={s('font-size:15px; line-height:1;')}>{sx.completeIcon}</span>{sx.completeText}</button>
          </div>
        </div>
      )}
    </>
  );
}
