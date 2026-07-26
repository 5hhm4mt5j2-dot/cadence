import React from 'react';
import { s } from '../lib/helpers';

// Repeated cloud silhouette used by several weather conditions.
function Cloud({ top }) {
  const o = top || 0;
  return (
    <>
      <div style={s(`position:absolute; top:${13 + o}px; left:5px; width:16px; height:16px; border-radius:50%; background:var(--text);`)}></div>
      <div style={s(`position:absolute; top:${9 + o}px; left:15px; width:20px; height:20px; border-radius:50%; background:var(--text);`)}></div>
      <div style={s(`position:absolute; top:${15 + o}px; left:27px; width:13px; height:13px; border-radius:50%; background:var(--text);`)}></div>
      <div style={s(`position:absolute; top:${21 + o}px; left:7px; width:32px; height:14px; border-radius:8px; background:var(--text);`)}></div>
      <div style={s(`position:absolute; top:${15.5 + o}px; left:7.5px; width:11px; height:11px; border-radius:50%; background:var(--bg);`)}></div>
      <div style={s(`position:absolute; top:${11.5 + o}px; left:17.5px; width:15px; height:15px; border-radius:50%; background:var(--bg);`)}></div>
      <div style={s(`position:absolute; top:${17.5 + o}px; left:29.5px; width:8px; height:8px; border-radius:50%; background:var(--bg);`)}></div>
      <div style={s(`position:absolute; top:${23.5 + o}px; left:9.5px; width:27px; height:9px; border-radius:6px; background:var(--bg);`)}></div>
    </>
  );
}

