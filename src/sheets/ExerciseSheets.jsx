import { s } from '../lib/helpers';
import CardioFields from '../components/CardioFields';

export function ExerciseSheet({ v }) {
  const ef = v.ef;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeExSheet} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:40;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:41; max-height:94%; overflow-y:auto; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{ef.heading}</div>
        <div style={s('margin-top:16px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>{ef.nameLabel}</div>
          <input value={ef.name} onChange={ef.onName} placeholder="e.g. Bench Press" style={s('width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:16px; font-weight:700; color:var(--text); outline:none;')} />
        </div>
        {ef.isStrength && (
          <>
            <div style={s('display:flex; gap:9px; margin-top:12px;')}>
              <div style={s('flex:1;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Sets</div>
                <input type="number" value={ef.sets} onChange={ef.onSets} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
              {ef.notTimed && !ef.repRange && (
                <div style={s('flex:1;')}>
                  <div style={s('display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;')}>
                    <span style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Reps</span>
                    <button onClick={ef.toggleRange} style={s('border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:10.5px; font-weight:800; color:var(--accent); padding:0;')}>Range</button>
                  </div>
                  <input type="number" value={ef.reps} onChange={ef.onReps} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                </div>
              )}
              {ef.timedOn && (
                <div style={s('flex:1;')}>
                  <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Hold (sec)</div>
                  <input inputMode="numeric" value={ef.holdSecs} onChange={ef.onHoldSecs} aria-label="Hold time in seconds" style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                </div>
              )}
              <div style={s('flex:1.2;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>{ef.weightLabel}</div>
                <input type="number" value={ef.weight} onChange={ef.onWeight} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
            </div>
            {ef.notTimed && ef.repRange && (
              <div style={s('margin-top:12px;')}>
                <div style={s('display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;')}>
                  <span style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Rep range</span>
                  <button onClick={ef.toggleRange} style={s('border:none; background:var(--accent); border-radius:999px; cursor:pointer; font-family:inherit; font-size:10.5px; font-weight:800; color:#fff; padding:3px 9px;')}>Range ✓</button>
                </div>
                <div style={s('display:flex; align-items:center; gap:9px;')}>
                  <input type="number" value={ef.repsMin} onChange={ef.onRepsMin} aria-label="Minimum reps" placeholder="min" style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                  <span style={s('font-size:14px; font-weight:800; color:var(--muted);')}>–</span>
                  <input type="number" value={ef.repsMax} onChange={ef.onRepsMax} aria-label="Maximum reps" placeholder="max" style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                </div>
                <div style={s('font-size:11px; font-weight:600; color:' + (ef.rangeErr ? '#B0715E' : 'var(--muted)') + '; margin-top:6px;')}>{ef.rangeErr || 'A target only — you log the reps you actually do.'}</div>
              </div>
            )}
            {!!ef.bwNote && (
              <div style={s('font-size:11.5px; font-weight:600; color:var(--muted); margin-top:8px;')}>{ef.bwNote}</div>
            )}
            <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:14px; background:var(--surface-2); border-radius:12px; padding:12px 14px;')}>
              <span style={s('font-size:12px; font-weight:700; color:var(--muted);')}>{ef.volumeLabel}</span>
              <span style={s("font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--accent);")}>{ef.volume}</span>
            </div>
            {/* #56 — pair this exercise with another, or chase each set with a dropset */}
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin:18px 0 8px;')}>Configure</div>
            <button onClick={ef.toggleSuperset} style={s('width:100%; display:flex; align-items:center; gap:11px; text-align:left; border:1px solid var(--border); background:var(--surface-2); cursor:pointer; font-family:inherit; padding:12px 13px; border-radius:12px;')}>
              <span style={s(`width:20px; height:20px; flex:none; border-radius:6px; border:2px solid ${ef.supersetOn ? 'var(--accent)' : 'var(--border)'}; background:${ef.supersetOn ? 'var(--accent)' : 'transparent'}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:800;`)}>{ef.supersetOn ? '✓' : ''}</span>
              <span style={s('flex:1; min-width:0;')}>
                <span style={s('display:block; font-size:13px; font-weight:700; color:var(--text);')}>Superset with another exercise</span>
                <span style={s('display:block; font-size:11px; font-weight:500; color:var(--muted); margin-top:1px;')}>Both performed back-to-back, no rest between them</span>
              </span>
            </button>
            {ef.supersetOn && (
              <div style={s('display:flex; flex-wrap:wrap; gap:7px; margin-top:9px;')}>
                {ef.supersetChoices.map((c, i) => (
                  <button key={i} onClick={c.pick} style={s(`border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:9px 13px; border-radius:999px; background:${c.bg}; color:${c.color};`)}>{c.label}</button>
                ))}
                {!ef.pickingPartner && (
                  <button onClick={ef.openPartnerDb} style={s('border:1px dashed var(--border); cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:8px 13px; border-radius:999px; background:transparent; color:var(--accent);')}>+ From database</button>
                )}
              </div>
            )}
            {!!ef.partnerAddNote && (
              <div style={s('font-size:11.5px; font-weight:600; color:var(--muted); margin-top:7px;')}>{ef.partnerAddNote}</div>
            )}
            {ef.pickingPartner && (
              <div style={s('margin-top:9px; border:1px solid var(--border); border-radius:14px; padding:12px; background:var(--surface);')}>
                <div style={s('display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;')}>
                  <span style={s('font-size:12px; font-weight:800; color:var(--text);')}>Pick a superset partner</span>
                  <button onClick={ef.closePartnerDb} style={s('border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; color:var(--muted); padding:0;')}>Close</button>
                </div>
                <input value={ef.partnerQuery} onChange={ef.onPartnerQuery} placeholder="Search the Exercise Database" aria-label="Search exercises" style={s('width:100%; border:1px solid var(--border); border-radius:10px; padding:9px 11px; background:var(--surface-2); font-family:inherit; font-size:16px; font-weight:600; color:var(--text); outline:none;')} />
                <div style={s('display:flex; gap:6px; overflow-x:auto; margin-top:8px; padding-bottom:2px;')}>
                  {ef.partnerParts.map((b, i) => (
                    <button key={i} onClick={b.pick} style={s(`flex:none; border:none; cursor:pointer; font-family:inherit; font-size:11px; font-weight:700; padding:6px 10px; border-radius:999px; background:${b.bg}; color:${b.color};`)}>{b.label}</button>
                  ))}
                </div>
                <div className="scrollable" style={s('max-height:200px; overflow-y:auto; margin-top:6px;')}>
                  {ef.partnerList.map((x, i) => (
                    <button key={i} onClick={x.pick} style={s(`width:100%; display:flex; align-items:center; justify-content:space-between; gap:8px; text-align:left; border:none; border-bottom:1px solid ${x.divider}; background:transparent; cursor:pointer; font-family:inherit; padding:9px 2px;`)}>
                      <span style={s('font-size:13px; font-weight:700; color:var(--text); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{x.name}</span>
                      <span style={s('flex:none; font-size:10.5px; font-weight:600; color:var(--muted);')}>{x.onDay ? 'On this day' : x.part}</span>
                    </button>
                  ))}
                  {ef.partnerEmpty && (
                    <div style={s('font-size:12px; color:var(--muted); font-weight:500; padding:10px 2px;')}>No exercises match.</div>
                  )}
                </div>
              </div>
            )}
            <button onClick={ef.toggleTimed} style={s('width:100%; margin-top:9px; display:flex; align-items:center; gap:11px; text-align:left; border:1px solid var(--border); background:var(--surface-2); cursor:pointer; font-family:inherit; padding:12px 13px; border-radius:12px;')}>
              <span style={s(`width:20px; height:20px; flex:none; border-radius:6px; border:2px solid ${ef.timedOn ? 'var(--accent)' : 'var(--border)'}; background:${ef.timedOn ? 'var(--accent)' : 'transparent'}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:800;`)}>{ef.timedOn ? '✓' : ''}</span>
              <span style={s('flex:1; min-width:0;')}>
                <span style={s('display:block; font-size:13px; font-weight:700; color:var(--text);')}>Timed hold</span>
                <span style={s('display:block; font-size:11px; font-weight:500; color:var(--muted); margin-top:1px;')}>Plank, dead hang, wall sit — log seconds instead of reps</span>
              </span>
            </button>
            {ef.notTimed && (
              <button onClick={ef.toggleBw} style={s('width:100%; margin-top:9px; display:flex; align-items:center; gap:11px; text-align:left; border:1px solid var(--border); background:var(--surface-2); cursor:pointer; font-family:inherit; padding:12px 13px; border-radius:12px;')}>
                <span style={s(`width:20px; height:20px; flex:none; border-radius:6px; border:2px solid ${ef.bwOn ? 'var(--accent)' : 'var(--border)'}; background:${ef.bwOn ? 'var(--accent)' : 'transparent'}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:800;`)}>{ef.bwOn ? '✓' : ''}</span>
                <span style={s('flex:1; min-width:0;')}>
                  <span style={s('display:block; font-size:13px; font-weight:700; color:var(--text);')}>Bodyweight exercise</span>
                  <span style={s('display:block; font-size:11px; font-weight:500; color:var(--muted); margin-top:1px;')}>Your body weight counts as load; weight is added on top</span>
                </span>
              </button>
            )}
            {ef.notTimed && (
            <button onClick={ef.toggleDropset} style={s('width:100%; margin-top:9px; display:flex; align-items:center; gap:11px; text-align:left; border:1px solid var(--border); background:var(--surface-2); cursor:pointer; font-family:inherit; padding:12px 13px; border-radius:12px;')}>
              <span style={s(`width:20px; height:20px; flex:none; border-radius:6px; border:2px solid ${ef.dropsetOn ? 'var(--accent)' : 'var(--border)'}; background:${ef.dropsetOn ? 'var(--accent)' : 'transparent'}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:800;`)}>{ef.dropsetOn ? '✓' : ''}</span>
              <span style={s('flex:1; min-width:0;')}>
                <span style={s('display:block; font-size:13px; font-weight:700; color:var(--text);')}>Dropset</span>
                <span style={s('display:block; font-size:11px; font-weight:500; color:var(--muted); margin-top:1px;')}>Lighter follow-up straight after each working set</span>
              </span>
            </button>
            )}
            {ef.notTimed && ef.dropsetOn && (
              <>
                <div style={s('display:flex; gap:7px; margin-top:9px;')}>
                  {ef.dropPcts.map((d, i) => (
                    <button key={i} onClick={d.pick} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:9px 0; border-radius:10px; background:${d.bg}; color:${d.color};`)}>{d.label}</button>
                  ))}
                </div>
                {!!ef.dropPreview && (
                  <div style={s('font-size:11.5px; font-weight:600; color:var(--muted); margin-top:7px;')}>{ef.dropPreview}</div>
                )}
              </>
            )}
          </>
        )}
        {ef.isCardio && <CardioFields c={ef} />}
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
          <input value={dbf.name} onChange={dbf.onName} placeholder="e.g. Bench Press" style={s('width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:16px; font-weight:700; color:var(--text); outline:none;')} />
        </div>
        <div style={s('margin-top:12px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Description</div>
          <textarea value={dbf.description} onChange={dbf.onDescription} placeholder="Cues, setup, form notes…" style={s('width:100%; min-height:90px; resize:none; border:1px solid var(--border); border-radius:14px; padding:12px 14px; background:var(--surface-2); font-family:inherit; font-size:16px; font-weight:500; color:var(--text); outline:none;')}></textarea>
        </div>
        <div style={s('margin-top:12px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Equipment</div>
          <div style={s('display:flex; flex-direction:column; gap:8px;')}>
            {dbf.equipment.map((eq, i) => (
              <div key={i} style={s('display:flex; align-items:center; gap:8px;')}>
                <input value={eq.value} onChange={eq.onInput} placeholder="e.g. Barbell, flat bench" style={s('flex:1; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:16px; font-weight:600; color:var(--text); outline:none;')} />
                <button onClick={eq.remove} aria-label="Remove option" style={s(`width:44px; height:44px; flex:none; border:1px solid var(--border); background:transparent; border-radius:10px; cursor:pointer; color:#EF4444; font-size:17px; line-height:1; align-items:center; justify-content:center; display:${eq.removeDisplay};`)}>×</button>
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
            <input type="number" value={paf.sets} onChange={paf.onSets} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
          </div>
          <div style={s('flex:1;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Reps</div>
            <input type="number" value={paf.reps} onChange={paf.onReps} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
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
        <CardioFields c={caf} />
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
