import React from 'react';
import { s } from '../lib/helpers';

export function ImportConfirm({ v }) {
  return (
    <div style={s('position:absolute; inset:0; z-index:90; background:rgba(20,16,12,.5); display:flex; align-items:center; justify-content:center; padding:0 28px;')}>
      <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:22px; max-width:300px; box-shadow:0 16px 44px rgba(0,0,0,.34); animation:zenIn .3s cubic-bezier(.22,1,.36,1) both;')}>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Replace all data?</div>
        <div style={s('font-size:13px; font-weight:500; color:var(--muted); margin-top:8px; line-height:1.5;')}>This will replace all your current data with the backup. This can't be undone.</div>
        <div style={s('display:flex; gap:8px; margin-top:18px;')}>
          <button onClick={v.confirmImportNo} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--muted); font-family:inherit; font-size:13px; font-weight:700; padding:11px 0; border-radius:11px;')}>Cancel</button>
          <button onClick={v.confirmImportYes} style={s('flex:1; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:13px; font-weight:800; padding:11px 0; border-radius:11px;')}>Replace</button>
        </div>
      </div>
    </div>
  );
}

export function ImportLoading() {
  return (
    <div style={s('position:absolute; inset:0; z-index:92; background:var(--bg); display:flex; flex-direction:column; padding:70px 20px 28px; gap:14px;')}>
      <div className="sk" style={s('height:56px; border-radius:16px; opacity:.9;')}></div>
      <div className="sk" style={s('height:92px; border-radius:20px;')}></div>
      <div className="sk" style={s('height:148px; border-radius:20px;')}></div>
      <div className="sk" style={s('height:180px; border-radius:20px;')}></div>
      <div style={s('position:absolute; left:0; right:0; bottom:calc(env(safe-area-inset-bottom) + 34px); text-align:center; font-size:12.5px; font-weight:700; color:var(--muted);')}>Restoring your data…</div>
    </div>
  );
}

export function Toast({ v }) {
  return (
    <div style={s('position:absolute; left:16px; right:16px; bottom:calc(env(safe-area-inset-bottom) + 26px); z-index:95; pointer-events:none; display:flex; justify-content:center;')}>
      <div style={s('background:var(--text); color:var(--surface); font-size:12.5px; font-weight:600; line-height:1.4; padding:12px 16px; border-radius:13px; box-shadow:0 10px 30px rgba(0,0,0,.3); max-width:100%; text-align:center; text-wrap:pretty; animation:toastIn .25s ease both;')}>{v.toast}</div>
    </div>
  );
}

