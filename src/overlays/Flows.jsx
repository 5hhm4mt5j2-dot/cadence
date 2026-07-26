import React from 'react';
import { s } from '../lib/helpers';

export function Splash({ v }) {
  return (
    <div style={s('position:absolute; inset:0; z-index:82; background:var(--bg); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 36px; text-align:center;')}>
      <div style={s('width:72px; height:72px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; margin-bottom:26px; animation:wRing .7s cubic-bezier(.34,1.56,.64,1) both;')}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"></path></svg>
      </div>
      <div style={s('font-size:34px; font-weight:800; color:var(--text); letter-spacing:-.03em; line-height:1.1; animation:wLine .8s cubic-bezier(.22,1,.36,1) .3s both;')}>Welcome to Cadence</div>
      <div style={s('font-size:15px; font-weight:600; color:var(--muted); margin-top:14px; line-height:1.5; animation:wLine .8s ease .6s both;')}>Your personal training &amp; nutrition companion</div>
      <button onClick={v.splashStart} style={s('margin-top:44px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:15px; font-weight:800; padding:15px 44px; border-radius:14px; animation:wLine .8s ease 1s both;')}>Get Started →</button>
    </div>
  );
}

export function Welcome({ v }) {
  const wt = v.wt;
  return (
    <div style={s('position:absolute; inset:0; z-index:80; background:var(--bg); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 36px; text-align:center;')}>
      <div style={s('width:64px; height:64px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; margin-bottom:26px; animation:wRing .7s cubic-bezier(.34,1.56,.64,1) both;')}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
      </div>
      <div style={s('font-size:13px; font-weight:700; color:var(--muted); letter-spacing:.08em; text-transform:uppercase; animation:wLine .7s ease .15s both;')}>Welcome to Cadence by KPC</div>
      <div style={s('font-size:34px; font-weight:800; color:var(--text); letter-spacing:-.03em; margin-top:10px; line-height:1.1; animation:wLine .8s cubic-bezier(.22,1,.36,1) .35s both;')}>{v.welcomeName}</div>
      <div style={s('font-size:13px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-top:30px; animation:wLine .8s ease .65s both;')}>Your daily targets</div>
      <div style={s('display:flex; gap:10px; margin-top:14px; width:100%; max-width:340px;')}>
        <div style={s('flex:1; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:12px 6px; animation:wLine .7s ease .85s both;')}>
          <div style={s('font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Kcal</div>
          <div style={s("font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--accent); margin-top:4px;")}>{wt.cal}</div>
        </div>
        <div style={s('flex:1; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:12px 6px; animation:wLine .7s ease 1s both;')}>
          <div style={s('font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Protein</div>
          <div style={s("font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--text); margin-top:4px;")}>{wt.p}</div>
        </div>
        <div style={s('flex:1; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:12px 6px; animation:wLine .7s ease 1.15s both;')}>
          <div style={s('font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Carbs</div>
          <div style={s("font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--text); margin-top:4px;")}>{wt.c}</div>
        </div>
        <div style={s('flex:1; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:12px 6px; animation:wLine .7s ease 1.3s both;')}>
          <div style={s('font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em;')}>Fat</div>
          <div style={s("font-family:'JetBrains Mono',monospace; font-size:15px; font-weight:700; color:var(--text); margin-top:4px;")}>{wt.f}</div>
        </div>
      </div>
      <button onClick={v.welcomeStart} style={s('margin-top:36px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:15px; font-weight:800; padding:15px 44px; border-radius:14px; animation:wLine .8s ease 1.55s both;')}>Let's get started →</button>
    </div>
  );
}

export function Tutorial({ v }) {
  const tut = v.tut;
  return (
    <div style={s('position:absolute; inset:0; z-index:82; pointer-events:none;')}>
      {tut.hasSpot && (
        <div style={s(`position:absolute; top:${tut.spotTop}; left:${tut.spotLeft}; width:${tut.spotW}; height:${tut.spotH}; border-radius:16px; animation:tutGlow 2.4s ease-in-out infinite;`)}></div>
      )}
      {tut.noSpot && (
        <div style={s('position:absolute; inset:0; background:rgba(20,16,12,.8);')}></div>
      )}
      <button onClick={tut.skip} style={s('position:absolute; top:calc(env(safe-area-inset-top) + 16px); left:calc(env(safe-area-inset-left) + 16px); z-index:2; pointer-events:auto; border:none; background:rgba(0,0,0,.28); backdrop-filter:blur(4px); cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; color:#fff; padding:7px 14px; border-radius:999px;')}>Skip Tutorial</button>
      <div style={s(`position:absolute; left:16px; right:16px; top:${tut.cardTop}; bottom:${tut.cardBottom}; pointer-events:auto;`)}>
        <div style={s('background:var(--surface); border:1px solid var(--border); border-radius:20px; padding:20px; box-shadow:0 16px 44px rgba(0,0,0,.34); animation:zenIn .4s cubic-bezier(.22,1,.36,1) both;')}>
          <div style={s('display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;')}>
            <span style={s('font-size:11px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:.08em;')}>{tut.counter}</span>
            <div style={s('display:flex; gap:4px;')}>
              {tut.dots.map((d, i) => (
                <div key={i} style={s(`width:5px; height:5px; border-radius:50%; background:${d.bg};`)}></div>
              ))}
            </div>
          </div>
          <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em; line-height:1.25; text-wrap:pretty;')}>{tut.title}</div>
          <div style={s('font-size:13.5px; font-weight:500; color:var(--muted); margin-top:8px; line-height:1.55; text-wrap:pretty;')}>{tut.text}</div>
          {tut.hasNote && (
            <div style={s('font-size:12.5px; font-weight:600; color:var(--faint); margin-top:8px; line-height:1.5; font-style:italic;')}>{tut.note}</div>
          )}
          <button onClick={tut.next} style={s('width:100%; margin-top:16px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>{tut.nextLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function FirstLaunch({ v }) {
  return (
    <div style={s('position:absolute; inset:0; z-index:72; background:var(--bg); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 32px; text-align:center;')}>
      <div style={s('width:56px; height:56px; border-radius:50%; background:var(--accent-soft); display:flex; align-items:center; justify-content:center; margin-bottom:22px;')}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V3M12 3l-4 4M12 3l4 4M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15"></path></svg>
      </div>
      <div style={s('font-size:13px; font-weight:700; color:var(--muted); letter-spacing:.08em; text-transform:uppercase;')}>Welcome to Cadence</div>
      <div style={s('font-size:26px; font-weight:800; color:var(--text); letter-spacing:-.03em; margin-top:10px; line-height:1.2; text-wrap:pretty;')}>Do you have a previous backup?</div>
      <div style={s('font-size:14px; font-weight:500; color:var(--muted); margin-top:10px; line-height:1.5; max-width:280px;')}>Restore everything from a Cadence backup file, or start fresh as a new user.</div>
      <div style={s('display:flex; flex-direction:column; gap:10px; margin-top:32px; width:100%; max-width:300px;')}>
        <button onClick={v.chooseImport} style={s('width:100%; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14.5px; font-weight:800; padding:15px 0; border-radius:14px;')}>Import Existing Backup</button>
        <button onClick={v.chooseFresh} style={s('width:100%; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--text); font-family:inherit; font-size:14.5px; font-weight:700; padding:15px 0; border-radius:14px;')}>Start Fresh (New User)</button>
      </div>
    </div>
  );
}

export function Onboarding({ v }) {
  const onb = v.onb;
  return (
    <div className="scrollable" style={s('position:absolute; inset:0; z-index:70; background:var(--bg); display:flex; flex-direction:column; padding:0 24px; overflow-y:auto;')}>
      <div style={s('flex:none; padding-top:calc(env(safe-area-inset-top) + 64px);')}>
        <div style={s('display:flex; gap:6px; margin-bottom:34px;')}>
          {onb.dots.map((d, i) => (
            <div key={i} style={s(`flex:1; height:4px; border-radius:2px; background:${d.bg}; transition:background .3s ease;`)}></div>
          ))}
        </div>
        <div style={s('min-height:34px; font-size:11.5px; font-weight:700; color:var(--accent); text-transform:uppercase; letter-spacing:.09em;')}>{onb.kicker}</div>
        <div style={s('font-size:26px; font-weight:800; color:var(--text); letter-spacing:-.03em; line-height:1.2; text-wrap:pretty;')}>{onb.title}</div>
        <div style={s('font-size:13.5px; font-weight:500; color:var(--muted); margin-top:6px; line-height:1.5;')}>{onb.subtitle}</div>
      </div>
      <div style={s('flex:1; padding:30px 0;')}>
        {onb.s0 && (
          <input value={onb.name} onChange={onb.onName} placeholder="Your name" style={s('width:100%; border:none; border-bottom:2px solid var(--border); background:transparent; font-family:inherit; font-size:24px; font-weight:800; color:var(--text); letter-spacing:-.02em; outline:none; padding:8px 2px;')} />
        )}
        {onb.s1 && (
          <>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Sex</div>
            <div style={s('display:flex; gap:8px;')}>
              {onb.sexOptions.map((op, i) => (
                <button key={i} onClick={op.set} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:700; padding:13px 0; border-radius:13px; background:${op.bg}; color:${op.color};`)}>{op.label}</button>
              ))}
            </div>
            <div style={s('display:flex; gap:12px; margin-top:22px;')}>
              <div style={s('flex:1;')}>
                <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Age</div>
                <input type="number" value={onb.age} onChange={onb.onAge} placeholder="—" style={s("width:100%; border:1px solid var(--border); border-radius:13px; padding:14px 12px; background:var(--surface); font-family:'JetBrains Mono',monospace; font-size:17px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              </div>
              <div style={s('flex:1;')}></div>
            </div>
          </>
        )}
        {onb.s2 && (
          <div style={s('display:flex; gap:12px;')}>
            <div style={s('flex:1;')}>
              <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Height cm</div>
              <input type="number" value={onb.height} onChange={onb.onHeight} placeholder="—" style={s("width:100%; border:1px solid var(--border); border-radius:13px; padding:14px 12px; background:var(--surface); font-family:'JetBrains Mono',monospace; font-size:17px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
            </div>
            <div style={s('flex:1;')}>
              <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px;')}>Weight kg</div>
              <input type="number" value={onb.weight} onChange={onb.onWeight} placeholder="—" style={s("width:100%; border:1px solid var(--border); border-radius:13px; padding:14px 12px; background:var(--surface); font-family:'JetBrains Mono',monospace; font-size:17px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
            </div>
          </div>
        )}
        {onb.s3 && (
          <div style={s('display:flex; flex-direction:column; gap:9px;')}>
            {onb.goalOptions.map((op, i) => (
              <button key={i} onClick={op.set} style={s(`text-align:left; border:none; cursor:pointer; font-family:inherit; font-size:14.5px; font-weight:700; padding:16px 18px; border-radius:14px; background:${op.bg}; color:${op.color};`)}>{op.label}</button>
            ))}
          </div>
        )}
        {onb.s4 && (
          <div style={s('display:flex; flex-direction:column; gap:8px;')}>
            {onb.activityOptions.map((op, i) => (
              <button key={i} onClick={op.set} style={s(`text-align:left; border:none; cursor:pointer; font-family:inherit; font-size:13.5px; font-weight:700; padding:14px 16px; border-radius:13px; background:${op.bg}; color:${op.color};`)}>{op.label}</button>
            ))}
          </div>
        )}
        {onb.hasErr && (
          <div style={s('margin-top:14px; font-size:12px; font-weight:600; color:#EF4444; line-height:1.5;')}>{onb.err}</div>
        )}
      </div>
      <div style={s('flex:none; display:flex; gap:10px; padding-bottom:calc(env(safe-area-inset-bottom) + 34px);')}>
        {onb.canBack && (
          <button onClick={onb.back} style={s('flex:none; width:56px; border:1px solid var(--border); cursor:pointer; background:var(--surface); color:var(--muted); font-family:inherit; font-size:20px; font-weight:700; border-radius:14px;')}>‹</button>
        )}
        <button onClick={onb.next} style={s(`flex:1; border:none; cursor:${onb.nextCursor}; background:${onb.nextBg}; color:${onb.nextFg}; font-family:inherit; font-size:15px; font-weight:800; padding:16px 0; border-radius:14px; transition:background .2s ease;`)}>{onb.nextLabel}</button>
      </div>
    </div>
  );
}
