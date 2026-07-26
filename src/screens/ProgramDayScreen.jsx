import React from 'react';
import { s } from '../lib/helpers';

export default function ProgramDayScreen({ v }) {
  const pdx = v.pdx;
  return (
    <div style={s('padding:14px 16px 28px;')}>
      <div style={s('font-size:19px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{pdx.full}</div>
      <div style={s('font-size:12px; color:var(--muted); font-weight:600; margin-top:2px;')}>Label this day and set its exercises</div>

      <div style={s('display:flex; gap:6px; flex-wrap:wrap; margin-top:16px;')}>
        {pdx.typeOptions.map((op, i) => (
          <button key={i} onClick={op.set} style={s(`border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:8px 13px; border-radius:10px; background:${op.bg}; color:${op.color};`)}>{op.label}</button>
        ))}
      </div>

      {pdx.showExercises && (
        <>
          <div style={s('display:flex; align-items:center; justify-content:space-between; margin:20px 4px 10px;')}>
            <span style={s('font-size:13px; font-weight:800; color:var(--text);')}>Exercises</span>
            {pdx.reorderMode && (
              <button onClick={v.exitReorder} style={s('border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:12.5px; font-weight:800; padding:7px 18px; border-radius:999px;')}>Done</button>
            )}
            {pdx.notReorderMode && (
              <button onClick={v.addProgramExercise} aria-label="Add exercise" style={s('width:30px; height:30px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; background:var(--accent); color:#fff; border-radius:50%; padding:0; font-size:20px; line-height:1;')}>+</button>
            )}
          </div>
          {pdx.hasExercises && (
            <div style={s('display:flex; flex-direction:column; gap:10px;')}>
              {pdx.exercises.map((ex, i) => (
                <div key={i} style={s(`position:relative; border-radius:16px; transform:translateY(${ex.ty}); transition:${ex.tyTransition}; z-index:${ex.z};`)}>
                  <div style={s(`position:absolute; inset:0; background:${ex.deleteBg}; border-radius:16px; overflow:hidden; display:flex; align-items:center; justify-content:flex-end; padding-right:18px;`)}>
                    <button onClick={ex.deleteNow} style={s('border:none; background:transparent; color:#fff; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; padding:0 6px;')}>Delete</button>
                  </div>
                  <div onClick={ex.edit} onTouchStart={ex.onTouchStart} onTouchMove={ex.onTouchMove} onTouchEnd={ex.onTouchEnd} onMouseDown={ex.onMouseDown} style={s(`position:relative; background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:14px 15px; box-shadow:${ex.cardShadow}; cursor:pointer; display:flex; align-items:center; gap:12px; transform:translateX(${ex.dx}); transition:transform .15s ease; animation:${ex.jiggle};`)}>
                    <div style={s('flex:1; min-width:0;')}>
                      <div style={s('font-size:14px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{ex.name}</div>
                      <div style={s("font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--muted); font-weight:600; margin-top:3px;")}>{ex.scheme}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {pdx.empty && (
            <div style={s('text-align:center; padding:30px 20px; background:var(--surface); border:1px dashed var(--border); border-radius:16px;')}>
              <div style={s('font-size:13.5px; font-weight:700; color:var(--text);')}>No exercises yet</div>
              <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px;')}>Tap + to add one</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
