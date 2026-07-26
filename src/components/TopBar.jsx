import React from 'react';
import { s } from '../lib/helpers';

export default function TopBar({ v }) {
  return (
    <div style={s('flex:none; display:flex; align-items:center; justify-content:space-between; padding:14px 16px 4px;')}>
      <button onClick={v.openMenu} data-tut="menu" aria-label="Menu" style={s('width:44px; height:44px; border-radius:12px; border:1px solid var(--border); background:var(--surface); cursor:pointer; display:flex; align-items:center; justify-content:center; flex:none; color:var(--text); padding:0;')}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>
      </button>
      <div style={s('text-align:center;')}>
        <div style={s('font-size:18px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{v.headerTitle}</div>
        <div style={s('font-size:11.5px; font-weight:600; color:var(--muted);')}>{v.headerSub}</div>
      </div>
      <div style={s('display:flex; align-items:center; gap:6px; flex:none;')}>
        {v.showAmend && (
          <button onClick={v.amendAction} aria-label="Edit day" style={s('height:44px; padding:0 15px; display:inline-flex; align-items:center; gap:6px; border:1px solid var(--accent); cursor:pointer; background:var(--accent-soft); color:var(--accent); border-radius:12px; font-family:inherit; font-size:12.5px; font-weight:800; transition:transform .12s cubic-bezier(.34,1.56,.64,1);')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path></svg>
            Edit
          </button>
        )}
        {v.onWeek && (
          <button onClick={v.toggleTheme} aria-label="Toggle dark mode" style={s('width:44px; height:44px; border-radius:12px; border:1px solid var(--border); background:var(--surface); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; color:var(--text); flex:none;')}>
            {v.isDark && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13.2A8 8 0 1 1 10.8 4 6.3 6.3 0 0 0 20 13.2z"></path></svg>}
            {v.notDark && <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4.5"></circle><path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8"></path></svg>}
          </button>
        )}
        {v.notWeek && (
          <button onClick={v.topAction} aria-label="Back" style={s('width:44px; height:44px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); border-radius:12px; padding:0;')}>
            <span style={s('font-size:20px; line-height:1;')}>‹</span>
          </button>
        )}
      </div>
    </div>
  );
}
