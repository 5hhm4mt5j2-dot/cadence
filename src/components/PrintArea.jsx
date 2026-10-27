import { s } from '../lib/helpers';

export default function PrintArea({ v }) {
  const np = v.np;
  const pp = v.pp;
  return (
    <div id="lt-print-area" style={s("position:absolute; width:1px; height:1px; overflow:hidden; left:-9999px; background:#fff; font-family:'Plus Jakarta Sans',system-ui,sans-serif;")}>
      {v.printNutrition && np && (
        <div style={s('padding:24px;')}>
          <div style={s('font-size:22px; font-weight:800; color:#111;')}>Nutrition History</div>
          <div style={s('font-size:13px; color:#555; margin-top:4px;')}>{np.range}</div>
          {np.days.map((d, i) => (
            <div key={i} data-print-block style={s('margin-top:20px; padding-top:16px; border-top:1px solid #ddd;')}>
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
      {v.printProgram && pp && (
        <div style={s('padding:24px;')}>
          <div style={s('font-size:22px; font-weight:800; color:#111;')}>{pp.name}</div>
          <div style={s('font-size:13px; color:#555; margin-top:4px;')}>{pp.status ? pp.status + ' · ' : ''}{pp.range}</div>

          <div style={s('margin-top:18px; padding-top:14px; border-top:2px solid #333;')}>
            <div style={s('font-size:15px; font-weight:800; color:#111;')}>Summary</div>
            <div style={s('margin-top:6px;')}>
              {pp.summary.map((r, i) => (
                <div key={i} style={s('display:flex; justify-content:space-between; font-size:12.5px; padding:4px 0; border-bottom:1px solid #eee;')}>
                  <span style={s('color:#333;')}>{r.label}</span><span style={s('font-weight:700; color:#111;')}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {pp.planDays.length > 0 && (
            <div style={s('margin-top:20px; padding-top:14px; border-top:1px solid #ddd;')}>
              <div style={s('font-size:15px; font-weight:800; color:#111;')}>Program</div>
              {pp.planDays.map((d, i) => (
                <div key={i} style={s('margin-top:10px;')}>
                  <div style={s('font-size:12.5px; font-weight:800; color:#111;')}>{d.title}</div>
                  {d.exercises.map((ex, j) => (
                    <div key={j} style={s('display:flex; justify-content:space-between; font-size:12px; padding:3px 0; border-bottom:1px solid #f1f1f1;')}>
                      <span style={s('color:#333;')}>{ex.name}</span><span style={s('color:#666;')}>{ex.scheme}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {pp.hasWeeks && (
            <div style={s('margin-top:20px; padding-top:14px; border-top:1px solid #ddd;')}>
              <div style={s('font-size:15px; font-weight:800; color:#111;')}>Volume by week</div>
              {pp.weeks.map((w, i) => (
                <div key={i} style={s('display:flex; justify-content:space-between; font-size:12.5px; padding:4px 0; border-bottom:1px solid #eee;')}>
                  <span style={s('color:#333;')}>{w.label} · <span style={s('color:#888;')}>{w.count}</span></span>
                  <span style={s('font-weight:700; color:#111;')}>{w.volume}</span>
                </div>
              ))}
            </div>
          )}

          {pp.hasTrends && (
            <div style={s('margin-top:20px; padding-top:14px; border-top:1px solid #ddd;')}>
              <div style={s('font-size:15px; font-weight:800; color:#111;')}>Progression</div>
              <div style={s('font-size:11px; color:#777; margin-top:2px;')}>Top working weight, first logged session to last.</div>
              {pp.trends.map((t, i) => (
                <div key={i} style={s('display:flex; justify-content:space-between; font-size:12.5px; padding:4px 0; border-bottom:1px solid #eee;')}>
                  <span style={s('color:#333;')}>{t.name}</span>
                  <span><span style={s('color:#666;')}>{t.line}</span> <span style={s(`font-weight:700; color:${t.color};`)}>{t.delta}</span></span>
                </div>
              ))}
            </div>
          )}

          <div style={s('margin-top:22px; padding-top:14px; border-top:2px solid #333;')}>
            <div style={s('font-size:15px; font-weight:800; color:#111;')}>Workout history</div>
            {!pp.hasDays && (
              <div style={s('font-size:12.5px; color:#777; margin-top:6px;')}>No sessions were logged while this program ran.</div>
            )}
            {pp.days.map((d, i) => (
              <div key={i} data-print-block style={s('margin-top:14px; padding-top:10px; border-top:1px solid #ddd;')}>
                <div style={s('display:flex; justify-content:space-between; align-items:baseline;')}>
                  <span style={s('font-size:13.5px; font-weight:800; color:#111;')}>{d.title}</span>
                  <span style={s('font-size:12px; font-weight:700; color:#333;')}>{d.volume}</span>
                </div>
                <div style={s('font-size:11px; color:#777; margin-top:2px;')}>{d.dateLabel}{d.rpe ? ' · ' + d.rpe : ''}</div>
                <div style={s('margin-top:6px;')}>
                  {d.exercises.map((ex, j) => (
                    <div key={j} style={s('display:flex; justify-content:space-between; gap:12px; font-size:12px; padding:4px 0; border-bottom:1px solid #f1f1f1;')}>
                      <span style={s('color:#333;')}>{ex.name}</span>
                      <span style={s('color:#666; text-align:right;')}>{ex.detail}<span style={s('color:#999; margin-left:10px;')}>{ex.volume}</span></span>
                    </div>
                  ))}
                </div>
                {!!d.notes && (
                  <div style={s('font-size:11.5px; color:#555; margin-top:5px; font-style:italic;')}>{d.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
