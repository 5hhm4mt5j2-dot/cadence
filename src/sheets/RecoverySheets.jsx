import React from 'react';
import { s } from '../lib/helpers';

export function WorkoutSettingsSheet({ v }) {
  const wsx = v.wsx;
  return (
    <>
      <div data-lt-backdrop onClick={wsx.close} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:74;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:75; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.25); padding:18px 20px 26px; max-height:82%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:19px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Workout Settings</div>
        <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; margin-top:4px;')}>Rest timer, feedback and gym display mode.</div>

        <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:20px 2px 8px;')}>Default rest duration</div>
        <div style={s('display:flex; gap:7px; flex-wrap:wrap;')}>
          {wsx.restChips.map((c, i) => (
            <button key={i} onClick={c.pick} style={s(`border:none; cursor:pointer; background:${c.bg}; color:${c.fg}; font-family:'JetBrains Mono',monospace; font-size:12.5px; font-weight:700; padding:9px 15px; border-radius:999px;`)}>{c.label}</button>
          ))}
        </div>
        <div style={s('display:flex; align-items:center; gap:9px; margin-top:10px;')}>
          <span style={s('font-size:12px; font-weight:600; color:var(--muted);')}>Custom</span>
          <input value={wsx.restCustom} onChange={wsx.onRestCustom} inputMode="numeric" style={s("width:76px; border:1px solid var(--border); border-radius:11px; padding:9px 11px; background:var(--bg); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:600; color:var(--text); outline:none; text-align:center;")} />
          <span style={s('font-size:12px; font-weight:600; color:var(--muted);')}>seconds</span>
        </div>

        <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:20px 2px 2px;')}>Timer finish</div>
        <div onClick={wsx.toggleVib} style={s('display:flex; align-items:center; justify-content:space-between; padding:13px 0; border-bottom:1px solid var(--border); cursor:pointer;')}>
          <span style={s('font-size:13px; font-weight:600; color:var(--text);')}>Vibration when rest ends</span>
          <span style={s(`width:42px; height:25px; flex:none; border-radius:999px; background:${wsx.vibBg}; position:relative; transition:background .2s ease;`)}><span style={s(`position:absolute; top:2.5px; left:${wsx.vibKnob}; width:20px; height:20px; border-radius:50%; background:#fff; transition:left .2s ease; box-shadow:0 1px 3px rgba(0,0,0,.25);`)}></span></span>
        </div>
        <div style={s('display:flex; align-items:center; justify-content:space-between; gap:10px; padding:13px 0;')}>
          <span style={s('font-size:13px; font-weight:600; color:var(--text);')}>Sound</span>
          <div style={s('display:flex; gap:6px;')}>
            {wsx.soundChips.map((c, i) => (
              <button key={i} onClick={c.pick} style={s(`border:none; cursor:pointer; background:${c.bg}; color:${c.fg}; font-family:inherit; font-size:12px; font-weight:700; padding:8px 13px; border-radius:999px;`)}>{c.label}</button>
            ))}
          </div>
        </div>

        <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:16px 2px 2px;')}>Display &amp; battery</div>
        <div onClick={wsx.toggleKeep} style={s('display:flex; align-items:center; justify-content:space-between; padding:13px 0; border-bottom:1px solid var(--border); cursor:pointer;')}>
          <span style={s('font-size:13px; font-weight:600; color:var(--text);')}>Keep screen on during workout</span>
          <span style={s(`width:42px; height:25px; flex:none; border-radius:999px; background:${wsx.keepBg}; position:relative; transition:background .2s ease;`)}><span style={s(`position:absolute; top:2.5px; left:${wsx.keepKnob}; width:20px; height:20px; border-radius:50%; background:#fff; transition:left .2s ease; box-shadow:0 1px 3px rgba(0,0,0,.25);`)}></span></span>
        </div>
        <div style={s('display:flex; align-items:center; justify-content:space-between; gap:10px; padding:13px 0;')}>
          <span style={s('font-size:13px; font-weight:600; color:var(--text);')}>Auto-dim after</span>
          <div style={s('display:flex; gap:5px; flex-wrap:wrap; justify-content:flex-end;')}>
            {wsx.idleChips.map((c, i) => (
              <button key={i} onClick={c.pick} style={s(`border:none; cursor:pointer; background:${c.bg}; color:${c.fg}; font-family:inherit; font-size:11.5px; font-weight:700; padding:7px 11px; border-radius:999px;`)}>{c.label}</button>
            ))}
          </div>
        </div>
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin:6px 2px 6px;')}>
          <span style={s('font-size:13px; font-weight:600; color:var(--text);')}>Dim brightness to</span>
          <span style={s("font-family:'JetBrains Mono',monospace; font-size:12.5px; font-weight:700; color:var(--accent);")}>{wsx.dimLabel}</span>
        </div>
        <input type="range" min="15" max="70" step="5" value={wsx.dim} onChange={wsx.onDim} style={s('width:100%; accent-color:var(--accent);')} />
        <div style={s('font-size:10.5px; font-weight:600; color:var(--faint); margin-top:2px;')}>While resting, the screen dims after inactivity to save battery. Any tap wakes it instantly.</div>

        <button onClick={wsx.close} style={s('width:100%; margin-top:18px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:14px;')}>Done</button>
      </div>
    </>
  );
}

