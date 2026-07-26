import React from 'react';
import { s } from '../lib/helpers';

export default function MealsScreen({ v }) {
  const pf = v.pf;
  const mx = v.mx;
  const sm = v.sm;
  return (
    <div style={s('padding:14px 16px 28px;')}>
      {v.mealsSetup && pf && (
        <>
          <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; line-height:1.5; margin:2px 4px 14px;')}>A few details to set your daily calorie and macro targets.</div>
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:18px 16px; box-shadow:var(--shadow);')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Name</div>
            <input value={pf.name} onChange={pf.onName} placeholder="Your name" style={s('width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:14px; font-weight:700; color:var(--text); outline:none;')} />
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:16px 0 6px;')}>Body</div>
            <div style={s('display:flex; gap:9px;')}>
              <div style={s('flex:1;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Height cm</div>
                <input type="number" value={pf.height} onChange={pf.onHeight} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
              <div style={s('flex:1;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Weight kg</div>
                <input type="number" value={pf.weight} onChange={pf.onWeight} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
              <div style={s('flex:.8;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Age</div>
                <input type="number" value={pf.age} onChange={pf.onAge} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
            </div>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:16px 0 6px;')}>Sex</div>
            <div style={s('display:flex; gap:8px;')}>
              {pf.sexOptions.map((op, i) => (
                <button key={i} onClick={op.set} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; padding:10px 0; border-radius:11px; background:${op.bg}; color:${op.color};`)}>{op.label}</button>
              ))}
            </div>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:16px 0 6px;')}>Goal</div>
            <div style={s('display:flex; gap:8px;')}>
              {pf.goalOptions.map((op, i) => (
                <button key={i} onClick={op.set} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:11.5px; font-weight:700; padding:10px 4px; border-radius:11px; background:${op.bg}; color:${op.color};`)}>{op.label}</button>
              ))}
            </div>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:16px 0 6px;')}>Activity level</div>
            <div style={s('display:flex; flex-direction:column; gap:8px;')}>
              {pf.activityOptions.map((op, i) => (
                <button key={i} onClick={op.set} style={s(`text-align:left; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:700; padding:12px 14px; border-radius:12px; background:${op.bg}; color:${op.color};`)}>{op.label}</button>
              ))}
            </div>
            <button onClick={pf.save} style={s('width:100%; margin-top:20px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Set my targets</button>
          </div>
        </>
      )}
      {v.mealsMain && mx && (
        <>
          <div style={s('display:flex; align-items:center; justify-content:space-between; margin:0 4px 10px;')}>
            <span style={s('font-size:15px; font-weight:800; color:var(--text); letter-spacing:-.01em;')}>Today</span>
            <div style={s('display:flex; gap:7px;')}>
              <button onClick={v.openExport} style={s('border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; font-size:11.5px; font-weight:700; color:var(--primary); padding:6px 13px; border-radius:999px;')}>Export</button>
              <button onClick={v.editProfile} style={s('border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; font-size:11.5px; font-weight:700; color:var(--primary); padding:6px 13px; border-radius:999px;')}>Edit Profile</button>
            </div>
          </div>
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:18px 16px; box-shadow:var(--shadow);')}>
            <div style={s('display:flex; flex-direction:column; gap:14px;')}>
              {mx.bars.map((b, i) => (
                <div key={i}>
                  <div style={s('display:flex; align-items:baseline; justify-content:space-between; margin-bottom:7px;')}>
                    <span style={s('font-size:13px; font-weight:800; color:var(--text);')}>{b.label}</span>
                    <span style={s("font-family:'JetBrains Mono',monospace; font-size:11.5px; font-weight:600; color:var(--muted);")}>{b.value}</span>
                  </div>
                  <div style={s('display:flex; gap:3px;')}>
                    {b.segs.map((sg, j) => (
                      <div key={j} style={s(`flex:1; height:8px; border-radius:4px; background:${sg.bg}; transition:background .45s ease;`)}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={s('display:flex; align-items:baseline; justify-content:space-between; margin-top:16px; padding-top:14px; border-top:1px solid var(--border);')}>
              <span style={s('font-size:12px; font-weight:700; color:var(--muted);')}>Calories remaining</span>
              <span style={s(`font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:700; color:${mx.remainColor}; letter-spacing:-.02em;`)}>{mx.remaining}</span>
            </div>
          </div>
          <button onClick={v.openMealAdd} style={s('width:100%; margin-top:14px; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:13.5px; font-weight:800; padding:13px 0; border-radius:13px;')}>+ Add Meal</button>
          <div style={s('margin:20px 4px 10px;')}><span style={s('font-size:15px; font-weight:800; color:var(--text); letter-spacing:-.01em;')}>Meals today</span></div>
          {mx.hasMeals && (
            <div style={s('display:flex; flex-direction:column; gap:10px;')}>
              {mx.meals.map((m, i) => (
                <div key={i} onClick={m.open} style={s('background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:14px 15px; box-shadow:var(--shadow); cursor:pointer;')}>
                  <div style={s('display:flex; align-items:center; justify-content:space-between; gap:10px;')}>
                    <span style={s('font-size:14px; font-weight:700; color:var(--text); flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{m.name}</span>
                    <span style={s('font-size:11px; font-weight:600; color:var(--faint); flex:none;')}>{m.time}</span>
                  </div>
                  <div style={s("font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--muted); font-weight:600; margin-top:5px;")}>{m.macros}</div>
                </div>
              ))}
            </div>
          )}
          {mx.noMeals && (
            <div style={s('text-align:center; padding:30px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:16px;')}>
              <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>No meals logged yet</div>
              <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px;')}>Tap + Add Meal to start tracking</div>
            </div>
          )}
          <div style={s('display:flex; align-items:center; justify-content:space-between; margin:22px 4px 10px;')}>
            <span style={s('font-size:15px; font-weight:800; color:var(--text); letter-spacing:-.01em;')}>Saved Meals</span>
            <button onClick={sm.create} style={s('border:1px solid var(--border); background:var(--surface); cursor:pointer; font-family:inherit; font-size:11.5px; font-weight:700; color:var(--primary); padding:6px 13px; border-radius:999px;')}>+ New</button>
          </div>
          {sm.has && (
            <div style={s('display:flex; flex-direction:column; gap:10px;')}>
              {sm.list.map((c, i) => (
                <div key={i} onClick={c.open} style={s('background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:13px 15px; box-shadow:var(--shadow); cursor:pointer; display:flex; align-items:center; gap:12px;')}>
                  <div style={s('flex:1; min-width:0;')}>
                    <div style={s('display:flex; align-items:baseline; gap:8px;')}>
                      <span style={s('font-size:14px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{c.name}</span>
                      <span style={s('font-size:10.5px; font-weight:600; color:var(--faint); flex:none;')}>{c.count}</span>
                    </div>
                    <div style={s("font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--muted); font-weight:600; margin-top:4px;")}>{c.macros}</div>
                  </div>
                  <button onClick={c.quickAdd} title="Add to today" style={s('width:44px; height:44px; flex:none; border:none; cursor:pointer; background:var(--accent); color:#fff; border-radius:999px; font-size:19px; line-height:1; display:inline-flex; align-items:center; justify-content:center; font-weight:600;')}>+</button>
                </div>
              ))}
            </div>
          )}
          {sm.none && (
            <div style={s('text-align:center; padding:24px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:16px;')}>
              <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>No saved meals yet</div>
              <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px;')}>Create one to log repeat meals in a single tap</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
