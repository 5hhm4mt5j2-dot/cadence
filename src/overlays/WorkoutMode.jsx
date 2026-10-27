import { s } from '../lib/helpers';

export default function WorkoutMode({ v }) {
  const wo = v.wo;
  return (
    <div onTouchStart={wo.activity} onMouseDown={wo.activity} style={s(`position:absolute; inset:0; z-index:70; background:var(--bg); display:flex; flex-direction:column; padding-bottom:env(safe-area-inset-bottom); transition:filter .5s ease; filter:${wo.dim};`)}>
      {/* idle-dim veil — sits above the UI but below the rest timer (z-index:11) so the countdown stays bright */}
      <div style={s(`position:absolute; inset:0; background:#000; opacity:${wo.dimVeil}; pointer-events:none; z-index:5; transition:opacity .5s ease;`)}></div>
      <div style={s('height:max(52px, env(safe-area-inset-top)); flex:none;')}></div>
      <div style={s('flex:none; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding:6px 20px 0;')}>
        <div style={s('min-width:0; display:flex; align-items:center; height:36px;')}>
          <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.07em;')}>Workout · {wo.dayLabel}</div>
        </div>
        <div style={s('display:flex; align-items:center; gap:7px; flex:none;')}>
          {wo.canRestart && (
            <button onClick={wo.askRestart} aria-label="Restart workout" style={s('height:36px; padding:0 13px; border-radius:999px; border:1px solid var(--border); background:var(--surface); cursor:pointer; color:var(--muted); font-size:12px; font-weight:700; font-family:inherit;')}>Restart</button>
          )}
          <button onClick={wo.openOverview} aria-label="Workout overview" style={s('width:44px; height:44px; flex:none; border-radius:50%; border:1px solid var(--border); background:var(--surface); cursor:pointer; color:var(--muted); display:inline-flex; align-items:center; justify-content:center; padding:0;')}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M1.8 12S5.5 5.5 12 5.5 22.2 12 22.2 12 18.5 18.5 12 18.5 1.8 12 1.8 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button onClick={wo.exit} aria-label="Exit workout" style={s('width:44px; height:44px; flex:none; border-radius:50%; border:1px solid var(--border); background:var(--surface); cursor:pointer; color:var(--muted); font-size:14px; line-height:1; font-weight:700; font-family:inherit;')}>✕</button>
        </div>
      </div>

      {/* set logger */}
      {wo.phaseSet && (
        <div style={s('flex:1; display:flex; flex-direction:column; justify-content:center; gap:18px; padding:0 22px 26px;')}>
          <div style={s('font-size:24px; font-weight:800; color:var(--text); letter-spacing:-.02em; text-align:center; line-height:1.25; overflow:hidden; text-overflow:ellipsis;')}>{wo.exName}</div>
          <div style={s('display:flex; align-items:center; justify-content:center; gap:8px;')}>
            {wo.dots.map((dt, i) => (<span key={i} style={s(`width:9px; height:9px; border-radius:50%; background:${dt.bg}; transition:background .2s ease;`)}></span>))}
          </div>
          <div style={s('text-align:center;')}>
            <div style={s('font-size:16px; font-weight:800; color:var(--text);')}>{wo.setLine}</div>
            <div style={s('font-size:12px; font-weight:600; color:var(--muted); margin-top:3px;')}>{wo.targetLine}</div>
            {!!wo.lastUsedLine && (
              <div style={s("font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; color:var(--accent); margin-top:4px;")}>{wo.lastUsedLine}</div>
            )}
            {!!wo.supersetLine && (
              <div style={s('display:inline-block; margin-top:7px; font-size:11px; font-weight:800; color:var(--accent); background:var(--accent-soft); padding:5px 11px; border-radius:999px;')}>{wo.supersetLine}</div>
            )}
          </div>
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:18px; box-shadow:var(--shadow); display:flex; flex-direction:column; gap:14px;')}>
            <div style={s('display:flex; align-items:center; gap:10px;')}>
              <span style={s('width:44px; flex:none; font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Reps</span>
              <button onMouseDown={wo.repsDecDown} onTouchStart={wo.repsDecDown} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none; -webkit-user-select:none; transition:transform .1s ease;')}>−</button>
              <input value={wo.reps} onChange={wo.onReps} onTouchStart={wo.valTS} onTouchEnd={wo.repsSwipe} inputMode="decimal" aria-label="Reps" style={s("flex:1; min-width:0; height:54px; border:none; outline:none; border-radius:16px; background:var(--surface-2); text-align:center; font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; color:var(--text);")} />
              <button onMouseDown={wo.repsIncDown} onTouchStart={wo.repsIncDown} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none; -webkit-user-select:none; transition:transform .1s ease;')}>+</button>
            </div>
            <div style={s('display:flex; align-items:center; gap:10px;')}>
              <span style={s('width:44px; flex:none; font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Kg</span>
              <button onMouseDown={wo.wDecDown} onTouchStart={wo.wDecDown} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none; -webkit-user-select:none; transition:transform .1s ease;')}>−</button>
              <input value={wo.weight} onChange={wo.onWeight} onTouchStart={wo.valTS} onTouchEnd={wo.weightSwipe} inputMode="decimal" aria-label="Weight in kg" style={s("flex:1; min-width:0; height:54px; border:none; outline:none; border-radius:16px; background:var(--surface-2); text-align:center; font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; color:var(--text);")} />
              <button onMouseDown={wo.wIncDown} onTouchStart={wo.wIncDown} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none; -webkit-user-select:none; transition:transform .1s ease;')}>+</button>
            </div>
            <div style={s('font-size:10.5px; font-weight:600; color:var(--faint); text-align:center;')}>Hold − / + for rapid change · swipe a value up or down to nudge</div>
          </div>
          <div style={s('display:flex; gap:9px;')}>
            <button onClick={wo.skipSet} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--muted); font-family:inherit; font-size:13.5px; font-weight:700; padding:15px 0; border-radius:15px;')}>Skip set</button>
            <button onClick={wo.logSet} style={s('flex:2; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:14.5px; font-weight:800; padding:15px 0; border-radius:15px; transition:transform .1s ease;')}>{wo.logLabel}</button>
          </div>
          {wo.hasEditable && (
            <button onClick={wo.editLast} style={s('align-self:center; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--muted); padding:2px 8px;')}>Fix last set (set {wo.lastSetN})</button>
          )}
        </div>
      )}

      {/* #56 — dropset prompt: log the lighter follow-up against the set just finished */}
      {wo.phaseDrop && (
        <div style={s('flex:1; display:flex; flex-direction:column; justify-content:center; gap:16px; padding:0 22px 26px;')}>
          <div style={s('text-align:center;')}>
            <div style={s('font-size:11px; font-weight:800; color:var(--accent); text-transform:uppercase; letter-spacing:.08em;')}>Dropset</div>
            <div style={s('font-size:22px; font-weight:800; color:var(--text); letter-spacing:-.02em; margin-top:5px;')}>{wo.dropExName}</div>
            <div style={s('font-size:12px; font-weight:600; color:var(--muted); margin-top:4px;')}>{wo.dropSub}</div>
          </div>
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:18px; box-shadow:var(--shadow); display:flex; flex-direction:column; gap:14px;')}>
            <div style={s('display:flex; align-items:center; gap:10px;')}>
              <span style={s('width:44px; flex:none; font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Reps</span>
              <button onMouseDown={wo.dropRepsDec} onTouchStart={wo.dropRepsDec} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none;')}>−</button>
              <input value={wo.dropReps} onChange={wo.onDropReps} inputMode="decimal" aria-label="Dropset reps" style={s("flex:1; min-width:0; height:54px; border:none; outline:none; border-radius:16px; background:var(--surface-2); text-align:center; font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; color:var(--text);")} />
              <button onMouseDown={wo.dropRepsInc} onTouchStart={wo.dropRepsInc} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none;')}>+</button>
            </div>
            <div style={s('display:flex; align-items:center; gap:10px;')}>
              <span style={s('width:44px; flex:none; font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Kg</span>
              <button onMouseDown={wo.dropWDec} onTouchStart={wo.dropWDec} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none;')}>−</button>
              <input value={wo.dropWeight} onChange={wo.onDropWeight} inputMode="decimal" aria-label="Dropset weight in kg" style={s("flex:1; min-width:0; height:54px; border:none; outline:none; border-radius:16px; background:var(--surface-2); text-align:center; font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; color:var(--text);")} />
              <button onMouseDown={wo.dropWInc} onTouchStart={wo.dropWInc} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none;')}>+</button>
            </div>
          </div>
          <div style={s('display:flex; gap:9px;')}>
            <button onClick={wo.skipDrop} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--muted); font-family:inherit; font-size:13.5px; font-weight:700; padding:15px 0; border-radius:15px;')}>Skip dropset</button>
            <button onClick={wo.logDrop} style={s('flex:2; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:14.5px; font-weight:800; padding:15px 0; border-radius:15px;')}>Log dropset</button>
          </div>
        </div>
      )}

      {/* rest timer */}
      {wo.phaseRest && (
        <div style={s('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; padding:0 24px 26px;')}>
          <div style={s('text-align:center;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.09em;')}>Rest</div>
            <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em; margin-top:4px;')}>{wo.exName}</div>
            <div style={s("font-family:'JetBrains Mono',monospace; font-size:11.5px; font-weight:700; color:var(--accent); margin-top:5px;")}>{wo.justLogged}</div>
          </div>
          <div onClick={wo.togglePause} style={s('position:relative; z-index:11; width:224px; height:224px; cursor:pointer;')}>
            <svg width="224" height="224" viewBox="0 0 224 224" style={s('transform:rotate(-90deg);')}>
              <circle cx="112" cy="112" r="98" fill="none" stroke="var(--track)" strokeWidth="10"></circle>
              <circle cx="112" cy="112" r="98" fill="none" stroke={wo.arcColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={wo.circ} strokeDashoffset={wo.dash} style={s('transition:stroke-dashoffset 1s linear, stroke .3s ease;')}></circle>
            </svg>
            <div style={s('position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;')}>
              <div style={s("font-family:'JetBrains Mono',monospace; font-size:48px; font-weight:700; color:var(--text); letter-spacing:-.03em;")}>{wo.time}</div>
              <div style={s('font-size:11px; font-weight:600; color:var(--faint);')}>{wo.pauseHint}</div>
            </div>
          </div>
          <div style={s('font-size:12.5px; font-weight:600; color:var(--muted); text-align:center;')}>{wo.restSub}</div>
          <div style={s(`display:flex; gap:9px; width:100%; opacity:${wo.ctlOpacity}; transition:opacity .5s ease;`)}>
            <button onClick={wo.minus30} style={s("flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; padding:14px 0; border-radius:14px;")}>−30s</button>
            <button onClick={wo.skipRest} style={s('flex:1.4; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:13.5px; font-weight:800; padding:14px 0; border-radius:14px;')}>Skip rest</button>
            <button onClick={wo.plus30} style={s("flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; padding:14px 0; border-radius:14px;")}>+30s</button>
          </div>
          {wo.hasEditable && (
            <button onClick={wo.editLast} style={s(`border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--muted); padding:2px 8px; opacity:${wo.ctlOpacity}; transition:opacity .5s ease;`)}>Edit set {wo.lastSetN}</button>
          )}
        </div>
      )}

      {/* edit last set (timer keeps running) */}
      {wo.editing && (
        <div style={s('flex:1; display:flex; flex-direction:column; justify-content:center; gap:16px; padding:0 22px 26px;')}>
          <div style={s('text-align:center;')}>
            <div style={s('font-size:16px; font-weight:800; color:var(--text);')}>{wo.editExName} — edit set {wo.editN}</div>
            <div style={s('font-size:12px; font-weight:600; color:var(--muted); margin-top:3px;')}>{wo.editSub}</div>
          </div>
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:22px; padding:18px; box-shadow:var(--shadow); display:flex; flex-direction:column; gap:14px;')}>
            <div style={s('display:flex; align-items:center; gap:10px;')}>
              <span style={s('width:44px; flex:none; font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Reps</span>
              <button onMouseDown={wo.repsDecDown} onTouchStart={wo.repsDecDown} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none; -webkit-user-select:none;')}>−</button>
              <input value={wo.esReps} onChange={wo.onEsReps} inputMode="decimal" aria-label="Reps" style={s("flex:1; min-width:0; height:54px; border:none; outline:none; border-radius:16px; background:var(--surface-2); text-align:center; font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; color:var(--text);")} />
              <button onMouseDown={wo.repsIncDown} onTouchStart={wo.repsIncDown} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none; -webkit-user-select:none;')}>+</button>
            </div>
            <div style={s('display:flex; align-items:center; gap:10px;')}>
              <span style={s('width:44px; flex:none; font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Kg</span>
              <button onMouseDown={wo.wDecDown} onTouchStart={wo.wDecDown} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none; -webkit-user-select:none;')}>−</button>
              <input value={wo.esWeight} onChange={wo.onEsWeight} inputMode="decimal" aria-label="Weight in kg" style={s("flex:1; min-width:0; height:54px; border:none; outline:none; border-radius:16px; background:var(--surface-2); text-align:center; font-family:'JetBrains Mono',monospace; font-size:26px; font-weight:700; color:var(--text);")} />
              <button onMouseDown={wo.wIncDown} onTouchStart={wo.wIncDown} onMouseUp={wo.holdEnd} onMouseLeave={wo.holdEnd} onTouchEnd={wo.holdEnd} onTouchCancel={wo.holdEnd} style={s('width:54px; height:54px; flex:none; border:none; border-radius:16px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:26px; font-weight:600; font-family:inherit; user-select:none; -webkit-user-select:none;')}>+</button>
            </div>
          </div>
          <div style={s('display:flex; gap:9px;')}>
            <button onClick={wo.editCancel} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--muted); font-family:inherit; font-size:13.5px; font-weight:700; padding:15px 0; border-radius:15px;')}>Cancel</button>
            <button onClick={wo.editSave} style={s('flex:2; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:14.5px; font-weight:800; padding:15px 0; border-radius:15px;')}>Save set</button>
          </div>
          <button onClick={wo.editUndo} style={s('align-self:center; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--danger, #c0564a); padding:2px 8px;')}>Undo &amp; re-log this set</button>
        </div>
      )}

      {/* rest complete */}
      {wo.phaseReady && (
        <div style={s('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; padding:0 24px 26px;')}>
          <span style={s('width:72px; height:72px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; animation:wRing .4s cubic-bezier(.34,1.56,.64,1) both;')}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span>
          <div style={s('text-align:center;')}>
            <div style={s('font-size:22px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Ready!</div>
            <div style={s('font-size:12.5px; font-weight:600; color:var(--muted); margin-top:4px;')}>Rest complete — back to work.</div>
          </div>
          <button onClick={wo.startSet} style={s('width:100%; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:15px; font-weight:800; padding:16px 0; border-radius:16px; transition:transform .1s ease;')}>{wo.startNLabel}</button>
          <button onClick={wo.restMore} style={s('border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--muted); padding:2px 8px;')}>Rest more</button>
        </div>
      )}

      {/* summary */}
      {wo.phaseSummary && (
        <div className="scrollable" style={s('flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:14px; padding:16px 22px 26px;')}>
          <div style={s('text-align:center; padding-top:8px;')}>
            <div style={s('font-size:22px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Workout complete</div>
            <div style={s('font-size:12.5px; font-weight:600; color:var(--muted); margin-top:4px;')}>Every set logged. Strong work.</div>
          </div>
          <div style={s('background:var(--accent); border-radius:18px; padding:18px 20px; color:#fff; display:flex; align-items:center; justify-content:space-between; gap:10px;')}>
            <div style={s('font-size:11.5px; font-weight:700; opacity:.85; text-transform:uppercase; letter-spacing:.06em;')}>Total volume lifted</div>
            <div style={s("font-family:'JetBrains Mono',monospace; font-size:24px; font-weight:700; letter-spacing:-.02em;")}>{wo.totVol}</div>
          </div>
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:4px 16px; box-shadow:var(--shadow);')}>
            {wo.sumRows.map((sr, i) => (
              <div key={i} style={s(`display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 0; border-bottom:1px solid ${sr.divider};`)}>
                <div style={s('min-width:0;')}>
                  <div style={s('font-size:13.5px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{sr.name}</div>
                  <div style={s('font-size:11.5px; font-weight:600; color:var(--muted); margin-top:2px;')}>{sr.detail}</div>
                </div>
                <div style={s("font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--text); flex:none;")}>{sr.vol}</div>
              </div>
            ))}
          </div>
          {wo.hasEditable && (
            <button onClick={wo.editLast} style={s('align-self:center; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--muted); padding:2px 8px;')}>Fix last set (set {wo.lastSetN})</button>
          )}
          <button onClick={wo.finish} style={s('width:100%; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14.5px; font-weight:800; padding:16px 0; border-radius:16px; margin-top:4px;')}>Finish &amp; rate effort</button>
        </div>
      )}

      {/* #58 — read-only overview; tapping anywhere returns to the set in progress */}
      {wo.overviewOpen && (
        <div onClick={wo.closeOverview} style={s('position:absolute; inset:0; z-index:40; background:rgba(0,0,0,.45); display:flex; flex-direction:column; justify-content:flex-end;')}>
          <div className="scrollable" style={s('background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.3); padding:12px 20px 24px; max-height:86%; overflow-y:auto; animation:slideUp .26s cubic-bezier(.22,1,.36,1) both;')}>
            <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 14px;')}></div>
            <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{wo.overviewTitle}</div>
            <div style={s('font-size:12px; font-weight:600; color:var(--muted); margin-top:3px;')}>{wo.overviewSub}</div>
            <div style={s('display:flex; flex-direction:column; gap:10px; margin-top:14px;')}>
              {wo.overviewRows.map((r, i) => (
                <div key={i} style={s(`background:${r.rowBg}; border-radius:14px; padding:12px 14px;`)}>
                  <div style={s('display:flex; align-items:center; gap:7px;')}>
                    <span style={s(`font-size:13.5px; font-weight:800; color:${r.nameColor}; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;`)}>{r.name}</span>
                    {r.current && <span style={s('flex:none; font-size:9.5px; font-weight:800; color:#fff; background:var(--accent); padding:3px 7px; border-radius:999px; text-transform:uppercase; letter-spacing:.05em;')}>Now</span>}
                  </div>
                  <div style={s('font-size:11px; font-weight:600; color:var(--muted); margin-top:3px;')}>{r.meta}</div>
                  {r.sets.length > 0 && (
                    <div style={s('display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;')}>
                      {r.sets.map((st, j) => (
                        <span key={j} style={s(`font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:${st.weight}; color:${st.color}; background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:4px 7px;`)}>{st.label} · {st.text}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={s('text-align:center; font-size:11.5px; font-weight:600; color:var(--faint); margin-top:16px;')}>Tap anywhere to go back to your set</div>
          </div>
        </div>
      )}

      {/* #54 — restart confirmation */}
      {wo.restartAsk && (
        <div style={s('position:absolute; inset:0; z-index:45; background:rgba(20,16,12,.55); display:flex; align-items:center; justify-content:center; padding:0 28px;')}>
          <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:22px; max-width:300px; box-shadow:0 16px 44px rgba(0,0,0,.34); animation:zenIn .3s cubic-bezier(.22,1,.36,1) both;')}>
            <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Restart today's workout?</div>
            <div style={s('font-size:13px; font-weight:500; color:var(--muted); margin-top:8px; line-height:1.5;')}>All logged sets will be cleared. Your exercises stay exactly as they are.</div>
            <div style={s('display:flex; gap:8px; margin-top:18px;')}>
              <button onClick={wo.cancelRestart} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--muted); font-family:inherit; font-size:13px; font-weight:700; padding:11px 0; border-radius:11px;')}>Cancel</button>
              <button onClick={wo.confirmRestart} style={s('flex:1; border:none; cursor:pointer; background:#EF4444; color:#fff; font-family:inherit; font-size:13px; font-weight:800; padding:11px 0; border-radius:11px;')}>Restart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
