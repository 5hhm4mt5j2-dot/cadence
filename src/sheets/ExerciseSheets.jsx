import React from 'react';
import { s } from '../lib/helpers';

export function ExerciseSheet({ v }) {
  const ef = v.ef;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeExSheet} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:40;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:41; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{ef.heading}</div>
        <div style={s('margin-top:16px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>{ef.nameLabel}</div>
          <input value={ef.name} onChange={ef.onName} placeholder="e.g. Bench Press" style={s('width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:14px; font-weight:700; color:var(--text); outline:none;')} />
        </div>
        {ef.isStrength && (
          <>
            <div style={s('display:flex; gap:9px; margin-top:12px;')}>
              <div style={s('flex:1;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Sets</div>
                <input type="number" value={ef.sets} onChange={ef.onSets} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
              <div style={s('flex:1;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Reps</div>
                <input type="number" value={ef.reps} onChange={ef.onReps} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
              <div style={s('flex:1.2;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Weight (kg)</div>
                <input type="number" value={ef.weight} onChange={ef.onWeight} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
            </div>
            <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:14px; background:var(--surface-2); border-radius:12px; padding:12px 14px;')}>
              <span style={s('font-size:12px; font-weight:700; color:var(--muted);')}>Exercise volume</span>
              <span style={s("font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--accent);")}>{ef.volume}</span>
            </div>
          </>
        )}
        {ef.isCardio && (
          <>
            <div style={s('margin-top:12px;')}>
              <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Duration (min)</div>
              <input type="number" value={ef.duration} onChange={ef.onDuration} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
            </div>
            <div style={s('margin-top:14px;')}>
              <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Intensity</div>
              <div style={s('display:flex; gap:8px;')}>
                {ef.intensities.map((it, i) => (
                  <button key={i} onClick={it.pick} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; padding:11px 0; border-radius:11px; background:${it.bg}; color:${it.color};`)}>{it.label}</button>
                ))}
              </div>
            </div>
          </>
        )}
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:20px;')}>
          <button onClick={v.deleteExercise} style={s(`border:none; cursor:pointer; background:transparent; font-family:inherit; font-size:13px; font-weight:700; color:#EF4444; padding:10px 4px; display:${ef.deleteDisplay};`)}>Delete</button>
          <button onClick={v.browseDb} aria-label="Browse database" style={s(`display:${ef.browseDisplay}; align-items:center; gap:6px; border:1px solid var(--border); cursor:pointer; background:var(--surface-2); color:var(--text); font-family:inherit; font-size:13px; font-weight:700; padding:10px 14px; border-radius:12px; margin-right:9px;`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>Browse</button>
          <button onClick={v.saveExercise} style={s('border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:700; padding:11px 30px; border-radius:12px; margin-left:auto;')}>Save</button>
        </div>
      </div>
    </>
  );
}

export function DbFormSheet({ v }) {
  const dbf = v.dbf;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeDbForm} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:48;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:49; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{dbf.heading}</div>
        <div style={s('margin-top:16px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Exercise</div>
          <input value={dbf.name} onChange={dbf.onName} placeholder="e.g. Bench Press" style={s('width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:14px; font-weight:700; color:var(--text); outline:none;')} />
        </div>
        <div style={s('margin-top:12px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Description</div>
          <textarea value={dbf.description} onChange={dbf.onDescription} placeholder="Cues, setup, form notes…" style={s('width:100%; min-height:90px; resize:none; border:1px solid var(--border); border-radius:14px; padding:12px 14px; background:var(--surface-2); font-family:inherit; font-size:13px; font-weight:500; color:var(--text); outline:none;')}></textarea>
        </div>
        <div style={s('margin-top:12px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Equipment</div>
          <div style={s('display:flex; flex-direction:column; gap:8px;')}>
            {dbf.equipment.map((eq, i) => (
              <div key={i} style={s('display:flex; align-items:center; gap:8px;')}>
                <input value={eq.value} onChange={eq.onInput} placeholder="e.g. Barbell, flat bench" style={s('flex:1; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:13px; font-weight:600; color:var(--text); outline:none;')} />
                <button onClick={eq.remove} aria-label="Remove option" style={s(`width:34px; height:34px; flex:none; border:1px solid var(--border); background:transparent; border-radius:10px; cursor:pointer; color:#EF4444; font-size:17px; line-height:1; align-items:center; justify-content:center; display:${eq.removeDisplay};`)}>×</button>
              </div>
            ))}
          </div>
          <button onClick={dbf.addEquipmentOption} style={s('margin-top:8px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--accent); padding:4px 2px;')}>+ Add option</button>
        </div>
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:20px;')}>
          <button onClick={v.deleteDbExercise} style={s(`border:none; cursor:pointer; background:transparent; font-family:inherit; font-size:13px; font-weight:700; color:#EF4444; padding:10px 4px; display:${dbf.deleteDisplay};`)}>Delete</button>
          <button onClick={v.saveDbExercise} style={s('border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:700; padding:11px 30px; border-radius:12px; margin-left:auto;')}>Save</button>
        </div>
      </div>
    </>
  );
}

export function ProgramAddSheet({ v }) {
  const paf = v.paf;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeProgramAdd} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:50;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:51; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; max-height:90%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Add to Program</div>
        <div style={s('font-size:12.5px; color:var(--muted); font-weight:600; margin-top:2px;')}>{paf.name}</div>
        {paf.hasVariants && (
          <div style={s('margin-top:18px;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Attachment</div>
            <div style={s('display:flex; gap:8px; flex-wrap:wrap;')}>
              {paf.variants.map((vr, i) => (
                <button key={i} onClick={vr.pick} style={s(`border:none; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; padding:9px 14px; border-radius:11px; background:${vr.bg}; color:${vr.color};`)}>{vr.label}</button>
              ))}
            </div>
          </div>
        )}
        <div style={s('display:flex; gap:9px; margin-top:18px;')}>
          <div style={s('flex:1;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Sets</div>
            <input type="number" value={paf.sets} onChange={paf.onSets} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
          </div>
          <div style={s('flex:1;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Reps</div>
            <input type="number" value={paf.reps} onChange={paf.onReps} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
          </div>
        </div>
        <div style={s('margin-top:18px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Add to day</div>
          <div style={s('display:flex; flex-direction:column; gap:8px;')}>
            {paf.days.map((d, i) => (
              <button key={i} onClick={d.pick} style={s(`text-align:left; border:none; cursor:pointer; font-family:inherit; padding:12px 14px; border-radius:12px; background:${d.bg}; color:${d.color}; display:flex; align-items:center; justify-content:space-between; gap:10px;`)}>
                <span style={s('font-size:13.5px; font-weight:700;')}>{d.label}</span>
                <span style={s('font-size:11px; font-weight:600; opacity:.75;')}>{d.sub}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={v.confirmProgramAdd} style={s('width:100%; margin-top:22px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Add to {paf.dayLabel}</button>
      </div>
    </>
  );
}

export function CardioAddSheet({ v }) {
  const caf = v.caf;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeCardioAdd} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:50;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:51; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; max-height:90%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Add Cardio</div>
        <div style={s('font-size:12.5px; color:var(--muted); font-weight:600; margin-top:2px;')}>{caf.name}</div>
        <div style={s('display:flex; gap:9px; margin-top:18px; align-items:flex-end;')}>
          <div style={s('flex:1;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Duration (min)</div>
            <input type="number" value={caf.duration} onChange={caf.onDuration} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
          </div>
        </div>
        <div style={s('margin-top:16px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Intensity</div>
          <div style={s('display:flex; gap:8px;')}>
            {caf.intensities.map((it, i) => (
              <button key={i} onClick={it.pick} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; padding:11px 0; border-radius:11px; background:${it.bg}; color:${it.color};`)}>{it.label}</button>
            ))}
          </div>
        </div>
        <div style={s('margin-top:18px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Add to day</div>
          <div style={s('display:flex; flex-direction:column; gap:8px;')}>
            {caf.days.map((d, i) => (
              <button key={i} onClick={d.pick} style={s(`text-align:left; border:none; cursor:pointer; font-family:inherit; padding:12px 14px; border-radius:12px; background:${d.bg}; color:${d.color}; display:flex; align-items:center; justify-content:space-between; gap:10px;`)}>
                <span style={s('font-size:13.5px; font-weight:700;')}>{d.label}</span>
                <span style={s('font-size:11px; font-weight:600; opacity:.75;')}>{d.sub}</span>
              </button>
            ))}
          </div>
        </div>
        {caf.hasFinisher && (
          <div style={s('margin-top:14px; background:var(--accent-soft); border-radius:12px; padding:11px 14px; font-size:12px; font-weight:600; color:var(--text); line-height:1.45;')}>{caf.finisherNote}</div>
        )}
        <button onClick={v.confirmCardioAdd} style={s('width:100%; margin-top:22px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Add to {caf.dayLabel}</button>
      </div>
    </>
  );
}
