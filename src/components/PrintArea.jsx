import React from 'react';
import { s } from '../lib/helpers';

export default function PrintArea({ v }) {
  const np = v.np;
  const ad = v.ad;
  return (
    <div id="lt-print-area" style={s("position:absolute; width:1px; height:1px; overflow:hidden; left:-9999px; background:#fff; font-family:'Plus Jakarta Sans',system-ui,sans-serif;")}>
      {v.printNutrition && np && (
        <div style={s('padding:24px;')}>
          <div style={s('font-size:22px; font-weight:800; color:#111;')}>Nutrition History</div>
          <div style={s('font-size:13px; color:#555; margin-top:4px;')}>{np.range}</div>
          {np.days.map((d, i) => (
            <div key={i} style={s('margin-top:20px; padding-top:16px; border-top:1px solid #ddd;')}>
              <div style={s('display:flex; justify-content:space-between; align-items:baseline;')}>
                <span style={s('font-size:15px; font-weight:800; color:#111;')}>{d.label}</span>
                <span style={s(`font-size:12px; font-weight:700; color:${d.statusColor};`)}>{d.status}</span>
              </div>
              <div style={s('margin-top:6px;')}>
                {d.meals.map((m, j) => (
                  <div key={j} style={s('display:flex; justify-content:space-between; font-size:12.5px; padding:5px 0; border-bottom:1px solid #eee;')}>
                    <span>{m.name} · <span style={s('color:#999;')}>{m.time}</span></span><span>{m.macros}</span>
                  </div>
                ))}
              </div>
              <div style={s('display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:#333; padding-top:7px;')}>
                <span>Daily total</span><span>{d.totals}</span>
              </div>
            </div>
          ))}
          <div style={s('margin-top:26px; padding-top:16px; border-top:2px solid #333;')}>
            <div style={s('font-size:15px; font-weight:800; color:#111;')}>Summary</div>
            <div style={s('font-size:12.5px; color:#333; margin-top:6px; line-height:1.7;')}>{np.summary1}</div>
            <div style={s('font-size:12.5px; color:#333; line-height:1.7;')}>{np.summary2}</div>
          </div>
        </div>
      )}
      {v.printArchive && ad && (
        <div style={s('padding:24px;')}>
          <div style={s('font-size:22px; font-weight:800; color:#111;')}>{ad.label}</div>
          <div style={s('font-size:13px; color:#555; margin-top:4px;')}>{ad.volume} total volume · {ad.count} sessions</div>
          {ad.sessions.map((se, i) => (
            <div key={i} style={s('margin-top:20px; padding-top:16px; border-top:1px solid #ddd;')}>
              <div style={s('display:flex; justify-content:space-between; font-size:15px; font-weight:800; color:#111;')}>
                <span>{se.title}</span><span>{se.volume}</span>
              </div>
              {se.hasDate && <div style={s('font-size:11px; color:#777; margin-top:2px;')}>{se.dateLabel}</div>}
              <div style={s('margin-top:8px;')}>
                {se.exercises.map((ex, j) => (
                  <div key={j} style={s('display:flex; justify-content:space-between; font-size:12.5px; padding:5px 0; border-bottom:1px solid #eee;')}>
                    <span>{ex.name}</span><span>{ex.scheme}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
