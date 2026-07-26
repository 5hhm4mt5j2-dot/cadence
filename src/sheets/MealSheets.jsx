import React from 'react';
import { s } from '../lib/helpers';

export function MealAddSheet({ v }) {
  const ma = v.ma;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeMealAdd} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:52;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:53; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; max-height:88%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>{ma.title}</div>
        {ma.onCustom && (
          <input value={ma.mealName} onChange={ma.onMealName} placeholder="Meal name e.g. Oat Breakfast" style={s('width:100%; margin-top:12px; border:1px solid var(--border); border-radius:11px; padding:11px 12px; background:var(--surface-2); font-family:inherit; font-size:13.5px; font-weight:700; color:var(--text); outline:none;')} />
        )}
        <div style={s('display:flex; gap:4px; margin-top:14px; background:var(--surface-2); border-radius:12px; padding:4px;')}>
          <button onClick={ma.tabText} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:9px 0; border-radius:9px; background:${ma.textTabBg}; color:${ma.textTabFg};`)}>Text</button>
          <button onClick={ma.tabPhoto} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:9px 0; border-radius:9px; background:${ma.photoTabBg}; color:${ma.photoTabFg};`)}>Photo</button>
          <button onClick={ma.tabScan} style={s(`flex:1; border:none; cursor:pointer; font-family:inherit; font-size:12px; font-weight:700; padding:9px 0; border-radius:9px; background:${ma.scanTabBg}; color:${ma.scanTabFg}; display:inline-flex; align-items:center; justify-content:center; gap:5px;`)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="18" height="12" rx="1.5"></rect><path d="M7 9v6M10 9v6M13.5 9v6M17 9v6"></path></svg>Scan</button>
        </div>
        {ma.onText && (
          <>
            <div style={s('margin-top:16px;')}>
              <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Describe your meal</div>
              <textarea value={ma.text} onChange={ma.onTextInput} placeholder="e.g. chicken breast 200g, brown rice 150g, olive oil 1 tbsp" style={s('width:100%; min-height:64px; resize:none; border:1px solid var(--border); border-radius:14px; padding:12px 14px; background:var(--surface-2); font-family:inherit; font-size:13px; font-weight:500; color:var(--text); outline:none;')}></textarea>
              <button onClick={ma.estimate} style={s('width:100%; margin-top:8px; border:1px solid var(--accent); background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--accent); padding:10px 0; border-radius:11px;')}>{ma.estimateLabel}</button>
            </div>
            <div style={s('margin-top:16px;')}>
              <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Or search USDA foods</div>
              <input value={ma.search} onChange={ma.onSearch} placeholder="Search generic names e.g. chicken breast" style={s('width:100%; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:inherit; font-size:13.5px; font-weight:600; color:var(--text); outline:none;')} />
              {ma.searching && (
                <div style={s('margin-top:8px; font-size:11.5px; color:var(--muted); font-weight:600;')}>Searching USDA FoodData Central…</div>
              )}
              {ma.hasSearchErr && (
                <div style={s('margin-top:8px; font-size:11.5px; color:#EF4444; font-weight:600;')}>{ma.searchErr}</div>
              )}
              {ma.hasResults && (
                <div style={s('margin-top:8px; border:1px solid var(--border); border-radius:13px; overflow:hidden;')}>
                  {ma.results.map((r, i) => (
                    <div key={i} onClick={r.add} style={s(`display:flex; align-items:center; justify-content:space-between; padding:11px 13px; border-bottom:1px solid ${r.divider}; cursor:pointer; background:var(--surface);`)}>
                      <span style={s('font-size:13px; font-weight:700; color:var(--text);')}>{r.name}</span>
                      <span style={s("font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--muted); font-weight:600;")}>{r.info}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={s('margin-top:8px; font-size:10.5px; color:var(--faint); font-weight:600; line-height:1.5;')}>Macros from USDA FoodData Central — government-verified. Search generic foods (e.g. “beef, ground, cooked”), not brand names.</div>
            </div>
          </>
        )}
        {ma.onPhoto && (
          <>
            <label style={s('display:flex; flex-direction:column; align-items:center; gap:8px; padding:26px 16px; margin-top:16px; border:1.5px dashed var(--border); border-radius:16px; cursor:pointer; background:var(--surface-2);')}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h2.5L8.5 5.5h7L17.5 8H20a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18V9.5A1.5 1.5 0 0 1 4 8z"></path><circle cx="12" cy="13.5" r="3.4"></circle></svg>
              <span style={s('font-size:13px; font-weight:700; color:var(--text);')}>{ma.photoLabel}</span>
              <span style={s('font-size:11.5px; color:var(--muted); font-weight:500;')}>Snap or upload a photo of your plate</span>
              <input type="file" accept="image/*" onChange={ma.onPhotoPick} style={s('display:none;')} />
            </label>
            <div style={s('margin-top:8px; font-size:10.5px; color:var(--faint); font-weight:600; line-height:1.5;')}>Foods are recognised on-device with TensorFlow.js and matched to USDA macros. Portions are rough estimates — review and adjust the quantities before logging.</div>
          </>
        )}
        {ma.onScan && (
          <>
            <button onClick={ma.scan.openCamera} style={s('width:100%; display:flex; flex-direction:column; align-items:center; gap:8px; padding:26px 16px; margin-top:16px; border:1.5px dashed var(--border); border-radius:16px; cursor:pointer; background:var(--surface-2); font-family:inherit;')}>
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="6" width="18" height="12" rx="1.5"></rect><path d="M7 9v6M10 9v6M13.5 9v6M17 9v6"></path></svg>
              <span style={s('font-size:13px; font-weight:700; color:var(--text);')}>Scan a barcode</span>
              <span style={s('font-size:11.5px; color:var(--muted); font-weight:500;')}>Point your camera at a product barcode</span>
            </button>
            <div style={s('margin-top:8px; font-size:10.5px; color:var(--faint); font-weight:600; line-height:1.5;')}>Nutrition is pulled from Open Food Facts (1M+ products), with USDA FoodData Central as a fallback. Scans are cached on-device.</div>
            <div style={s('display:flex; align-items:center; gap:10px; margin:16px 0 12px;')}>
              <div style={s('flex:1; height:1px; background:var(--border);')}></div>
              <span style={s('font-size:10px; font-weight:700; color:var(--faint); text-transform:uppercase; letter-spacing:.06em;')}>or enter manually</span>
              <div style={s('flex:1; height:1px; background:var(--border);')}></div>
            </div>
            <div style={s('display:flex; gap:8px;')}>
              <input value={ma.scan.manual} onChange={ma.scan.onManual} inputMode="numeric" placeholder="Barcode number" style={s("flex:1; min-width:0; border:1px solid var(--border); border-radius:11px; padding:11px 13px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:var(--text); outline:none;")} />
              <button onClick={ma.scan.submitManual} style={s('flex:none; border:1px solid var(--accent); background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--accent); padding:0 16px; border-radius:11px;')}>Look up</button>
            </div>
            {ma.scan.hasCamErr && (
              <div style={s('margin-top:8px; font-size:11.5px; color:#EF4444; font-weight:600;')}>{ma.scan.camErr}</div>
            )}
          </>
        )}
        {ma.busy && (
          <div style={s('margin-top:14px; text-align:center; font-size:12.5px; color:var(--muted); font-weight:600;')}>Estimating your meal…</div>
        )}
        {ma.hasError && (
          <div style={s('margin-top:14px; text-align:center; font-size:12px; color:#EF4444; font-weight:600;')}>{ma.error}</div>
        )}
        {ma.hasItems && (
          <div style={s('margin-top:18px;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px;')}>This meal</div>
            <div style={s('display:flex; flex-direction:column;')}>
              {ma.items.map((it, i) => (
                <div key={i} style={s('display:flex; align-items:center; gap:9px; padding:9px 0; border-bottom:1px solid var(--border);')}>
                  <div style={s('flex:1; min-width:0;')}>
                    <div style={s('font-size:13px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{it.food}</div>
                    <div style={s("font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--muted); font-weight:600; margin-top:2px;")}>{it.macros}</div>
                  </div>
                  <input type="number" value={it.qty} onChange={it.onQty} style={s("width:60px; flex:none; border:1px solid var(--border); border-radius:9px; padding:8px 4px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:12.5px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
                  <button onClick={it.toggleUnit} style={s('flex:none; border:1px solid var(--border); background:var(--surface-2); border-radius:9px; cursor:pointer; font-family:inherit; font-size:11px; font-weight:700; color:var(--muted); padding:8px 9px; min-width:34px;')}>{it.unit}</button>
                  <button onClick={it.remove} style={s('width:30px; height:30px; flex:none; border:1px solid var(--border); background:transparent; border-radius:9px; cursor:pointer; color:#EF4444; font-size:16px; line-height:1; display:inline-flex; align-items:center; justify-content:center;')}>×</button>
                </div>
              ))}
            </div>
            <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:12px; background:var(--surface-2); border-radius:12px; padding:12px 14px;')}>
              <span style={s('font-size:12px; font-weight:700; color:var(--muted);')}>Meal total</span>
              <span style={s("font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:var(--accent);")}>{ma.total}</span>
            </div>
            {ma.onLog && (
              <>
                <button onClick={v.confirmMeal} style={s('width:100%; margin-top:16px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Log meal</button>
                <button onClick={ma.startSave} style={s('width:100%; margin-top:9px; border:1px solid var(--accent); background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:var(--accent); padding:11px 0; border-radius:13px;')}>Save as Custom Meal</button>
              </>
            )}
            {ma.onCustom && (
              <button onClick={ma.saveCustom} style={s(`width:100%; margin-top:16px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px; opacity:${ma.saveOpacity};`)}>Save Meal</button>
            )}
          </div>
        )}
      </div>
      {ma.scanOverlay && (
        <div style={s('position:absolute; inset:0; z-index:60; background:#0b0b0c; display:flex; flex-direction:column;')}>
          <div style={s('display:flex; align-items:center; gap:10px; padding:16px 18px; flex:none;')}>
            <button onClick={ma.scan.closeCamera} style={s('width:38px; height:38px; flex:none; border:none; border-radius:11px; background:rgba(255,255,255,.12); cursor:pointer; display:inline-flex; align-items:center; justify-content:center;')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7"></path></svg>
            </button>
            <span style={s('font-size:15px; font-weight:800; color:#fff; letter-spacing:-.01em;')}>Scan barcode</span>
          </div>
          {ma.scan.showCam && (
            <div style={s('flex:1; position:relative; overflow:hidden;')}>
              <div id="lt-scan-cam" style={s('position:absolute; inset:0; background:#000;')}></div>
              <div style={s('position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center;')}>
                <div style={s(`width:78%; height:32%; border-radius:18px; box-shadow:0 0 0 100vmax rgba(0,0,0,.5); border:2px solid ${ma.scan.boxColor}; position:relative; transition:border-color .2s;`)}>
                  {ma.scan.detected && (
                    <div style={s('position:absolute; inset:0; display:flex; align-items:center; justify-content:center;')}>
                      <div style={s('width:54px; height:54px; border-radius:999px; background:#22C55E; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(34,197,94,.5);')}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={s('position:absolute; left:0; right:0; bottom:26px; text-align:center; color:rgba(255,255,255,.86); font-size:13px; font-weight:600;')}>{ma.scan.camHint}</div>
              {ma.scan.isLooking && (
                <div style={s('position:absolute; inset:0; background:rgba(0,0,0,.55); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px;')}>
                  <div style={s('width:34px; height:34px; border-radius:999px; border:3px solid rgba(255,255,255,.25); border-top-color:#fff; animation:sunSpin .8s linear infinite;')}></div>
                  <span style={s('color:#fff; font-size:13.5px; font-weight:700;')}>Looking up product…</span>
                </div>
              )}
            </div>
          )}
          {ma.scan.isFound && (
            <div className="scrollable" style={s('flex:1; overflow-y:auto; padding:8px 20px 24px;')}>
              <div style={s('display:flex; gap:14px; align-items:center;')}>
                {ma.scan.product.hasImage && (
                  <div style={s(ma.scan.product.imageStyle)}></div>
                )}
                <div style={s('flex:1; min-width:0;')}>
                  <div style={s('font-size:16px; font-weight:800; color:#fff; letter-spacing:-.01em; line-height:1.25;')}>{ma.scan.product.name}</div>
                  {ma.scan.product.hasBrand && (
                    <div style={s('font-size:12.5px; color:rgba(255,255,255,.6); font-weight:600; margin-top:3px;')}>{ma.scan.product.brand}</div>
                  )}
                  <div style={s('font-size:10.5px; color:rgba(255,255,255,.42); font-weight:600; margin-top:5px;')}>{ma.scan.product.serving} · {ma.scan.product.source}</div>
                </div>
              </div>
              <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:22px;')}>
                <span style={s('font-size:12.5px; font-weight:700; color:rgba(255,255,255,.7);')}>Servings</span>
                <div style={s('display:flex; align-items:center; gap:10px;')}>
                  <button onClick={ma.scan.decServ} style={s('width:34px; height:34px; border:none; border-radius:10px; background:rgba(255,255,255,.14); color:#fff; font-size:20px; cursor:pointer; line-height:1;')}>−</button>
                  <input type="number" value={ma.scan.servings} onChange={ma.scan.onServ} style={s("width:58px; border:none; border-radius:10px; padding:9px 4px; background:rgba(255,255,255,.14); color:#fff; font-family:'JetBrains Mono',monospace; font-size:14px; font-weight:800; text-align:center; outline:none;")} />
                  <button onClick={ma.scan.incServ} style={s('width:34px; height:34px; border:none; border-radius:10px; background:rgba(255,255,255,.14); color:#fff; font-size:20px; cursor:pointer; line-height:1;')}>+</button>
                </div>
              </div>
              <div style={s("margin-top:6px; text-align:right; font-size:11px; color:rgba(255,255,255,.4); font-weight:600; font-family:'JetBrains Mono',monospace;")}>≈ {ma.scan.grams} g</div>
              <div style={s('margin-top:16px; background:rgba(255,255,255,.08); border-radius:14px; padding:14px 16px;')}>
                <div style={s('font-size:10.5px; font-weight:700; color:rgba(255,255,255,.5); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>Macros for this quantity</div>
                <div style={s("font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700; color:#fff;")}>{ma.scan.preview}</div>
              </div>
              <button onClick={ma.scan.add} style={s('width:100%; margin-top:20px; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Add to meal</button>
              <button onClick={ma.scan.tryAgain} style={s('width:100%; margin-top:9px; border:1px solid rgba(255,255,255,.2); background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:rgba(255,255,255,.8); padding:11px 0; border-radius:13px;')}>Scan another</button>
            </div>
          )}
          {ma.scan.isNotFound && (
            <div style={s('flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 34px; text-align:center;')}>
              <div style={s('width:56px; height:56px; border-radius:999px; background:rgba(255,255,255,.12); display:flex; align-items:center; justify-content:center;')}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>
              </div>
              <div style={s('font-size:15px; font-weight:800; color:#fff; margin-top:14px;')}>{ma.scan.notFoundTitle}</div>
              {ma.scan.isNetErr && (
                <div style={s('font-size:12.5px; color:rgba(255,255,255,.6); font-weight:500; line-height:1.55; margin-top:6px;')}>{ma.scan.notFoundBody}</div>
              )}
              {ma.scan.notNetErr && (
                <div style={s('font-size:12.5px; color:rgba(255,255,255,.6); font-weight:500; line-height:1.55; margin-top:6px;')}>We couldn't find <span style={s("font-family:'JetBrains Mono',monospace;")}>{ma.scan.barcode}</span> in Open Food Facts or USDA. Try a different barcode or log it manually.</div>
              )}
              <button onClick={ma.scan.tryAgain} style={s('margin-top:18px; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:13px; font-weight:800; padding:12px 28px; border-radius:12px;')}>Try again</button>
              <button onClick={ma.scan.toText} style={s('margin-top:6px; border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:700; color:rgba(255,255,255,.7); padding:8px;')}>Search or type it instead</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function MealDetailSheet({ v }) {
  const md = v.md;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeMealDetail} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:54;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:55; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; max-height:88%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <input value={md.name} onChange={md.onName} style={s('width:100%; border:none; background:transparent; font-family:inherit; font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em; outline:none; padding:0;')} />
        <div style={s('font-size:11.5px; color:var(--muted); font-weight:600; margin-top:3px;')}>{md.time}</div>
        <div style={s('display:flex; flex-direction:column; margin-top:12px;')}>
          {md.items.map((it, i) => (
            <div key={i} style={s('display:flex; align-items:center; gap:9px; padding:9px 0; border-bottom:1px solid var(--border);')}>
              <div style={s('flex:1; min-width:0;')}>
                <div style={s('font-size:13px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{it.food}</div>
                <div style={s("font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--muted); font-weight:600; margin-top:2px;")}>{it.macros}</div>
              </div>
              <input type="number" value={it.qty} onChange={it.onQty} style={s("width:60px; flex:none; border:1px solid var(--border); border-radius:9px; padding:8px 4px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:12.5px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              <button onClick={it.toggleUnit} style={s('flex:none; border:1px solid var(--border); background:var(--surface-2); border-radius:9px; cursor:pointer; font-family:inherit; font-size:11px; font-weight:700; color:var(--muted); padding:8px 9px; min-width:34px;')}>{it.unit}</button>
              <button onClick={it.remove} style={s('width:30px; height:30px; flex:none; border:1px solid var(--border); background:transparent; border-radius:9px; cursor:pointer; color:#EF4444; font-size:16px; line-height:1; display:inline-flex; align-items:center; justify-content:center;')}>×</button>
            </div>
          ))}
        </div>
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:12px; background:var(--surface-2); border-radius:12px; padding:12px 14px;')}>
          <span style={s('font-size:12px; font-weight:700; color:var(--muted);')}>Meal total</span>
          <span style={s("font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:var(--accent);")}>{md.total}</span>
        </div>
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:18px;')}>
          <button onClick={md.deleteMeal} style={s('border:none; cursor:pointer; background:transparent; font-family:inherit; font-size:13px; font-weight:700; color:#EF4444; padding:10px 4px;')}>Delete meal</button>
          <button onClick={v.closeMealDetail} style={s('border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:700; padding:11px 30px; border-radius:12px;')}>Done</button>
        </div>
      </div>
    </>
  );
}

export function SavedMealDetailSheet({ v }) {
  const smd = v.smd;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeSavedMeal} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:58;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:59; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px; max-height:88%; overflow-y:auto;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <input value={smd.name} onChange={smd.onName} style={s('width:100%; border:none; background:transparent; font-family:inherit; font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em; outline:none; padding:0;')} />
        <div style={s('font-size:11.5px; color:var(--muted); font-weight:600; margin-top:3px;')}>{smd.count}</div>
        <div style={s('display:flex; flex-direction:column; margin-top:12px;')}>
          {smd.items.map((it, i) => (
            <div key={i} style={s('display:flex; align-items:center; gap:9px; padding:9px 0; border-bottom:1px solid var(--border);')}>
              <div style={s('flex:1; min-width:0;')}>
                <div style={s('font-size:13px; font-weight:700; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;')}>{it.food}</div>
                <div style={s("font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--muted); font-weight:600; margin-top:2px;")}>{it.macros}</div>
              </div>
              <input type="number" value={it.qty} onChange={it.onQty} style={s("width:60px; flex:none; border:1px solid var(--border); border-radius:9px; padding:8px 4px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:12.5px; font-weight:700; color:var(--text); outline:none; text-align:center;")} />
              <button onClick={it.toggleUnit} style={s('flex:none; border:1px solid var(--border); background:var(--surface-2); border-radius:9px; cursor:pointer; font-family:inherit; font-size:11px; font-weight:700; color:var(--muted); padding:8px 9px; min-width:34px;')}>{it.unit}</button>
              <button onClick={it.remove} style={s('width:30px; height:30px; flex:none; border:1px solid var(--border); background:transparent; border-radius:9px; cursor:pointer; color:#EF4444; font-size:16px; line-height:1; display:inline-flex; align-items:center; justify-content:center;')}>×</button>
            </div>
          ))}
        </div>
        <div style={s('display:flex; align-items:center; justify-content:space-between; margin-top:12px; background:var(--surface-2); border-radius:12px; padding:12px 14px;')}>
          <span style={s('font-size:12px; font-weight:700; color:var(--muted);')}>Meal total</span>
          <span style={s("font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; color:var(--accent);")}>{smd.total}</span>
        </div>
        <button onClick={smd.addToToday} style={s('width:100%; margin-top:16px; border:none; cursor:pointer; background:var(--accent); color:#fff; font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Add to Today</button>
        <div style={s('display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:14px;')}>
          <button onClick={smd.deleteMeal} style={s('border:none; cursor:pointer; background:transparent; font-family:inherit; font-size:13px; font-weight:700; color:#EF4444; padding:10px 4px;')}>Delete</button>
          <div style={s('display:flex; gap:8px;')}>
            <button onClick={smd.clone} style={s('border:1px solid var(--border); cursor:pointer; background:var(--surface); font-family:inherit; font-size:13px; font-weight:700; color:var(--text); padding:11px 18px; border-radius:12px;')}>Clone</button>
            <button onClick={v.closeSavedMeal} style={s('border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:700; padding:11px 24px; border-radius:12px;')}>Done</button>
          </div>
        </div>
      </div>
    </>
  );
}

export function NutritionExportSheet({ v }) {
  const exd = v.exd;
  return (
    <>
      <div data-lt-backdrop onClick={v.closeExport} style={s('position:absolute; inset:0; background:rgba(0,0,0,.42); z-index:56;')}></div>
      <div data-lt-sheet className="scrollable" style={s('position:absolute; left:0; right:0; bottom:0; z-index:57; background:var(--surface); border-radius:26px 26px 0 0; box-shadow:0 -10px 40px rgba(0,0,0,.26); padding:12px 20px 24px;')}>
        <div style={s('width:40px; height:4px; border-radius:999px; background:var(--border); margin:0 auto 16px;')}></div>
        <div style={s('font-size:17px; font-weight:800; color:var(--text); letter-spacing:-.02em;')}>Export nutrition history</div>
        <div style={s('font-size:12px; color:var(--muted); font-weight:500; margin-top:3px;')}>Pick a date range to generate a PDF report.</div>
        <div style={s('display:flex; gap:9px; margin-top:16px;')}>
          <div style={s('flex:1;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>From</div>
            <input type="date" value={exd.from} onChange={exd.onFrom} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:10px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:12.5px; font-weight:700; color:var(--text); outline:none;")} />
          </div>
          <div style={s('flex:1;')}>
            <div style={s('font-size:11px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px;')}>To</div>
            <input type="date" value={exd.to} onChange={exd.onTo} style={s("width:100%; border:1px solid var(--border); border-radius:11px; padding:10px 10px; background:var(--surface-2); font-family:'JetBrains Mono',monospace; font-size:12.5px; font-weight:700; color:var(--text); outline:none;")} />
          </div>
        </div>
        <button onClick={exd.run} style={s('width:100%; margin-top:20px; border:none; cursor:pointer; background:var(--text); color:var(--surface); font-family:inherit; font-size:14px; font-weight:800; padding:14px 0; border-radius:13px;')}>Export PDF</button>
      </div>
    </>
  );
}
