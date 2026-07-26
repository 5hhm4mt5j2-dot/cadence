import React from 'react';
import { s } from '../lib/helpers';

export function DatabaseScreen({ v }) {
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:12.5px; color:var(--muted); font-weight:500; line-height:1.5; margin-bottom:14px;')}>Browse exercises by body part.</div>
      <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:4px 16px; box-shadow:var(--shadow);')}>
        {v.bodyParts.map((bp) => (
          <div key={bp.key} onClick={bp.open} style={s(`display:flex; align-items:center; justify-content:space-between; padding:15px 0; border-bottom:1px solid ${bp.divider}; cursor:pointer;`)}>
            <span style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>{bp.label}</span>
            <span style={s('color:var(--muted); font-size:18px;')}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DatabaseDetailScreen({ v }) {
  const dbx = v.dbx;
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('display:flex; align-items:center; justify-content:space-between; margin:4px 4px 10px;')}>
        <span style={s('font-size:13px; font-weight:800; color:var(--text);')}>Exercises</span>
        <button onClick={v.addDbExercise} aria-label="Add exercise" style={s('width:44px; height:44px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; background:var(--accent); color:#fff; border-radius:50%; padding:0; font-size:20px; line-height:1;')}>+</button>
      </div>
      {dbx.hasExercises && (
        <div style={s('display:flex; flex-direction:column; gap:10px;')}>
          {dbx.exercises.map((ex, i) => (
            <div key={i} style={s('background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:14px 15px; box-shadow:var(--shadow);')}>
              <div onClick={ex.edit} style={s('cursor:pointer;')}>
                <div style={s('font-size:14px; font-weight:700; color:var(--text);')}>{ex.name}</div>
                {ex.hasDesc && (
                  <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:4px; line-height:1.45;')}>{ex.descPreview}</div>
                )}
                {ex.hasEquip && (
                  <div style={s('display:flex; align-items:center; gap:6px; margin-top:8px;')}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11M6.5 12h11M6.5 17.5h11"></path></svg>
                    <span style={s('font-size:11.5px; color:var(--muted); font-weight:600;')}>{ex.equipLabel}</span>
                  </div>
                )}
              </div>
              <button onClick={ex.addToProgram} style={s('margin-top:13px; width:100%; border:1px solid var(--accent); background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--accent); padding:9px 0; border-radius:11px;')}>+ Add to Program</button>
            </div>
          ))}
        </div>
      )}
      {dbx.empty && (
        <div style={s('text-align:center; padding:30px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:16px;')}>
          <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>No exercises yet</div>
          <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px;')}>Tap + to add one</div>
        </div>
      )}
    </div>
  );
}