export function TagRename({ v }) {
  const tr = v.tr;
  return (
    <>
      <div data-lt-backdrop onClick={tr.close} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:70;')}></div>
      <div data-lt-sheet style={s('position:absolute; left:0; right:0; bottom:0; z-index:71; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; animation:slideUp .28s cubic-bezier(.22,1,.36,1) both;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Name this day</div>
        <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; margin-top:4px;')}>Give {tr.dayFull}'s custom session its own tag — e.g. "Arms Day" or "Full Body".</div>
        <input value={tr.value} onChange={tr.onChange} placeholder="Custom" style={s('width:100%; margin-top:14px; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:14px; font-weight:700; color:var(--text); outline:none;')} />
        <div style={s('display:flex; gap:9px; margin-top:16px;')}>
          <button onClick={tr.reset} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--muted); font-family:inherit; font-size:13px; font-weight:700; padding:12px 0; border-radius:12px;')}>Reset to Custom</button>
          <button onClick={tr.save} style={s('flex:1.4; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:13.5px; font-weight:800; padding:12px 0; border-radius:12px;')}>Save name</button>
        </div>
      </div>
    </>
  );
}

export function CompleteConfirm({ v }) {
  const cc = v.cc;
  return (
    <>
      <div data-lt-backdrop onClick={cc.close} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:78;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:79; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; max-height:88%; overflow-y:auto; animation:slideUp .28s cubic-bezier(.22,1,.36,1) both;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:19px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Everything look right?</div>
        <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; margin-top:4px;')}>{cc.sub}</div>
        <div style={s('background:var(--surface-2); border-radius:16px; padding:6px 14px; margin-top:14px;')}>
          {cc.exercises.map((e, i) => (
            <div key={i} style={s(`display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 0; border-bottom:1px solid ${e.divider};`)}>
              <span style={s('font-size:13px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{e.name}</span>
              <span style={s("font-family:'JetBrains Mono',monospace; font-size:11.5px; font-weight:600; color:var(--muted); flex:none;")}>{e.scheme}</span>
            </div>
          ))}
        </div>
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:0 4px;')}>
          <span style={s('font-size:12px; font-weight:700; color:var(--muted);')}>Total volume</span>
          <span style={s("font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--accent);")}>{cc.volume}</span>
        </div>
        <div style={s('display:flex; gap:9px; margin-top:16px;')}>
          <button onClick={cc.close} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); font-family:inherit; font-size:13.5px; font-weight:700; padding:13px 0; border-radius:13px;')}>Go back &amp; edit</button>
          <button onClick={cc.confirm} style={s('flex:1.4; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:13.5px; font-weight:800; padding:13px 0; border-radius:13px;')}>Confirm &amp; complete</button>
        </div>
      </div>
    </>
  );
}

export function ProfileEditSheet({ v }) {
  const pf = v.pf;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeProfileEdit} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:58;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:59; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; max-height:90%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Edit profile</div>
        <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:16px 0 6px;')}>Name</div>
        <input value={pf.name} onChange={pf.onName} placeholder="Your name" style={s('width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:14px; font-weight:700; color:var(--text); outline:none;')} />
        <div style={s('display:flex; gap:9px; margin-top:14px;')}>
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
        <button onClick={pf.save} style={s('width:100%; margin-top:20px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Save changes</button>
      </div>
    </>
  );
}

export function SideMenu({ v }) {
  return (
    <>
      <div data-lt-backdrop onClick={v.closeMenu} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:44;')}></div>
      <div className="scrollable" style={s('position:absolute; top:0; bottom:0; left:0; z-index:45; width:270px; max-width:80%; background:var(--surface); box-shadow:8px 0 30px rgba(0,0,0,.2); padding:calc(env(safe-area-inset-top) + 20px) 16px calc(env(safe-area-inset-bottom) + 20px) calc(env(safe-area-inset-left) + 16px); display:flex; flex-direction:column; overflow-y:auto; animation:slideUp .2s ease-out;')}>
        <div style={s('font-size:19px; font-weight:800; color:var(--text); letter-spacing:-.02em; margin:6px 4px 18px;')}>Menu</div>
        {v.menuItems.map((mi, i) => (
          <div key={i} onClick={mi.select} style={s(`display:flex; align-items:center; gap:12px; padding:13px 10px; border-radius:13px; cursor:pointer; background:${mi.bg};`)}>
            <span style={s(`width:34px; height:34px; flex:none; border-radius:10px; background:${mi.tint}; display:flex; align-items:center; justify-content:center;`)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={mi.iconColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={mi.iconPath}></path></svg>
            </span>
            <span style={s('font-size:14px; font-weight:700; color:var(--text);')}>{mi.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function SupplementsEdit({ v }) {
  return (
    <>
      <div data-lt-backdrop onClick={v.closeSupplementsEdit} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:46;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:47; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Edit supplements</div>
        <div style={s('display:flex; flex-direction:column; margin-top:14px;')}>
          {v.supplementsDraft.map((d, i) => (
            <div key={i} style={s('display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--border);')}>
              <span style={s('flex:1; font-size:14px; font-weight:700; color:var(--text);')}>{d.name}</span>
              <button onClick={d.remove} style={s('border:none; background:transparent; cursor:pointer; color:#EF4444; font-size:13px; font-weight:700; padding:6px;')}>Remove</button>
            </div>
          ))}
        </div>
        <div style={s('display:flex; gap:9px; margin-top:14px;')}>
          <input value={v.newSupplementName} onChange={v.onNewSupplementInput} placeholder="e.g. Vitamin D" style={s('flex:1; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:14px; font-weight:700; color:var(--text); outline:none;')} />
          <button onClick={v.addSupplement} style={s('border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:14px; font-weight:700; padding:0 18px; border-radius:11px;')}>Add</button>
        </div>
        <button onClick={v.closeSupplementsEdit} style={s('width:100%; margin-top:20px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:700; padding:13px 0; border-radius:13px;')}>Done</button>
      </div>
    </>
  );
}

export function MoveLift({ v }) {
  return (
    <>
      <div data-lt-backdrop onClick={v.closeMove} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:42;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:43; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{v.moveTitle}</div>
        <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px;')}>{v.moveSub}</div>
        <div style={s('display:flex; flex-direction:column; margin-top:14px;')}>
          {v.moveTargets.map((mt, i) => (
            <div key={i} onClick={mt.pick} style={s(`display:flex; align-items:center; justify-content:space-between; padding:13px 4px; border-bottom:1px solid ${mt.divider}; cursor:${mt.rowCursor}; opacity:${mt.rowOpacity};`)}>
              <span style={s('font-size:14px; font-weight:700; color:var(--text);')}>{mt.full}</span>
              <span style={s('font-size:11.5px; font-weight:600; color:var(--muted);')}>{mt.current}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