export function RpeSheet({ v }) {
  const rpe = v.rpe;
  return (
    <>
      <div style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:80;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:81; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; max-height:88%; overflow-y:auto; animation:slideUp .28s cubic-bezier(.22,1,.36,1) both;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:19px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>How hard was today's workout?</div>
        <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; margin-top:4px;')}>{rpe.dayLabel} · rate your effort from 1 to 10.</div>
        <div style={s('display:flex; flex-direction:column; gap:6px; margin-top:16px;')}>
          {rpe.scale.map((r, i) => (
            <div key={i} onClick={r.pick} style={s(`display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:13px; background:${r.rowBg}; cursor:pointer; transition:background .15s ease;`)}>
              <div style={s(`width:28px; height:28px; flex:none; border-radius:9px; background:${r.numBg}; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:${r.rowFg};`)}>{r.n}</div>
              <div style={s('display:flex; flex-direction:column;')}>
                <span style={s(`font-size:13.5px; font-weight:700; color:${r.rowFg}; line-height:1.2;`)}>{r.label}</span>
                <span style={s(`font-size:11px; font-weight:500; color:${r.subFg}; line-height:1.3;`)}>{r.sub}</span>
              </div>
            </div>
          ))}
        </div>
        {rpe.hasCardio && (
          <>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:18px 4px 8px;')}>Actual — adjust if needed</div>
            <div style={s('display:flex; flex-direction:column; gap:12px;')}>
              {rpe.cardio.map((c, i) => (
                <div key={i} style={s('background:var(--surface-2); border-radius:14px; padding:13px 14px;')}>
                  <div style={s('font-size:13px; font-weight:700; color:var(--text);')}>{c.name}</div>
                  <div style={s('display:flex; align-items:center; gap:10px; margin-top:10px;')}>
                    <span style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Min</span>
                    <input type="number" value={c.duration} onChange={c.onDuration} style={s("width:70px; border:1px solid var(--border); border-radius:10px; padding:8px 10px; background:var(--surface); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                  </div>
                  <div style={s('display:flex; gap:7px; margin-top:10px;')}>
                    {c.intensities.map((it, j) => (
                      <button key={j} onClick={it.pick} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:9px 0; border-radius:10px; background:${it.bg}; color:${it.color};`)}>{it.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:18px 4px 8px;')}>Notes (optional)</div>
        <textarea value={rpe.notes} onChange={rpe.onNotes} placeholder="Felt strong · slept poorly · weak today…" style={s('width:100%; min-height:56px; resize:none; border:1px solid var(--border); border-radius:14px; padding:12px 14px; background:var(--surface); font-family:inherit; font-size:16px; font-weight:500; color:var(--text); outline:none;')}></textarea>
        <button onClick={rpe.submit} disabled={rpe.submitDisabled} style={s(`width:100%; margin-top:16px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14.5px; font-weight:800; padding:15px 0; border-radius:14px; opacity:${rpe.submitOpacity};`)}>Log RPE</button>
      </div>
    </>
  );
}

export function RecoveryPrompt({ v }) {
  const recovery = v.recovery;
  return (
    <div style={s('position:absolute; inset:0; z-index:84; background:rgba(20,16,12,.5); display:flex; align-items:center; justify-content:center; padding:0 26px;')}>
      <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:24px 22px; max-width:320px; box-shadow:0 16px 44px rgba(0,0,0,.34); animation:zenIn .32s cubic-bezier(.22,1,.36,1) both;')}>
        <div style={s('display:flex; align-items:center; gap:8px;')}>
          <div style={s('width:9px; height:9px; border-radius:50%; background:var(--accent);')}></div>
          <div style={s('font-size:12px; font-weight:800; color:var(--accent); letter-spacing:.06em; text-transform:uppercase;')}>Recovery Alert</div>
        </div>
        <div style={s('font-size:12px; font-weight:600; color:var(--muted); margin-top:12px; line-height:1.5; font-style:italic;')}>{recovery.learnedLine}</div>
        <div style={s('font-size:16px; font-weight:700; color:var(--text); margin-top:10px; line-height:1.4; letter-spacing:-.01em; text-wrap:pretty;')}>{recovery.reason}</div>
        <div style={s('display:flex; flex-direction:column; gap:8px; margin-top:18px;')}>
          {recovery.options.map((op, i) => (
            <button key={i} onClick={op.pick} style={s('width:100%; border:1px solid var(--border); cursor:pointer; background:var(--surface-2); color:var(--text); font-family:inherit; font-size:13.5px; font-weight:700; padding:13px 0; border-radius:13px;')}>{op.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RecoveryView({ v }) {
  const rv = v.recoveryViewData;
  return (
    <div className="scrollable" style={s('position:absolute; inset:0; z-index:86; background:var(--bg); display:flex; flex-direction:column; overflow-y:auto; padding-top:env(safe-area-inset-top); padding-bottom:env(safe-area-inset-bottom);')}>
      <div style={s('flex:none; display:flex; align-items:center; gap:12px; padding:18px 20px 10px;')}>
        <button onClick={rv.close} style={s('width:34px; height:34px; flex:none; border:1px solid var(--border); background:var(--surface); border-radius:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text); padding:0;')}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
        </button>
        <div style={s('font-size:18px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Recovery Profile</div>
      </div>
      <div style={s('flex:1; padding:8px 20px 28px; display:flex; flex-direction:column; gap:14px;')}>
        <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:20px;')}>
          <div style={s('font-size:24px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{rv.toleranceLabel}</div>
          <div style={s('font-size:13px; font-weight:600; color:var(--accent); margin-top:3px;')}>{rv.toleranceSub}</div>
          <div style={s('height:1px; background:var(--border); margin:16px 0;')}></div>
          <div style={s('font-size:13px; font-weight:600; color:var(--text); line-height:1.6;')}>{rv.freqLine}</div>
          <div style={s('font-size:12.5px; font-weight:500; color:var(--muted); line-height:1.6; margin-top:2px;')}>{rv.loadLine}</div>
        </div>
        <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:20px;')}>
          <div style={s('display:flex; align-items:center; justify-content:space-between;')}>
            <span style={s('font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Confidence</span>
            <span style={s("font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text);")}>{rv.confPct}</span>
          </div>
          <div style={s('height:8px; border-radius:999px; background:var(--track); margin-top:10px; overflow:hidden;')}>
            <div style={s(`height:100%; width:${rv.confBarW}; background:var(--accent); border-radius:999px; transition:width .5s cubic-bezier(.22,1,.36,1);`)}></div>
          </div>
          <div style={s('font-size:12px; font-weight:500; color:var(--muted); margin-top:10px; line-height:1.5;')}>{rv.statusLine}</div>
        </div>
        <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:4px 4px 0;')}>Recovery history</div>
        {rv.hasLog && (
          <div style={s('display:flex; flex-direction:column; background:var(--surface); border:1px solid var(--border); border-radius:20px; overflow:hidden;')}>
            {rv.entries.map((e, i) => (
              <div key={i} style={s('display:flex; align-items:center; justify-content:space-between; padding:13px 16px; border-bottom:1px solid var(--border);')}>
                <div style={s('display:flex; flex-direction:column;')}>
                  <span style={s('font-size:13px; font-weight:700; color:var(--text);')}>{e.date} · {e.choice}</span>
                  <span style={s('font-size:11.5px; font-weight:500; color:var(--muted); margin-top:2px;')}>{e.suggested}</span>
                </div>
                <span style={s(`font-size:12px; font-weight:700; color:${e.outcomeColor};`)}>{e.outcome}</span>
              </div>
            ))}
          </div>
        )}
        {rv.noLog && (
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:22px; text-align:center; font-size:12.5px; font-weight:500; color:var(--muted); line-height:1.5;')}>No recovery data yet. Log a few workouts with RPE and your tolerance profile will build here.</div>
        )}
      </div>
    </div>
  );
}