export default function Hero({ v }) {
  const weather = v.weather;
  return (
    <div style={s('flex:none; display:flex; align-items:center; justify-content:space-between; padding:6px 20px 8px;')}>
      <div style={s('position:relative;')}>
        <div onClick={v.goHome} data-tut="greet" onMouseDown={v.greetPressStart} onMouseUp={v.greetPressEnd} onMouseLeave={v.greetPressEnd} onTouchStart={v.greetPressStart} onTouchEnd={v.greetPressEnd} style={s('cursor:pointer; user-select:none; -webkit-user-select:none;')}>
          <div style={s('font-size:21px; font-weight:800; color:var(--text); letter-spacing:-.02em; animation:appfade .5s ease both;')}>{v.greetLine}</div>
          <div style={s('font-size:12px; font-weight:600; color:var(--muted); margin-top:2px;')}>{weather.dateLine}</div>
        </div>
        {v.profileMenuOpen && (
          <>
            <div onClick={v.closeProfileMenu} style={s('position:fixed; inset:0; z-index:60;')}></div>
            <div style={s('position:absolute; top:52px; left:0; z-index:61; width:230px; background:var(--surface); border:1px solid var(--border); border-radius:18px; box-shadow:0 12px 34px rgba(0,0,0,.2); padding:14px 15px; animation:zenIn .22s cubic-bezier(.22,1,.36,1) both;')}>
              <div style={s('display:flex; flex-direction:column; gap:9px;')}>
                {v.pm.rows.map((r, i) => (
                  <div key={i} style={s('display:flex; align-items:baseline; justify-content:space-between; gap:10px;')}>
                    <span style={s('font-size:11.5px; font-weight:600; color:var(--muted);')}>{r.label}</span>
                    <span style={s('font-size:12.5px; font-weight:700; color:var(--text); text-align:right;')}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div style={s('display:flex; flex-direction:column; gap:8px; margin-top:14px;')}>
                <button onClick={v.pm.edit} style={s('width:100%; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:12.5px; font-weight:800; padding:10px 0; border-radius:11px;')}>Edit Profile</button>
                <div style={s('display:flex; gap:8px;')}>
                  <button onClick={v.pm.exportData} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); font-family:inherit; font-size:12px; font-weight:700; padding:10px 0; border-radius:11px;')}>Export Data</button>
                  <button onClick={v.pm.importData} style={s('flex:1; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); font-family:inherit; font-size:12px; font-weight:700; padding:10px 0; border-radius:11px;')}>Import Data</button>
                </div>
                <button onClick={v.pm.recoveryProfile} style={s('width:100%; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); font-family:inherit; font-size:12px; font-weight:700; padding:10px 0; border-radius:11px;')}>Recovery Profile</button>
                <button onClick={v.closeProfileMenu} style={s('width:100%; border:none; cursor:pointer; background:transparent; color:var(--muted); font-family:inherit; font-size:12.5px; font-weight:700; padding:6px 0 2px; border-radius:11px;')}>Close</button>
              </div>
            </div>
          </>
        )}
      </div>
      <div data-tut="weather" style={s('display:flex; align-items:center; gap:8px;')}>
        {weather.showIcon && (
          <div onClick={weather.refresh} title="Tap to refresh" style={s('width:46px; height:46px; position:relative; flex:none; cursor:pointer;')}>
            {weather.isSunny && (
              <>
                <div style={s('position:absolute; inset:0; animation: sunSpin 26s linear infinite;')}>
                  {weather.sunBeams.map((b, i) => (
                    <div key={i} style={s(`position:absolute; top:50%; left:50%; width:2px; height:6px; background:var(--text); border-radius:1px; transform:translate(-50%,-50%) rotate(${b.angle}deg) translateY(-20px);`)}></div>
                  ))}
                </div>
                <div style={s('position:absolute; top:9px; left:9px; width:28px; height:28px; border-radius:50%; border:2px solid var(--text); animation: sunPulse 3s ease-in-out infinite;')}></div>
              </>
            )}
            {weather.isCloudyDay && (
              <>
                <div style={s('position:absolute; top:0px; left:0px; width:15px; height:15px; border-radius:50%; border:2px solid var(--text);')}></div>
                <div style={s('position:absolute; inset:0; animation: cloudDrift1 5s ease-in-out infinite;')}><Cloud top={0} /></div>
              </>
            )}
            {weather.isCloudyNight && (
              <>
                <div style={s('position:absolute; top:0px; left:1px; width:13px; height:13px; border-radius:50%; border:2px solid var(--text); box-shadow:-4px -2px 0 2px var(--bg);')}></div>
                <div style={s('position:absolute; inset:0; animation: cloudDrift1 5s ease-in-out infinite;')}><Cloud top={0} /></div>
              </>
            )}
            {weather.isRainyDay && (
              <>
                <div style={s('position:absolute; top:6px; left:5px; width:16px; height:16px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:2px; left:15px; width:20px; height:20px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:8px; left:27px; width:13px; height:13px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:14px; left:7px; width:32px; height:14px; border-radius:8px; background:var(--text);')}></div>
                <div style={s('position:absolute; top:8.5px; left:7.5px; width:11px; height:11px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:4.5px; left:17.5px; width:15px; height:15px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:10.5px; left:29.5px; width:8px; height:8px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:16.5px; left:9.5px; width:27px; height:9px; border-radius:6px; background:var(--bg);')}></div>
                {weather.raindrops.map((r, i) => (
                  <div key={i} style={s(`position:absolute; top:30px; left:${r.left}px; width:2px; height:9px; border-radius:2px; background:var(--text); animation: rainFall 1.1s linear infinite; animation-delay:${r.delay}s;`)}></div>
                ))}
              </>
            )}
            {weather.isRainyNight && (
              <>
                <div style={s('position:absolute; top:6px; left:5px; width:16px; height:16px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:2px; left:15px; width:20px; height:20px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:8px; left:27px; width:13px; height:13px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:14px; left:7px; width:32px; height:14px; border-radius:8px; background:var(--text);')}></div>
                <div style={s('position:absolute; top:8.5px; left:7.5px; width:11px; height:11px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:4.5px; left:17.5px; width:15px; height:15px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:10.5px; left:29.5px; width:8px; height:8px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:16.5px; left:9.5px; width:27px; height:9px; border-radius:6px; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:0px; left:32px; width:2px; height:2px; border-radius:50%; background:var(--text); animation: starTwinkle 2s ease-in-out infinite;')}></div>
                {weather.raindrops.map((r, i) => (
                  <div key={i} style={s(`position:absolute; top:30px; left:${r.left}px; width:2px; height:9px; border-radius:2px; background:var(--text); animation: rainFall 1.1s linear infinite; animation-delay:${r.delay}s;`)}></div>
                ))}
              </>
            )}
            {weather.isSnowyDay && (
              <>
                <div style={s('position:absolute; top:6px; left:5px; width:16px; height:16px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:2px; left:15px; width:20px; height:20px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:8px; left:27px; width:13px; height:13px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:14px; left:7px; width:32px; height:14px; border-radius:8px; background:var(--text);')}></div>
                <div style={s('position:absolute; top:8.5px; left:7.5px; width:11px; height:11px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:4.5px; left:17.5px; width:15px; height:15px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:10.5px; left:29.5px; width:8px; height:8px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:16.5px; left:9.5px; width:27px; height:9px; border-radius:6px; background:var(--bg);')}></div>
                {weather.snowflakes.map((sf, i) => (
                  <div key={i} style={s(`position:absolute; top:30px; left:${sf.left}px; width:4px; height:4px; border-radius:50%; background:var(--text); animation: snowFall 2.4s linear infinite; animation-delay:${sf.delay}s;`)}></div>
                ))}
              </>
            )}
            {weather.isSnowyNight && (
              <>
                <div style={s('position:absolute; top:6px; left:5px; width:16px; height:16px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:2px; left:15px; width:20px; height:20px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:8px; left:27px; width:13px; height:13px; border-radius:50%; background:var(--text);')}></div>
                <div style={s('position:absolute; top:14px; left:7px; width:32px; height:14px; border-radius:8px; background:var(--text);')}></div>
                <div style={s('position:absolute; top:8.5px; left:7.5px; width:11px; height:11px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:4.5px; left:17.5px; width:15px; height:15px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:10.5px; left:29.5px; width:8px; height:8px; border-radius:50%; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:16.5px; left:9.5px; width:27px; height:9px; border-radius:6px; background:var(--bg);')}></div>
                <div style={s('position:absolute; top:0px; left:32px; width:2px; height:2px; border-radius:50%; background:var(--text); animation: starTwinkle 2s ease-in-out infinite;')}></div>
                {weather.snowflakes.map((sf, i) => (
                  <div key={i} style={s(`position:absolute; top:30px; left:${sf.left}px; width:4px; height:4px; border-radius:50%; background:var(--text); animation: snowFall 2.4s linear infinite; animation-delay:${sf.delay}s;`)}></div>
                ))}
              </>
            )}
            {weather.isClearNight && (
              <>
                <div style={s('position:absolute; top:9px; left:11px; width:26px; height:26px; border-radius:50%; border:2px solid var(--text); box-shadow:-8px -3px 0 3px var(--bg); animation: moonGlow 4s ease-in-out infinite;')}></div>
                {weather.stars.map((st, i) => (
                  <div key={i} style={s(`position:absolute; top:${st.top}px; left:${st.left}px; width:2px; height:2px; border-radius:50%; background:var(--text); animation: starTwinkle 2s ease-in-out infinite; animation-delay:${st.delay}s;`)}></div>
                ))}
              </>
            )}
          </div>
        )}
        {weather.wxReady && (
          <div onClick={weather.refresh} title="Tap to refresh" style={s('display:flex; align-items:center; gap:8px; cursor:pointer; animation:appfade .2s ease both;')}>
            <div style={s('font-size:32px; font-weight:300; color:var(--text); letter-spacing:-.02em;')}>{weather.tempLabel}</div>
            <div style={s('display:flex; flex-direction:column; gap:2px; white-space:nowrap;')}>
              <div style={s('font-size:12.5px; font-weight:700; color:var(--text); line-height:1.3;')}>{weather.condLabel}</div>
              <div style={s('font-size:11px; font-weight:600; color:var(--muted); line-height:1.3;')}>{weather.location}</div>
              <div style={s('font-size:10.5px; font-weight:600; color:var(--faint); line-height:1.3;')}>H:{weather.high}° L:{weather.low}°</div>
              {weather.hasSunTimes && (
                <div style={s('font-size:10px; font-weight:600; color:var(--faint); line-height:1.3;')}>↑ {weather.sunrise} · ↓ {weather.sunset}</div>
              )}
            </div>
          </div>
        )}
        {weather.wxLoading && (
          <div className="sk" style={s('width:100px; height:40px; border-radius:11px;')}></div>
        )}
        {weather.wxNeedCity && (
          <div style={s('display:flex; flex-direction:column; gap:5px; align-items:flex-end;')}>
            <div style={s('font-size:9.5px; font-weight:600; color:var(--faint); line-height:1.3; max-width:150px; text-align:right;')}>{weather.wxErrorMsg}</div>
            <div style={s('display:flex; gap:5px;')}>
              <input value={weather.cityInput} onChange={weather.onCityInput} placeholder="City" style={s('width:88px; border:1px solid var(--border); border-radius:9px; padding:6px 9px; background:var(--surface-2); font-family:inherit; font-size:12px; font-weight:600; color:var(--text); outline:none;')} />
              <button onClick={weather.submitCity} style={s('border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:11.5px; font-weight:700; padding:0 12px; border-radius:9px;')}>Set</button>
            </div>
          </div>
        )}
        {weather.wxError && (
          <div onClick={weather.refresh} title="Tap to retry" style={s('font-size:11px; font-weight:600; color:var(--muted); line-height:1.35; max-width:140px; text-align:right; cursor:pointer;')}>{weather.wxErrorMsg}</div>
        )}
      </div>
    </div>
  );
}
