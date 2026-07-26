import React from 'react';
import { s } from '../lib/helpers';

export default function WeekScreen({ v }) {
  return (
    <div style={s('padding:12px 16px 28px;')}>
      {/* week navigation (swipe the card below) */}
      <div style={s('display:flex; flex-direction:column; align-items:center; gap:7px; margin-bottom:11px; padding:0 2px;')}>
        <div style={s('display:flex; align-items:center; justify-content:center; gap:7px;')}>
          <span style={s('font-size:14px; font-weight:800; color:var(--text); letter-spacing:-.01em;')}>{v.weekNav.label}</span>
        </div>
        <div style={s('display:flex; align-items:center; justify-content:center; gap:5px;')}>
          {v.weekNav.dots.map((dot, i) => (
            <span key={i} onClick={dot.go} style={s(`width:${dot.w}; height:6px; border-radius:999px; background:${dot.bg}; cursor:pointer; transition:all .3s cubic-bezier(.34,1.4,.64,1);`)}></span>
          ))}
        </div>
      </div>

      {/* week strip (swipeable) */}
      <div data-week-strip data-tut="week" onTouchStart={v.weekNav.touchStart} onTouchMove={v.weekNav.touchMove} onTouchEnd={v.weekNav.touchEnd} onMouseDown={v.weekNav.touchStart} onMouseUp={v.weekNav.touchEnd} style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:16px 12px; box-shadow:var(--shadow); touch-action:pan-y; user-select:none;')}>
        <div style={s('display:flex; justify-content:space-between; gap:4px;')}>
          {v.days.map((d) => (
            <div key={d.key} onClick={d.open} style={s('flex:1; display:flex; flex-direction:column; align-items:center; gap:7px; cursor:pointer; transition:transform .12s cubic-bezier(.34,1.56,.64,1);')}>
              <span style={s('font-size:11px; font-weight:700; color:var(--muted);')}>{d.letter}</span>
              <span style={s(`position:relative; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:${d.chipBg}; box-shadow:${d.chipRing};`)}>
                <span style={s(`width:7px; height:7px; border-radius:50%; background:${d.dot};`)}></span>
                <span style={s(`position:absolute; top:-3px; right:-3px; font-size:9px; color:var(--accent); display:${d.movedDisplay};`)}>⤵</span>
              </span>
              <span style={s(`font-size:9.5px; font-weight:700; color:${d.labelColor}; max-width:46px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{d.short}</span>
            </div>
          ))}
        </div>
      </div>

      {/* today card */}
      <div data-tut="today" style={s(`margin-top:12px; background:${v.todayBg}; border:1px solid var(--border); border-radius:18px; padding:14px 16px; box-shadow:var(--shadow); color:${v.todayFg};`)}>
        <div style={s('display:flex; align-items:center; justify-content:space-between;')}>
          <span style={s('font-size:11px; font-weight:700; opacity:.8; text-transform:uppercase; letter-spacing:.07em;')}>Today · {v.todayName}</span>
          <span style={s(`font-size:10.5px; font-weight:700; background:${v.todayPillBg}; padding:3px 9px; border-radius:999px;`)}>{v.todayStatus}</span>
        </div>
        <div onClick={v.openTodayMenu} style={s('display:flex; align-items:center; gap:9px; margin-top:6px; cursor:pointer; transition:opacity .12s ease;')}>
          <span style={s('font-size:21px; font-weight:800; letter-spacing:-.02em;')}>{v.todayProgram}</span>
          <span style={s(`font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; opacity:.85; background:${v.todayPillBg}; padding:4px 9px; border-radius:999px;`)}>Edit ›</span>
        </div>
        <div style={s('font-size:11.5px; opacity:.82; font-weight:500; margin-top:2px;')}>{v.todaySub}</div>
        <div style={s('display:flex; gap:8px; margin-top:12px;')}>
          <button onClick={v.openToday} style={s(`flex:1; border:none; cursor:pointer; background:${v.todayBtnBg}; color:${v.todayBtnFg}; font-family:inherit; font-size:12.5px; font-weight:700; padding:9px 0; border-radius:11px; display:${v.todayTrainDisplay};`)}>Open session</button>
          <button onClick={v.openMoveToday} style={s(`flex:1; border:1px solid ${v.todayMoveBorder}; cursor:pointer; background:transparent; color:${v.todayFg}; font-family:inherit; font-size:12.5px; font-weight:700; padding:9px 0; border-radius:11px; display:${v.todayTrainDisplay};`)}>Move lift</button>
        </div>
      </div>

      {/* supplements */}
      <div style={s('display:flex; align-items:center; justify-content:space-between; margin:16px 4px 10px;')}>
        <span style={s('font-size:15px; font-weight:800; color:var(--text); letter-spacing:-.01em;')}>Supplements</span>
        <button onClick={v.openSupplementsEdit} style={s('border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; font-size:11.5px; font-weight:700; color:var(--primary); padding:6px 13px; border-radius:999px;')}>Edit</button>
      </div>
      <div data-tut="supps" style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:4px 16px; box-shadow:var(--shadow);')}>
        {v.supplements.map((sp, i) => (
          <div key={i} onClick={sp.toggle} style={s(`display:flex; align-items:center; gap:13px; padding:13px 0; border-bottom:1px solid ${sp.divider}; cursor:pointer;`)}>
            <span style={s(`width:23px; height:23px; flex:none; border-radius:50%; border:2px solid ${sp.ringColor}; background:${sp.fillColor}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:800;`)}>{sp.check}</span>
            <span style={s(`flex:1; font-size:13.5px; font-weight:700; color:var(--text); text-decoration:${sp.strike};`)}>{sp.name}</span>
          </div>
        ))}
        {v.supplementsEmpty && (
          <div style={s('padding:16px 0; text-align:center; font-size:12.5px; color:var(--muted); font-weight:500;')}>No supplements yet — tap Edit to add some</div>
        )}
      </div>

      {/* nutrition widget */}
      <div style={s('display:flex; align-items:center; justify-content:space-between; margin:16px 4px 10px;')}>
        <span style={s('font-size:15px; font-weight:800; color:var(--text); letter-spacing:-.01em;')}>Today's Macros</span>
      </div>
      <div onClick={v.openMeals} data-tut="nutri" style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:16px; box-shadow:var(--shadow); cursor:pointer;')}>
        {v.nw.hasData && (
          <>
            <div style={s('display:flex; gap:8px;')}>
              {v.nw.rings.map((r, i) => (
                <div key={i} style={s('flex:1; display:flex; flex-direction:column; align-items:center; gap:7px;')}>
                  <div style={s(`position:relative; width:58px; height:58px; border-radius:50%; background:${r.ring}; transition:background .55s cubic-bezier(.22,1,.36,1);`)}>
                    <div style={s('position:absolute; inset:6px; border-radius:50%; background:var(--surface); display:flex; align-items:center; justify-content:center;')}>
                      <span style={s(`font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; color:${r.color};`)}>{r.pct}</span>
                    </div>
                  </div>
                  <div style={s('text-align:center;')}>
                    <div style={s('font-size:10.5px; font-weight:700; color:var(--text);')}>{r.label}</div>
                    <div style={s("font-family:'JetBrains Mono',monospace; font-size:9.5px; font-weight:600; color:var(--muted); margin-top:1px;")}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={s('margin-top:14px; padding-top:13px; border-top:1px solid var(--border);')}>
              <div style={s('display:flex; align-items:baseline; justify-content:space-between;')}>
                <span style={s('font-size:10.5px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.06em;')}>Calories</span>
                <span style={s("font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); letter-spacing:-.02em;")}>{v.nw.calText}</span>
              </div>
              <div style={s('margin-top:7px; height:7px; border-radius:4px; background:var(--track); overflow:hidden;')}>
                <div style={s(`height:100%; border-radius:4px; width:${v.nw.calPct}; background:${v.nw.calColor}; transition:width .6s cubic-bezier(.22,1,.36,1);`)}></div>
              </div>
            </div>
          </>
        )}
        {v.nw.empty && (
          <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; text-align:center; padding:6px 0;')}>No meals logged yet. Start tracking.</div>
        )}
      </div>

      {/* schedule */}
      <div style={s('margin:22px 4px 10px; display:flex; align-items:baseline; justify-content:space-between; gap:8px;')}>
        <span style={s('font-size:15px; font-weight:800; color:var(--text); letter-spacing:-.01em;')}>{v.weekSectionLabel}</span>
        <span style={s('font-size:11px; font-weight:600; color:var(--muted);')}>{v.weekNav.label}</span>
      </div>
      <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:4px 16px; box-shadow:var(--shadow);')}>
        {v.days.map((d) => (
          <div key={d.key} onClick={d.open} style={s(`display:flex; align-items:center; gap:13px; padding:13px 0; border-bottom:1px solid ${d.divider}; cursor:pointer;`)}>
            <span style={s(`width:40px; height:40px; flex:none; border-radius:50%; background:${d.tint}; display:flex; align-items:center; justify-content:center;`)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={d.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d.iconPath}></path></svg>
            </span>
            <div style={s('flex:1; min-width:0;')}>
              <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>{d.full}</div>
              <div style={s('font-size:11.5px; color:var(--muted); font-weight:500;')}>{d.rowSub}</div>
            </div>
            <span style={s("font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:var(--muted);")}>{d.rowRight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
