import { s } from '../lib/helpers';

// An exercise name: free text with matches from the Exercise Database as you type, and a
// "+" that opens the full database picker (search + body-part filters). Used for both the
// exercise itself and its superset partner, so the two behave the same; the view-model
// comes from App._exNameField.
export default function ExerciseNameField({ f }) {
  return (
    <div>
      <div style={s('display:flex; gap:8px;')}>
        <input value={f.value} onChange={f.onText} placeholder={f.placeholder} aria-label={f.inputLabel} style={s('flex:1; min-width:0; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:16px; font-weight:700; color:var(--text); outline:none;')} />
        <button onClick={f.pickerOpen ? f.closePicker : f.openPicker} aria-label={f.plusLabel} aria-expanded={f.pickerOpen} title={f.plusLabel} style={s(`width:44px; height:44px; flex:none; border:none; border-radius:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; background:${f.pickerOpen ? 'var(--text)' : 'var(--accent)'}; color:${f.pickerOpen ? 'var(--surface)' : '#fff'};`)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"></path></svg>
        </button>
      </div>
      {f.suggestions.length > 0 && (
        <div style={s('margin-top:6px; border:1px solid var(--border); border-radius:11px; overflow:hidden;')}>
          {f.suggestions.map((x, i) => (
            <button key={i} onClick={x.pick} style={s(`width:100%; display:flex; align-items:center; justify-content:space-between; gap:8px; text-align:left; border:none; border-top:${i ? '1px solid var(--border)' : 'none'}; background:var(--surface); cursor:pointer; font-family:inherit; padding:10px 12px;`)}>
              <span style={s('font-size:13px; font-weight:700; color:var(--text); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{x.name}</span>
              <span style={s('flex:none; font-size:10.5px; font-weight:600; color:var(--muted);')}>{x.part}</span>
            </button>
          ))}
        </div>
      )}
      {!!f.matchNote && (
        <div style={s('font-size:11.5px; font-weight:600; color:var(--accent); margin-top:6px;')}>✓ {f.matchNote}</div>
      )}
      {!!f.customNote && (
        <div style={s('font-size:11.5px; font-weight:600; color:var(--muted); margin-top:6px;')}>{f.customNote}</div>
      )}
      {f.pickerOpen && (
        <div style={s('margin-top:9px; border:1px solid var(--border); border-radius:14px; padding:12px; background:var(--surface);')}>
          <div style={s('display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;')}>
            <span style={s('font-size:12px; font-weight:800; color:var(--text);')}>{f.pickerTitle}</span>
            <button onClick={f.closePicker} style={s('border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; color:var(--muted); padding:0;')}>Close</button>
          </div>
          <input value={f.query} onChange={f.onQuery} placeholder="Search the Exercise Database" aria-label="Search exercises" style={s('width:100%; border:1px solid var(--border); border-radius:10px; padding:9px 11px; background:var(--surface-2); font-family:inherit; font-size:16px; font-weight:600; color:var(--text); outline:none;')} />
          <div style={s('display:flex; gap:6px; overflow-x:auto; margin-top:8px; padding-bottom:2px;')}>
            {f.parts.map((b, i) => (
              <button key={i} onClick={b.pick} style={s(`flex:none; border:none; cursor:pointer; font-family:inherit; font-size:11px; font-weight:700; padding:6px 10px; border-radius:999px; background:${b.bg}; color:${b.color};`)}>{b.label}</button>
            ))}
          </div>
          <div className="scrollable" style={s('max-height:200px; overflow-y:auto; margin-top:6px;')}>
            {f.list.map((x, i) => (
              <button key={i} onClick={x.pick} style={s(`width:100%; display:flex; align-items:center; justify-content:space-between; gap:8px; text-align:left; border:none; border-bottom:1px solid ${x.divider}; background:transparent; cursor:pointer; font-family:inherit; padding:9px 2px;`)}>
                <span style={s('font-size:13px; font-weight:700; color:var(--text); min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{x.name}</span>
                <span style={s('flex:none; font-size:10.5px; font-weight:600; color:var(--muted);')}>{x.sub}</span>
              </button>
            ))}
            {f.empty && (
              <div style={s('font-size:12px; color:var(--muted); font-weight:500; padding:10px 2px;')}>No exercises match.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
