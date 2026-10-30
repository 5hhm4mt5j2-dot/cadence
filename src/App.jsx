// Cadence — application controller.
// The logic (state, all methods, and renderVals) is preserved verbatim from the
// Claude Design export (Lifts.dc.html). Only the host class changes: DCLogic ->
// React.Component (their setState/state/lifecycle contracts are identical), and
// render() below maps the view-model onto JSX screen/overlay/sheet components.

import React from 'react';
import {
  DAYS, FULL, TYPES, TYPE_COLOR, TYPE_TINT, DUMBBELL, SNEAKER, HEART, MOON, TYPE_ICON,
  typeLabel, dayTypeName, TUT_STEPS, ONB_DEFAULTS, DEFAULT_EX, CARDIO_TYPES, seedCardioDb,
  PACES,
  migrateCardioDb, fmt, fmtDate, fmtDateShort, migrateArchive, exVol, W_DEFAULTS, scheme,
  weekStartISO, daySpan, KCAL_PER_KG, localISO, fixUtcDates, topWeight, loggedLine, exerciseNotes,
  seedSessions, seedExerciseDb, migrateExerciseDb, eqToOptions, eqLabel, KEY, BODY_PARTS,
  PLATE, MACRO_COLORS, ACTIVITY, ACTIVITY_MULT, GOALS, GOAL_RULES, DEFAULT_RECOVERY,
  RPE_SCALE, fmtKcal, mealMacroLine, GPU, itemMacros, sumItems, timeLabel,
  numOrEmpty, isTimed, isBodyweight, fmtSecs, parseSecs, hasRange, repTarget, loadLabel, setVol,
  exHoldSecs, cardioRpe, rpeIntensity, cardioLine,
} from './lib/data';
import { downloadProgramPdf, preloadPdf } from './lib/pdf';
import { s } from './lib/helpers';
import Shell from './components/Shell';

// ---- global undo ----
// The slice of state that IS the user's data (exactly what save() persists). An undo
// step restores the keys one write replaced, so it has to list the same keys — anything
// outside this set is transient UI and is left alone.
const UNDO_KEYS = [
  'recurring', 'week', 'sessions', 'weekOverrides', 'program', 'sessionHistory',
  'programStartDate', 'programName', 'weights', 'archive', 'supplements',
  'supplementsChecked', 'supplementsDate', 'exerciseDb', 'cardioDb', 'profile',
  'meals', 'customMeals', 'recoveryProfile', 'recoveryLog', 'customLabels', 'restMode',
];
// Deep enough to walk back out of a mistake, shallow enough that the stack never holds
// a meaningful amount of memory (each entry is only the keys one write touched).
const UNDO_MAX = 25;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    const recurringDefault = { Mon: 'Push', Tue: 'Rest', Wed: 'Pull', Thu: 'Rest', Fri: 'Legs', Sat: 'Rest', Sun: 'Rest' };
    const program = {};
    DAYS.forEach(d => { const t = recurringDefault[d]; program[d] = { type: t, exercises: (DEFAULT_EX[t] || []).map(x => ({ ...x })) }; });
    const recurring = {};
    DAYS.forEach(d => { recurring[d] = program[d].type; });
    const week = { ...recurring };
    const di = (new Date().getDay() + 6) % 7;
    this.state = {
      theme: 'light',
      themeAuto: true,
      loading: true,
      screen: 'week',
      activeDay: null,
      activeSlot: 'a',
      addWorkout: null,
      bulkEdit: null,
      activeProgramDay: null,
      swipe: null,
      weekOffset: 0,
      weekOverrides: {},
      todayKey: DAYS[di],
      program,
      recurring,
      week,
      sessions: seedSessions(week, program),
      sessionHistory: [],
      programStartDate: localISO(),
      programName: 'Program 1',
      programRename: null,
      archiveId: null,
      moveOpen: false,
      moveSrc: null,
      moveConfirm: null,
      moveTargetOffset: null,
      movePath: null,
      exForm: null,
      menuOpen: false,
      exerciseDb: seedExerciseDb(),
      cardioDb: seedCardioDb(),
      activeCardioType: null,
      cardioAddForm: null,
      activeBodyPart: null,
      dbForm: null,
      programAddForm: null,
      quickAdd: null,
      customLabels: {},
      tagRename: null,
      confirmComplete: false,
      dayMenu: null,
      dayConfirm: null,
      reorderMode: null,
      drag: null,
      sessDrag: null,
      restMode: false,
      supplements: ['Creatine', 'Omega-3', 'ZMA'],
      supplementsChecked: {},
      supplementsDate: this.supplementDayKey(),
      supplementsEditOpen: false,
      supplementsDraft: null,
      newSupplementName: '',
      archiveSwipe: null,
      profile: null,
      meals: [],
      onbStep: 0,
      onbForm: null,
      flowPhase: 'onboarding',
      tutStep: 0,
      tutRect: null,
      tutorialDone: false,
      weatherData: null,
      weatherStatus: 'loading',
      weatherError: '',
      weatherCityInput: '',
      toast: null,
      // Stack of {before, label} — the data each of the last few writes replaced.
      // Session-only: it is deliberately not persisted, so a reload starts clean.
      undoStack: [],
      restartAsk: null,
      importing: false,
      confirmImport: false,
      rpeSheet: null,
      workout: null,
      workoutIdle: false,
      wsOpen: false,
      wcfg: null,
      recoveryPrompt: null,
      recoveryView: false,
      recoveryProfile: { ...DEFAULT_RECOVERY },
      recoveryLog: [],
      profileMenu: false,
      profileEditOpen: false,
      profileForm: null,
      mealAdd: null,
      mealDetail: null,
      customMeals: [],
      savedMealDetail: null,
      exportForm: null,
      nutritionPrint: null,
      weights: [],
      weightForm: null,
      sessionPeek: null,
      archive: [
        { id: 'w1', label: 'From 16 Jun 2026 to 22 Jun 2026', sessions: [
          { day: 'Mon', type: 'Push', date: '2026-06-16', exercises: [ { name: 'Bench Press', sets: 4, reps: 8, weight: 62 }, { name: 'Overhead Press', sets: 3, reps: 10, weight: 42 }, { name: 'Incline DB Press', sets: 3, reps: 12, weight: 24 }, { name: 'Triceps Pushdown', sets: 4, reps: 15, weight: 27 } ] },
          { day: 'Wed', type: 'Pull', date: '2026-06-18', exercises: [ { name: 'Deadlift', sets: 4, reps: 6, weight: 105 }, { name: 'Pull-Up', sets: 4, reps: 9, weight: 0 }, { name: 'Barbell Row', sets: 4, reps: 10, weight: 62 } ] },
          { day: 'Fri', type: 'Legs', date: '2026-06-20', exercises: [ { name: 'Back Squat', sets: 4, reps: 8, weight: 85 }, { name: 'Leg Press', sets: 4, reps: 12, weight: 150 }, { name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 72 } ] },
        ] },
        { id: 'w2', label: 'From 9 Jun 2026 to 15 Jun 2026', sessions: [
          { day: 'Mon', type: 'Push', date: '2026-06-09', exercises: [ { name: 'Bench Press', sets: 4, reps: 8, weight: 60 }, { name: 'Overhead Press', sets: 3, reps: 10, weight: 40 } ] },
          { day: 'Thu', type: 'Pull', date: '2026-06-12', exercises: [ { name: 'Deadlift', sets: 4, reps: 6, weight: 100 }, { name: 'Barbell Row', sets: 4, reps: 10, weight: 58 } ] },
        ] },
      ],
    };
  }

  // ---- automatic theme (#11) ----
  // Dark from 19:00 to 07:00 by the device clock, light otherwise. A manual pick (the
  // header toggle or Menu → Appearance) holds until the next 07:00/19:00 boundary, then
  // the schedule takes over again; the minute tick below is what notices the boundary.
  isNightNow() { const h = new Date().getHours(); return h < 7 || h >= 19; }
  nextThemeBoundary() {
    const n = new Date(); const h = n.getHours();
    // Hour 31 rolls over to 07:00 tomorrow.
    return new Date(n.getFullYear(), n.getMonth(), n.getDate(), h < 7 ? 7 : (h < 19 ? 19 : 31), 0, 0).getTime();
  }
  // Restore a manual pick only while its window is still open; anything older (including
  // overrides saved before they expired) falls back to the schedule.
  _loadThemePref() {
    let t = null, auto = true, until = 0;
    try { t = localStorage.getItem('lt_theme'); auto = localStorage.getItem('lt_theme_auto') !== 'false'; until = +(localStorage.getItem('lt_theme_until') || 0); } catch (e) {}
    if (!auto && t && until > Date.now()) { this._themeUntil = until; this.setState({ theme: t, themeAuto: false }); return; }
    this._themeUntil = null;
    this.setState({ themeAuto: true }, () => this.applyAutoTheme());
  }

  // ---- body weight as load (#5) ----
  // The most recent weigh-in, else the profile's weight. Memoised on the two references it
  // reads because volume is summed for every exercise on every render.
  bodyweightKg() {
    const ws = this.state.weights || [], prof = this.state.profile;
    const m = this._bwMemo;
    if (m && m.ws === ws && m.prof === prof) return m.kg;
    let last = null;
    ws.forEach(w => { if (w && w.kg > 0 && (!last || w.date >= last.date)) last = w; });
    const kg = last ? last.kg : ((prof && +prof.weight) || 0);
    this._bwMemo = { ws, prof, kg };
    return kg;
  }
  exVol(e) { return exVol(e, this.bodyweightKg()); }
  // A logged record's volume, recomputed rather than read from `rec.volume` so records
  // written before bodyweight counted (or with a stale total) read the same as new ones.
  recordVolume(rec) { return ((rec && rec.exercises) || []).reduce((a, e) => a + this.exVol(e), 0); }
  // #8 — a logged record that stands for a completed day: not un-completed afterwards,
  // and holding real work (a logged set, planned load, a hold, or cardio time/distance).
  // Rest days and records that never had anything done in them don't count.
  recordCompleted(rec) {
    if (!rec || rec.completed === false || rec.type === 'Rest' && !(rec.exercises || []).length) return false;
    return (rec.exercises || []).some(e => (e.cardio
      ? (+e.duration > 0 || +e.distance > 0)
      : ((e.logged || []).some(l => !l.skipped) || this.exVol(e) > 0 || exHoldSecs(e) > 0)));
  }

  // Supplements roll over at 03:00 local (not midnight) so before-bed doses (ZMA etc.)
  // logged after midnight aren't wiped. Shift "now" back 3h, then take the local date.
  supplementDayKey() {
    return localISO(Date.now() - 3 * 3600 * 1000);
  }

  checkSupplementsReset() {
    const today = this.supplementDayKey();
    if (this.state.supplementsDate !== today) this.save({ supplementsChecked: {}, supplementsDate: today }, null);
  }

  applyAutoTheme() {
    if (!this.state.themeAuto) {
      if (this._themeUntil && Date.now() < this._themeUntil) return;
      // The manual pick ran out at a 07:00/19:00 boundary — back to the schedule.
      this._themeUntil = null;
      try { localStorage.setItem('lt_theme_auto', 'true'); localStorage.removeItem('lt_theme_until'); } catch (e) {}
    }
    const theme = this.isNightNow() ? 'dark' : 'light';
    if (theme !== this.state.theme || !this.state.themeAuto) this.setState({ theme, themeAuto: true });
  }

  // ---- day rollover ----
  // `state.todayKey` is the weekday the app believes it is. It was computed once in the
  // constructor, so an app left open overnight kept highlighting yesterday on the week
  // strip, kept yesterday's workout on the home card, and kept showing the "Lift Done
  // for Today" screen for a session finished the day before. Re-checked on a timeout
  // armed for the next local midnight, on the 5-minute housekeeping tick, and on every
  // return from the background — the timeout alone can't be trusted, because a sleeping
  // device simply doesn't fire it on time.
  refreshToday() {
    const key = DAYS[(new Date().getDay() + 6) % 7];
    if (key !== this.state.todayKey) {
      this.setState({ todayKey: key });
      // A new day can also be a new week, which is when last week's completed flags and
      // logged sets turn stale.
      this.normalizeCompletions();
    }
    this._armMidnight();
  }

  // One timeout re-armed each time it fires, rather than polling for the date to change.
  // Two seconds past midnight, so the clock has unambiguously ticked over.
  _armMidnight() {
    clearTimeout(this._midnightT);
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
    this._midnightT = setTimeout(() => this.refreshToday(), Math.max(1000, next - now));
  }

  componentDidMount() {
    try { const wc = JSON.parse(localStorage.getItem('lt_workout_settings') || 'null'); if (wc) this.setState({ wcfg: { ...W_DEFAULTS, ...wc } }); } catch (e) {}
    // Coming back to a backgrounded app can cross a week boundary, which is when last
    // week's completed flags and logged sets turn stale — re-check straight away rather
    // than waiting out the 5-minute housekeeping tick.
    this._woVis = () => {
      if (document.visibilityState !== 'visible') return;
      if (this.state.workout) this._woWake();
      this.applyAutoTheme();
      this.refreshToday();
      this.normalizeCompletions();
    };
    document.addEventListener('visibilitychange', this._woVis);
    this._loadThemePref();
    this._themeTimer = setInterval(() => this.applyAutoTheme(), 60 * 1000);
    this._autoTimer = setInterval(() => { this.applyAutoTheme(); this.refreshToday(); this.checkSupplementsReset(); this.normalizeCompletions(); this.maybeRefreshWeather(); }, 5 * 60 * 1000);
    this._armMidnight();
    try { const raw = localStorage.getItem(KEY); if (raw) { const d = fixUtcDates(JSON.parse(raw)); const wk = this.reconcileWeekOverrides(d); this.setState({ recurring: d.recurring || this.state.recurring, week: wk.week || d.week || this.state.week, sessions: wk.sessions || d.sessions || this.state.sessions, weekOverrides: wk.weekOverrides, program: d.program || this.state.program, sessionHistory: d.sessionHistory || this.state.sessionHistory, programStartDate: d.programStartDate || this.state.programStartDate, programName: d.programName || this.state.programName, weights: Array.isArray(d.weights) ? d.weights : [], archive: migrateArchive(d.archive || this.state.archive), supplements: d.supplements || this.state.supplements, supplementsChecked: d.supplementsChecked || this.state.supplementsChecked, supplementsDate: d.supplementsDate || this.state.supplementsDate, exerciseDb: migrateExerciseDb(d.exerciseDb), profile: d.profile || null, meals: d.meals || [], customMeals: d.customMeals || [], tutorialDone: !!d.tutorialDone, recoveryProfile: d.recoveryProfile || { ...DEFAULT_RECOVERY }, recoveryLog: d.recoveryLog || [], cardioDb: migrateCardioDb(d.cardioDb), customLabels: d.customLabels || {}, restMode: !!d.restMode, flowPhase: (d.profile ? (d.tutorialDone ? 'done' : 'tutorial') : 'onboarding'), tutStep: (d.profile && !d.tutorialDone) ? Math.min(TUT_STEPS.length - 1, Math.max(0, parseInt(localStorage.getItem('lt_tut_step') || '0', 10) || 0)) : 0 }, () => { this.checkSupplementsReset(); this.normalizeCompletions(); this.maybeRecalibrate(); this._tutMeasureSoon(1100); }); } else { this.setState({ flowPhase: 'splash' }); this.checkSupplementsReset(); } } catch (e) {}
    this._loadTimer = setTimeout(() => this.setState({ loading: false }), 800);
    this.initWeather();
    this._ptrDetach = window.LT && window.LT.attach({ onRefresh: () => new Promise((r) => setTimeout(r, 600)) });
    this._scrollTimers = new WeakMap();
    this._onAnyScroll = (e) => {
      const el = e.target;
      if (!el || !el.classList || !el.classList.contains('scrollable')) return;
      el.classList.add('lt-scrolling');
      clearTimeout(this._scrollTimers.get(el));
      this._scrollTimers.set(el, setTimeout(() => el.classList.remove('lt-scrolling'), 500));
    };
    const phone = document.querySelector('[data-lt-phone]');
    this._scrollRoot = phone || document;
    this._scrollRoot.addEventListener('scroll', this._onAnyScroll, { capture: true, passive: true });
  }
  componentWillUnmount() {
    clearTimeout(this._loadTimer); clearInterval(this._autoTimer); clearInterval(this._themeTimer); clearTimeout(this._midnightT);
    clearTimeout(this._toastT); clearTimeout(this._lp); clearTimeout(this._greetLp); clearTimeout(this._tutMeasureT); clearTimeout(this._searchTimer); this._ptrDetach && this._ptrDetach();
    clearInterval(this._woTick); clearTimeout(this._woIdleT); this._woHoldEnd();
    try { this._wl && this._wl.release(); } catch (e) {}
    try { document.removeEventListener('visibilitychange', this._woVis); } catch (e) {}
    try { this._scrollRoot && this._scrollRoot.removeEventListener('scroll', this._onAnyScroll, { capture: true }); } catch (e) {}
  }

  // Flips the look either way: on the schedule it overrides until the next boundary; while
  // overridden it hands back to the schedule (which is always the other look).
  toggleTheme() {
    if (!this.state.themeAuto) {
      this._themeUntil = null;
      try { localStorage.setItem('lt_theme_auto', 'true'); localStorage.removeItem('lt_theme_until'); } catch (e) {}
      this.setState({ themeAuto: true }, () => this.applyAutoTheme());
      return;
    }
    const next = this.state.theme === 'dark' ? 'light' : 'dark';
    this._themeUntil = this.nextThemeBoundary();
    this.setState({ theme: next, themeAuto: false });
    try { localStorage.setItem('lt_theme', next); localStorage.setItem('lt_theme_auto', 'false'); localStorage.setItem('lt_theme_until', String(this._themeUntil)); } catch (e) {}
  }

  // `undoLabel` names the action for the undo button's toast. Pass `null` to keep a
  // write off the undo stack — housekeeping (week rollover, the 03:00 supplement reset,
  // onboarding) isn't something the user did and shouldn't be undoable.
  save(patch, undoLabel) {
    if (undoLabel !== null && !this._undoing) this._pushUndo(patch, undoLabel);
    this.setState(patch, () => {
      try { localStorage.setItem(KEY, JSON.stringify({ recurring: this.state.recurring, week: this.state.week, sessions: this.state.sessions, weekOverrides: this.state.weekOverrides, program: this.state.program, sessionHistory: this.state.sessionHistory, programStartDate: this.state.programStartDate, programName: this.state.programName, weights: this.state.weights, archive: this.state.archive, supplements: this.state.supplements, supplementsChecked: this.state.supplementsChecked, supplementsDate: this.state.supplementsDate, exerciseDb: this.state.exerciseDb, cardioDb: this.state.cardioDb, profile: this.state.profile, meals: this.state.meals, customMeals: this.state.customMeals, tutorialDone: this.state.tutorialDone, recoveryProfile: this.state.recoveryProfile, recoveryLog: this.state.recoveryLog, customLabels: this.state.customLabels, restMode: this.state.restMode })); this._saveFailed = false; } catch (e) { if (!this._saveFailed) { this._saveFailed = true; this.showToast("Couldn't save — device storage may be full or blocked (private browsing). Recent changes won't persist."); } }
    });
  }

  // ---- global undo ----
  // Every write to the user's data funnels through save(), so an undo step is just "put
  // back the slice of state that write replaced". Only the keys a patch actually touches
  // are snapshotted (and only when the value really changed — the app updates
  // immutably, so reference equality is enough), which keeps the stack cheap and makes
  // one tap revert exactly one action.
  _pushUndo(patch, label) {
    const before = {};
    let n = 0;
    UNDO_KEYS.forEach(k => {
      if (!(k in (patch || {})) || patch[k] === this.state[k]) return;
      before[k] = this.state[k];
      n++;
    });
    if (!n) return;
    const stack = (this.state.undoStack || []).concat([{ before, label: label || 'that change', at: Date.now() }]);
    this.setState({ undoStack: stack.slice(-UNDO_MAX) });
  }

  undo() {
    const stack = this.state.undoStack || [];
    if (!stack.length) return;
    const entry = stack[stack.length - 1];
    this.haptic(true);
    // Any half-open editor or drag points at data that is about to change shape, so it
    // closes with the undo rather than reopening onto something that moved.
    this._undoing = true;
    this.save({
      ...entry.before,
      undoStack: stack.slice(0, -1),
      sessDrag: null, drag: null, swipe: null, bulkEdit: null, exForm: null,
      confirmComplete: false, restartAsk: null, sessionPeek: null,
    }, null);
    this._undoing = false;
    this._resyncWorkout();
    this.showToast('Undone — ' + entry.label + '.');
  }

  // Undoing a logged set while the set logger is open moves the workout's cursor, so put
  // it back on whatever the session now says is the next unlogged set.
  _resyncWorkout() {
    if (!this.state.workout) return;
    setTimeout(() => {
      const w = this.state.workout; if (!w) return;
      const slot = w.slot || 'a';
      const sess = this.slotSession(w.day, slot);
      if (!sess) { this.endWorkout(); return; }
      const exs = sess.exercises || [];
      const pos = this._nextPos(exs);
      if (!pos) { this.setState({ workout: { day: w.day, slot, phase: 'summary' }, workoutIdle: false }); return; }
      const pf = this._prefill(exs[pos.exIdx]);
      this.setState({ workout: { day: w.day, slot, exIdx: pos.exIdx, setIdx: pos.setIdx, phase: 'set', reps: pf.reps, weight: pf.weight, secs: pf.secs, editSet: null }, workoutIdle: false });
      this._woIdleReset();
    }, 0);
  }

  // ---- Toasts ----
  showToast(msg) {
    clearTimeout(this._toastT);
    this.setState({ toast: msg });
    this._toastT = setTimeout(() => this.setState({ toast: null }), 3800);
  }

  // ---- JSON export (dynamic dump of app-owned localStorage) ----
  _appStateDump() {
    const appState = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k === KEY || k.indexOf('lt_') === 0 || k.indexOf('cadence') === 0) {
          const v = localStorage.getItem(k);
          try { appState[k] = JSON.parse(v); } catch (e) { appState[k] = v; }
        }
      }
    } catch (e) {}
    return appState;
  }

  exportData() {
    const backup = { cadenceBackup: { version: '1.0', exportDate: new Date().toISOString(), appVersion: '1.0.0', appState: this._appStateDump() } };
    const str = JSON.stringify(backup, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const d = new Date(), pad = (n) => String(n).padStart(2, '0');
    const fn = 'cadence-backup-' + localISO(d) + '-' + pad(d.getHours()) + '-' + pad(d.getMinutes()) + '-' + pad(d.getSeconds()) + '.json';
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = fn;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (e) { this.showToast('Export failed — try again.'); return; }
    const mb = blob.size / (1024 * 1024);
    const sizeStr = mb < 0.01 ? Math.max(1, Math.round(blob.size / 1024)) + ' KB' : mb.toFixed(2) + ' MB';
    this.setState({ profileMenu: false });
    if (blob.size > 5 * 1024 * 1024) this.showToast('Backup exported (' + sizeStr + '). Large file — nearing storage limits.');
    else this.showToast('Backup exported: ' + fn + ' · ' + sizeStr);
  }

  // ---- JSON import ----
  pickImport(context) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'application/json,.json';
    input.onchange = (e) => { const file = e.target.files && e.target.files[0]; if (file) this.importFile(file, context); };
    input.click();
  }

  _importFail(msg) { this.setState({ importing: false, confirmImport: false }); this.showToast(msg); }

  importFile(file, context) {
    this.setState({ importing: true, profileMenu: false });
    const reader = new FileReader();
    reader.onload = () => {
      let json;
      try { json = JSON.parse(reader.result); }
      catch (e) { this._importFail('File is corrupted or not a valid Cadence backup.'); return; }
      const bk = json && json.cadenceBackup;
      if (!bk || !bk.version) { this._importFail("This file isn't a Cadence backup."); return; }
      const major = parseInt(String(bk.version).split('.')[0], 10) || 0;
      if (major > 1) { this._importFail('This backup is from a newer version of Cadence. Please update the app.'); return; }
      if (!bk.appState || typeof bk.appState !== 'object' || !Object.keys(bk.appState).length) { this._importFail('Backup file is incomplete. Cannot restore.'); return; }
      this._pendingImport = { bk, context };
      if (context === 'firstLaunch') { this.doRestore(); }
      else { this.setState({ importing: false, confirmImport: true }); }
    };
    reader.onerror = () => this._importFail('Could not read that file.');
    reader.readAsText(file);
  }

  doRestore() {
    const p = this._pendingImport; if (!p) return;
    const bk = p.bk;
    this.setState({ importing: true, confirmImport: false });
    setTimeout(() => {
      try {
        const appState = bk.appState;
        Object.keys(appState).forEach(k => {
          const v = appState[k];
          localStorage.setItem(k, (v !== null && typeof v === 'object') ? JSON.stringify(v) : String(v));
        });
      } catch (e) {
        this._importFail('Not enough storage to restore this backup. Clear some data or use a different device.');
        return;
      }
      let workouts = 0, meals = 0, cmeals = 0;
      try {
        const main = bk.appState[KEY];
        const d = (main && typeof main === 'object') ? main : JSON.parse(main || '{}');
        workouts = ((d && d.sessionHistory) || []).length;
        meals = ((d && d.meals) || []).length;
        cmeals = ((d && d.customMeals) || []).length;
      } catch (e) {}
      this._pendingImport = null;
      this.showToast('Data restored: ' + workouts + ' workouts, ' + meals + ' meals' + (cmeals ? ', ' + cmeals + ' saved meals' : '') + '. Refreshing…');
      setTimeout(() => this._reloadFromStorage(), 750);
    }, 450);
  }

  _reloadFromStorage() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const d = fixUtcDates(JSON.parse(raw));
        const rwk = this.reconcileWeekOverrides(d);
        this.setState({
          recurring: d.recurring || this.state.recurring, week: rwk.week || d.week || this.state.week, sessions: rwk.sessions || d.sessions || {}, weekOverrides: rwk.weekOverrides,
          program: d.program || this.state.program, sessionHistory: d.sessionHistory || [], programStartDate: d.programStartDate || this.state.programStartDate,
          programName: d.programName || this.state.programName, weights: Array.isArray(d.weights) ? d.weights : [],
          archive: migrateArchive(d.archive || this.state.archive), supplements: d.supplements || this.state.supplements,
          supplementsChecked: d.supplementsChecked || {}, supplementsDate: d.supplementsDate || this.state.supplementsDate,
          exerciseDb: migrateExerciseDb(d.exerciseDb), profile: d.profile || null, meals: d.meals || [], customMeals: d.customMeals || [], tutorialDone: !!d.tutorialDone,
          recoveryProfile: d.recoveryProfile || { ...DEFAULT_RECOVERY }, recoveryLog: d.recoveryLog || [], cardioDb: migrateCardioDb(d.cardioDb), customLabels: d.customLabels || {}, restMode: !!d.restMode,
          flowPhase: (d.profile ? (d.tutorialDone ? 'done' : 'tutorial') : 'onboarding'), tutStep: (d.profile && !d.tutorialDone) ? Math.min(TUT_STEPS.length - 1, Math.max(0, parseInt(localStorage.getItem('lt_tut_step') || '0', 10) || 0)) : 0, importing: false, confirmImport: false, profileMenu: false, screen: 'week', activeDay: null, loading: false,
        }, () => { this.checkSupplementsReset(); this.normalizeCompletions(); this.maybeRecalibrate(); this._tutMeasureSoon(1100); });
      } else { this.setState({ importing: false }); }
    } catch (e) { this.setState({ importing: false }); }
    this._loadThemePref();
    this.initWeather();
  }

  // ---- workout slots ----
  // A day holds a primary workout (slot 'a', the session itself) and an optional second
  // one (slot 'b', `session.extra`) — e.g. a morning lift and an evening cardio. Both are
  // logged, completed and rated independently, and reach sessionHistory as separate
  // records (the second carries `slot:'b'`), so volume and stats never merge them.
  slotSession(day, slot) {
    const base = this.state.sessions[day];
    if (!base) return null;
    return slot === 'b' ? (base.extra || null) : base;
  }
  // sessions map with `patch` applied to one slot of one day.
  patchSlot(day, slot, patch) {
    const base = this.state.sessions[day];
    if (!base) return this.state.sessions;
    if (slot === 'b') {
      if (!base.extra) return this.state.sessions;
      return { ...this.state.sessions, [day]: { ...base, extra: { ...base.extra, ...patch } } };
    }
    return { ...this.state.sessions, [day]: { ...base, ...patch } };
  }
  slotType(day, slot) {
    if (slot === 'b') { const x = this.slotSession(day, 'b'); return (x && x.type) || 'Custom'; }
    return this.state.week[day];
  }
  // Both workouts of a day, as {slot, session} — used wherever a day's totals are summed.
  slotList(sess) {
    if (!sess) return [];
    return sess.extra ? [{ slot: 'a', session: sess }, { slot: 'b', session: sess.extra }] : [{ slot: 'a', session: sess }];
  }
  // How a logged session reads in history, the archive and reports. A day's second
  // workout carries its own name whatever its type, so "Evening run" doesn't flatten
  // back into "Cardio".
  recordTitle(rec) {
    const cl = this.state.customLabels || {};
    const name = ((rec.slot || 'a') === 'b' && rec.label) ? rec.label : dayTypeName(rec.type, rec.day, cl, false, rec.label);
    return FULL[rec.day] + ' · ' + name;
  }
  historyId(day, slot, dateISO) { return day + '_' + dateISO + (slot === 'b' ? '_b' : ''); }
  // The record this week's logged session wrote, if there is one.
  historyRecordFor(day, slot) {
    const monISO = this.weekDayISO(0, DAYS[0]);
    const sunISO = this.weekDayISO(0, DAYS[6]);
    const want = slot === 'b' ? 'b' : 'a';
    const list = (this.state.sessionHistory || []).filter(r => r.day === day && (r.slot || 'a') === want && r.date >= monISO && r.date <= sunISO);
    return list.length ? list[list.length - 1] : null;
  }
  // #57 — editing a workout after it was completed rewrites what was logged, so the
  // history record (and every stat drawn from it) follows the edit instead of going stale.
  syncHistoryExercises(day, slot, exercises) {
    const sess = this.slotSession(day, slot);
    if (!sess || !sess.completed) return null;
    const rec = this.historyRecordFor(day, slot);
    if (!rec) return null;
    const vol = (exercises || []).reduce((a, e) => a + this.exVol(e), 0);
    return (this.state.sessionHistory || []).map(r => (r.id === rec.id
      ? { ...r, exercises: (exercises || []).map(x => ({ ...x })), volume: vol }
      : r));
  }
  // One editable row per exercise for the bulk editor: the planned numbers plus the sets
  // already logged, which can be corrected without undoing the workout (#55/#57).
  bulkRowsFor(sess) {
    return ((sess && sess.exercises) || []).map(e => ({
      name: e.name, cardio: !!e.cardio,
      sets: e.sets != null ? e.sets : 0, reps: e.reps != null ? e.reps : 0, weight: e.weight != null ? e.weight : 0,
      duration: e.duration != null ? e.duration : 0, intensity: e.intensity || 'Moderate',
      distance: e.distance != null ? e.distance : '', rpe: e.cardio ? cardioRpe(e) : null, timed: isTimed(e),
      logged: (e.logged || []).map(l => ({ reps: l.reps != null ? l.reps : '', weight: l.weight != null ? l.weight : '', secs: l.secs != null ? l.secs : '', skipped: !!l.skipped })),
    }));
  }

  // One place to write a session's exercise list: session, recurring template (main slot
  // only, when it still mirrors the day) and the logged record all stay consistent.
  saveSessionExercises(day, slot, exercises, extra) {
    const patch = { sessions: this.patchSlot(day, slot, { exercises }), ...(extra || {}) };
    const hist = this.syncHistoryExercises(day, slot, exercises);
    if (hist) patch.sessionHistory = hist;
    this.save(patch, 'that exercise change');
  }

  // Apply a template change to a live session without throwing away what was logged:
  // matching exercises keep their logged sets, and anything already logged this week
  // stays on the day even after it leaves the template.
  mergeTemplateIntoSession(prev, templateExs) {
    const prevExs = (prev && prev.exercises) || [];
    const used = {};
    const next = (templateExs || []).map(t => {
      const i = prevExs.findIndex((e, idx) => !used[idx] && e.name === t.name);
      if (i < 0) return { ...t };
      used[i] = true;
      const old = prevExs[i];
      return (old.logged && old.logged.length) ? { ...t, logged: old.logged } : { ...t };
    });
    prevExs.forEach((e, idx) => { if (!used[idx] && (e.logged || []).length) next.push({ ...e }); });
    return { ...(prev || { completed: false, notes: '' }), exercises: next };
  }

  // An "every week" edit writes the recurring template AND the week on screen, so the
  // change is visible straight away (#60) — except on a day whose session was moved in
  // or out this week, which would otherwise be overwritten by someone else's workout.
  updateProgramDay(day, patch) {
    const p = { ...this.state.program[day], ...patch };
    const program = { ...this.state.program, [day]: p };
    const recurring = { ...this.state.recurring, [day]: p.type };
    const week = { ...this.state.week };
    const wasMoved = this.state.week[day] !== this.state.recurring[day];
    if (!wasMoved) week[day] = p.type;
    const sessions = { ...this.state.sessions };
    const prev = sessions[day];
    if (wasMoved) {
      this.showToast(FULL[day] + ' is holding a moved session this week — the change starts next week.');
    } else if (week[day] && week[day] !== 'Rest') {
      sessions[day] = this.mergeTemplateIntoSession(prev, p.exercises);
    } else if (prev && (prev.exercises || []).some(e => (e.logged || []).length)) {
      // Logged work outlives a switch to Rest: keep the day rather than erase the record.
      sessions[day] = prev;
    } else {
      delete sessions[day];
    }
    this.save({ program, recurring, week, sessions }, 'the program change');
  }

  _beginReorderPress() {
    clearTimeout(this._lp);
    this._lp = setTimeout(() => {
      this.haptic(true);
      this.setState({ reorderMode: this.state.activeProgramDay, swipe: null });
    }, 480);
  }
  _cancelReorderPress() { clearTimeout(this._lp); this._lp = null; }
  _startDrag(clientY, idx, pitch) { this._dragStartY = clientY; this.setState({ drag: { fromIndex: idx, newPos: idx, dy: 0, pitch } }); }
  _moveDrag(clientY) {
    const dr = this.state.drag; if (!dr) return;
    const apd = this.state.activeProgramDay;
    const n = this.state.program[apd].exercises.length;
    const dy = clientY - this._dragStartY;
    let np = dr.fromIndex + Math.round(dy / dr.pitch);
    np = Math.max(0, Math.min(n - 1, np));
    this.setState({ drag: { ...dr, dy, newPos: np } });
  }
  _endDrag() {
    const dr = this.state.drag; if (!dr) return;
    const apd = this.state.activeProgramDay;
    const list = this.state.program[apd].exercises.slice();
    const [m] = list.splice(dr.fromIndex, 1);
    list.splice(dr.newPos, 0, m);
    this.setState({ drag: null });
    this.updateProgramDay(apd, { exercises: list });
  }

  // ===== session-view direct reorder (day view) =====
  _startSessDrag(clientY, idx, pitch) {
    this._sdStartY = clientY;
    this.haptic(true);
    this.setState({ sessDrag: { fromIndex: idx, newPos: idx, dy: 0, pitch } });
  }
  _moveSessDrag(clientY) {
    const dr = this.state.sessDrag; if (!dr) return;
    const ad = this.state.activeDay;
    const sess = this.slotSession(ad, this.state.activeSlot || 'a'); if (!sess) return;
    const n = (sess.exercises || []).length;
    const dy = clientY - this._sdStartY;
    let np = dr.fromIndex + Math.round(dy / dr.pitch);
    np = Math.max(0, Math.min(n - 1, np));
    this.setState({ sessDrag: { ...dr, dy, newPos: np } });
  }
  _endSessDrag() {
    const dr = this.state.sessDrag; if (!dr) return;
    this.setState({ sessDrag: null });
    if (dr.fromIndex === dr.newPos) return;
    const ad = this.state.activeDay;
    const slot = this.state.activeSlot || 'a';
    const move = (arr) => { const l = arr.slice(); const [m] = l.splice(dr.fromIndex, 1); l.splice(dr.newPos, 0, m); return l; };
    const sess = this.slotSession(ad, slot);
    if (!sess) return;
    const sessions = this.patchSlot(ad, slot, { exercises: move(sess.exercises || []) });
    const patch = { sessions };
    // carry the same order into the recurring template when it mirrors this session
    const prog = this.state.program[ad];
    const se = sess.exercises || [];
    let syncedTemplate = false;
    if (slot === 'a' && prog && prog.exercises && prog.exercises.length === se.length && prog.exercises.every((e, i) => e.name === se[i].name)) {
      const program = { ...this.state.program, [ad]: { ...prog, exercises: move(prog.exercises) } };
      patch.program = program;
      syncedTemplate = true;
    }
    const hist = this.syncHistoryExercises(ad, slot, move(sess.exercises || []));
    if (hist) patch.sessionHistory = hist;
    this.haptic(true);
    this.save(patch, 'the reorder');
    this.showToast(syncedTemplate ? 'Order saved — applies every week.' : 'Order saved for this week.');
  }

  addExerciseToProgram(day, item) {
    const p = this.state.program[day];
    const wasRest = p.type === 'Rest';
    const type = wasRest ? 'Custom' : p.type;
    const exercises = (p.exercises || []).concat([{ ...item }]);
    this.updateProgramDay(day, { type, exercises });
    // A Rest day just became a Custom training day — prompt for a real name.
    if (wasRest && !((this.state.customLabels || {})[day])) this.setState({ tagRename: { day, value: '' } });
  }

  addCardioToProgram(day, item) {
    const p = this.state.program[day];
    const type = (p.type === 'Rest') ? 'Cardio' : p.type;
    const exercises = (p.exercises || []).concat([{ ...item, cardio: true }]);
    this.updateProgramDay(day, { type, exercises });
  }

  // ===== multi-week navigation =====
  weekMonday(offset) {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7; // 0 = Monday
    const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow + offset * 7);
    return mon;
  }

  weekKey(offset) { return localISO(this.weekMonday(offset)); }

  // ISO date for a given weekday within the week at `offset`.
  weekDayISO(offset, day) {
    const mon = this.weekMonday(offset);
    const i = DAYS.indexOf(day);
    return localISO(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i));
  }

  // Was a session actually LOGGED for this weekday during the current calendar week?
  // sessions are keyed by weekday and their `completed` flag persists across weeks, so
  // this (not the flag) is the source of truth for "completed this week".
  loggedThisWeek(day, slot) {
    const s = this.state;
    const monISO = this.weekDayISO(0, DAYS[0]);
    const sunISO = this.weekDayISO(0, DAYS[6]);
    const dayISO = this.weekDayISO(0, day);
    const want = slot === 'b' ? 'b' : 'a';
    const inWk = (r) => (r.day === day || (!r.day && r.date === dayISO)) && ((r.slot || 'a') === want) && r.date >= monISO && r.date <= sunISO;
    if ((s.sessionHistory || []).some(inWk)) return true;
    return (s.archive || []).some(w => (w.sessions || []).some(inWk));
  }

  // ---- stale logged sets ----
  // Timestamp of this week's Monday, 00:00 local.
  weekStartTs() { return this.weekMonday(0).getTime(); }

  // `sess` with every logged set performed before this week dropped — the same object
  // when there was nothing to drop, so callers can test identity for "did it change".
  //
  // sessions are keyed by weekday and keep their `logged` arrays indefinitely, so last
  // Monday's sets sit on this Monday: enough to make an untouched workout read as
  // "Resume workout", resume mid-way through, and count its old volume twice. Each entry
  // carries the `ts` it was logged at, which is what tells this week's work from last
  // week's; what the old sets recorded lives on in sessionHistory, written when the
  // session was completed.
  freshSession(sess) {
    if (!sess) return sess;
    const start = this.weekStartTs();
    let changed = false;
    const exercises = (sess.exercises || []).map(e => {
      const lg = e.logged || [];
      if (!lg.length) return e;
      const keep = lg.filter(l => (l.ts || 0) >= start);
      if (keep.length === lg.length) return e;
      changed = true;
      const c = { ...e };
      if (keep.length) c.logged = keep; else delete c.logged;
      return c;
    });
    return changed ? { ...sess, exercises } : sess;
  }

  // Lift sets logged for this session THIS week — what makes a workout resumable.
  loggedSetCount(sess) {
    const start = this.weekStartTs();
    return ((sess && sess.exercises) || []).reduce(
      (a, e) => a + (e.cardio ? 0 : (e.logged || []).filter(l => (l.ts || 0) >= start).length), 0);
  }

  // Clear stale `completed` flags left over from a previous week: a weekday reads as
  // completed only if a workout was logged for it THIS week. Runs on load + periodically
  // so a day that "passes" without a logged session no longer shows as done.
  normalizeCompletions() {
    const sessions = this.state.sessions || {};
    const curKey = this.weekKey(0);
    let changed = false;
    const next = { ...sessions };
    DAYS.forEach(d => {
      const sess = sessions[d];
      if (!sess) return;
      let cur = sess;
      if (cur.completed && !this.loggedThisWeek(d, 'a')) { cur = { ...cur, completed: false }; }
      // A skip belongs to the week it was made in; sessions are keyed by weekday, so it
      // has to be dropped once that week is behind us or the day stays skipped forever.
      if (cur.skipped && cur.skippedWeek !== curKey) { cur = { ...cur }; delete cur.skipped; delete cur.skippedWeek; }
      if (cur.extra && cur.extra.completed && !this.loggedThisWeek(d, 'b')) { cur = { ...cur, extra: { ...cur.extra, completed: false } }; }
      // Sets logged in an earlier week, likewise: they belong to that week's record, not
      // to this week's copy of the same weekday.
      cur = this.freshSession(cur);
      if (cur.extra) { const fx = this.freshSession(cur.extra); if (fx !== cur.extra) cur = { ...cur, extra: fx }; }
      if (cur !== sess) { next[d] = cur; changed = true; }
    });
    if (changed) this.save({ sessions: next }, null);
  }

  // Migrate legacy relative-offset override keys ("1", "-2") to absolute week-start
  // dates, then fold any override matured onto the current week into week/sessions.
  reconcileWeekOverrides(d) {
    const src = d.weekOverrides || {};
    const out = {};
    Object.keys(src).forEach(k => {
      if (/^-?\d+$/.test(k)) out[this.weekKey(parseInt(k, 10))] = src[k];
      else out[k] = src[k];
    });
    const curKey = this.weekKey(0);
    const patch = { weekOverrides: out };
    const matured = out[curKey];
    if (matured) {
      const week = { ...(d.week || this.state.week) };
      const sessions = { ...(d.sessions || this.state.sessions) };
      DAYS.forEach(day => {
        if (matured.types && day in matured.types) {
          week[day] = matured.types[day];
          const os = matured.sessions && matured.sessions[day];
          if (os) sessions[day] = os; else delete sessions[day];
        }
      });
      delete out[curKey];
      patch.week = week; patch.sessions = sessions;
    }
    return patch;
  }

  weekPhrase(offset) {
    return offset === 0 ? 'This week' : (offset < 0 ? (offset === -1 ? 'Last week' : Math.abs(offset) + ' weeks ago') : (offset === 1 ? 'Next week' : 'In ' + offset + ' weeks'));
  }

  weekLabelFor(offset) {
    const mon = this.weekMonday(offset);
    const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
    const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (mon.getMonth() === sun.getMonth()) return 'Week of ' + M[mon.getMonth()] + ' ' + mon.getDate() + '\u2013' + sun.getDate();
    return M[mon.getMonth()] + ' ' + mon.getDate() + ' \u2013 ' + M[sun.getMonth()] + ' ' + sun.getDate();
  }

  // Merged view for a given week offset: recurring template + week-specific overrides.
  // Past weeks additionally overlay sessionHistory — what was actually done wins.
  viewWeek(offset) {
    const s = this.state;
    if (!offset) return { types: s.week, sessions: s.sessions };
    const ov = (s.weekOverrides || {})[this.weekKey(offset)] || {};
    const types = {}; const sessions = {};
    DAYS.forEach(d => {
      const t = (ov.types && d in ov.types) ? ov.types[d] : s.recurring[d];
      types[d] = t;
      if (ov.sessions && d in ov.sessions) {
        if (ov.sessions[d]) sessions[d] = ov.sessions[d];
      } else if (t && t !== 'Rest') {
        sessions[d] = { exercises: ((s.program[d] && s.program[d].exercises) || []).map(e => ({ ...e })), completed: false, notes: '' };
      }
    });
    if (offset < 0) {
      const mon = this.weekMonday(offset);
      const dayDates = {};
      DAYS.forEach((d, i) => { dayDates[localISO(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i))] = d; });
      // Days before the current program started belong to the OLD program:
      // never project the new template backwards — show only what actually happened.
      const startISO = s.programStartDate || '';
      if (startISO) {
        Object.keys(dayDates).forEach(dateISO => {
          const d = dayDates[dateISO];
          if (dateISO < startISO && !(ov.types && d in ov.types)) { types[d] = 'Rest'; delete sessions[d]; }
        });
      }
      const allHist = (s.sessionHistory || []).concat((s.archive || []).flatMap(w => w.sessions || []));
      allHist.forEach(h => {
        const d = dayDates[h.date];
        if (!d) return;
        const rec = { exercises: (h.exercises || []).map(e => ({ ...e })), completed: true, notes: h.notes || '', rpe: h.rpe, label: h.label };
        if ((h.slot || 'a') === 'b') {
          // A day's second workout hangs off the primary one, which may not exist for a
          // week where only the extra was logged.
          const base = sessions[d] || { exercises: [], completed: false, notes: '' };
          sessions[d] = { ...base, extra: { ...rec, type: h.type || 'Custom' } };
        } else {
          types[d] = h.type || types[d];
          sessions[d] = { ...rec, extra: sessions[d] && sessions[d].extra };
        }
      });
    }
    return { types, sessions };
  }

  writeOverride(offset, day, type, session) {
    const key = this.weekKey(offset);
    const all = { ...(this.state.weekOverrides || {}) };
    const cur = all[key] || {};
    const entry = { types: { ...(cur.types || {}) }, sessions: { ...(cur.sessions || {}) } };
    entry.types[day] = type;
    entry.sessions[day] = session || null;
    all[key] = entry;
    return all;
  }

  goWeek(delta) {
    const next = Math.max(-3, Math.min(3, this.state.weekOffset + delta));
    if (next === this.state.weekOffset) return;
    this.haptic(false);
    this.setState({ weekOffset: next }, () => {
      try {
        const el = document.querySelector('[data-week-strip]');
        if (el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = (delta > 0 ? 'wkSlideL' : 'wkSlideR') + ' .42s cubic-bezier(.34,1.4,.64,1)'; }
      } catch (e) {}
    });
  }

  // One-time add: touches only the displayed week (never the recurring template)
  addOneTimeToWeek(day, item, cardio, offset) {
    offset = offset || 0;
    if (!offset) {
      const week = { ...this.state.week };
      const prevType = week[day];
      const type = (prevType && prevType !== 'Rest') ? prevType : (cardio ? 'Cardio' : 'Custom');
      week[day] = type;
      const sessions = { ...this.state.sessions };
      const prev = sessions[day] || { exercises: [], completed: false, notes: '' };
      const ex = cardio ? { ...item, cardio: true } : { ...item };
      sessions[day] = { ...prev, exercises: (prev.exercises || []).concat([ex]) };
      this.save({ week, sessions }, 'adding that exercise');
      if (type === 'Custom' && (!prevType || prevType === 'Rest') && !((this.state.customLabels || {})[day])) this.setState({ tagRename: { day, value: '' } });
      return;
    }
    const view = this.viewWeek(offset);
    const prevType = view.types[day];
    const type = (prevType && prevType !== 'Rest') ? prevType : (cardio ? 'Cardio' : 'Custom');
    const base = view.sessions[day] || { exercises: [], completed: false, notes: '' };
    const ex = cardio ? { ...item, cardio: true } : { ...item };
    const session = { ...base, exercises: (base.exercises || []).concat([ex]) };
    this.save({ weekOverrides: this.writeOverride(offset, day, type, session) }, 'adding that exercise');
    if (type === 'Custom' && (!prevType || prevType === 'Rest') && !((this.state.customLabels || {})[day])) this.setState({ tagRename: { day, value: '' } });
  }

  // Day type conversion: 'every' rewrites the recurring template; 'once' only the displayed week
  applyDayConvert(day, type, scope, offset) {
    offset = offset || 0;
    if (scope === 'every') {
      this.updateProgramDay(day, { type, exercises: [] });
    } else if (!offset) {
      const week = { ...this.state.week }; week[day] = type;
      const sessions = { ...this.state.sessions };
      if (type === 'Rest') delete sessions[day];
      else sessions[day] = { exercises: [], completed: false, notes: '' };
      this.save({ week, sessions }, 'the day change');
    } else {
      const session = type === 'Rest' ? null : { exercises: [], completed: false, notes: '' };
      this.save({ weekOverrides: this.writeOverride(offset, day, type, session) }, 'the day change');
    }
    this.haptic(true);
  }

  // A day's type + session lifted out of its slot, ready to be written elsewhere.
  // A custom day's name lives in customLabels, which is keyed by weekday alone — not by
  // week — so it can't simply be reassigned to the target without renaming that day in
  // every week, including the recurring template. Resolve it onto the session instead:
  // the name follows the workout for this week only, and the source day keeps its
  // standing name for future weeks. A skip is deliberately left behind — re-planning a
  // workout puts it back on the board rather than carrying "skipped" to the new day.
  takeDay(day, off) {
    const view = this.viewWeek(off);
    const type = view.types[day] || 'Rest';
    const src = view.sessions[day];
    if (!src) return { type, session: null };
    const label = type === 'Custom' ? (src.label || (this.state.customLabels || {})[day] || '') : null;
    const session = { ...src, exercises: (src.exercises || []).map(e => ({ ...e })), ...(label == null ? {} : { label }) };
    delete session.skipped; delete session.skippedWeek;
    return { type, session };
  }

  // Apply a list of {day, off, type, session} writes in order, returning a save-patch
  // spanning whichever weeks were touched (offset 0 lives in week/sessions; other weeks
  // live in weekOverrides). Later writes see earlier ones, so several writes into the
  // same week accumulate in one override entry instead of overwriting each other.
  applyDayWrites(writes) {
    const s = this.state;
    const week = { ...s.week };
    const sessions = { ...s.sessions };
    const overrides = { ...(s.weekOverrides || {}) };
    let touchedWeek = false; let touchedOv = false;
    writes.forEach(({ day, off, type, session }) => {
      if (!off) {
        week[day] = type;
        if (session) sessions[day] = session; else delete sessions[day];
        touchedWeek = true;
      } else {
        const key = this.weekKey(off);
        const cur = overrides[key] || {};
        const entry = { types: { ...(cur.types || {}) }, sessions: { ...(cur.sessions || {}) } };
        entry.types[day] = type; entry.sessions[day] = session || null;
        overrides[key] = entry;
        touchedOv = true;
      }
    });
    const patch = {};
    if (touchedWeek) { patch.week = week; patch.sessions = sessions; }
    if (touchedOv) patch.weekOverrides = overrides;
    return patch;
  }

  // Move a chain of sessions in one shot: the workout in path[i] lands on path[i + 1],
  // and the workout sitting on the final slot is discarded (that slot is either free, or
  // the user chose to skip what was there). Every session is lifted out of the pre-move
  // state before anything is written, so a chain that loops back on itself — A onto B
  // while B goes to A — keeps both intact. Sources are cleared first and destinations
  // written last, so a slot that is both keeps whatever lands on it.
  performMovePath(path) {
    if (path.length < 2) return {};
    const taken = path.map(p => this.takeDay(p.day, p.off));
    const writes = path.map(p => ({ day: p.day, off: p.off, type: 'Rest', session: null }));
    for (let i = 0; i < path.length - 1; i++) {
      writes.push({ day: path[i + 1].day, off: path[i + 1].off, type: taken[i].type, session: taken[i].session });
    }
    return this.applyDayWrites(writes);
  }

  // Commit a move chain and report it. `discarded` names the session that the final slot
  // gave up, when the user chose to skip it rather than relocate it.
  commitMovePath(path, discarded) {
    const s = this.state;
    this.haptic(false);
    const patch = this.performMovePath(path);
    const reset = { moveOpen: false, moveSrc: null, moveConfirm: null, moveTargetOffset: null, movePath: null };
    const dest = path[1];
    if (s.breakMode) {
      const log = (s.recoveryLog || []).slice();
      for (let k = log.length - 1; k >= 0; k--) { if (log[k].choice === 'break' && !log[k].action) { log[k] = { ...log[k], action: 'moved_to_' + dest.day }; break; } }
      this.save({ ...patch, ...reset, recoveryLog: log, breakMode: false, activeDay: null, screen: 'week' }, 'the move');
      this.showToast('Workout moved to ' + FULL[dest.day] + '. Rest well.');
      return;
    }
    this.save({ ...patch, ...reset, ...(dest.off === 0 ? { activeDay: dest.day } : {}) }, 'the move');
    const legs = [];
    for (let i = 0; i < path.length - 1; i++) {
      const wk = path[i + 1].off === path[i].off ? '' : ' (' + this.weekPhrase(path[i + 1].off).toLowerCase() + ')';
      legs.push(FULL[path[i].day] + ' moved to ' + FULL[path[i + 1].day] + wk);
    }
    const tail = path[path.length - 1];
    this.showToast(legs.join(' · ') + '.' + (discarded ? ' ' + FULL[tail.day] + "'s " + discarded + ' session was skipped.' : ''));
  }

  // Mark a day's session as intentionally skipped for its week: the exercises stay put
  // (unlike clearing the day, which throws them away) but the session stops reading as
  // work still owed. Stamped with the week it belongs to because sessions are keyed by
  // weekday — an unstamped flag would still be set when that weekday comes round again.
  setSkipped(day, off, skipped) {
    const view = this.viewWeek(off);
    const cur = view.sessions[day];
    if (!cur) return;
    const next = { ...cur };
    if (skipped) { next.skipped = true; next.skippedWeek = this.weekKey(off); next.completed = false; }
    else { delete next.skipped; delete next.skippedWeek; }
    this.haptic(true);
    this.save({ ...this.applyDayWrites([{ day, off, type: view.types[day] || 'Rest', session: next }]), dayMenu: null }, skipped ? 'the skip' : 'putting that day back');
    this.showToast(skipped
      ? (FULL[day] + ' skipped ' + this.weekPhrase(off).toLowerCase() + ' — exercises kept.')
      : (FULL[day] + ' is back on your schedule.'));
  }

  // A moved session carries its own label, which outranks customLabels — so renaming
  // that day has to rewrite the session too, or the moved name keeps winning and the
  // rename looks like it did nothing. Days without a moved session are unaffected.
  sessionLabelPatch(day, label) {
    const cur = this.state.sessions[day];
    if (!cur || cur.label == null) return {};
    return { sessions: { ...this.state.sessions, [day]: { ...cur, label } } };
  }

  // The name currently shown for a day in the live week — the moved session's label if
  // it has one, otherwise the day's standing custom name.
  effectiveDayLabel(day) {
    const cur = this.state.sessions[day];
    if (cur && cur.label != null) return cur.label;
    return (this.state.customLabels || {})[day] || '';
  }

  // The exercise sheet's working copy of an exercise. `timed` / `bw` stay null unless the
  // exercise carries an explicit flag, so they keep following the name until toggled.
  _exFormFrom(e, base) {
    return {
      ...base,
      name: e.name, cardio: !!e.cardio, sets: e.sets, reps: e.reps, weight: e.weight,
      duration: e.duration, intensity: e.intensity, distance: e.distance != null ? e.distance : '', rpe: e.cardio ? cardioRpe(e) : null,
      supersetWith: e.supersetWith || '', dropset: e.dropset || null,
      repRange: hasRange(e), repsMin: hasRange(e) ? e.repsMin : (e.reps || ''), repsMax: hasRange(e) ? e.repsMax : '',
      timed: e.timed != null ? !!e.timed : null, bw: e.bw != null ? !!e.bw : null,
      holdSecs: e.holdSecs != null ? e.holdSecs : 30,
    };
  }
  // Ten effort chips (RPE 1–10) for a cardio entry.
  _effortChips(cur, pick) {
    return RPE_SCALE.map(r => ({ label: String(r.n), bg: +cur === r.n ? TYPE_COLOR.Cardio : 'var(--surface-2)', color: +cur === r.n ? '#fff' : 'var(--text)', pick: () => pick(r.n) }));
  }
  _formTimed(f) { return f.timed != null ? !!f.timed : isTimed({ name: f.name }); }
  _formBw(f) { return f.bw != null ? !!f.bw : isBodyweight({ name: f.name, timed: this._formTimed(f) }); }

  // The exercise the sheet would save. Only the fields that apply are written, and the
  // timed / bodyweight flags only when they differ from what the name implies.
  _exItemFromForm(f) {
    if (f.cardio) {
      const rpe = Math.min(10, Math.max(1, +f.rpe || 5));
      return { name: f.name || 'Cardio', cardio: true, duration: +f.duration || 0, distance: +f.distance || 0, rpe, intensity: rpeIntensity(rpe) };
    }
    const timed = this._formTimed(f), bw = this._formBw(f);
    const item = { name: f.name || 'Exercise', sets: f.sets || 0, reps: f.reps || 0, weight: f.weight || 0 };
    if (timed !== isTimed({ name: item.name })) item.timed = timed;
    if (!timed && bw !== isBodyweight({ name: item.name })) item.bw = bw;
    if (timed) item.holdSecs = Math.max(1, Math.min(3600, f.holdSecs || 30));
    else if (f.repRange && +f.repsMax > +f.repsMin && +f.repsMin > 0) {
      // The range is a display target; `reps` keeps its low end so planned volume stays
      // a number and nothing downstream needs to know about ranges.
      item.repsMin = +f.repsMin; item.repsMax = +f.repsMax; item.reps = +f.repsMin;
    }
    if (f.supersetWith) item.supersetWith = f.supersetWith;
    if (f.dropset && !timed) item.dropset = { pct: f.dropset.pct };
    return item;
  }

  // Write an exercise into a day's list (index null = append) and keep superset pairs
  // two-sided: a partner already on the day gets the link back, a partner picked from
  // the Exercise Database is added straight after it in the same step (#3), and turning
  // the superset off clears the partner's half. Logged sets on the edited exercise stay.
  _applyExerciseEdit(list, index, item, prevPartner) {
    const out = (list || []).map(x => ({ ...x }));
    let at;
    if (index === null || index === undefined || index >= out.length) { out.push({ ...item }); at = out.length - 1; }
    else { const old = out[index]; out[index] = { ...item, ...(old.logged ? { logged: old.logged } : {}) }; at = index; }
    if (prevPartner && prevPartner !== item.supersetWith) {
      out.forEach((x, j) => { if (j !== at && x.name === prevPartner && x.supersetWith === item.name) delete x.supersetWith; });
    }
    if (item.supersetWith) {
      const pj = out.findIndex((x, j) => j !== at && !x.cardio && x.name === item.supersetWith);
      if (pj >= 0) {
        if (!out[pj].supersetWith) out[pj].supersetWith = item.name;
      } else {
        const lu = this.lastUsedFor(item.supersetWith);
        const partner = { name: item.supersetWith, sets: item.sets || 3, reps: item.reps || 10, weight: lu ? (lu.weight || 0) : 0, supersetWith: item.name };
        if (isTimed(partner)) partner.holdSecs = 30;
        out.splice(at + 1, 0, partner);
      }
    }
    return out;
  }

  // A partner left behind stops pointing at the exercise that went.
  _unpair(x, gone) {
    if (!gone || x.supersetWith !== gone.name) return x;
    const c = { ...x }; delete c.supersetWith; return c;
  }

  // #3 — the whole Exercise Database, filtered by body part and search text, for picking
  // a superset partner that isn't on the day yet.
  _dbPartnerList(f) {
    const pk = f.pickPartner || {};
    const q = (pk.q || '').trim().toLowerCase();
    const parts = pk.cat ? BODY_PARTS.filter(b => b.key === pk.cat) : BODY_PARTS;
    const seen = {}; const out = [];
    parts.forEach(b => (this.state.exerciseDb[b.key] || []).forEach(x => {
      if (!x || !x.name || seen[x.name] || x.name === f.name) return;
      if (q && x.name.toLowerCase().indexOf(q) < 0) return;
      seen[x.name] = true; out.push({ name: x.name, part: b.label });
    }));
    return out.slice(0, 40);
  }

  // #56 — the other exercises on the same day, which a superset can be paired with.
  _supersetChoices(f) {
    if (!f || f.cardio) return [];
    const list = f.mode === 'program'
      ? ((this.state.program[f.day] || {}).exercises || [])
      : ((this.slotSession(f.day, f.slot || 'a') || {}).exercises || []);
    return list.filter((e, i) => !e.cardio && i !== f.index && e.name && e.name !== f.name).map(e => e.name);
  }

  removeProgramExerciseAt(day, index) {
    const p = this.state.program[day];
    if (!p) return this.state.program;
    const exercises = (p.exercises || []).filter((_, i) => i !== index);
    return { ...this.state.program, [day]: { ...p, exercises } };
  }

  haptic(strong) { try { navigator.vibrate && navigator.vibrate(strong ? [10, 40, 10] : 8); } catch (e) {} }

  // ---- Workout mode: set logger / rest timer / idle display ----
  saveW(patch) { const wcfg = { ...(this.state.wcfg || W_DEFAULTS), ...patch }; this.setState({ wcfg }); try { localStorage.setItem('lt_workout_settings', JSON.stringify(wcfg)); } catch (e) {} }
  // ---- last used weight (#62) ----
  // The most recent non-skipped set logged for an exercise name, across logged history
  // and archived programs — so repeating a workout starts from what was actually lifted
  // last time rather than the template's number.
  // Memoised per name until sessionHistory / archive change: the set logger asks on every
  // render, and the rest timer re-renders once a second.
  lastUsedFor(name) {
    if (!name) return null;
    const sh = this.state.sessionHistory, ar = this.state.archive;
    const m = this._luMemo;
    if (!m || m.sh !== sh || m.ar !== ar) this._luMemo = { sh, ar, by: {} };
    const by = this._luMemo.by;
    if (!(name in by)) by[name] = this._lastUsedScan(name);
    return by[name];
  }
  _lastUsedScan(name) {
    const recs = (this.state.sessionHistory || []).concat((this.state.archive || []).flatMap(w => w.sessions || []));
    let best = null;
    recs.forEach(r => {
      (r.exercises || []).forEach(e => {
        if (e.cardio || e.name !== name) return;
        const lg = (e.logged || []).filter(l => !l.skipped);
        if (!lg.length) return;
        const last = lg[lg.length - 1];
        const key = (r.date || '') + '|' + String(last.ts || 0).padStart(16, '0');
        if (!best || key > best.key) best = { key, weight: last.weight, reps: last.reps, secs: last.secs, date: r.date };
      });
    });
    return best;
  }
  // What the set logger should open with: this session's own last set first, then the
  // last time this exercise was lifted at all, then the planned target.
  // Timed holds prefill `secs` (the reps field is unused for them).
  _prefill(e) {
    if (!e) return { reps: '0', weight: '0', secs: '0' };
    const hold = String(e.holdSecs || 30);
    const last = (e.logged || []).filter(l => !l.skipped).slice(-1)[0];
    if (last) return { reps: String(last.reps != null ? last.reps : (e.reps || 0)), weight: String(last.weight || 0), secs: String(last.secs != null ? last.secs : hold) };
    const lu = this.lastUsedFor(e.name);
    if (lu) return { reps: String(lu.reps != null ? lu.reps : (e.reps || 0)), weight: String(lu.weight || 0), secs: String(lu.secs != null ? lu.secs : hold) };
    return { reps: String(e.reps || 0), weight: String(e.weight || 0), secs: hold };
  }

  // The next set owed. Inside a superset it is the member furthest behind in the current
  // round, so resuming mid-round lands on the partner rather than starting a new round.
  _nextPos(exs) {
    for (let i = 0; i < exs.length; i++) {
      const e = exs[i]; if (e.cardio) continue;
      if ((e.logged || []).length < (e.sets || 0)) {
        let best = i;
        this._supersetGroup(exs, i).forEach(j => {
          const x = exs[j]; const n = (x.logged || []).length;
          if (n < (x.sets || 0) && n < (exs[best].logged || []).length) best = j;
        });
        return { exIdx: best, setIdx: (exs[best].logged || []).length };
      }
    }
    return null;
  }
  startWorkout() {
    const ad = this.state.activeDay; const slot = this.state.activeSlot || 'a';
    const sess0 = ad && this.slotSession(ad, slot); if (!sess0) return;
    // Drop anything left over from a previous week before deciding where to start, so a
    // fresh week opens at set 1 instead of resuming last week's run (the periodic
    // normalize would get here eventually; this makes it certain at the moment it matters).
    const sess = this.freshSession(sess0);
    const exs = sess.exercises || [];
    if (sess !== sess0) this.save({ sessions: this.patchSlot(ad, slot, { exercises: exs }) }, null);
    if (!exs.some(e => !e.cardio && (e.sets || 0) > 0)) { this.showToast('Add a lift exercise first.'); return; }
    const pos = this._nextPos(exs);
    this.haptic(true);
    this._woUnlockAudio();
    let workout;
    if (!pos) workout = { day: ad, slot, phase: 'summary' };
    else { const pf = this._prefill(exs[pos.exIdx]); workout = { day: ad, slot, exIdx: pos.exIdx, setIdx: pos.setIdx, phase: 'set', reps: pf.reps, weight: pf.weight, secs: pf.secs, editSet: null }; }
    this.setState({ workout, workoutIdle: false });
    this._woWake(); this._woIdleReset();
    if (!this._woTick) this._woTick = setInterval(() => this._woOnTick(), 1000);
  }
  endWorkout(msg) {
    clearInterval(this._woTick); this._woTick = null; clearTimeout(this._woIdleT); this._woHoldEnd();
    try { this._wl && this._wl.release(); } catch (e) {} this._wl = null;
    this.setState({ workout: null, workoutIdle: false });
    if (msg) this.showToast(msg);
  }
  async _woWake() { if (!(this.state.wcfg || W_DEFAULTS).keepAwake) return; try { if (navigator.wakeLock) this._wl = await navigator.wakeLock.request('screen'); } catch (e) {} }
  _woIdleReset() {
    clearTimeout(this._woIdleT);
    if (this.state.workoutIdle) this.setState({ workoutIdle: false });
    const d = (this.state.wcfg || W_DEFAULTS).idleDelay;
    if (this.state.workout && d > 0) this._woIdleT = setTimeout(() => { if (this.state.workout) this.setState({ workoutIdle: true }); }, d * 1000);
  }
  _woOnTick() {
    this.setState(s => { const w = s.workout; if (!w || w.phase !== 'rest' || w.paused) return null; const nl = (w.restLeft || 0) - 1; if (nl <= 0) setTimeout(() => this._woRestDone(), 0); return { workout: { ...w, restLeft: Math.max(0, nl) } }; });
  }
  _woRestDone() {
    const w = this.state.workout; if (!w || w.phase !== 'rest') return;
    const cfg = this.state.wcfg || W_DEFAULTS;
    if (cfg.vibrate) this._woVibrate();
    this._woSound();
    this.setState({ workout: { ...w, phase: 'ready', editSet: null }, workoutIdle: false });
    this._woIdleReset();
  }
  _woVibrate() { try { if (navigator.vibrate) navigator.vibrate([90, 60, 90]); } catch (e) {} }

  // ---- rest-timer chime (#12) ----
  // The chime is synthesised — there is no audio file to resolve. It used to be created
  // lazily when the timer ran out, which is never inside a user gesture, so browsers kept
  // the AudioContext suspended and nothing played. Now every Start / Log tap unlocks
  // audio ahead of time: it resumes the AudioContext and primes an <audio> element with a
  // silent play. The chime itself goes through that <audio> element first (a generated
  // WAV — media playback, which iOS doesn't route through the silent switch the way it
  // does Web Audio) and falls back to the oscillators if the element is refused.
  _woUnlockAudio() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = this._actx || (this._actx = new AC());
        if (ctx.state === 'suspended') ctx.resume().catch(err => console.warn('[cadence] audio unlock: resume failed', err));
      }
    } catch (e) { console.warn('[cadence] audio unlock failed', e); }
    if (this._chimeUnlocked) return;
    try {
      const el = this._chimeEl || (this._chimeEl = new Audio());
      el.muted = true; el.src = this._chimeUrl('silent');
      const p = el.play();
      const done = () => { el.pause(); el.muted = false; this._chimeUnlocked = true; };
      if (p && p.then) p.then(done).catch(err => { el.muted = false; console.warn('[cadence] audio unlock: priming play() rejected', err); });
      else done();
    } catch (e) { console.warn('[cadence] audio unlock failed', e); }
  }

  // A short mono 16-bit WAV for each sound, built once and kept as a blob URL.
  _chimeUrl(type) {
    this._chimes = this._chimes || {};
    if (this._chimes[type]) return this._chimes[type];
    const rate = 22050;
    const tones = type === 'beep' ? [[660, 0, .16, .3, true], [660, .26, .16, .3, true]]
      : (type === 'silent' ? [] : [[880, 0, .5, .4], [1174.66, .16, .6, .4]]);
    const len = Math.ceil(rate * (type === 'silent' ? .1 : (type === 'beep' ? .5 : .85)));
    const data = new Float32Array(len);
    tones.forEach(([f, at, dur, amp, square]) => {
      const s0 = Math.floor(at * rate), n = Math.floor(dur * rate);
      for (let i = 0; i < n && s0 + i < len; i++) {
        const t = i / rate;
        const env = Math.min(1, t / .02) * Math.exp(-5 * t / dur);
        const ph = Math.sin(2 * Math.PI * f * t);
        data[s0 + i] += amp * env * (square ? Math.sign(ph) : ph);
      }
    });
    const buf = new ArrayBuffer(44 + len * 2), dv = new DataView(buf);
    const str = (o, x) => { for (let i = 0; i < x.length; i++) dv.setUint8(o + i, x.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, 36 + len * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, rate, true); dv.setUint32(28, rate * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
    str(36, 'data'); dv.setUint32(40, len * 2, true);
    for (let i = 0; i < len; i++) dv.setInt16(44 + i * 2, Math.max(-1, Math.min(1, data[i])) * 32767, true);
    this._chimes[type] = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    return this._chimes[type];
  }

  _woSound(type) {
    const t = type || (this.state.wcfg || W_DEFAULTS).sound;
    if (!t || t === 'silent') return;
    const viaWebAudio = () => {
      try {
        const ctx = this._actx || (this._actx = new (window.AudioContext || window.webkitAudioContext)());
        if (ctx.state === 'suspended') ctx.resume().catch(err => console.warn('[cadence] rest chime: AudioContext resume rejected', err));
        const mk = (f, at, dur) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = t === 'beep' ? 'square' : 'sine'; o.frequency.value = f; const t0 = ctx.currentTime + at; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(t === 'beep' ? .12 : .2, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + dur + .05); };
        if (t === 'beep') { mk(660, 0, .16); mk(660, .26, .16); } else { mk(880, 0, .5); mk(1174.66, .16, .6); }
      } catch (e) {
        // No way to make a sound at all — at least buzz where the device can.
        console.warn('[cadence] rest chime: Web Audio unavailable', e);
        this._woVibrate();
      }
    };
    try {
      const el = this._chimeEl || (this._chimeEl = new Audio());
      el.muted = false; el.src = this._chimeUrl(t);
      const p = el.play();
      if (p && p.catch) p.catch(err => { console.warn('[cadence] rest chime: <audio> play() rejected, falling back to Web Audio', err); viaWebAudio(); });
    } catch (e) {
      console.warn('[cadence] rest chime: <audio> failed, falling back to Web Audio', e);
      viaWebAudio();
    }
  }
  _mkHold(field, delta) {
    return (ev) => {
      if (ev.type === 'touchstart') this._woLastTouch = Date.now();
      else if (this._woLastTouch && Date.now() - this._woLastTouch < 700) return;
      this._woHoldEnd();
      const fn = () => this._woStep(field, delta);
      fn();
      this._woHT = setTimeout(() => { this._woHI = setInterval(fn, 110); }, 450);
    };
  }
  _woHoldEnd() { clearTimeout(this._woHT); clearInterval(this._woHI); this._woHT = null; this._woHI = null; }
  _woStep(field, delta) {
    this.setState(s => {
      const w = s.workout; if (!w) return null;
      const useEdit = !!w.editSet; const obj = useEdit ? w.editSet : w;
      const isSecs = field.toLowerCase().indexOf('secs') >= 0;
      const cur = isSecs ? parseSecs(obj[field]) : parseFloat(obj[field]); const base = isNaN(cur) ? 0 : cur;
      const max = isSecs ? 3600 : (field.toLowerCase().indexOf('reps') >= 0 ? 100 : 500);
      const v = Math.min(max, Math.max(0, Math.round((base + delta) * 100) / 100));
      const patch = { [field]: String(v) };
      return { workout: useEdit ? { ...w, editSet: { ...w.editSet, ...patch } } : { ...w, ...patch } };
    });
  }
  _woSwipe(ev, field) {
    if (this._wvY == null) return;
    const t = ev.changedTouches && ev.changedTouches[0]; if (!t) { this._wvY = null; return; }
    const dy = t.clientY - this._wvY; this._wvY = null;
    if (Math.abs(dy) > 26) this._woStep(field, (dy < 0 ? 1 : -1) * (field === 'weight' ? 2.5 : 1));
  }
  _woLog(skipped) {
    if (this._woLogTs && Date.now() - this._woLogTs < 350) return;
    this._woLogTs = Date.now();
    const w = this.state.workout; if (!w) return;
    const slot = w.slot || 'a';
    const sess = this.slotSession(w.day, slot); if (!sess) { this.endWorkout(); return; }
    const exs = (sess.exercises || []).map(x => ({ ...x }));
    const e = exs[w.exIdx]; if (!e) { this.endWorkout(); return; }
    this._woUnlockAudio();
    const timed = isTimed(e);
    const reps = parseFloat(w.reps), weight = parseFloat(w.weight), secs = parseSecs(w.secs);
    if (!skipped) {
      if (timed && !(secs > 0 && secs <= 3600)) { this.showToast('Hold time must be between 1 second and 60 minutes.'); return; }
      if (!timed && !(reps > 0 && reps <= 100)) { this.showToast('Reps must be between 0.5 and 100.'); return; }
      if (!(weight >= 0 && weight <= 500)) { this.showToast('Weight must be between 0 and 500 kg.'); return; }
    }
    // A bodyweight set is stamped with the body weight it was done at, so its volume
    // doesn't drift as later weigh-ins come in.
    const entry = skipped ? { set: w.setIdx + 1, skipped: true, ts: Date.now() }
      : (timed ? { set: w.setIdx + 1, secs, weight, ts: Date.now() }
        : { set: w.setIdx + 1, reps, weight, ...(isBodyweight(e) ? { bw: this.bodyweightKg() } : {}), ts: Date.now() });
    const logged = (e.logged || []).concat([entry]);
    exs[w.exIdx] = { ...e, logged };
    this.haptic(!skipped);
    this.save({ sessions: this.patchSlot(w.day, slot, { exercises: exs }) }, skipped ? 'skipping that set' : 'that logged set');
    // #56 — a dropset is logged straight after the working set it hangs off.
    if (!skipped && !timed && e.dropset && e.dropset.pct) {
      const dw = Math.max(0, Math.round(weight * (e.dropset.pct / 100) * 2) / 2);
      this.setState({ workout: { ...w, phase: 'drop', dropIdx: logged.length - 1, dropReps: String(reps), dropWeight: String(dw), editSet: null } });
      return;
    }
    this._woAfterSet(exs, w, skipped);
  }

  // #56 — every exercise linked to exs[i] through `supersetWith`, in either direction, in
  // day order ([i] alone when it isn't in a superset). Following only the direction the
  // pairing was saved from left the other half of the pair resting before its partner.
  _supersetGroup(exs, i) {
    const e = exs[i]; if (!e || e.cardio) return [i];
    const seen = new Set([i]); const queue = [i];
    while (queue.length) {
      const x = exs[queue.shift()];
      exs.forEach((y, j) => {
        if (seen.has(j) || !y || y.cardio) return;
        if ((x.supersetWith && y.name === x.supersetWith) || (y.supersetWith && y.supersetWith === x.name)) { seen.add(j); queue.push(j); }
      });
    }
    return Array.from(seen).sort((a, b) => a - b);
  }

  // Where the workout goes once a set (and its dropset) is in the book. A superset is
  // worked in rounds: each member's set follows straight on from the previous member's
  // with no rest, and the rest timer only runs once the last member of the round is
  // logged — then the next round starts back on the first member still owed a set. An
  // exercise outside a superset is simply a round of one.
  _woAfterSet(exs, w, skipped) {
    const slot = w.slot || 'a';
    const cfg = this.state.wcfg || W_DEFAULTS;
    const e = exs[w.exIdx]; if (!e) { this.endWorkout(); return; }
    const done = (x) => (x.logged || []).length;
    const owed = (x) => done(x) < (x.sets || 0);
    const group = this._supersetGroup(exs, w.exIdx);
    const round = done(e);
    const partnerIdx = group.slice(group.indexOf(w.exIdx) + 1).find(j => owed(exs[j]) && done(exs[j]) < round);
    const go = (idx, phase) => {
      const pf = this._prefill(exs[idx]);
      return { day: w.day, slot, exIdx: idx, setIdx: done(exs[idx]), phase, reps: pf.reps, weight: pf.weight, secs: pf.secs, editSet: null };
    };
    let workout;
    if (partnerIdx != null) {
      workout = { ...go(partnerIdx, 'set'), superFrom: w.exIdx };
    } else {
      const nextIdx = group.find(j => owed(exs[j]));
      if (nextIdx != null) {
        // A skipped set has nothing to recover from, so it goes straight on.
        workout = skipped ? go(nextIdx, 'set')
          : { ...go(nextIdx, 'rest'), restLeft: cfg.rest, restTotal: cfg.rest, paused: false, restStart: Date.now(), restOn: w.exIdx };
      } else {
        const pos = this._nextPos(exs);
        workout = pos ? go(pos.exIdx, 'set') : { day: w.day, slot, phase: 'summary' };
      }
    }
    this.setState({ workout });
  }

  _woLogDrop(skip) {
    const w = this.state.workout; if (!w || w.phase !== 'drop') return;
    const slot = w.slot || 'a';
    const sess = this.slotSession(w.day, slot); if (!sess) { this.endWorkout(); return; }
    const exs = (sess.exercises || []).map(x => ({ ...x }));
    const e = exs[w.exIdx]; if (!e) { this.endWorkout(); return; }
    if (!skip) {
      const reps = parseFloat(w.dropReps), weight = parseFloat(w.dropWeight);
      if (!(reps > 0 && reps <= 100)) { this.showToast('Reps must be between 0.5 and 100.'); return; }
      if (!(weight >= 0 && weight <= 500)) { this.showToast('Weight must be between 0 and 500 kg.'); return; }
      const lg = (e.logged || []).slice();
      if (lg[w.dropIdx]) lg[w.dropIdx] = { ...lg[w.dropIdx], drop: { reps, weight, ts: Date.now() } };
      exs[w.exIdx] = { ...e, logged: lg };
      this.haptic(true);
      this.save({ sessions: this.patchSlot(w.day, slot, { exercises: exs }) }, 'that dropset');
    }
    this._woAfterSet(exs, w, false);
  }
  _woStartSet() {
    const w = this.state.workout; if (!w) return;
    const slot = w.slot || 'a';
    const sess = this.slotSession(w.day, slot); if (!sess) { this.endWorkout(); return; }
    const exs = (sess.exercises || []).map(x => ({ ...x }));
    const e = exs[w.exIdx]; if (!e) { this.endWorkout(); return; }
    this._woUnlockAudio();
    // The rest belongs to the set it followed — in a superset that is the last member of
    // the round, not the exercise coming up next.
    const ri = w.restOn != null ? w.restOn : w.exIdx;
    const re = exs[ri];
    if (w.restStart && re) {
      const lg = (re.logged || []).slice(); const li = lg.length - 1;
      if (li >= 0 && lg[li].restAfter == null) {
        lg[li] = { ...lg[li], restAfter: Math.round((Date.now() - w.restStart) / 1000) };
        exs[ri] = { ...re, logged: lg };
        this.save({ sessions: this.patchSlot(w.day, slot, { exercises: exs }) }, null);
      }
    }
    const pf = this._prefill(e);
    this.haptic(false);
    this.setState({ workout: { day: w.day, slot, exIdx: w.exIdx, setIdx: w.setIdx, phase: 'set', reps: pf.reps, weight: pf.weight, secs: pf.secs, editSet: null } });
  }
  _woEditSave() {
    const w = this.state.workout; if (!w || !w.editSet) return;
    const es = w.editSet;
    const xi = es.exIdx != null ? es.exIdx : w.exIdx;
    const slot = w.slot || 'a';
    const sess = this.slotSession(w.day, slot); if (!sess) return;
    const exs = (sess.exercises || []).map(x => ({ ...x }));
    const e = exs[xi]; if (!e) return;
    const timed = isTimed(e);
    const reps = parseFloat(es.reps), weight = parseFloat(es.weight), secs = parseSecs(es.secs);
    if (timed && !(secs > 0 && secs <= 3600)) { this.showToast('Hold time must be between 1 second and 60 minutes.'); return; }
    if (!timed && !(reps > 0 && reps <= 100)) { this.showToast('Reps must be between 0.5 and 100.'); return; }
    if (!(weight >= 0 && weight <= 500)) { this.showToast('Weight must be between 0 and 500 kg.'); return; }
    const lg = (e.logged || []).slice();
    if (lg[es.idx]) lg[es.idx] = timed ? { ...lg[es.idx], secs, weight } : { ...lg[es.idx], reps, weight };
    exs[xi] = { ...e, logged: lg };
    this.haptic(false);
    this.setState({ workout: { ...w, editSet: null } });
    this.save({ sessions: this.patchSlot(w.day, slot, { exercises: exs }) }, 'that set correction');
  }
  // Undo the edited set: remove it and drop back into logging that slot (values
  // prefilled) so the user can re-do it from scratch.
  _woUndoSet() {
    const w = this.state.workout; if (!w || !w.editSet) return;
    const es = w.editSet;
    const xi = es.exIdx != null ? es.exIdx : w.exIdx;
    const slot = w.slot || 'a';
    const sess = this.slotSession(w.day, slot); if (!sess) return;
    const exs = (sess.exercises || []).map(x => ({ ...x }));
    const e = exs[xi]; if (!e) { this.setState({ workout: { ...w, editSet: null } }); return; }
    const lg = (e.logged || []).slice();
    const removed = lg[es.idx];
    if (!removed) { this.setState({ workout: { ...w, editSet: null } }); return; }
    lg.splice(es.idx, 1);
    exs[xi] = { ...e, logged: lg };
    this.haptic(false);
    const setIdx = removed.set != null ? removed.set - 1 : lg.length;
    this.setState({ workout: { day: w.day, slot, exIdx: xi, setIdx, phase: 'set', reps: String(removed.reps != null ? removed.reps : (e.reps || 0)), weight: String(removed.weight != null ? removed.weight : (e.weight || 0)), secs: String(removed.secs != null ? removed.secs : (e.holdSecs || 30)), editSet: null } });
    this.save({ sessions: this.patchSlot(w.day, slot, { exercises: exs }) }, 'dropping that set');
    this._woIdleReset();
  }

  // ---- #54 restart a day's workout ----
  // Clears every logged set for one slot (the exercises themselves are untouched) and
  // puts it back to "not started". Any history record already written for today is
  // removed too, so stats don't keep counting a run that was thrown away. Reachable both
  // from inside the set logger and from the session screen's Restart button, so the
  // logger is only repositioned when it is actually open on this slot.
  restartSession(day, slot) {
    if (!day) return;
    const sl = slot || 'a';
    const sess = this.slotSession(day, sl); if (!sess) return;
    const exs = (sess.exercises || []).map(e => { const c = { ...e }; delete c.logged; return c; });
    const histId = this.historyId(day, sl, this.todayISO());
    const sessionHistory = (this.state.sessionHistory || []).filter(r => r.id !== histId);
    this.haptic(true);
    this.save({
      sessions: this.patchSlot(day, sl, { exercises: exs, completed: false }),
      sessionHistory,
      restartAsk: null,
      sessionPeek: null,
    }, 'restarting the workout');
    const w = this.state.workout;
    if (w && w.day === day && (w.slot || 'a') === sl) {
      const pos = this._nextPos(exs);
      const pf = pos ? this._prefill(exs[pos.exIdx]) : null;
      this.setState({
        workout: pos
          ? { day, slot: sl, exIdx: pos.exIdx, setIdx: pos.setIdx, phase: 'set', reps: pf.reps, weight: pf.weight, secs: pf.secs, editSet: null }
          : { day, slot: sl, phase: 'summary' },
        workoutIdle: false,
      });
      this._woIdleReset();
    }
    this.showToast('Workout restarted — all logged sets cleared.');
  }

  restartWorkout() {
    const w = this.state.workout; if (!w) return;
    this.restartSession(w.day, w.slot || 'a');
  }

  startGreetPress() {
    if (!this.state.profile) return;
    this._greetMoved = false;
    clearTimeout(this._greetLp);
    this._greetLp = setTimeout(() => { this.haptic(true); this.setState({ profileMenu: true }); }, 480);
  }
  endGreetPress() { clearTimeout(this._greetLp); }

  finishOnboarding() {
    this.haptic(true);
    this.setState({ onbStep: 0, onbForm: null, flowPhase: 'welcome' });
    this.save({ profile: this.computeTargets({ ...ONB_DEFAULTS, ...(this.state.onbForm || {}) }) }, null);
  }

  completeTutorial(skipped) {
    this.haptic(true);
    this.setState({ flowPhase: 'done', tutRect: null, tutStep: 0 });
    this.save({ tutorialDone: true }, null);
    try { localStorage.setItem('cadenceTutorialComplete', 'true'); localStorage.setItem('lt_tut_step', '0'); } catch (e) {}
    if (skipped) this.showToast('You can replay the tutorial from Menu → Replay Tutorial.');
  }

  _tutMeasureSoon(delay) {
    clearTimeout(this._tutMeasureT);
    this._tutMeasureT = setTimeout(() => this.measureTut(), delay || 120);
  }

  advanceTutorial() {
    const next = this.state.tutStep + 1;
    if (next >= TUT_STEPS.length) { this.completeTutorial(); return; }
    this.haptic(false);
    this.setState({ tutStep: next, tutRect: null }, () => this._tutMeasureSoon());
    try { localStorage.setItem('lt_tut_step', String(next)); } catch (e) {}
  }

  measureTut() {
    if (this.state.flowPhase !== 'tutorial') return;
    const step = TUT_STEPS[this.state.tutStep];
    let rect = null;
    const phone = document.querySelector('[data-lt-phone]');
    if (phone && step && step.target) {
      const el = phone.querySelector('[data-tut="' + step.target + '"]');
      if (el) {
        // Targets further down the home screen (weight, supplements, macros) start below
        // the fold — bring them into view first, or the spotlight lands off-screen.
        const p0 = phone.getBoundingClientRect(), r0 = el.getBoundingClientRect();
        const sc = el.closest('[data-lt-scroll]');
        if (sc && (r0.top < sc.getBoundingClientRect().top || r0.bottom > p0.bottom - 40)) { try { el.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) {} }
        const p = phone.getBoundingClientRect(), r = el.getBoundingClientRect();
        rect = { top: Math.round(r.top - p.top) - 6, left: Math.round(r.left - p.left) - 6, width: Math.round(r.width) + 12, height: Math.round(r.height) + 12 };
      }
    }
    const cur = this.state.tutRect;
    const same = (!cur && !rect) || (cur && rect && cur.top === rect.top && cur.left === rect.left && cur.width === rect.width && cur.height === rect.height);
    if (!same) this.setState({ tutRect: rect });
  }

  componentDidUpdate() {
    if (this.state.flowPhase === 'tutorial' && (this._lastTutPhase !== 'tutorial' || this._lastTutStep !== this.state.tutStep)) {
      clearTimeout(this._tutMeasureT);
      this._tutMeasureT = setTimeout(() => this.measureTut(), 50);
    }
    this._lastTutPhase = this.state.flowPhase;
    this._lastTutStep = this.state.tutStep;
    const scanPhase = (this.state.mealAdd && this.state.mealAdd.scan && this.state.mealAdd.scan.phase) || null;
    if (scanPhase === 'camera' && this._camPhase !== 'camera') this._startQuagga();
    else if (scanPhase !== 'camera' && this._camPhase === 'camera') this._stopQuagga();
    this._camPhase = scanPhase;
  }

  computeTargets(f) {
    const w = +f.weight, h = +f.height, age = +f.age;
    const bmr = 10 * w + 6.25 * h - 5 * age + (f.sex === 'Male' ? 5 : (f.sex === 'Female' ? -161 : -78));
    const tdee = Math.round(bmr * (ACTIVITY_MULT[f.activity] || 1.55));
    const r = GOAL_RULES[f.goal] || GOAL_RULES.Maintain;
    // Paced goals (Lose Weight / Gain Muscle) scale the deficit/surplus; others
    // ignore pace. Default to Moderate for a paced goal with no pace set yet.
    const pace = r.paces ? (r.paces[f.pace] != null ? f.pace : 'Moderate') : null;
    const adj = pace ? r.paces[pace] : r.adj;
    const cal = Math.round(tdee * (1 + adj));
    // calibratedAt opens the fortnightly weigh-in window: setting targets by hand
    // (onboarding or a profile edit) restarts the clock from that estimate.
    return { name: (f.name || '').trim(), height: h, weight: w, age, sex: f.sex, goal: f.goal, pace, activity: f.activity, tdee, calories: cal, protein: Math.round(r.pk * w), carbs: Math.round(cal * r.c / 4), fat: Math.round(cal * r.f / 9), calibratedAt: this.todayISO(), calibration: null };
  }

  _setMa(p) { if (this.state.mealAdd) this.setState({ mealAdd: { ...this.state.mealAdd, ...p } }); }

  // ---- USDA FoodData Central ----
  async usdaSearch(query, pageSize) {
    const key = (this.props.usdaApiKey || '').trim();
    if (!key) throw new Error('usda no key'); // set VITE_USDA_API_KEY in .env.local
    const url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=' + encodeURIComponent(key)
      + '&query=' + encodeURIComponent(query)
      + '&pageSize=' + (pageSize || 8)
      + '&dataType=' + encodeURIComponent('Foundation,SR Legacy,Survey (FNDDS)');
    // USDA's edge throttles bursts with a transient nginx 400 (not 429), so a
    // fast sequence of lookups (e.g. a multi-item meal) sees sporadic failures.
    // Retry the transient statuses with backoff before giving up.
    let res;
    for (let attempt = 0; ; attempt++) {
      res = await fetch(url);
      if (res.ok) break;
      if (attempt >= 3 || ![400, 429, 500, 502, 503].includes(res.status)) throw new Error('usda ' + res.status);
      await new Promise(r => setTimeout(r, 400 * (attempt + 1)));
    }
    const json = await res.json();
    return (json.foods || []).map(f => this._usdaToFood(f)).filter(Boolean);
  }

  // Open Food Facts text search — fallback for foods missing from USDA (its 1M+
  // products cover exotic/international/branded items USDA's generic DB lacks).
  // Returns the first product with usable macros in the same shape as usdaSearch.
  async offSearchFood(query) {
    try {
      const url = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=' + encodeURIComponent(query)
        + '&search_simple=1&action=process&json=1&page_size=5'
        + '&fields=' + encodeURIComponent('product_name,generic_name,nutriments');
      const res = await fetch(url);
      if (!res.ok) return null;
      const j = await res.json();
      // Relevance guard: OFF's fuzzy popularity-ranked search will happily return
      // unrelated products (e.g. "omelette" -> a fried-rice product). Require the
      // label to actually appear in the matched name — a wrong macro is worse than
      // falling through to manual entry.
      const q = query.toLowerCase();
      const terms = q.split(/\s+/).filter(w => w.length >= 4);
      for (const p of (j.products || [])) {
        const n = p.nutriments || {};
        const cal = +n['energy-kcal_100g'] || (n['energy_100g'] ? +n['energy_100g'] / 4.184 : 0);
        const c = +n.carbohydrates_100g || 0, prot = +n.proteins_100g || 0, fat = +n.fat_100g || 0;
        if (!cal && !prot && !c && !fat) continue;
        const raw = (p.product_name || p.generic_name || '').trim().toLowerCase();
        const relevant = terms.length ? terms.some(t => raw.includes(t)) : raw.includes(q);
        if (!raw || !relevant) continue;
        return { name: raw.slice(0, 60).replace(/\b\w/g, m => m.toUpperCase()), cal, p: prot, c, f: fat };
      }
    } catch (e) {}
    return null;
  }

  _usdaToFood(f) {
    const get = (num) => {
      const n = (f.foodNutrients || []).find(x => String(x.nutrientNumber) === num);
      return n ? (+n.value || 0) : 0;
    };
    const cal = get('208'), p = get('203'), c = get('205'), fat = get('204');
    if (!cal && !p && !c && !fat) return null;
    let name = (f.description || 'Food').toLowerCase().replace(/\s+/g, ' ').trim();
    name = name.replace(/\b\w/g, m => m.toUpperCase());
    return { name, cal, p, c, f: fat, fdcId: f.fdcId };
  }

  onMealSearch(q) {
    this._setMa({ search: q });
    clearTimeout(this._searchTimer);
    if (!q.trim()) { this._setMa({ results: [], searching: false, searchErr: '' }); return; }
    this._searchTimer = setTimeout(async () => {
      this._setMa({ searching: true, searchErr: '' });
      try {
        const foods = await this.usdaSearch(q.trim(), 8);
        if (this.state.mealAdd && this.state.mealAdd.search.trim() === q.trim())
          this._setMa({ results: foods, searching: false });
      } catch (e) {
        this._setMa({ results: [], searching: false, searchErr: 'USDA search unavailable — check your key or connection.' });
      }
    }, 350);
  }

  // ---- Free-text pattern parsing ----
  _toGrams(val, unit) {
    switch ((unit || '').toLowerCase()) {
      case 'kg': case 'kilogram': case 'kilograms': return val * 1000;
      case 'oz': case 'ounce': case 'ounces': return val * 28.35;
      case 'lb': case 'lbs': case 'pound': case 'pounds': return val * 453.6;
      case 'l': case 'litre': case 'litres': case 'liter': case 'liters': return val * 1000;
      case 'ml': case 'milliliter': case 'milliliters': return val;
      case 'tbsp': case 'tbs': case 'tablespoon': case 'tablespoons': return val * 15;
      case 'tsp': case 'teaspoon': case 'teaspoons': return val * 5;
      case 'cup': case 'cups': return val * 240;
      case 'slice': case 'slices': return val * 30;
      case 'piece': case 'pieces': return val * 50;
      case 'serving': case 'servings': case 'portion': case 'portions': return val * 100;
      default: return val; // grams / unitless
    }
  }

  _parseMealText(text) {
    const parts = text.split(/[,\n;]| and | with /i).map(s => s.trim()).filter(Boolean);
    const unitRe = /(\d+(?:[.,]\d+)?)\s*(kg|kilograms?|g|grams?|oz|ounces?|lbs?|pounds?|ml|milliliters?|l|li?tres?|liters?|tbsp|tbs|tablespoons?|tsp|teaspoons?|cups?|slices?|pieces?|servings?|portions?)?\b/i;
    return parts.map(part => {
      const m = part.match(unitRe);
      let grams = 100, qtyFound = false, name = part;
      if (m && m[1]) {
        qtyFound = true;
        grams = Math.max(1, this._toGrams(parseFloat(m[1].replace(',', '.')), m[2]));
        name = (part.slice(0, m.index) + ' ' + part.slice(m.index + m[0].length)).trim();
      }
      name = name.replace(/^of\s+/i, '').replace(/\s{2,}/g, ' ').trim();
      return { name: name || part, grams: Math.round(grams), qtyFound };
    }).filter(x => x.name);
  }

  async parseTextMeal() {
    const ma = this.state.mealAdd; if (!ma || !ma.text.trim() || ma.busy) return;
    const parts = this._parseMealText(ma.text.trim());
    if (!parts.length) { this._setMa({ error: "Couldn't parse that — try 'chicken breast 200g, brown rice 150g'." }); return; }
    this._setMa({ busy: true, error: '' });
    try {
      const items = [];
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        // Space out multi-item lookups so we don't trip USDA's burst throttle
        // (usdaSearch also retries, but pacing keeps the common case clean).
        if (i > 0) await new Promise(r => setTimeout(r, 150));
        // Ask for a few results and take the first with usable macros — the very
        // top hit is sometimes a macro-less entry that _usdaToFood drops to null.
        const foods = await this.usdaSearch(part.name, 5);
        if (foods && foods[0]) {
          const f = foods[0];
          items.push({ food: f.name, qty: part.grams, pgP: f.p / 100, pgC: f.c / 100, pgF: f.f / 100, pgCal: f.cal / 100, estimated: !part.qtyFound });
        }
      }
      if (!items.length) throw new Error('none matched');
      this._setMa({ busy: false, items: [...this.state.mealAdd.items, ...items] });
    } catch (e) {
      this._setMa({ busy: false, error: "Couldn't match those foods in USDA — try the search below with generic names." });
    }
  }

  // ---- TensorFlow.js photo classification (local) ----
  _loadScript(src) {
    return new Promise((resolve, reject) => {
      this._scripts = this._scripts || {};
      if (this._scripts[src]) return resolve();
      const el = document.createElement('script'); el.src = src; el.async = true;
      el.onload = () => { this._scripts[src] = 1; resolve(); };
      el.onerror = () => reject(new Error('script load failed'));
      document.head.appendChild(el);
    });
  }

  // Google AIY food_V1 — MobileNet V1 trained on 2024 food-dish classes (vs. the
  // old ImageNet MobileNet, which almost never matched an actual meal). The model
  // and its label map are self-hosted under /models, so inference is 100% local:
  // no backend, no per-photo cost, works for any number of concurrent testers.
  async _loadFoodModel() {
    if (this._foodModel) return this._foodModel;
    await this._loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
    await this._loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/tf-tflite.min.js');
    const base = (import.meta.env.BASE_URL || '/');
    window.tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/');
    const [model, labelsText] = await Promise.all([
      window.tflite.loadTFLiteModel(base + 'models/food_v1.tflite'),
      fetch(base + 'models/food_labels.txt').then(r => r.text()),
    ]);
    this._foodModel = model;
    this._foodLabels = labelsText.split('\n').map(l => l.trim());
    return this._foodModel;
  }

  classifyPhoto(ev) {
    const file = ev.target && ev.target.files && ev.target.files[0]; if (!file) return;
    if (!this.state.mealAdd) return;
    this._setMa({ busy: true, error: '', photoName: file.name });
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const model = await this._loadFoodModel();
        const tf = window.tf;
        // Model input is uint8 RGB (192x192 for food_V1) — read the size off the
        // model so we stay correct if the graph changes. tfjs-tflite handles the
        // int32 -> uint8 quantization of the input for us.
        const size = (model.inputs && model.inputs[0] && model.inputs[0].shape && model.inputs[0].shape[1]) || 192;
        const out = tf.tidy(() => {
          const input = tf.cast(tf.expandDims(tf.image.resizeBilinear(tf.browser.fromPixels(img), [size, size])), 'int32');
          const res = model.predict(input);
          return (res && res.dataSync) ? res : res[Object.keys(res)[0]];
        });
        const raw = Array.from(out.dataSync());
        out.dispose();
        URL.revokeObjectURL(url);
        // Output is a quantized score per class on an arbitrary scale; normalise by
        // the total so we can reason about it as a probability distribution.
        const total = raw.reduce((a, b) => a + b, 0) || 1;
        // Rank classes, dropping the background class and untranslated
        // knowledge-graph ids (e.g. "/m/0abc"); keep real dish names.
        const ranked = raw
          .map((p, i) => ({ p: p / total, label: this._foodLabels[i] || '' }))
          .filter(x => x.label && x.label !== '__background__' && !x.label.startsWith('/'))
          .sort((a, b) => b.p - a.p);
        // food_V1 is a single-dish classifier: the top entries are competing
        // guesses for the SAME dish, not separate foods — so take the best guess.
        // A low top score means it's unsure -> fall through to manual entry.
        const best = ranked[0];
        if (!best || best.p < 0.04) throw new Error('no food recognised');
        const label = best.label.toLowerCase();
        // USDA first (government-verified generic macros); fall back to Open Food
        // Facts for the many exotic/international dishes the model emits that USDA
        // has no entry for. Tolerate a USDA hard-failure (throttle) via the catch.
        let f = null;
        try { const matches = await this.usdaSearch(label, 5); f = matches && matches[0]; } catch (e) {}
        if (!f) f = await this.offSearchFood(label);
        if (!f) throw new Error('no macros for label');
        const item = { food: f.name, qty: 180, pgP: f.p / 100, pgC: f.c / 100, pgF: f.f / 100, pgCal: f.cal / 100, estimated: true };
        this._setMa({ busy: false, items: [...this.state.mealAdd.items, item] });
      } catch (e) {
        URL.revokeObjectURL(url);
        this._setMa({ busy: false, error: "Couldn't identify foods in that photo — try a clearer shot or use the Text tab." });
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); this._setMa({ busy: false, error: "Couldn't read that photo." }); };
    img.crossOrigin = 'anonymous';
    img.src = url;
  }

  // ---- Barcode scanning (Open Food Facts + USDA fallback) ----
  _setScan(p) {
    const ma = this.state.mealAdd; if (!ma) return;
    this.setState({ mealAdd: { ...ma, scan: { ...(ma.scan || {}), ...p } } });
  }

  async lookupBarcode(code) {
    const cacheKey = 'lt_bc_' + code;
    try { const c = JSON.parse(localStorage.getItem(cacheKey) || 'null'); if (c && c.per100) return c; } catch (e) {}
    let netErr = false;
    // Open Food Facts
    try {
      const res = await fetch('https://world.openfoodfacts.org/api/v0/product/' + encodeURIComponent(code) + '.json');
      const j = await res.json();
      if (j && j.status === 1 && j.product) {
        const p = j.product, n = p.nutriments || {};
        const kcal = +n['energy-kcal_100g'] || (n['energy_100g'] ? +n['energy_100g'] / 4.184 : 0);
        const per100 = { cal: kcal, p: +n.proteins_100g || 0, c: +n.carbohydrates_100g || 0, f: +n.fat_100g || 0 };
        if (per100.cal || per100.p || per100.c || per100.f) {
          let sg = parseFloat(p.serving_quantity) || 0;
          if (!sg && p.serving_size) { const m = String(p.serving_size).match(/([\d.]+)\s*g/i); if (m) sg = parseFloat(m[1]); }
          const prod = {
            name: (p.product_name || p.generic_name || 'Product').trim().slice(0, 60),
            brand: (p.brands || '').split(',')[0].trim(),
            image: p.image_front_small_url || p.image_front_url || p.image_url || '',
            per100, servingG: sg || 100, hasServing: !!sg, barcode: code, source: 'Open Food Facts',
          };
          try { localStorage.setItem(cacheKey, JSON.stringify(prod)); } catch (e) {}
          return prod;
        }
      }
    } catch (e) { netErr = true; }
    // USDA fallback
    try {
      const foods = await this.usdaSearch(code, 1);
      if (foods && foods[0]) {
        const f = foods[0];
        const prod = { name: f.name, brand: '', image: '', per100: { cal: f.cal, p: f.p, c: f.c, f: f.f }, servingG: 100, hasServing: false, barcode: code, source: 'USDA FoodData Central' };
        try { localStorage.setItem(cacheKey, JSON.stringify(prod)); } catch (e) {}
        return prod;
      }
    } catch (e) { netErr = true; }
    return { notFound: true, netErr };
  }

  openCamera() { this._setScan({ phase: 'camera', camErr: '', detected: false, _busy: false, product: null }); }

  closeCamera() { this._stopQuagga(); this._setScan({ phase: 'idle', detected: false, _busy: false }); }

  onBarcodeDetected(code) {
    const ma = this.state.mealAdd; if (!ma) return;
    const sc = ma.scan || {};
    if (sc.phase !== 'camera' || sc._busy) return;
    this._stopQuagga();
    this.haptic(true);
    this._setScan({ detected: true, barcode: code, _busy: true });
    setTimeout(() => this.resolveBarcode(code), 480);
  }

  async resolveBarcode(code) {
    if (!this.state.mealAdd) return;
    this._setScan({ phase: 'looking', barcode: code });
    const prod = await this.lookupBarcode(code);
    if (!this.state.mealAdd) return;
    if (prod && prod.per100) this._setScan({ phase: 'found', product: prod, qty: 1, _busy: false, detected: false });
    else this._setScan({ phase: 'notfound', _busy: false, detected: false, netErr: !!(prod && prod.netErr) });
  }

  submitManual() {
    const ma = this.state.mealAdd; if (!ma) return;
    const code = ((ma.scan || {}).manual || '').trim();
    if (!/^\d{6,14}$/.test(code)) { this._setScan({ camErr: 'Enter a valid barcode number (6–14 digits).' }); return; }
    this._setScan({ camErr: '', _busy: true });
    this.resolveBarcode(code);
  }

  addScannedProduct() {
    const ma = this.state.mealAdd; if (!ma || !ma.scan || !ma.scan.product) return;
    const p = ma.scan.product;
    const servings = Math.max(0.1, parseFloat(ma.scan.qty) || 1);
    const grams = Math.max(1, Math.round(p.servingG * servings));
    const item = { food: p.brand ? (p.name + ' — ' + p.brand) : p.name, qty: grams, pgP: p.per100.p / 100, pgC: p.per100.c / 100, pgF: p.per100.f / 100, pgCal: p.per100.cal / 100, estimated: !p.hasServing };
    this.haptic(true);
    this._stopQuagga();
    this.setState({ mealAdd: { ...ma, items: [...ma.items, item], scan: { phase: 'idle', manual: '' } } });
  }

  async _startQuagga() {
    try { await this._loadScript('https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.4/dist/quagga.min.js'); }
    catch (e) { this._setScan({ phase: 'idle', camErr: 'Scanner failed to load — enter the barcode manually.' }); return; }
    const Q = window.Quagga, el = document.getElementById('lt-scan-cam');
    if (!Q || !el) return;
    Q.init({
      inputStream: { type: 'LiveStream', target: el, constraints: { facingMode: 'environment' }, area: { top: '25%', right: '8%', left: '8%', bottom: '25%' } },
      locator: { patchSize: 'medium', halfSample: true },
      numOfWorkers: 0, frequency: 10,
      decoder: { readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader', 'code_128_reader', 'code_39_reader'] },
    }, (err) => {
      const cur = this.state.mealAdd && this.state.mealAdd.scan;
      if (err) { this._setScan({ phase: 'idle', camErr: 'Camera unavailable. Grant camera access or enter the barcode manually.' }); return; }
      if (cur && cur.phase === 'camera') { try { Q.start(); this._quaggaOn = true; } catch (e) {} }
      else { try { Q.stop(); } catch (e) {} }
    });
    this._qDetHandler = (res) => { const code = res && res.codeResult && res.codeResult.code; if (code) this.onBarcodeDetected(code); };
    Q.onDetected(this._qDetHandler);
  }

  _stopQuagga() {
    const Q = window.Quagga;
    if (Q && this._quaggaOn) { try { if (this._qDetHandler) Q.offDetected(this._qDetHandler); Q.stop(); } catch (e) {} this._quaggaOn = false; }
  }

  exportNutritionPdf() {
    const f = this.state.exportForm, prof = this.state.profile;
    if (!f || !f.from || !f.to || !prof) return;
    const byDate = {};
    (this.state.meals || []).filter(m => m.date >= f.from && m.date <= f.to).forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });
    const dates = Object.keys(byDate).sort();
    let met = 0, calSum = 0, pSum = 0, cSum = 0, fSum = 0;
    const days = dates.map(d => {
      const ms = byDate[d].slice().sort((a, b) => a.ts - b.ts);
      const t = ms.reduce((a, m) => ({ p: a.p + m.protein, c: a.c + m.carbs, f: a.f + m.fat, cal: a.cal + m.calories }), { p: 0, c: 0, f: 0, cal: 0 });
      calSum += t.cal; pSum += t.p; cSum += t.c; fSum += t.f;
      const diff = t.cal - prof.calories;
      const hit = Math.abs(diff) <= prof.calories * 0.05;
      if (hit) met++;
      return {
        label: new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }),
        status: hit ? '✓ Hit target' : (diff > 0 ? '↑ ' + fmtKcal(diff) + ' cal over' : '↓ ' + fmtKcal(-diff) + ' cal under'),
        statusColor: hit ? '#4C7A5E' : '#A05B3C',
        meals: ms.map(m => ({ name: m.name, time: timeLabel(m.ts), macros: mealMacroLine(m) })),
        totals: 'P ' + Math.round(t.p) + 'g · C ' + Math.round(t.c) + 'g · F ' + Math.round(t.f) + 'g · ' + fmtKcal(t.cal) + ' kcal',
      };
    });
    const n = dates.length || 1;
    const np = {
      range: fmtDate(f.from) + ' – ' + fmtDate(f.to),
      days,
      summary1: dates.length + ' day' + (dates.length === 1 ? '' : 's') + ' tracked · goals met on ' + met + ' day' + (met === 1 ? '' : 's'),
      summary2: 'Average per day: ' + fmtKcal(calSum / n) + ' kcal · P ' + Math.round(pSum / n) + 'g · C ' + Math.round(cSum / n) + 'g · F ' + Math.round(fSum / n) + 'g',
    };
    this.setState({ exportForm: null });
    this._printReport('nutritionPrint', np);
  }

  // Today's LOCAL calendar day — see localISO. (This used the UTC day, so a session
  // completed after local midnight was dated yesterday; on a Monday that put it in last
  // week and loggedThisWeek() stopped counting it.)
  todayISO() { return localISO(); }

  // ---- body weight ----
  // One entry per date (re-logging the same day overwrites it). The profile's weight
  // follows the scale so protein and BMR track reality; the calorie target only moves
  // on the fortnightly recalibration below.
  saveWeightEntry() {
    const f = this.state.weightForm; if (!f) return;
    const kg = Math.round(parseFloat(f.value) * 10) / 10;
    if (!(kg >= 30 && kg <= 250)) { this.showToast('Weight must be between 30 and 250 kg.'); return; }
    const date = f.date || this.todayISO();
    const weights = (this.state.weights || []).filter(w => w.date !== date)
      .concat([{ date, kg, ts: Date.now() }])
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    const prof = this.state.profile;
    const latest = weights[weights.length - 1];
    const profile = (prof && latest) ? { ...prof, weight: latest.kg } : prof;
    this.haptic(true);
    this.save({ weights, profile, weightForm: null }, 'that weigh-in');
    this.showToast('Logged ' + kg.toFixed(1) + ' kg for ' + fmtDateShort(date) + '.');
    this.maybeRecalibrate();
  }

  deleteWeightEntry() {
    const f = this.state.weightForm; if (!f) return;
    const weights = (this.state.weights || []).filter(w => w.date !== f.date);
    this.save({ weights, weightForm: null }, 'that weigh-in');
    this.showToast('Weigh-in removed.');
  }

  // ---- TDEE recalibration ----
  // Formulas predict a weight change; the scale reports the real one. Every 14 days
  // the gap between them is read back as the true maintenance intake, so the targets
  // converge on the body rather than on the estimate.
  recalibration() {
    const prof = this.state.profile;
    const ws = (this.state.weights || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    if (!prof || ws.length < 2) return null;
    const last = ws[ws.length - 1];
    const anchor = prof.calibratedAt || ws[0].date;
    // Window opens at the last weigh-in on/before the anchor (the previous check-in).
    const start = ws.filter(x => x.date <= anchor).slice(-1)[0] || ws[0];
    const elapsed = daySpan(start.date, last.date) - 1;
    if (elapsed <= 0) return null;
    const weeks = elapsed / 7;
    const actual = (last.kg - start.kg) / weeks;
    const expected = ((prof.calories - prof.tdee) * 7) / KCAL_PER_KG;
    // Prefer what was actually eaten, but only when the window is well tracked —
    // a half-logged fortnight would read as a huge deficit that never happened.
    const byDate = {};
    (this.state.meals || []).filter(m => m.date >= start.date && m.date <= last.date)
      .forEach(m => { byDate[m.date] = (byDate[m.date] || 0) + m.calories; });
    const trackedDays = Object.keys(byDate).length;
    const wellTracked = trackedDays >= Math.ceil((elapsed + 1) * 0.7);
    const avgIntake = trackedDays ? Object.keys(byDate).reduce((a, k) => a + byDate[k], 0) / trackedDays : 0;
    return {
      start, last, elapsed, weeks, actual, expected,
      intake: wellTracked ? avgIntake : prof.calories,
      source: wellTracked ? 'logged meals' : 'your calorie target',
      daysLeft: Math.max(0, 14 - elapsed),
      ready: elapsed >= 14,
    };
  }

  maybeRecalibrate() {
    const c = this.recalibration();
    if (!c || !c.ready) return;
    const prof = this.state.profile;
    const r = GOAL_RULES[prof.goal] || GOAL_RULES.Maintain;
    // Observed maintenance = intake minus the energy the weight change accounts for.
    const observed = Math.round(c.intake - (c.actual * KCAL_PER_KG) / 7);
    // Cap each step at 15% of the standing estimate so one noisy fortnight (water
    // weight, a travel week) can't swing the targets.
    const tdee = Math.min(Math.round(prof.tdee * 1.15), Math.max(Math.round(prof.tdee * 0.85), observed));
    const adj = r.paces ? (r.paces[prof.pace] != null ? r.paces[prof.pace] : r.paces.Moderate) : r.adj;
    const cal = Math.round((tdee * (1 + adj)) / 10) * 10;
    const kg = c.last.kg;
    const delta = cal - prof.calories;
    const profile = {
      ...prof, weight: kg, tdee, calories: cal,
      protein: Math.round(r.pk * kg), carbs: Math.round(cal * r.c / 4), fat: Math.round(cal * r.f / 9),
      calibratedAt: c.last.date,
      calibration: { actual: c.actual, expected: c.expected, days: c.elapsed, from: prof.calories, to: cal, source: c.source },
    };
    this.save({ profile }, null);
    this.showToast(delta === 0
      ? 'Two-week check-in: your calorie target still matches the scale.'
      : 'Targets recalibrated from your weigh-ins: ' + (delta > 0 ? '+' : '') + delta + ' kcal/day.');
  }

  // ---- program report (PDF) ----
  // One report shape for both an archived program and the current one.
  buildProgramReport(meta) {
    const cl = this.state.customLabels || {};
    // Completed days only (#8) — the same set the Archive screen lists.
    const sessions = (meta.sessions || []).filter(se => this.recordCompleted(se)).sort((a, b) => ((a.date || '') < (b.date || '') ? -1 : 1));
    const dated = sessions.filter(se => !!se.date);
    const startDate = meta.startDate || (dated.length ? dated[0].date : '');
    const endDate = meta.endDate || (dated.length ? dated[dated.length - 1].date : '');
    let totalVol = 0, rpeSum = 0, rpeN = 0, cardioKm = 0, cardioMin = 0, cardioRpeSum = 0, cardioN = 0, holdSecs = 0;
    const weeks = {}, firstSeen = {}, lastSeen = {}, loggedDates = {};
    const days = sessions.map(se => {
      let vol = 0;
      const exercises = (se.exercises || []).map(e => {
        const v = this.exVol(e); vol += v;
        const tw = topWeight(e);
        if (!e.cardio && !isTimed(e) && tw > 0) {
          if (!firstSeen[e.name]) firstSeen[e.name] = { date: se.date || '', w: tw };
          lastSeen[e.name] = { date: se.date || '', w: tw };
        }
        if (e.cardio) { cardioKm += +e.distance || 0; cardioMin += +e.duration || 0; cardioRpeSum += cardioRpe(e); cardioN++; }
        const held = exHoldSecs(e); holdSecs += held;
        return { name: e.name, detail: loggedLine(e), volume: e.cardio ? '—' : (isTimed(e) ? fmtSecs(held) : fmt(v)) };
      });
      totalVol += vol;
      if (se.rpe != null) { rpeSum += se.rpe; rpeN++; }
      if (se.date) {
        loggedDates[se.date] = true;
        const k = weekStartISO(se.date);
        weeks[k] = weeks[k] || { vol: 0, count: 0 };
        weeks[k].vol += vol; weeks[k].count++;
      }
      const cardioOnly = (se.exercises || []).length > 0 && se.exercises.every(e => e.cardio);
      return {
        dateLabel: se.date ? fmtDate(se.date) : 'Undated',
        title: this.recordTitle(se),
        rpe: se.rpe != null ? ('RPE ' + se.rpe + '/10') : '',
        notes: se.notes || '', volume: cardioOnly ? (se.exercises.reduce((a, e) => a + (+e.duration || 0), 0) + ' min') : fmt(vol), exercises,
      };
    });
    const weekRows = Object.keys(weeks).sort().map(k => ({
      label: 'Week of ' + fmtDate(k), volume: fmt(weeks[k].vol),
      count: weeks[k].count + (weeks[k].count === 1 ? ' session' : ' sessions'),
    }));
    const span = (startDate && endDate) ? daySpan(startDate, endDate) : days.length;
    const completed = Object.keys(loggedDates).length;
    const trends = Object.keys(firstSeen)
      .filter(n => lastSeen[n] && lastSeen[n].date !== firstSeen[n].date && lastSeen[n].w !== firstSeen[n].w)
      .map(n => {
        const a = firstSeen[n].w, b = lastSeen[n].w;
        const pct = a > 0 ? Math.round(((b - a) / a) * 100) : 0;
        return { name: n, line: a + ' kg → ' + b + ' kg', delta: (pct > 0 ? '+' : '') + pct + '%', pct, color: b > a ? '#4C7A5E' : '#A05B3C' };
      })
      .sort((x, y) => y.pct - x.pct);
    const weeksN = span / 7;
    return {
      name: meta.name || 'Program', status: meta.status || '',
      range: (startDate && endDate) ? (fmtDate(startDate) + ' → ' + fmtDate(endDate)) : 'No sessions logged yet',
      days, hasDays: days.length > 0,
      weeks: weekRows, hasWeeks: weekRows.length > 0,
      trends, hasTrends: trends.length > 0,
      summary: [
        { label: 'Total volume', value: fmt(totalVol) },
        { label: 'Volume per week', value: weeksN > 0 ? fmt(totalVol / weeksN) : fmt(totalVol) },
        { label: 'Sessions logged', value: String(days.length) },
        { label: 'Days completed', value: completed + ' of ' + span },
        { label: 'Rest days', value: String(Math.max(0, span - completed)) },
        { label: 'Average RPE', value: rpeN ? ((Math.round((rpeSum / rpeN) * 10) / 10) + '/10 · ' + rpeN + ' rated') : 'Not rated' },
      ].concat(cardioN ? [{ label: 'Cardio', value: (cardioKm ? (Math.round(cardioKm * 10) / 10) + ' km · ' : '') + cardioMin + ' min · avg RPE ' + (Math.round((cardioRpeSum / cardioN) * 10) / 10) }] : [])
        .concat(holdSecs ? [{ label: 'Time in holds', value: fmtSecs(holdSecs) }] : []),
      planDays: (meta.days || []).filter(d => (d.exercises || []).length && d.type !== 'Rest' && (!meta.onlyDone || sessions.some(se => se.day === d.day))).map(d => ({
        title: FULL[d.day] + ' · ' + dayTypeName(d.type, d.day, cl, false, d.label),
        exercises: (d.exercises || []).map(e => ({ name: e.name, scheme: scheme(e) })),
      })),
    };
  }

  // Snapshot of the live program's days, for archiving and for the current-program report.
  programSnapshot() {
    const s = this.state, cl = s.customLabels || {};
    return DAYS.filter(d => (s.program[d] || {}).type !== 'Rest').map(d => ({
      day: d, type: s.program[d].type, label: cl[d] || '',
      exercises: (s.program[d].exercises || []).map(e => ({ ...e })),
    }));
  }

  exportProgramPdf(id) {
    const s = this.state;
    let meta;
    if (id) {
      const a = (s.archive || []).find(w => w.id === id);
      if (!a) return;
      meta = { name: a.name, startDate: a.startDate, endDate: a.endDate, sessions: a.sessions, days: a.days, status: 'Archived', onlyDone: true };
    } else {
      meta = { name: s.programName || 'Current program', startDate: s.programStartDate, endDate: this.todayISO(), sessions: s.sessionHistory || [], days: this.programSnapshot(), status: 'Current program' };
    }
    this.setState({ menuOpen: false });
    // #9 — this used to mount the report and call window.print(), which an installed iOS
    // PWA silently ignores (no dialog, no error), so the button looked dead. A real PDF
    // file is generated and handed over instead; any failure is logged and surfaced.
    const report = this.buildProgramReport(meta);
    const slug = (report.name || 'program').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'program';
    const file = 'cadence-' + slug + '-' + this.todayISO() + '.pdf';
    return downloadProgramPdf(report, file)
      .then(how => { if (how !== 'cancelled') this.showToast(how === 'shared' ? 'PDF ready — save it to Files or share it.' : 'PDF downloaded: ' + file); return how; })
      .catch(e => {
        console.error('[cadence] PDF export failed', e);
        this.showToast("Couldn't create the PDF" + (e && e.message ? ' — ' + e.message : '') + '.');
        return 'failed';
      });
  }

  // Mount a report into the hidden print area, let it paint, print, then drop it.
  // window.print is missing (or throws) in some installed-PWA webviews, where the export
  // would otherwise look like a dead button — say so instead of failing silently.
  _printReport(key, payload) {
    this.setState({ [key]: payload }, () => {
      setTimeout(() => {
        let ok = typeof window.print === 'function';
        if (ok) { try { window.print(); } catch (e) { ok = false; } }
        if (!ok) this.showToast("This browser can't open a print dialog — open Cadence in Safari or Chrome to save the PDF.");
        setTimeout(() => this.setState({ [key]: null }), 400);
      }, 60);
    });
  }

  weekVolume(sessions) {
    let v = 0;
    Object.keys(sessions || {}).forEach(d => { (sessions[d].exercises || []).forEach(e => { v += this.exVol(e); }); });
    return v;
  }

  // ---- Weather: Open-Meteo (free, no auth) ----
  _wxCodeInfo(code, isDay) {
    const day = isDay !== 0;
    if (code === 0) return { key: day ? 'sunny' : 'clear-night', label: day ? 'Sunny' : 'Clear Night' };
    if (code <= 3) return { key: day ? 'cloudy' : 'cloudy-night', label: 'Partly Cloudy' };
    if (code <= 48) return { key: day ? 'cloudy' : 'cloudy-night', label: 'Fog' };
    if (code <= 67) return { key: day ? 'rainy' : 'rainy-night', label: 'Rainy' };
    if (code <= 77) return { key: day ? 'snowy' : 'snowy-night', label: 'Snowy' };
    if (code <= 82) return { key: day ? 'rainy' : 'rainy-night', label: 'Showers' };
    if (code <= 86) return { key: day ? 'snowy' : 'snowy-night', label: 'Snow Showers' };
    return { key: day ? 'rainy' : 'rainy-night', label: 'Thunderstorm' };
  }

  _wxTime(iso) {
    if (!iso) return '';
    const t = (iso.split('T')[1] || '');
    const parts = t.split(':');
    if (parts[0] == null || parts[0] === '') return '';
    return parseInt(parts[0], 10) + ':' + (parts[1] || '00');
  }

  async fetchWeather(lat, lng, city) {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng
      + '&current=temperature_2m,weather_code,is_day'
      + '&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min'
      + '&timezone=auto';
    const res = await fetch(url);
    if (!res.ok) throw new Error('open-meteo ' + res.status);
    const j = await res.json();
    const cur = j.current || {}, daily = j.daily || {};
    const info = this._wxCodeInfo(+cur.weather_code || 0, cur.is_day);
    const data = {
      temp: Math.round(+cur.temperature_2m || 0),
      cond: info.key, condLabel: info.label,
      high: (daily.temperature_2m_max && daily.temperature_2m_max[0] != null) ? Math.round(daily.temperature_2m_max[0]) : '',
      low: (daily.temperature_2m_min && daily.temperature_2m_min[0] != null) ? Math.round(daily.temperature_2m_min[0]) : '',
      sunrise: this._wxTime(daily.sunrise && daily.sunrise[0]),
      sunset: this._wxTime(daily.sunset && daily.sunset[0]),
      city: city || 'My location',
    };
    try { localStorage.setItem('lt_weather_cache', JSON.stringify({ ts: Date.now(), data })); } catch (e) {}
    const applyReady = () => this.setState({ weatherData: data, weatherStatus: 'ready', weatherError: '' });
    if (this._wxMinShimmer) {
      const wait = Math.max(0, 500 - (Date.now() - this._wxMinShimmer));
      this._wxMinShimmer = null;
      setTimeout(applyReady, wait);
    } else applyReady();
  }

  async _wxFetchStored() {
    let coords = null;
    try { coords = JSON.parse(localStorage.getItem('lt_weather_coords') || 'null'); } catch (e) {}
    if (coords && coords.lat != null) { await this.fetchWeather(coords.lat, coords.lng, coords.city); return true; }
    return false;
  }

  initWeather() {
    try {
      const c = JSON.parse(localStorage.getItem('lt_weather_cache') || 'null');
      if (c && c.data && (Date.now() - c.ts) < 30 * 60 * 1000) { this.setState({ weatherData: c.data, weatherStatus: 'ready' }); return; }
    } catch (e) {}
    this._wxFetchStored().then(ok => { if (!ok) this._wxGeolocate(); }).catch(() => this._wxGeolocate());
  }

  _wxGeolocate() {
    if (!navigator.geolocation) { this._wxFallbackToCityOrCache(); return; }
    this.setState({ weatherStatus: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 100) / 100;
        const lng = Math.round(pos.coords.longitude * 100) / 100;
        try { localStorage.setItem('lt_weather_coords', JSON.stringify({ lat, lng, city: 'My location' })); } catch (e) {}
        this.fetchWeather(lat, lng, 'My location').catch(() => this._wxFallbackToCityOrCache());
      },
      () => this._wxFallbackToCityOrCache(),
      { timeout: 8000, maximumAge: 30 * 60 * 1000 }
    );
  }

  _wxFallbackToCityOrCache() {
    try {
      const c = JSON.parse(localStorage.getItem('lt_weather_cache') || 'null');
      if (c && c.data) { this.setState({ weatherData: c.data, weatherStatus: 'ready' }); return; }
    } catch (e) {}
    this.setState({ weatherStatus: 'needCity', weatherError: 'Weather unavailable. Enter a city below.' });
  }

  async submitWeatherCity() {
    const name = (this.state.weatherCityInput || '').trim();
    if (!name) return;
    this.setState({ weatherStatus: 'loading', weatherError: '' });
    try {
      const g = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(name));
      const gj = await g.json();
      const hit = gj.results && gj.results[0];
      if (!hit) throw new Error('no city');
      const lat = Math.round(hit.latitude * 100) / 100;
      const lng = Math.round(hit.longitude * 100) / 100;
      const city = hit.name + (hit.country_code ? ', ' + hit.country_code : '');
      try { localStorage.setItem('lt_weather_coords', JSON.stringify({ lat, lng, city })); } catch (e) {}
      await this.fetchWeather(lat, lng, city);
      this.setState({ weatherCityInput: '' });
    } catch (e) {
      this.setState({ weatherStatus: 'needCity', weatherError: "Couldn't find that city — try another name." });
    }
  }

  maybeRefreshWeather() {
    let stale = true;
    try {
      const c = JSON.parse(localStorage.getItem('lt_weather_cache') || 'null');
      if (c && c.data && (Date.now() - c.ts) < 30 * 60 * 1000) stale = false;
    } catch (e) {}
    if (stale) this._wxFetchStored().catch(() => {});
  }

  refreshWeather() {
    try { localStorage.removeItem('lt_weather_cache'); } catch (e) {}
    this.setState({ weatherStatus: 'loading', weatherError: '' });
    this._wxMinShimmer = Date.now();
    this._wxFetchStored().then(ok => { if (!ok) this._wxGeolocate(); }).catch(() => this._wxFallbackToCityOrCache());
  }

  // ---- RPE + recovery learning ----
  _perfScore(rec, history) {
    const prior = (history || []).filter(h => h.type === rec.type && h.id !== rec.id && h.volume > 0);
    if (prior.length < 1) return 'normal';
    const avg = prior.reduce((a, h) => a + h.volume, 0) / prior.length;
    if (!avg) return 'normal';
    const ratio = rec.volume / avg;
    let perf = ratio >= 1.02 ? 'strong' : (ratio <= 0.85 ? 'weak' : 'normal');
    // RPE nuance: a much lower-than-usual RPE with lower volume reinforces weak; high RPE at normal volume can lift to strong
    if (rec.rpe != null) {
      const rpes = prior.filter(h => h.rpe != null);
      if (rpes.length) {
        const avgR = rpes.reduce((a, h) => a + h.rpe, 0) / rpes.length;
        if (perf === 'normal' && rec.rpe >= avgR + 1.5 && ratio >= 1) perf = 'strong';
        if (perf === 'normal' && rec.rpe <= avgR - 2) perf = 'weak';
      }
    }
    return perf;
  }

  _dayGapDays(history) {
    const withDate = (history || []).filter(h => h.date).map(h => h.date).sort();
    if (!withDate.length) return 0;
    const last = new Date(withDate[withDate.length - 1] + 'T00:00:00');
    return Math.floor((Date.now() - last.getTime()) / 86400000);
  }

  _detectRecovery(history, profile) {
    const done = (history || []).filter(h => h.rpe != null).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    // consecutive distinct-day high effort (RPE >= 8), counting from most recent
    let consec = 0, prevDate = null;
    for (const h of done) {
      if (h.rpe >= 8) {
        if (prevDate === null) { consec = 1; prevDate = h.date; }
        else {
          const diff = Math.round((new Date(prevDate) - new Date(h.date)) / 86400000);
          if (diff <= 2) { consec++; prevDate = h.date; } else break;
        }
      } else break;
    }
    // weekly RPE load
    const weekAgo = localISO(Date.now() - 7 * 86400000);
    const weeklyLoad = done.filter(h => h.date >= weekAgo).reduce((a, h) => a + h.rpe, 0);
    const consecThreshold = Math.max(2, Math.round(profile.learned_consecutive_days));
    const byConsec = consec >= consecThreshold;
    const byLoad = weeklyLoad > profile.learned_weekly_load_threshold;
    return { suggested: byConsec || byLoad, consec, weeklyLoad, byConsec, byLoad };
  }

  _recomputeProfile(log) {
    const resolved = (log || []).filter(e => e.nextPerf);
    const p = { ...DEFAULT_RECOVERY, sample_size: resolved.length };
    const ignored = resolved.filter(e => e.suggested && e.ignored);
    const pos = ignored.filter(e => e.nextPerf === 'strong').length;
    const neg = ignored.filter(e => e.nextPerf === 'weak').length;
    const missedRest = resolved.filter(e => !e.suggested && e.nextPerf === 'weak').length;
    const net = pos - neg - Math.min(missedRest, 2) * 0.5;
    p.learned_consecutive_days = Math.max(1, Math.min(5, 2 + net * 0.5));
    p.learned_weekly_load_threshold = Math.max(20, Math.min(70, 40 + net * 5));
    p.tolerance = net >= 2 ? 'high' : (net <= -2 ? 'low' : 'moderate');
    p.confidence = Math.min(1, resolved.length / 16);
    p.last_updated = new Date().toISOString();
    return p;
  }

  submitRpe() {
    const r = this.state.rpeSheet; if (!r || r.rpe == null) return;
    let history = (this.state.sessionHistory || []).slice();
    const idx = history.findIndex(h => h.id === r.id);
    if (idx < 0) { this.setState({ rpeSheet: null }); return; }
    let sessions = this.state.sessions;
    if (r.cardio && r.cardio.length) {
      const exs = (history[idx].exercises || []).map(x => ({ ...x }));
      const cardioPatch = (c) => ({ duration: +c.duration || 0, distance: +c.distance || 0, rpe: c.rpe || 5, intensity: rpeIntensity(c.rpe || 5) });
      r.cardio.forEach(c => { if (exs[c.idx]) exs[c.idx] = { ...exs[c.idx], ...cardioPatch(c) }; });
      history[idx] = { ...history[idx], exercises: exs };
      const live = this.slotSession(r.day, r.slot || 'a');
      if (live) {
        const lexs = (live.exercises || []).map(x => ({ ...x }));
        r.cardio.forEach(c => { if (lexs[c.idx]) lexs[c.idx] = { ...lexs[c.idx], ...cardioPatch(c) }; });
        sessions = this.patchSlot(r.day, r.slot || 'a', { exercises: lexs });
      }
    }
    history[idx] = { ...history[idx], rpe: r.rpe, notes: (r.notes || '').trim(), rpeAt: new Date().toISOString() };
    const perf = this._perfScore(history[idx], history);
    history[idx].perf = perf;
    // resolve most recent unresolved recovery-log entry with this workout's performance
    let log = (this.state.recoveryLog || []).slice();
    for (let i = log.length - 1; i >= 0; i--) {
      if (!log[i].nextPerf && log[i].id !== r.id) {
        const e = { ...log[i], nextPerf: perf };
        e.outcome = (e.suggested && e.ignored) ? (perf === 'strong' ? 'positive' : perf === 'weak' ? 'negative' : 'neutral')
          : (e.suggested && !e.ignored) ? (perf === 'strong' ? 'positive' : 'neutral')
          : (perf === 'weak' ? 'negative' : 'neutral');
        log[i] = e;
        break;
      }
    }
    const profile = this._recomputeProfile(log);
    const det = this._detectRecovery(history, profile);
    this.haptic(true);
    if (det.suggested) {
      this.save({ sessions, sessionHistory: history, recoveryLog: log, recoveryProfile: profile, rpeSheet: null, recoveryPrompt: { id: r.id, det, choice: null } }, 'that effort rating');
    } else {
      this.save({ sessions, sessionHistory: history, recoveryLog: log, recoveryProfile: profile, rpeSheet: null }, 'that effort rating');
      this.showToast('Logged RPE ' + r.rpe + '. Recovery tracking active.');
    }
  }

  respondRecovery(choice) {
    const rp = this.state.recoveryPrompt; if (!rp) return;
    const ignored = choice !== 'break';
    const entry = { id: rp.id, date: localISO(), suggested: true, ignored, choice, action: null, nextPerf: null, outcome: null };
    const log = (this.state.recoveryLog || []).concat([entry]);
    if (choice === 'break') {
      // navigate to tomorrow's workout in reschedule mode
      const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const jsDay = new Date().getDay(); // 0=Sun
      const todayKey = order[(jsDay + 6) % 7];
      const tomKey = order[(order.indexOf(todayKey) + 1) % 7];
      const tomType = this.state.week[tomKey];
      if (!tomType || tomType === 'Rest') {
        this.save({ recoveryLog: log, recoveryPrompt: null, screen: 'week', activeDay: null }, 'that recovery choice');
        this.showToast('Tomorrow is already a rest day. Rest well.');
      } else {
        this.save({ recoveryLog: log, recoveryPrompt: null, screen: 'week', activeDay: tomKey, breakMode: true, moveSrc: null, moveConfirm: null, moveTargetOffset: null, movePath: null, moveOpen: true }, 'that recovery choice');
      }
    } else {
      this.save({ recoveryLog: log, recoveryPrompt: null, screen: 'week', activeDay: null }, 'that recovery choice');
      this.showToast(choice === 'lighter' ? 'Noted — take it lighter tomorrow.' : "You're good to go. Keep the cadence.");
    }
  }

  renderVals() {
    const s = this.state;
    const cl = s.customLabels || {};
    const now = new Date();
    const hour = now.getHours();
    const isNightTime = hour < 6 || hour >= 19;
    const dayIdx = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000) % 4;
    const baseCond = ['sunny', 'cloudy', 'rainy', 'snowy'][dayIdx];
    const autoCond = isNightTime ? (baseCond === 'sunny' ? 'clear-night' : baseCond + '-night') : baseCond;
    // Live Open-Meteo data; until it arrives the icon shows a placeholder condition.
    const wd = s.weatherData;
    const wxStatus = s.weatherStatus || 'loading';
    let cond, tempLabel, condLabel, location, high, low, sunrise, sunset;
    if (wd) {
      cond = wd.cond; tempLabel = wd.temp + '°'; condLabel = wd.condLabel; location = wd.city;
      high = wd.high; low = wd.low; sunrise = wd.sunrise; sunset = wd.sunset;
    } else {
      cond = autoCond; tempLabel = '—'; condLabel = ''; location = ''; high = ''; low = ''; sunrise = ''; sunset = '';
    }
    const weather = {
      dateLine: now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
      tempLabel, condLabel, location, high, low, sunrise, sunset,
      hasSunTimes: !!(sunrise && sunset),
      status: wxStatus,
      wxReady: wxStatus === 'ready', wxLoading: wxStatus === 'loading',
      wxError: wxStatus === 'error', wxNeedCity: wxStatus === 'needCity',
      showIcon: !(wxStatus === 'needCity' || wxStatus === 'error'),
      wxErrorMsg: s.weatherError || 'Weather unavailable. Try again later.',
      cityInput: s.weatherCityInput || '',
      onCityInput: (e) => this.setState({ weatherCityInput: e.target.value }),
      submitCity: () => this.submitWeatherCity(),
      refresh: () => this.refreshWeather(),
      isSunny: cond === 'sunny',
      isCloudyDay: cond === 'cloudy', isCloudyNight: cond === 'cloudy-night',
      isRainyDay: cond === 'rainy', isRainyNight: cond === 'rainy-night',
      isSnowyDay: cond === 'snowy', isSnowyNight: cond === 'snowy-night',
      isClearNight: cond === 'clear-night',
      sunBeams: [0, 45, 90, 135, 180, 225, 270, 315].map(a => ({ angle: a })),
      raindrops: [3, 13, 23].map((l, i) => ({ left: l, delay: i * 0.25 })),
      snowflakes: [3, 13, 23].map((l, i) => ({ left: l, delay: i * 0.4 })),
      stars: [{ top: 2, left: 2, delay: 0 }, { top: 6, left: 30, delay: 0.4 }, { top: 24, left: 2, delay: 0.8 }, { top: 28, left: 28, delay: 1.2 }],
    };
    const screen = s.screen;
    const openDay = (d) => () => this.setState({ screen: 'session', activeDay: d, activeSlot: 'a', sessionPeek: null });

    const wOff = s.weekOffset || 0;
    const wView = this.viewWeek(wOff);
    const isCurWeek = wOff === 0;

    // Rest mode hides all scheduled work from the week/today view (data is untouched).
    const restMode = !!s.restMode;
    const days = DAYS.map((d, i) => {
      const t = wView.types[d];
      const realTraining = t && t !== 'Rest';
      const training = realTraining && !restMode;
      const isToday = isCurWeek && d === s.todayKey;
      const moved = (t !== s.recurring[d]) && !restMode;
      const sess = wView.sessions[d];
      const openThis = isCurWeek ? openDay(d) : () => { this.haptic(false); this.setState({ dayMenu: { day: d, scope: 'once', source: 'week', offset: wOff }, dayConfirm: null }); };
      return {
        key: d, letter: d.charAt(0), short: training ? dayTypeName(t, d, cl, false, sess && sess.label) : 'Rest', full: FULL[d],
        chipBg: training ? TYPE_TINT[t] : 'var(--surface-2)',
        chipRing: isToday ? ('0 0 0 2px ' + (training ? TYPE_COLOR[t] : 'var(--muted)')) : 'none',
        dot: training ? TYPE_COLOR[t] : 'var(--border)',
        labelColor: training ? 'var(--text)' : 'var(--muted)',
        movedDisplay: moved ? 'block' : 'none',
        tint: training ? TYPE_TINT[t] : TYPE_TINT.Rest,
        iconColor: training ? TYPE_COLOR[t] : 'var(--muted)',
        iconPath: training ? DUMBBELL : MOON,
        divider: i === DAYS.length - 1 ? 'transparent' : 'var(--border)',
        rowSub: (restMode && realTraining) ? 'No workout due' : ((training ? dayTypeName(t, d, cl, true, sess && sess.label) : 'Rest day') + (moved ? ' · this week only' : '') + ((sess && sess.extra && !restMode) ? ' + ' + (sess.extra.label || typeLabel(sess.extra.type || 'Custom')) : '')),
        rowRight: training && sess ? (sess.skipped ? 'Skipped' : ((sess.completed && (!sess.extra || sess.extra.completed)) ? 'Done' : fmt(this.slotList(sess).reduce((a, x) => a + this.weekVolume({ x: x.session }), 0)))) : '',
        open: openThis,
        openMenu: () => { this.haptic(false); this.setState({ dayMenu: { day: d, scope: 'once', source: 'week', offset: wOff }, dayConfirm: null }); },
      };
    });

    const weekDots = [-3, -2, -1, 0, 1, 2, 3].map(o => ({
      w: o === wOff ? '18px' : '6px',
      bg: o === wOff ? 'var(--accent)' : (o === 0 ? 'var(--muted)' : 'var(--border)'),
      go: () => this.goWeek(o - wOff),
    }));
    const weekNav = {
      label: this.weekLabelFor(wOff),
      dots: weekDots,
      touchStart: (e) => { const t = e.touches ? e.touches[0] : e; this._wsx = t.clientX; this._wsy = t.clientY; this._wsw = false; },
      touchMove: (e) => { if (this._wsx == null) return; const t = e.touches ? e.touches[0] : e; if (Math.abs(t.clientX - this._wsx) > Math.abs(t.clientY - this._wsy) && Math.abs(t.clientX - this._wsx) > 10) this._wsw = true; },
      touchEnd: (e) => { if (this._wsx == null) return; const t = (e.changedTouches ? e.changedTouches[0] : e); const dx = t.clientX - this._wsx; const isMouse = !e.changedTouches; this._wsx = null; if ((!isMouse && !this._wsw) || Math.abs(dx) < 45) return; this.goWeek(dx < 0 ? 1 : -1); },
    };

    // today card (rest mode presents today as a recovery day, workout untouched)
    const tk = s.todayKey;
    const tt = s.week[tk];
    const tTrain = tt && tt !== 'Rest' && !restMode;
    const todayBg = tTrain ? TYPE_COLOR[tt] : 'var(--surface)';
    const todayFg = tTrain ? '#fff' : 'var(--text)';
    const tCompleted = !!(tTrain && s.sessions[tk] && s.sessions[tk].completed);
    const tSkipped = !!(tTrain && s.sessions[tk] && s.sessions[tk].skipped);

    // active session — a day can hold a second workout (slot 'b'), picked with the
    // switcher at the top of the screen; everything below works on the chosen slot.
    const ad = s.activeDay;
    const adayBase = ad ? s.sessions[ad] : null;
    const aslot = (s.activeSlot === 'b' && adayBase && adayBase.extra) ? 'b' : 'a';
    const asess = aslot === 'b' ? adayBase.extra : adayBase;
    const at = aslot === 'b' ? ((asess && asess.type) || 'Custom') : (ad ? s.week[ad] : null);
    const aExtra = adayBase ? adayBase.extra : null;
    const slotName = (slot) => slot === 'b'
      ? ((aExtra && aExtra.label) || typeLabel((aExtra && aExtra.type) || 'Custom'))
      : dayTypeName(s.week[ad], ad, cl, false, adayBase && adayBase.label);
    let sx = null;
    if (asess) {
      const exs = asess.exercises || [];
      const total = exs.reduce((a, e) => a + this.exVol(e), 0);
      // Sets logged for THIS week only — see freshSession(). A session is "in progress"
      // (so: resumable, and restartable) only when this week put sets in it.
      const aLogged = this.loggedSetCount(asess);
      sx = {
        hasSlots: !!aExtra,
        slots: (aExtra ? ['a', 'b'] : []).map(sl => ({
          label: slotName(sl),
          sub: sl === 'b' ? 'Second workout' : 'Main workout',
          bg: sl === aslot ? 'var(--text)' : 'var(--surface-2)',
          color: sl === aslot ? 'var(--surface)' : 'var(--muted)',
          pick: () => this.setState({ activeSlot: sl, sessionPeek: null, sessDrag: null }),
        })),
        showAddWorkout: !aExtra && !asess.skipped,
        showRemoveExtra: aslot === 'b',
        typeLine: aslot === 'b' ? slotName('b') : dayTypeName(at, ad, cl, true, asess.label), renameDisplay: (aslot === 'a' && at === 'Custom') ? 'inline-flex' : 'none', dayFull: FULL[ad], tint: TYPE_TINT[at] || TYPE_TINT.Custom, color: TYPE_COLOR[at] || '#00B8D4', iconPath: TYPE_ICON[at] || DUMBBELL,
        statusText: asess.skipped ? 'Skipped' : (asess.completed ? 'Completed' : 'In progress'),
        statusColor: asess.skipped ? TYPE_COLOR.Rest : (asess.completed ? 'var(--accent)' : 'var(--muted)'),
        statusBg: asess.skipped ? TYPE_TINT.Rest : (asess.completed ? 'var(--accent-soft)' : 'var(--surface-2)'),
        hasExercises: exs.length > 0,
        empty: exs.length === 0,
        handleDisplay: exs.length > 1 ? 'flex' : 'none',
        exercises: exs.map((e, idx) => {
          const dr = s.sessDrag;
          const dragging = dr && dr.fromIndex === idx;
          let ty = '0px', z = 'auto', scale = '1', cardShadow = 'var(--shadow)', tyTransition = 'transform .2s cubic-bezier(.34,1.4,.64,1), box-shadow .2s ease';
          if (dr) {
            const pitch = dr.pitch;
            if (dragging) { ty = dr.dy + 'px'; z = '30'; scale = '1.05'; cardShadow = '0 14px 30px rgba(0,0,0,.22)'; tyTransition = 'none'; }
            else {
              const from = dr.fromIndex, to = dr.newPos;
              if (from < to && idx > from && idx <= to) ty = (-pitch) + 'px';
              else if (from > to && idx < from && idx >= to) ty = pitch + 'px';
            }
          }
          const startFrom = (clientY, ev) => { const rect = ev.currentTarget.closest('[data-sess-card]').getBoundingClientRect(); this._startSessDrag(clientY, idx, rect.height + 10); };
          const exNotes = exerciseNotes(e);
          return {
            name: e.name, scheme: scheme(e) + (!e.cardio && (e.logged || []).length ? ' · ' + Math.min((e.logged || []).length, e.sets || 0) + '/' + (e.sets || 0) + ' logged' : ''), volume: e.cardio ? ((e.duration || 0) + 'm') : (isTimed(e) ? fmtSecs(exHoldSecs(e)) : fmt(this.exVol(e))), volLabel: e.cardio ? 'cardio' : (isTimed(e) ? 'held' : 'volume'),
            notes: exNotes, hasNotes: !!exNotes,
            ty, z, scale, cardShadow, tyTransition,
            handleTouchStart: (ev) => { startFrom(ev.touches[0].clientY, ev); },
            handleTouchMove: (ev) => { if (s.sessDrag) { this._moveSessDrag(ev.touches[0].clientY); if (ev.cancelable) ev.preventDefault(); } },
            handleTouchEnd: () => { this._endSessDrag(); },
            handleMouseDown: (ev) => {
              ev.preventDefault(); ev.stopPropagation();
              startFrom(ev.clientY, ev);
              const mm = (e2) => this._moveSessDrag(e2.clientY);
              const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); this._endSessDrag(); };
              document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu);
            },
            edit: () => { if (s.sessDrag) return; this.setState({ exForm: this._exFormFrom(e, { mode: 'session', day: ad, slot: aslot, index: idx }) }); },
          };
        }),
        exCount: exs.length,
        showVolume: at !== 'Cardio' && exs.some(e => !e.cardio),
        listLabel: at === 'Cardio' ? 'Activities' : 'Exercises',
        showBulkEdit: exs.length > 0,
        // #57 — the session stays editable after it's been completed and rated.
        completedNote: asess.completed ? 'Completed — any edit here updates your logged session.' : '',
        doneTitle: at === 'Cardio' ? 'Session Done for Today.' : 'Lift Done for Today.',
        emptyTitle: at === 'Cardio' ? 'No activities yet' : 'No exercises yet',
        emptySub: at === 'Cardio' ? 'Tap + to add a cardio activity' : 'Tap + to log your first exercise',
        totalVolume: fmt(total),
        notes: asess.notes || '',
        showStart: !asess.completed && exs.some(e => !e.cardio && (e.sets || 0) > 0),
        startLabel: aLogged > 0 ? 'Resume workout' : 'Start workout',
        // Restart sits beside Resume, and only there: with nothing logged this week
        // there is nothing to throw away.
        showRestart: !asess.completed && aLogged > 0,
        askRestart: () => { this.haptic(); this.setState({ restartAsk: { day: ad, slot: aslot } }); },
        completeText: asess.completed ? 'Completed' : 'Mark completed',
        completeIcon: asess.completed ? '✓' : '○',
        completeBg: asess.completed ? 'var(--accent-soft)' : 'var(--accent)',
        completeFg: asess.completed ? 'var(--accent)' : '#fff',
      };
    }

    if (screen === 'program') preloadPdf();
    // current program
    const programDays = DAYS.map((d, i) => {
      const p = s.program[d];
      const training = p.type !== 'Rest';
      const empty = (p.exercises || []).length === 0;
      return {
        key: d, full: FULL[d],
        tint: empty ? 'var(--surface-2)' : (training ? TYPE_TINT[p.type] : TYPE_TINT.Rest),
        iconColor: empty ? 'var(--faint)' : (training ? TYPE_COLOR[p.type] : 'var(--muted)'),
        iconPath: empty ? 'M12 5v14M5 12h14' : (training ? DUMBBELL : MOON),
        iconBorder: empty ? '1.5px dashed var(--border)' : 'none',
        nameColor: empty ? 'var(--muted)' : 'var(--text)',
        subColor: empty ? 'var(--faint)' : 'var(--muted)',
        sub: empty ? 'Empty — tap to set up' : (dayTypeName(p.type, d, cl, true) + ' · ' + p.exercises.length + ' exercise' + (p.exercises.length === 1 ? '' : 's')),
        divider: i === DAYS.length - 1 ? 'transparent' : 'var(--border)',
        chevronDisplay: empty ? 'none' : 'inline',
        addDisplay: empty ? 'inline-flex' : 'none',
        tap: () => { this.setState({ screen: 'programDay', activeProgramDay: d }); },
        open: () => this.setState({ screen: 'programDay', activeProgramDay: d }),
      };
    });
    const apd = s.activeProgramDay;
    let pdx = null;
    if (apd) {
      const p = s.program[apd];
      const training = p.type !== 'Rest';
      pdx = {
        full: FULL[apd],
        typeOptions: TYPES.map(t => ({
          // Show the user's own name on the Custom chip once it's set/active.
          label: (t === 'Custom' && p.type === 'Custom' && cl[apd]) ? cl[apd] : typeLabel(t),
          bg: p.type === t ? TYPE_COLOR[t] : 'var(--surface-2)',
          color: p.type === t ? '#fff' : 'var(--muted)',
          // Picking "Custom" opens the naming prompt so the day gets a real name
          // instead of the literal word "Custom".
          set: () => {
            this.updateProgramDay(apd, { type: t });
            if (t === 'Custom') this.setState({ tagRename: { day: apd, value: (this.state.customLabels || {})[apd] || '' } });
          },
        })),
        showExercises: training,
        hasExercises: p.exercises.length > 0,
        empty: p.exercises.length === 0,
        reorderMode: s.reorderMode === apd,
        notReorderMode: s.reorderMode !== apd,
        exercises: p.exercises.map((e, idx) => {
          const inReorder = s.reorderMode === apd;
          const sw = s.swipe;
          const swActive = sw && sw.day === apd && sw.index === idx;
          const dx = inReorder ? 0 : (swActive ? sw.dx : 0);
          const dr = s.drag;
          let ty = '0px', z = 'auto', jig = 'none', cardShadow = 'var(--shadow)', tyTransition = 'transform .18s ease';
          if (inReorder) {
            jig = 'jiggle ' + (idx % 2 ? '0.32s' : '0.28s') + ' ease-in-out infinite';
            if (dr) {
              if (idx === dr.fromIndex) { ty = dr.dy + 'px'; z = '30'; jig = 'none'; cardShadow = '0 10px 26px rgba(0,0,0,.32)'; tyTransition = 'none'; }
              else if (dr.fromIndex < dr.newPos && idx > dr.fromIndex && idx <= dr.newPos) ty = (-dr.pitch) + 'px';
              else if (dr.fromIndex > dr.newPos && idx < dr.fromIndex && idx >= dr.newPos) ty = dr.pitch + 'px';
            }
          }
          const startDragFrom = (clientY, ev) => {
            const rect = ev.currentTarget.getBoundingClientRect();
            this._startDrag(clientY, idx, rect.height + 10);
          };
          const pdNotes = exerciseNotes(e);
          return {
            name: e.name, scheme: scheme(e), notes: pdNotes, hasNotes: !!pdNotes, dx: dx + 'px',
            ty, z, jiggle: jig, cardShadow, tyTransition, deleteBg: inReorder ? 'transparent' : '#EF4444',
            onTouchStart: (ev) => {
              if (inReorder) { startDragFrom(ev.touches[0].clientY, ev); return; }
              this._swipeStartX = ev.touches[0].clientX; this._lpX = ev.touches[0].clientX; this._lpY = ev.touches[0].clientY;
              this._beginReorderPress();
              this.setState({ swipe: { day: apd, index: idx, dx } });
            },
            onTouchMove: (ev) => {
              if (inReorder) { this._moveDrag(ev.touches[0].clientY); if (ev.cancelable) ev.preventDefault(); return; }
              if (this._swipeStartX == null) return;
              const cur = ev.touches[0].clientX; const curY = ev.touches[0].clientY;
              if (Math.abs(cur - this._lpX) > 8 || Math.abs(curY - this._lpY) > 8) this._cancelReorderPress();
              const base = (s.swipe && s.swipe.day === apd && s.swipe.index === idx) ? s.swipe.dx : 0;
              const startBase = base === -88 ? -88 : 0;
              let d = Math.min(0, Math.max(-88, startBase + (cur - this._swipeStartX)));
              this.setState({ swipe: { day: apd, index: idx, dx: d } });
            },
            onTouchEnd: () => {
              if (inReorder) { this._endDrag(); return; }
              this._cancelReorderPress();
              this._swipeStartX = null;
              const cur = (this.state.swipe && this.state.swipe.day === apd && this.state.swipe.index === idx) ? this.state.swipe.dx : 0;
              this.setState({ swipe: { day: apd, index: idx, dx: cur < -44 ? -88 : 0 } });
            },
            onMouseDown: (ev) => {
              if (inReorder) {
                startDragFrom(ev.clientY, ev);
                const mm = (e) => this._moveDrag(e.clientY);
                const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); this._endDrag(); };
                document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu);
              } else {
                this._lpX = ev.clientX; this._lpY = ev.clientY; this._beginReorderPress();
                const mm = (e) => { if (Math.abs(e.clientX - this._lpX) > 8 || Math.abs(e.clientY - this._lpY) > 8) this._cancelReorderPress(); };
                const mu = () => { this._cancelReorderPress(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
                document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu);
              }
            },
            edit: () => {
              if (inReorder) return;
              if (swActive && dx === -88) { this.setState({ swipe: null }); return; }
              this.setState({ exForm: this._exFormFrom(e, { mode: 'program', day: apd, index: idx }) });
            },
            deleteNow: () => {
              const list = (p.exercises || []).filter((_, i) => i !== idx);
              this.setState({ swipe: null });
              this.updateProgramDay(apd, { exercises: list });
            },
          };
        }),
      };
    }

    // archive
    const archiveWeeks = (screen !== 'archive' ? [] : s.archive).map(w => {
      const done = (w.sessions || []).filter(se => this.recordCompleted(se));
      const vol = done.reduce((a, se) => a + this.recordVolume(se), 0);
      const asw = s.archiveSwipe;
      const active = asw && asw.id === w.id;
      const dx = active ? asw.dx : 0;
      // The exercises the program was built from — the snapshot when there is one,
      // otherwise whatever was logged under it (legacy entries).
      const exNames = [];
      (w.days || []).forEach(d => (d.exercises || []).forEach(e => { if (exNames.indexOf(e.name) < 0) exNames.push(e.name); }));
      return {
        name: w.name || 'Program',
        range: (w.startDate && w.endDate) ? (fmtDate(w.startDate) + ' → ' + fmtDate(w.endDate)) : (w.label || ''),
        exCount: exNames.length + (exNames.length === 1 ? ' exercise' : ' exercises'),
        exLine: exNames.slice(0, 3).join(' · ') + (exNames.length > 3 ? ' +' + (exNames.length - 3) + ' more' : ''),
        hasExercises: exNames.length > 0,
        label: w.label, volume: fmt(vol), count: done.length, dx: dx + 'px',
        onTouchStart: (ev) => { this._archiveSwipeStartX = ev.touches[0].clientX; this.setState({ archiveSwipe: { id: w.id, dx } }); },
        onTouchMove: (ev) => {
          if (this._archiveSwipeStartX == null) return;
          const cur = ev.touches[0].clientX;
          const base = (s.archiveSwipe && s.archiveSwipe.id === w.id) ? s.archiveSwipe.dx : 0;
          const startBase = base === -88 ? -88 : 0;
          let d = Math.min(0, Math.max(-88, startBase + (cur - this._archiveSwipeStartX)));
          this.setState({ archiveSwipe: { id: w.id, dx: d } });
        },
        onTouchEnd: () => {
          this._archiveSwipeStartX = null;
          const cur = (this.state.archiveSwipe && this.state.archiveSwipe.id === w.id) ? this.state.archiveSwipe.dx : 0;
          this.setState({ archiveSwipe: { id: w.id, dx: cur < -44 ? -88 : 0 } });
        },
        open: () => {
          if (active && dx === -88) { this.setState({ archiveSwipe: null }); return; }
          this.setState({ screen: 'archiveDetail', archiveId: w.id });
        },
        deleteNow: () => {
          if (this.state.confirmArchiveDelete === w.id) { this.setState({ confirmArchiveDelete: null, archiveSwipe: null }); this.save({ archive: s.archive.filter(x => x.id !== w.id) }, 'that archive delete'); this.showToast('Week deleted from archive.'); }
          else { this.setState({ confirmArchiveDelete: w.id }); this.showToast('Tap delete again to confirm — this can\'t be undone.'); }
        },
      };
    });
    const arcEntry = screen === 'archiveDetail' ? s.archive.find(w => w.id === s.archiveId) : null;
    let adv = null;
    if (arcEntry) {
      preloadPdf();
      // Only completed days: a missed, unlogged or rest day isn't part of what the program
      // amounted to, and listing it just shows a 0 kg row.
      const arcDone = (arcEntry.sessions || []).filter(se => this.recordCompleted(se));
      const doneDays = {}; arcDone.forEach(se => { doneDays[se.day] = true; });
      const tv = arcDone.reduce((a, se) => a + this.recordVolume(se), 0);
      adv = {
        name: arcEntry.name || 'Program',
        range: (arcEntry.startDate && arcEntry.endDate) ? (fmtDate(arcEntry.startDate) + ' → ' + fmtDate(arcEntry.endDate)) : (arcEntry.label || ''),
        dayGroups: (arcEntry.days || []).filter(d => (d.exercises || []).length && d.type !== 'Rest' && doneDays[d.day]).map(d => ({
          title: FULL[d.day] + ' · ' + dayTypeName(d.type, d.day, cl, false, d.label),
          exercises: (d.exercises || []).map((e, i) => ({ name: e.name, scheme: scheme(e), divider: i === d.exercises.length - 1 ? 'transparent' : 'var(--border)' })),
        })),
        hasSessions: arcDone.length > 0, noSessions: arcDone.length === 0,
        label: arcEntry.label, volume: fmt(tv), count: arcDone.length,
        sessions: arcDone.map(se => {
          se = { ...se, exercises: se.exercises || [] };
          const v = this.recordVolume(se);
          const cardioOnly = se.exercises.length > 0 && se.exercises.every(e => e.cardio);
          // What was actually performed — the sets as logged, including any the user
          // added or dropped that day — rather than the program's template scheme.
          const sets = se.exercises.reduce((a, e) => a + (e.logged || []).filter(l => !l.skipped).length, 0);
          return {
            title: this.recordTitle(se),
            volume: cardioOnly ? se.exercises.reduce((a, e) => a + (+e.duration || 0), 0) + ' min' : fmt(v), hasDate: !!se.date,
            dateLabel: (se.date ? fmtDate(se.date) : '') + (se.rpe != null ? ' · RPE ' + se.rpe + '/10' : '') + (sets ? ' · ' + sets + ' sets logged' : ''),
            hasNotes: !!se.notes, notes: se.notes || '',
            exercises: se.exercises.map((e, i) => ({
              name: e.name,
              scheme: loggedLine(e),
              planned: (e.cardio || !(e.logged || []).length) ? '' : ('plan ' + scheme(e)),
              divider: i === se.exercises.length - 1 ? 'transparent' : 'var(--border)',
            })),
          };
        }),
      };
    }

    // exercise form
    const ef0 = s.exForm;
    const efPairs0 = ef0 ? this._supersetChoices(ef0) : [];
    // A partner picked from the database isn't on the day yet; keep it in the chip row.
    const efPairs = (ef0 && ef0.supersetWith && efPairs0.indexOf(ef0.supersetWith) < 0) ? efPairs0.concat([ef0.supersetWith]) : efPairs0;
    const setEf = (patch) => this.setState({ exForm: { ...this.state.exForm, ...patch } });
    const efTimed = ef0 ? this._formTimed(ef0) : false;
    const efBw = ef0 ? this._formBw(ef0) : false;
    const efPick = ef0 && ef0.pickPartner;
    const efPartners = efPick ? this._dbPartnerList(ef0) : [];
    const ef = ef0 ? {
      heading: ef0.index === null ? 'Add exercise' : (ef0.cardio ? 'Edit cardio' : 'Edit exercise'),
      isCardio: !!ef0.cardio, isStrength: !ef0.cardio,
      nameLabel: ef0.cardio ? 'Activity' : 'Exercise',
      name: ef0.name, sets: ef0.sets, reps: ef0.reps, weight: ef0.weight,
      duration: ef0.duration, intensity: ef0.intensity,
      volume: efTimed ? (fmtSecs((ef0.sets || 0) * (ef0.holdSecs || 0)) + ' held') : fmt(this.exVol(this._exItemFromForm(ef0))),
      volumeLabel: efTimed ? 'Planned hold time' : 'Exercise volume',
      deleteDisplay: ef0.index === null ? 'none' : 'block',
      // ---- #10 rep range ----
      repRange: !!ef0.repRange,
      toggleRange: () => { const f = this.state.exForm; if (!f) return; setEf(f.repRange ? { repRange: false, reps: f.repsMin || f.reps } : { repRange: true, repsMin: f.repsMin || f.reps || 6, repsMax: f.repsMax || Math.max(12, (+f.reps || 0) + 4) }); },
      repsMin: ef0.repsMin, repsMax: ef0.repsMax,
      onRepsMin: (e) => setEf({ repsMin: numOrEmpty(e.target.value) }),
      onRepsMax: (e) => setEf({ repsMax: numOrEmpty(e.target.value) }),
      rangeErr: (ef0.repRange && ef0.repsMin !== '' && ef0.repsMax !== '' && !(+ef0.repsMax > +ef0.repsMin)) ? 'Max must be higher than min.' : '',
      // ---- #4 / #5 timed holds and bodyweight ----
      timedOn: efTimed, notTimed: !efTimed,
      toggleTimed: () => { const f = this.state.exForm; if (f) setEf({ timed: !this._formTimed(f) }); },
      holdSecs: ef0.holdSecs,
      onHoldSecs: (e) => { const v = e.target.value; setEf({ holdSecs: v === '' ? '' : (Number.isNaN(parseSecs(v)) ? this.state.exForm.holdSecs : parseSecs(v)) }); },
      bwOn: efBw,
      toggleBw: () => { const f = this.state.exForm; if (f) setEf({ bw: !this._formBw(f) }); },
      weightLabel: efBw ? 'Added (kg)' : 'Weight (kg)',
      bwNote: efBw ? ('Body weight ' + (this.bodyweightKg() ? this.bodyweightKg() + ' kg' : 'not logged yet') + ' counts as load; weight here is added on top.') : '',
      // ---- #7 cardio ----
      distance: ef0.distance,
      onDistance: (e) => setEf({ distance: numOrEmpty(e.target.value, true) }),
      efforts: this._effortChips(ef0.rpe, (n) => setEf({ rpe: n })),
      effortLabel: 'Effort · RPE ' + (ef0.rpe || 5) + ' — ' + ((RPE_SCALE.find(r => r.n === (ef0.rpe || 5)) || {}).label || ''),
      browseDisplay: (ef0.mode === 'session' && ef0.index === null) ? 'inline-flex' : 'none',
      // A new exercise starts at 20 kg — unless the name makes it a bodyweight movement or
      // a hold, where that 20 would read as added weight. Only until the weight is touched.
      onName: (e) => {
        const f = this.state.exForm; const name = e.target.value;
        const patch = { name };
        if (f.index === null && !f.weightTouched && !f.cardio) { const nf = { ...f, name }; patch.weight = (this._formBw(nf) || this._formTimed(nf)) ? 0 : 20; }
        this.setState({ exForm: { ...f, ...patch } });
      },
      onSets: (e) => this.setState({ exForm: { ...s.exForm, sets: numOrEmpty(e.target.value) } }),
      onReps: (e) => this.setState({ exForm: { ...s.exForm, reps: numOrEmpty(e.target.value) } }),
      onWeight: (e) => this.setState({ exForm: { ...s.exForm, weight: numOrEmpty(e.target.value, true), weightTouched: true } }),
      onDuration: (e) => this.setState({ exForm: { ...s.exForm, duration: numOrEmpty(e.target.value) } }),
      // ---- #56 superset / dropset ----
      supersetOn: !!ef0.supersetWith,
      supersetWith: ef0.supersetWith || '',
      // With nothing else on the day to pair with, turning it on opens the database
      // picker straight away rather than sending the user off to add a partner first.
      toggleSuperset: () => {
        const f = this.state.exForm; if (!f) return;
        if (f.supersetWith || f.pickPartner) { setEf({ supersetWith: '', pickPartner: null }); return; }
        const opts = this._supersetChoices(f);
        setEf(opts.length ? { supersetWith: opts[0] } : { pickPartner: { cat: null, q: '' } });
      },
      pickingPartner: !!efPick,
      openPartnerDb: () => setEf({ pickPartner: { cat: null, q: '' } }),
      closePartnerDb: () => setEf({ pickPartner: null }),
      partnerQuery: efPick ? (efPick.q || '') : '',
      onPartnerQuery: (e) => setEf({ pickPartner: { ...(this.state.exForm.pickPartner || {}), q: e.target.value } }),
      partnerParts: efPick ? [{ key: null, label: 'All' }].concat(BODY_PARTS).map(b => ({
        label: b.label,
        bg: (efPick.cat || null) === b.key ? 'var(--accent)' : 'var(--surface-2)',
        color: (efPick.cat || null) === b.key ? '#fff' : 'var(--text)',
        pick: () => setEf({ pickPartner: { ...(this.state.exForm.pickPartner || {}), cat: b.key } }),
      })) : [],
      partnerList: efPartners.map((x, i, arr) => ({
        name: x.name, part: x.part,
        onDay: efPairs0.indexOf(x.name) >= 0,
        divider: i === arr.length - 1 ? 'transparent' : 'var(--border)',
        pick: () => setEf({ supersetWith: x.name, pickPartner: null }),
      })),
      partnerEmpty: !!efPick && efPartners.length === 0,
      partnerAddNote: (ef0.supersetWith && efPairs0.indexOf(ef0.supersetWith) < 0) ? (ef0.supersetWith + ' will be added to this day as its superset partner.') : '',
      supersetChoices: efPairs.map(n => ({
        label: n,
        bg: ef0.supersetWith === n ? 'var(--accent)' : 'var(--surface-2)',
        color: ef0.supersetWith === n ? '#fff' : 'var(--text)',
        pick: () => this.setState({ exForm: { ...this.state.exForm, supersetWith: n } }),
      })),
      dropsetOn: !!ef0.dropset,
      toggleDropset: () => {
        const f = this.state.exForm; if (!f) return;
        this.setState({ exForm: { ...f, dropset: f.dropset ? null : { pct: 80 } } });
      },
      dropPcts: [60, 70, 80, 90].map(pc => ({
        label: pc + '%',
        bg: (!!ef0.dropset && ef0.dropset.pct === pc) ? 'var(--accent)' : 'var(--surface-2)',
        color: (!!ef0.dropset && ef0.dropset.pct === pc) ? '#fff' : 'var(--text)',
        pick: () => this.setState({ exForm: { ...this.state.exForm, dropset: { pct: pc } } }),
      })),
      dropPreview: (ef0.dropset && +ef0.weight) ? ('After each set: ' + (Math.round(+ef0.weight * ef0.dropset.pct) / 100) + ' kg to failure.') : '',
    } : null;

    // session history
    // Built only for the screen that reads it: mapping every logged session (and its
    // exercises) on every render costs ~9ms once a few hundred sessions pile up, and the
    // rest timer re-renders once a second.
    const historyEntries = (screen !== 'history' ? [] : (s.sessionHistory || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1)).map(h => ({
      title: this.recordTitle(h),
      dateLabel: fmtDate(h.date) + (h.rpe != null ? ' · RPE ' + h.rpe + '/10' : ''),
      volume: fmt(this.recordVolume(h)),
      // The sets as logged — a session that ran long or short reads as it happened.
      exercises: h.exercises.map((e, i) => ({ name: e.name, scheme: loggedLine(e), divider: i === h.exercises.length - 1 ? 'transparent' : 'var(--border)' })),
    })));

    // exercise database
    const abp = s.activeBodyPart;
    const dbMeta = BODY_PARTS.find(b => b.key === abp);
    const dbListRaw = (s.exerciseDb[abp] || []);
    const dbx = abp ? {
      hasExercises: dbListRaw.length > 0, empty: dbListRaw.length === 0,
      exercises: dbListRaw.map((e, idx) => ({
        name: e.name, hasDesc: !!e.description, descPreview: e.description || '',
        hasEquip: !!(Array.isArray(e.equipment) ? e.equipment.length : e.equipment),
        equipLabel: eqLabel(e.equipment),
        edit: () => this.setState({ dbForm: { key: abp, index: idx, name: e.name, description: e.description || '', equipment: eqToOptions(e.equipment) } }),
        addToProgram: (ev) => {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          const opts = Array.isArray(e.equipment) ? e.equipment : [];
          this.setState({ programAddForm: { name: e.name, options: opts, hasVariants: opts.length > 1, variant: opts.length ? opts[0] : (e.equipment || ''), sets: 3, reps: 10, day: DAYS[0] } });
        },
      })),
    } : null;
    const df0 = s.dbForm;
    const dbf = df0 ? {
      heading: df0.index === null ? 'Add exercise' : 'Edit exercise',
      name: df0.name, description: df0.description,
      deleteDisplay: df0.index === null ? 'none' : 'block',
      onName: (e) => this.setState({ dbForm: { ...s.dbForm, name: e.target.value } }),
      onDescription: (e) => this.setState({ dbForm: { ...s.dbForm, description: e.target.value } }),
      equipment: (df0.equipment || ['']).map((opt, i) => ({
        value: opt,
        removeDisplay: (df0.equipment || ['']).length > 1 ? 'inline-flex' : 'none',
        onInput: (e) => { const arr = (s.dbForm.equipment || ['']).slice(); arr[i] = e.target.value; this.setState({ dbForm: { ...s.dbForm, equipment: arr } }); },
        remove: () => { const arr = (s.dbForm.equipment || ['']).filter((_, idx) => idx !== i); this.setState({ dbForm: { ...s.dbForm, equipment: arr.length ? arr : [''] } }); },
      })),
      addEquipmentOption: () => this.setState({ dbForm: { ...s.dbForm, equipment: [...(s.dbForm.equipment || ['']), ''] } }),
    } : null;

    // add-to-program form
    const paf0 = s.programAddForm;
    const paf = paf0 ? {
      name: paf0.name, hasVariants: paf0.hasVariants, dayLabel: FULL[paf0.day],
      variants: (paf0.options || []).map(opt => ({
        label: opt, bg: paf0.variant === opt ? 'var(--accent)' : 'var(--surface-2)', color: paf0.variant === opt ? '#fff' : 'var(--text)',
        pick: () => this.setState({ programAddForm: { ...s.programAddForm, variant: opt } }),
      })),
      sets: paf0.sets, reps: paf0.reps,
      onSets: (e) => this.setState({ programAddForm: { ...s.programAddForm, sets: numOrEmpty(e.target.value) } }),
      onReps: (e) => this.setState({ programAddForm: { ...s.programAddForm, reps: numOrEmpty(e.target.value) } }),
      days: DAYS.map(d => {
        const t = s.program[d].type; const n = s.program[d].exercises.length;
        return {
          label: FULL[d] + ' – ' + ((t === 'Custom' && cl[d]) ? cl[d] : (t === 'Rest' ? 'Rest day' : typeLabel(t) + ' Day')),
          sub: t === 'Rest' ? '' : (n + ' exercise' + (n === 1 ? '' : 's')),
          bg: paf0.day === d ? 'var(--accent)' : 'var(--surface-2)', color: paf0.day === d ? '#fff' : 'var(--text)',
          pick: () => this.setState({ programAddForm: { ...s.programAddForm, day: d } }),
        };
      }),
    } : null;

    // ===== empty-day quick add =====
    const qa0 = s.quickAdd;
    const quickAddOpen = !!qa0;
    let qa = null;
    const commitQuickAdd = () => {
          const st = this.state.quickAdd; if (!st || !st.item) return;
          const cardio = st.kind === 'cardio' || st.kind === 'sport';
          // #62 — a lift added from the database starts at whatever it was last lifted at.
          const lu = cardio ? null : this.lastUsedFor(st.item.name);
          const qRpe = st.rpe || 5;
          const item = cardio
            ? { name: st.item.name, duration: st.duration || 0, distance: +st.distance || 0, rpe: qRpe, intensity: rpeIntensity(qRpe) }
            : { name: st.item.name, sets: st.sets || 0, reps: st.reps || 0, weight: lu ? (lu.weight || 0) : 0, equipment: st.item.equipment || '' };
          // Adding into a day's second workout never touches the recurring template.
          if (st.slot === 'b') {
            const x = this.slotSession(st.day, 'b');
            if (x) this.save({ sessions: this.patchSlot(st.day, 'b', { exercises: (x.exercises || []).concat([cardio ? { ...item, cardio: true } : item]) }) }, 'adding that exercise');
          }
          else if (st.recur === 'every') { if (cardio) this.addCardioToProgram(st.day, item); else this.addExerciseToProgram(st.day, item); }
          else { this.addOneTimeToWeek(st.day, item, cardio, st.offset || 0); }
          this.haptic(true);
          this.setState({ quickAdd: null });
          this.showToast(st.item.name + ' added to ' + FULL[st.day] + (st.slot === 'b' ? ' — second workout.' : (st.recur === 'every' ? ' — every week.' : (st.offset ? ' — that week.' : ' — just this week.'))));
        };

    if (qa0) {
      const day = qa0.day;
      const kind = qa0.kind;
      const isCardioKind = kind === 'cardio' || kind === 'sport';
      const titles = {
        type: 'Add to ' + FULL[day],
        browseCat: kind === 'lift' ? 'Exercise Database' : 'Cardio Database',
        browseList: qa0.catLabel || (kind === 'sport' ? 'Sports' : ''),
        config: qa0.item ? qa0.item.name : 'Configure',
        recur: 'How often?',
      };
      const subs = {
        type: FULL[day] + ' is open — pick something to add',
        browseCat: kind === 'lift' ? 'Choose a body part' : 'Choose a category',
        browseList: kind === 'lift' ? 'Pick an exercise' : 'Pick an activity',
        config: isCardioKind ? 'Set duration & intensity' : 'Set sets & reps',
        recur: 'Just this week, or every week?',
      };
      let cats = [];
      if (qa0.stage === 'browseCat') {
        if (kind === 'lift') {
          cats = BODY_PARTS.map((bp, i) => ({ label: bp.label, count: (s.exerciseDb[bp.key] || []).length + ' exercises', divider: i === BODY_PARTS.length - 1 ? 'transparent' : 'var(--border)', pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, cat: bp.key, catLabel: bp.label, stage: 'browseList' } }) }));
        } else {
          const types = CARDIO_TYPES;
          cats = types.map((t, i) => ({ label: t, count: (s.cardioDb[t] || []).length + ' activities', divider: i === types.length - 1 ? 'transparent' : 'var(--border)', pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, cat: t, catLabel: t, stage: 'browseList' } }) }));
        }
      }
      let list = [];
      if (qa0.stage === 'browseList') {
        if (kind === 'lift') {
          list = (s.exerciseDb[qa0.cat] || []).map(e => ({
            name: e.name, meta: eqLabel(e.equipment) || 'Bodyweight',
            pick: () => { const opts = Array.isArray(e.equipment) ? e.equipment : []; this.setState({ quickAdd: { ...this.state.quickAdd, item: { name: e.name, equipment: opts.length ? opts[0] : (e.equipment || '') }, sets: 3, reps: 10, stage: 'config' } }); },
          }));
        } else {
          const cat = kind === 'sport' ? 'Sports' : qa0.cat;
          list = (s.cardioDb[cat] || []).map(a => ({
            name: a.name, meta: '~' + a.defaultDuration + ' min' + (a.equipment ? ' · ' + a.equipment : ''),
            pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, item: { name: a.name }, duration: a.defaultDuration, intensity: 'Moderate', stage: 'config' } }),
          }));
        }
      }
      const configLabel = isCardioKind ? cardioLine({ distance: qa0.distance, duration: qa0.duration, rpe: qa0.rpe || 5 }) : ((qa0.sets || 0) + ' sets × ' + (qa0.reps || 0) + ' reps');
      const backMap = { recur: 'config', config: 'browseList', browseList: (kind === 'sport' ? 'type' : 'browseCat'), browseCat: 'type' };
      qa = {
        dayFull: FULL[day],
        title: titles[qa0.stage], subtitle: subs[qa0.stage],
        backDisplay: qa0.stage === 'type' ? 'none' : 'inline-flex',
        isType: qa0.stage === 'type', isBrowseCat: qa0.stage === 'browseCat', isBrowseList: qa0.stage === 'browseList', isConfig: qa0.stage === 'config', isRecur: qa0.stage === 'recur',
        isLift: kind === 'lift', isCardioKind,
        types: [
          { label: 'Add Lift', sub: 'Strength — sets & reps', icon: DUMBBELL, tint: TYPE_TINT.Push, color: TYPE_COLOR.Push, pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, kind: 'lift', stage: 'browseCat' } }) },
          { label: 'Add Cardio', sub: 'Running, cycling, rowing…', icon: HEART, tint: TYPE_TINT.Cardio, color: TYPE_COLOR.Cardio, pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, kind: 'cardio', stage: 'browseCat' } }) },
          { label: 'Add Sport', sub: 'Tennis, football, boxing…', icon: SNEAKER, tint: TYPE_TINT.Legs, color: TYPE_COLOR.Legs, pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, kind: 'sport', cat: 'Sports', catLabel: 'Sports', stage: 'browseList' } }) },
        ],
        cats, list, listEmpty: qa0.stage === 'browseList' && list.length === 0,
        sets: qa0.sets, reps: qa0.reps, duration: qa0.duration,
        onSets: (e) => this.setState({ quickAdd: { ...this.state.quickAdd, sets: numOrEmpty(e.target.value) } }),
        onReps: (e) => this.setState({ quickAdd: { ...this.state.quickAdd, reps: numOrEmpty(e.target.value) } }),
        onDuration: (e) => this.setState({ quickAdd: { ...this.state.quickAdd, duration: numOrEmpty(e.target.value) } }),
        distance: qa0.distance != null ? qa0.distance : '',
        onDistance: (e) => this.setState({ quickAdd: { ...this.state.quickAdd, distance: numOrEmpty(e.target.value, true) } }),
        efforts: this._effortChips(qa0.rpe || 5, (n) => this.setState({ quickAdd: { ...this.state.quickAdd, rpe: n } })),
        itemName: qa0.item ? qa0.item.name : '', configLabel,
        // A second workout isn't part of the recurring template, so there is nothing
        // to choose between "just today" and "every week" — commit straight away.
        toRecur: () => { const st = this.state.quickAdd; if (st && st.slot === 'b') { commitQuickAdd(); return; } this.setState({ quickAdd: { ...st, stage: 'recur' } }); },
        recurOptions: [
          { k: 'once', label: 'Just today', sub: 'One-time — ' + FULL[day] + ' stays empty next week' },
          { k: 'every', label: 'Every ' + FULL[day], sub: 'Repeats weekly in your program' },
        ].map(o => {
          const sel = qa0.recur === o.k;
          return { label: o.label, sub: o.sub, border: sel ? 'var(--accent)' : 'var(--border)', bg: sel ? 'var(--accent-soft)' : 'var(--surface-2)', dotBorder: sel ? 'var(--accent)' : 'var(--border)', dotInner: sel ? 'var(--accent)' : 'transparent', pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, recur: o.k } }) };
        }),
        back: () => { const st = this.state.quickAdd; if (!st) return; this.setState({ quickAdd: { ...st, stage: backMap[st.stage] || 'type' } }); },
        confirm: commitQuickAdd,
      };
    }

    // ===== day type conversion menu =====
    const dm0 = s.dayMenu;
    const dmConfirm = s.dayConfirm;
    let dm = null;
    if (dm0) {
      const day = dm0.day; const p = s.program[day];
      const src = dm0.source || 'program';
      const mOff = dm0.offset || 0;
      const mView = (src === 'week' && mOff) ? this.viewWeek(mOff) : null;
      const type = src === 'week' ? (mView ? (mView.types[day] || 'Rest') : (s.week[day] || 'Rest')) : p.type;
      const daySess = src === 'week' ? (mView ? mView.sessions[day] : s.sessions[day]) : null;
      const exs = src === 'week' ? ((daySess && daySess.exercises) || []) : (p.exercises || []);
      const isLiftType = ['Push', 'Pull', 'Legs', 'Custom'].includes(type);
      const strengthN = exs.filter(e => !e.cardio).length;
      const cardioN = exs.filter(e => e.cardio).length;
      const hasActivities = exs.length > 0;
      const scope = dm0.scope;
      const onceLabelSuffix = mOff ? ' — that week.' : ' — this week.';
      const curLabel = dayTypeName(type, day, cl, true, daySess && daySess.label);
      const clearParts = [];
      if (strengthN) clearParts.push(strengthN + ' exercise' + (strengthN === 1 ? '' : 's'));
      if (cardioN) clearParts.push(cardioN + ' cardio/sport' + (cardioN === 1 ? '' : 's'));
      const clearLabel = clearParts.join(' and ');
      const toName = { lift: 'Lift', cardio: 'Cardio', rest: 'Rest' };
      const pickConvert = (to, targetType, sameCat) => () => {
        if (sameCat) { this.setState({ dayMenu: null }); return; }
        if (hasActivities) {
          this.setState({ dayConfirm: { day, to, targetType, scope, clearLabel, offset: mOff } });
        } else {
          this.applyDayConvert(day, targetType, scope, mOff);
          if (targetType === 'Custom') {
            // New lift day: let the user name it right away instead of leaving it "Custom".
            this.setState({ dayMenu: null, tagRename: { day, value: (this.state.customLabels || {})[day] || '' } });
          } else {
            this.setState({ dayMenu: null });
            this.showToast(FULL[day] + ' is now a ' + toName[to] + ' day' + (scope === 'every' ? ' — every week.' : onceLabelSuffix));
          }
        }
      };
      dm = {
        full: FULL[day], currentLabel: 'Currently: ' + curLabel,
        currentColor: type === 'Rest' ? 'var(--muted)' : TYPE_COLOR[type],
        menuOpen: !dmConfirm, confirmOpen: !!dmConfirm,
        onceBg: scope === 'once' ? 'var(--accent)' : 'transparent', onceColor: scope === 'once' ? '#fff' : 'var(--muted)',
        everyBg: scope === 'every' ? 'var(--accent)' : 'transparent', everyColor: scope === 'every' ? '#fff' : 'var(--muted)',
        everyLabel: 'Every ' + FULL[day],
        onceLabel: mOff ? 'Just that week' : 'Just this week',
        hasPeek: mOff !== 0 && exs.length > 0,
        peekItems: mOff !== 0 ? exs.map(e => ({ name: e.name, detail: scheme(e) })) : [],
        peekDone: mOff < 0 && !!(mView && mView.sessions[day] && mView.sessions[day].completed),
        setOnce: () => this.setState({ dayMenu: { ...this.state.dayMenu, scope: 'once' } }),
        setEvery: () => this.setState({ dayMenu: { ...this.state.dayMenu, scope: 'every' } }),
        changeOptions: [
          { to: 'lift', label: 'Change to Lift Day', desc: 'Strength — build with exercises', icon: DUMBBELL, tint: TYPE_TINT.Push, color: TYPE_COLOR.Push, current: isLiftType, targetType: isLiftType ? type : 'Custom' },
          { to: 'cardio', label: 'Change to Cardio Day', desc: 'Cardio & sports session', icon: HEART, tint: TYPE_TINT.Cardio, color: TYPE_COLOR.Cardio, current: type === 'Cardio', targetType: 'Cardio' },
          { to: 'rest', label: 'Change to Rest Day', desc: 'Recovery — clears the day', icon: MOON, tint: TYPE_TINT.Rest, color: 'var(--muted)', current: type === 'Rest', targetType: 'Rest' },
        ].map(o => ({
          label: o.current ? o.label.replace('Change to ', '') : o.label,
          desc: o.desc, icon: o.icon, tint: o.tint, color: o.color,
          badgeDisplay: o.current ? 'inline-flex' : 'none',
          chevDisplay: o.current ? 'none' : 'inline',
          rowBorder: o.current ? '1.5px solid ' + o.color : '1px solid var(--border)',
          pick: pickConvert(o.to, o.targetType, o.current),
        })),
        showAddActivity: hasActivities,
        showAddEmpty: !hasActivities && type !== 'Rest',
        addActivity: () => {
          const qk = type === 'Cardio' ? 'cardio' : (isLiftType && hasActivities ? 'lift' : null);
          this.setState({ dayMenu: null, quickAdd: { day, stage: qk ? 'browseCat' : 'type', kind: qk, cat: null, item: null, sets: 3, reps: 10, duration: 30, intensity: 'Moderate', recur: scope, offset: mOff } });
        },
        showMove: src === 'week' && type !== 'Rest',
        moveToDay: () => this.setState({ dayMenu: null, moveSrc: { day, offset: mOff }, moveConfirm: null, moveTargetOffset: null, movePath: null, moveOpen: true }),
        // Skip sits beside Move: same "this week only" scope, but the workout stays put
        // and is written off rather than rehomed. Unavailable once it's been logged.
        showSkip: src === 'week' && type !== 'Rest' && hasActivities && !(daySess && daySess.completed),
        isSkipped: !!(daySess && daySess.skipped),
        skipLabel: (daySess && daySess.skipped) ? 'Unskip this day' : 'Skip this workout',
        skipDesc: (daySess && daySess.skipped) ? 'Put it back on the board as still owed' : 'Marks it not done for ' + this.weekPhrase(mOff).toLowerCase() + ' — exercises stay',
        toggleSkip: () => this.setSkipped(day, mOff, !(daySess && daySess.skipped)),
        close: () => this.setState({ dayMenu: null }),
        confirmTitle: dmConfirm ? ('Clear ' + FULL[dmConfirm.day] + '?') : '',
        confirmBody: dmConfirm ? ('This will clear ' + dmConfirm.clearLabel + ' on ' + FULL[dmConfirm.day] + (dmConfirm.scope === 'every' ? ' every week' : ' this week') + '. Continue?') : '',
        confirmYes: () => {
          const c = this.state.dayConfirm; if (!c) return;
          this.applyDayConvert(c.day, c.targetType, c.scope, c.offset || 0);
          if (c.targetType === 'Custom') {
            this.setState({ dayConfirm: null, dayMenu: null, tagRename: { day: c.day, value: (this.state.customLabels || {})[c.day] || '' } });
          } else {
            this.setState({ dayConfirm: null, dayMenu: null });
            this.showToast(FULL[c.day] + ' is now a ' + toName[c.to] + ' day' + (c.scope === 'every' ? ' — every week.' : onceLabelSuffix));
          }
        },
        confirmCancel: () => this.setState({ dayConfirm: null }),
      };
    }
    const breakMode = !!s.breakMode;
    // Move source: explicit moveSrc (any day/week) or the active day this week.
    const mv = s.moveSrc || (ad ? { day: ad, offset: 0 } : null);
    const srcOff = mv ? (mv.offset || 0) : 0;
    // Target week: user can page across calendar weeks (break mode stays in-week).
    // Range spans the source's own week (so within-week moves still work) through +3.
    const moveWeekLo = breakMode ? srcOff : Math.max(-3, Math.min(0, srcOff));
    const moveWeekHi = breakMode ? srcOff : 3;
    const toOff = mv ? Math.max(moveWeekLo, Math.min(moveWeekHi, s.moveTargetOffset != null ? s.moveTargetOffset : srcOff)) : 0;
    const toView = mv ? this.viewWeek(toOff) : null;
    // Relocating a workout displaced by an earlier leg: movePath holds the chain agreed
    // so far, ending on the slot whose occupant is being placed now. Nothing is written
    // until the chain lands, so backing out of the sheet cancels the whole thing.
    const mpath = (s.movePath && s.movePath.length > 1) ? s.movePath : null;
    // The head of the chain is already spoken for — it empties when the chain commits —
    // so offer it as free. Picking it is what turns a conflict into a straight swap.
    const freed = mpath ? mpath[0] : null;
    // Exclude the source row only when the target week IS the source week.
    const moveTargets = mv ? DAYS.filter(d => !(toOff === srcOff && d === mv.day)).map((d, i, arr) => {
      const isFreed = !!freed && freed.off === toOff && freed.day === d;
      const tType = isFreed ? 'Rest' : (toView.types[d] || 'Rest');
      const occupied = tType !== 'Rest';
      const disabled = breakMode && occupied;
      const basePath = mpath || [{ day: mv.day, off: srcOff }];
      return {
        full: FULL[d],
        current: isFreed ? 'Free after this move' : (occupied ? dayTypeName(tType, d, cl, true, (toView.sessions[d] || {}).label) : 'Rest'),
        divider: i === arr.length - 1 ? 'transparent' : 'var(--border)',
        rowOpacity: disabled ? 0.4 : 1,
        rowCursor: disabled ? 'not-allowed' : 'pointer',
        pick: () => {
          if (disabled) { this.showToast('That day already has a workout — pick a free day.'); return; }
          // Occupied target: ask whether to relocate what's there or skip it (break mode
          // disables these rows, so it never reaches the prompt).
          if (occupied) { this.setState({ moveConfirm: { path: basePath, to: d, toOff } }); return; }
          this.commitMovePath(basePath.concat([{ day: d, off: toOff }]));
        },
      };
    }) : [];
    const mc = s.moveConfirm;
    const mcView = mc ? this.viewWeek(mc.toOff) : null;
    // What the contested day is currently holding — named, so the prompt can say "Legs"
    // rather than "a workout". Uses the raw type rather than dayTypeName's display form,
    // which trims "Legs" to "Leg" for the "Leg day" phrasing and reads wrong standing alone.
    const mcType = mc ? (mcView.types[mc.to] || 'Rest') : '';
    const mcName = mc ? ((mcType === 'Custom' && ((mcView.sessions[mc.to] || {}).label || cl[mc.to])) || mcType) : '';

    const menuItems = [
      { label: 'Current Program', iconPath: DUMBBELL, iconColor: TYPE_COLOR.Push, tint: TYPE_TINT.Push, select: () => this.setState({ screen: 'program', menuOpen: false }) },
      { label: 'Exercise Database', iconPath: 'M4 4h11a2 2 0 0 1 2 2v13.5a1.5 1.5 0 0 1-1.5 1.5H6a2 2 0 0 1-2-2V4z M4 8h2 M4 12h2 M4 16h2 M14.5 9.5l3.8-3.8a1 1 0 0 1 1.4 1.4L16 11 13.5 12z', iconColor: TYPE_COLOR.Pull, tint: TYPE_TINT.Pull, select: () => this.setState({ screen: 'database', menuOpen: false }) },
      { label: 'Cardio Database', iconPath: HEART, iconColor: TYPE_COLOR.Cardio, tint: TYPE_TINT.Cardio, select: () => this.setState({ screen: 'cardioDb', activeCardioType: null, menuOpen: false }) },
      { label: 'Meals', iconPath: PLATE, iconColor: TYPE_COLOR.Custom, tint: TYPE_TINT.Custom, select: () => this.setState({ screen: 'meals', menuOpen: false }) },
      { label: 'Archive', iconPath: 'M4 7h16v3H4V7zM5 10v9h14v-9M10 14h4', iconColor: TYPE_COLOR.Legs, tint: TYPE_TINT.Legs, select: () => this.setState({ screen: 'archive', menuOpen: false }) },
      { label: 'Rest mode', iconPath: MOON, iconColor: s.restMode ? 'var(--accent)' : 'var(--muted)', tint: s.restMode ? 'var(--accent-soft)' : 'var(--surface-2)', trailing: s.restMode ? 'On' : 'Off', trailingBg: s.restMode ? 'var(--accent)' : 'var(--surface-2)', trailingColor: s.restMode ? '#fff' : 'var(--muted)', select: () => { this.haptic(true); this.save({ restMode: !this.state.restMode }, 'the rest mode switch'); this.showToast(!this.state.restMode ? 'Rest mode on — workouts hidden until you turn it off.' : 'Rest mode off — workouts are back.'); } },
      {
        label: 'Appearance', iconPath: s.theme === 'dark' ? MOON : 'M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z M12 2.5v2 M12 19.5v2 M2.5 12h2 M19.5 12h2 M5.3 5.3l1.4 1.4 M17.3 17.3l1.4 1.4 M5.3 18.7l1.4-1.4 M17.3 6.7l1.4-1.4',
        iconColor: 'var(--accent)', tint: 'var(--accent-soft)',
        trailing: s.themeAuto ? ('Auto · ' + (s.theme === 'dark' ? 'Dark' : 'Light')) : ((s.theme === 'dark' ? 'Dark' : 'Light') + ' until ' + (this.isNightNow() ? '07:00' : '19:00')),
        trailingBg: s.themeAuto ? 'var(--surface-2)' : 'var(--accent)', trailingColor: s.themeAuto ? 'var(--muted)' : '#fff',
        select: () => {
          const wasAuto = this.state.themeAuto, was = this.state.theme;
          this.toggleTheme();
          this.showToast(wasAuto
            ? ((was === 'dark' ? 'Light' : 'Dark') + ' until ' + (this.isNightNow() ? '07:00' : '19:00') + ', then back to automatic.')
            : 'Back to automatic — dark 19:00–07:00, light otherwise.');
        },
      },
      { label: 'Workout Settings', iconPath: 'M10 2h4M12 9v4l2.5 2.5M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', iconColor: 'var(--accent)', tint: 'var(--accent-soft)', select: () => this.setState({ menuOpen: false, wsOpen: true }) },
      { label: 'Replay Tutorial', iconPath: 'M4 4v5h5M4 9a8 8 0 1 1-1 5', iconColor: TYPE_COLOR.Custom, tint: TYPE_TINT.Custom, select: () => this.setState({ menuOpen: false, screen: 'week', weekOffset: 0, activeDay: null, flowPhase: 'tutorial', tutStep: 0, tutRect: null }, () => this._tutMeasureSoon(300)) },
    ].map(m => ({ ...m, bg: 'transparent' }));

    // ===== workout mode (gym companion) =====
    const wcfg = s.wcfg || W_DEFAULTS;
    const wk = s.workout;
    let wo = null;
    if (wk) {
      const wsess = this.slotSession(wk.day, wk.slot || 'a') || { exercises: [] };
      const wexs = wsess.exercises || [];
      const we = wexs[wk.exIdx];
      const phase = wk.phase;
      const circ = 2 * Math.PI * 98;
      const wRestTotal = Math.max(1, wk.restTotal || 1);
      const frac = Math.max(0, Math.min(1, (wk.restLeft || 0) / wRestTotal));
      const mmss = (t) => { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
      const loggedCount = we ? (we.logged || []).length : 0;
      // Most-recently logged (non-skipped) set across ALL exercises, so the set a
      // user just logged stays correctable even after the exercise advances or the
      // workout reaches its summary.
      let gLast = null;
      wexs.forEach((e, xi) => (e.logged || []).forEach((l, li) => { if (!l.skipped && (!gLast || (l.ts || 0) >= gLast.ts)) gLast = { exIdx: xi, idx: li, ts: l.ts || 0, set: l.set, reps: l.reps, weight: l.weight, secs: l.secs, timed: isTimed(e), bwEx: isBodyweight(e), name: e.name }; }));
      const bwKg = this.bodyweightKg();
      // What one logged set reads as: "0:45" for a hold, "BW+10kg × 8" / "60 kg × 8" otherwise.
      const setText = (timed, bwEx, l) => (timed ? fmtSecs(l.secs) + (l.weight ? ' +' + l.weight + ' kg' : '') : ((bwEx ? loadLabel(true, l.weight) : (l.weight || 0) + ' kg') + ' × ' + (l.reps || 0)));
      const liftRows = wexs.filter(e => !e.cardio);
      // Logged volume only (the summary is what was done, not what was planned), with
      // dropsets and body weight counted; holds report their time instead.
      const loggedVol = (e) => (isTimed(e) ? 0 : (e.logged || []).reduce((a, l) => a + setVol(l, isBodyweight(e), bwKg), 0));
      const sumRows = liftRows.map((e, i) => {
        const lg = (e.logged || []).filter(l => !l.skipped);
        const timed = isTimed(e);
        return {
          name: e.name,
          detail: lg.length + ' of ' + (e.sets || 0) + (timed ? ' holds' : ' sets') + ' logged' + (timed && lg.length ? ' · ' + fmtSecs(lg.reduce((a, l) => a + (l.secs || 0), 0)) + ' total' : ''),
          vol: timed ? fmtSecs(lg.reduce((a, l) => a + (l.secs || 0), 0)) : fmt(loggedVol(e)),
          divider: i === liftRows.length - 1 ? 'transparent' : 'var(--border)',
        };
      });
      const totVol = liftRows.reduce((a, e) => a + loggedVol(e), 0);
      const es = wk.editSet;
      const wLastUsed = (we && !(we.logged || []).filter(l => !l.skipped).length) ? this.lastUsedFor(we.name) : null;
      const weTimed = isTimed(we), weBw = isBodyweight(we);
      // #2 — where this set sits in its superset round.
      const wGroup = (we && phase !== 'summary') ? this._supersetGroup(wexs, wk.exIdx) : [];
      const wNextInRound = wGroup.length > 1 ? wGroup.slice(wGroup.indexOf(wk.exIdx) + 1).find(j => (wexs[j].logged || []).length < (wexs[j].sets || 0)) : undefined;
      const esEx = es ? wexs[es.exIdx != null ? es.exIdx : wk.exIdx] : null;
      wo = {
        dayLabel: (FULL[wk.day] || '') + ((wk.slot === 'b') ? ' · ' + ((wsess.label) || 'Second workout') : ''),
        // #62 — what this exercise was last lifted at, when nothing is logged yet today.
        lastUsedLine: wLastUsed ? ('Last time ' + (weTimed ? fmtSecs(wLastUsed.secs) : ((weBw ? loadLabel(true, wLastUsed.weight) : wLastUsed.weight + ' kg') + ' × ' + wLastUsed.reps)) + ' · ' + fmtDateShort(wLastUsed.date)) : '',
        // #54 restart
        restartAsk: !!wk.restartAsk,
        askRestart: () => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, restartAsk: true } } : null),
        cancelRestart: () => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, restartAsk: false } } : null),
        confirmRestart: () => this.restartWorkout(),
        canRestart: wexs.some(e => (e.logged || []).length > 0),
        // #58 read-only overview of the whole session, mid-workout
        overviewOpen: !!wk.overview,
        openOverview: () => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, overview: true } } : null),
        closeOverview: () => { this._woIdleReset(); this.setState(s2 => s2.workout ? { workout: { ...s2.workout, overview: false } } : null); },
        overviewTitle: (wsess.label || dayTypeName(this.slotType(wk.day, wk.slot || 'a'), wk.day, cl, false, wsess.label)) + ' · ' + (FULL[wk.day] || ''),
        overviewSub: phase === 'summary'
          ? 'Every set logged — review before you finish.'
          : ('Exercise ' + (wexs.indexOf(we) + 1) + ' of ' + wexs.length + ((we && !we.cardio) ? ' · set ' + (wk.setIdx + 1) + ' of ' + (we.sets || 0) : '')),
        overviewRows: wexs.map((e, i) => {
          const lg = e.logged || [];
          const done = lg.filter(l => !l.skipped).length;
          return {
            name: e.name,
            current: i === wk.exIdx && phase !== 'summary',
            nameColor: (i === wk.exIdx && phase !== 'summary') ? 'var(--accent)' : 'var(--text)',
            rowBg: (i === wk.exIdx && phase !== 'summary') ? 'var(--accent-soft)' : 'var(--surface-2)',
            meta: e.cardio ? cardioLine(e) : (done + ' of ' + (e.sets || 0) + ' sets · target ' + (isTimed(e) ? (e.holdSecs ? fmtSecs(e.holdSecs) + ' hold' : 'hold') : repTarget(e) + ' × ' + (isBodyweight(e) ? loadLabel(true, e.weight) : (e.weight || 0) + ' kg'))),
            sets: e.cardio ? [] : Array.from({ length: Math.max(e.sets || 0, lg.length) }, (_, si) => {
              const l = lg[si];
              const isNow = i === wk.exIdx && si === wk.setIdx && phase !== 'summary';
              return {
                label: 'Set ' + (si + 1),
                text: l ? (l.skipped ? 'skipped' : setText(isTimed(e), isBodyweight(e), l)) : (isNow ? 'up next' : '—'),
                color: l ? (l.skipped ? 'var(--faint)' : 'var(--text)') : (isNow ? 'var(--accent)' : 'var(--faint)'),
                weight: (l && !l.skipped) ? '700' : '600',
              };
            }),
            divider: i === wexs.length - 1 ? 'transparent' : 'var(--border)',
          };
        }),
        exName: phase === 'summary' ? 'Session summary' : (we ? we.name : ''),
        setLine: we ? 'Set ' + (wk.setIdx + 1) + ' of ' + (we.sets || 0) : '',
        targetLine: we ? (weTimed ? (we.holdSecs ? 'Target ' + fmtSecs(we.holdSecs) + ' hold' : 'Hold as long as planned') : 'Target ' + repTarget(we) + ' reps × ' + (weBw ? loadLabel(true, we.weight) : (we.weight || 0) + ' kg')) : '',
        // #10 — the range sits right above the reps input; what gets logged is the actual count.
        repsTargetLabel: (we && !weTimed && hasRange(we)) ? 'Target ' + repTarget(we) : '',
        // #4 / #5 — holds log a duration; bodyweight sets show the load they carry.
        isTimed: weTimed, notTimed: !weTimed,
        secs: wk.secs || '', secsLabel: fmtSecs(parseSecs(wk.secs) || 0),
        onSecs: (e) => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, secs: e.target.value } } : null),
        secsDecDown: this._mkHold('secs', -5), secsIncDown: this._mkHold('secs', 5),
        secsSwipe: (e) => this._woSwipe(e, 'secs'),
        weightLabel: weBw ? '+Kg' : 'Kg',
        bwLine: weBw ? ('BW ' + (bwKg ? bwKg + ' kg' : '— log your weight') + ' · add extra weight below') : '',
        dots: we ? Array.from({ length: we.sets || 0 }, (_, i) => ({ bg: i < loggedCount ? 'var(--accent)' : (i === wk.setIdx && phase === 'set' ? 'var(--text)' : 'var(--track)') })) : [],
        phaseSet: phase === 'set' && !es, phaseRest: phase === 'rest' && !es, phaseReady: phase === 'ready' && !es, phaseSummary: phase === 'summary' && !es, editing: !!es,
        // #56 — pairing notes and the dropset prompt that follows a working set
        supersetLine: wGroup.length < 2 ? ''
          : (wNextInRound != null
            ? ('Superset → ' + wexs[wNextInRound].name + ' straight after, no rest')
            : ('Superset — last of the round, rest after this set')),
        phaseDrop: phase === 'drop' && !es,
        dropExName: we ? we.name : '',
        dropSub: we && we.dropset ? ('Drop to ' + we.dropset.pct + '% and go again — logged against set ' + ((wk.dropIdx || 0) + 1) + '.') : '',
        dropReps: wk.dropReps || '', dropWeight: wk.dropWeight || '',
        onDropReps: (e) => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, dropReps: e.target.value } } : null),
        onDropWeight: (e) => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, dropWeight: e.target.value } } : null),
        dropRepsDec: this._mkHold('dropReps', -1), dropRepsInc: this._mkHold('dropReps', 1),
        dropWDec: this._mkHold('dropWeight', -2.5), dropWInc: this._mkHold('dropWeight', 2.5),
        logDrop: () => this._woLogDrop(false), skipDrop: () => this._woLogDrop(true),
        reps: wk.reps || '', weight: wk.weight || '',
        onReps: (e) => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, reps: e.target.value } } : null),
        onWeight: (e) => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, weight: e.target.value } } : null),
        repsDecDown: this._mkHold('reps', -1), repsIncDown: this._mkHold('reps', 1),
        wDecDown: this._mkHold('weight', -5), wIncDown: this._mkHold('weight', 5),
        holdEnd: () => this._woHoldEnd(),
        valTS: (e) => { const t = e.touches && e.touches[0]; if (t) this._wvY = t.clientY; },
        repsSwipe: (e) => this._woSwipe(e, 'reps'), weightSwipe: (e) => this._woSwipe(e, 'weight'),
        logLabel: we && wk.setIdx >= (we.sets || 0) - 1 ? 'Finish exercise' : 'Log set',
        logSet: () => this._woLog(false), skipSet: () => this._woLog(true),
        restTitle: gLast ? gLast.name : (we ? we.name : ''),
        time: mmss(wk.restLeft || 0), circ: String(circ), dash: String(circ * (1 - frac)),
        arcColor: wk.paused ? 'var(--muted)' : 'var(--accent)',
        pauseHint: wk.paused ? 'paused' : 'tap to pause',
        restSub: wk.paused ? 'Timer paused — tap the ring to resume.' : ('Up next: ' + (we ? we.name : '') + ' · set ' + (wk.setIdx + 1) + ' when the timer ends.'),
        togglePause: () => this.setState(s2 => s2.workout && s2.workout.phase === 'rest' ? { workout: { ...s2.workout, paused: !s2.workout.paused } } : null),
        plus30: () => this.setState(s2 => { const w = s2.workout; if (!w || w.phase !== 'rest') return null; const nl = (w.restLeft || 0) + 30; return { workout: { ...w, restLeft: nl, restTotal: Math.max(w.restTotal || 0, nl) } }; }),
        minus30: () => this.setState(s2 => { const w = s2.workout; if (!w || w.phase !== 'rest') return null; const nl = Math.max(0, (w.restLeft || 0) - 30); if (nl === 0) setTimeout(() => this._woRestDone(), 0); return { workout: { ...w, restLeft: nl } }; }),
        skipRest: () => this._woStartSet(), startSet: () => this._woStartSet(),
        startNLabel: 'Start set ' + (wk.setIdx + 1),
        restMore: () => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, phase: 'rest', restLeft: wcfg.rest, restTotal: wcfg.rest, paused: false, editSet: null } } : null),
        hasEditable: !!gLast,
        justLogged: gLast ? 'Set ' + gLast.set + ' ✓ · ' + setText(gLast.timed, gLast.bwEx, gLast) : '',
        lastSetN: gLast ? gLast.set : 0,
        editLast: () => { if (!gLast) return; this.setState(s2 => s2.workout ? { workout: { ...s2.workout, editSet: { exIdx: gLast.exIdx, idx: gLast.idx, n: gLast.set, reps: String(gLast.reps != null ? gLast.reps : ''), weight: String(gLast.weight || 0), secs: String(gLast.secs != null ? gLast.secs : '') } } } : null); },
        esTimed: isTimed(esEx), esNotTimed: !isTimed(esEx),
        esSecs: es ? (es.secs || '') : '',
        onEsSecs: (e) => this.setState(s2 => s2.workout && s2.workout.editSet ? { workout: { ...s2.workout, editSet: { ...s2.workout.editSet, secs: e.target.value } } } : null),
        esWeightLabel: isBodyweight(esEx) ? '+Kg' : 'Kg',
        editN: es ? es.n : 0,
        editExName: es ? ((wexs[es.exIdx] && wexs[es.exIdx].name) || '') : '',
        editSub: (!!es && phase === 'rest') ? ('Timer keeps running · ' + mmss(wk.restLeft || 0) + ' left') : (isTimed(esEx) ? 'Fix the time or weight, or undo to redo the set.' : 'Fix the reps or weight, or undo to redo the set.'),
        esReps: es ? es.reps : '', esWeight: es ? es.weight : '',
        onEsReps: (e) => this.setState(s2 => s2.workout && s2.workout.editSet ? { workout: { ...s2.workout, editSet: { ...s2.workout.editSet, reps: e.target.value } } } : null),
        onEsWeight: (e) => this.setState(s2 => s2.workout && s2.workout.editSet ? { workout: { ...s2.workout, editSet: { ...s2.workout.editSet, weight: e.target.value } } } : null),
        editSave: () => this._woEditSave(),
        editUndo: () => this._woUndoSet(),
        editCancel: () => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, editSet: null } } : null),
        sumRows, totVol: fmt(totVol),
        finish: () => { this.endWorkout(); this.setState({ confirmComplete: true }); },
        exit: () => this.endWorkout(phase === 'summary' ? null : 'Progress saved — resume anytime.'),
        activity: () => this._woIdleReset(),
        // Idle dim: a black veil darkens the UI while the timer ring/number are
        // lifted above it (z-index) so the countdown stays fully readable.
        dim: s.workoutIdle ? 'grayscale(.35)' : 'none',
        dimVeil: s.workoutIdle ? (1 - (wcfg.idleDim || 30) / 100) : 0,
        ctlOpacity: s.workoutIdle ? '0.25' : '1',
      };
    }
    const wChip = (act) => ({ bg: act ? 'var(--text)' : 'var(--surface-2)', fg: act ? 'var(--surface)' : 'var(--text)' });
    const wsx = s.wsOpen ? {
      restChips: [60, 75, 90, 120, 150].map(v => ({ label: v + 's', ...wChip(wcfg.rest === v), pick: () => this.saveW({ rest: v }) })),
      restCustom: String(wcfg.rest),
      onRestCustom: (e) => { const v = parseInt(e.target.value, 10); if (v > 0 && v <= 900) this.saveW({ rest: v }); },
      vibBg: wcfg.vibrate ? 'var(--accent)' : 'var(--track)', vibKnob: wcfg.vibrate ? '19.5px' : '2.5px',
      toggleVib: () => this.saveW({ vibrate: !wcfg.vibrate }),
      keepBg: wcfg.keepAwake ? 'var(--accent)' : 'var(--track)', keepKnob: wcfg.keepAwake ? '19.5px' : '2.5px',
      toggleKeep: () => this.saveW({ keepAwake: !wcfg.keepAwake }),
      soundChips: [['ding', 'Ding'], ['beep', 'Beep'], ['silent', 'Silent']].map(x => ({ label: x[1], ...wChip(wcfg.sound === x[0]), pick: () => { this.saveW({ sound: x[0] }); this._woSound(x[0]); } })),
      idleChips: [[5, '5s'], [10, '10s'], [15, '15s'], [20, '20s'], [0, 'Never']].map(x => ({ label: x[1], ...wChip(wcfg.idleDelay === x[0]), pick: () => this.saveW({ idleDelay: x[0] }) })),
      dim: String(wcfg.idleDim || 30), dimLabel: (wcfg.idleDim || 30) + '%',
      onDim: (e) => this.saveW({ idleDim: +e.target.value }),
      close: () => this.setState({ wsOpen: false }),
    } : null;

    // ===== meals / nutrition =====
    const todayISO = localISO();
    const prof = s.profile;
    const todayMeals = (s.meals || []).filter(m => m.date === todayISO).sort((a, b) => b.ts - a.ts);
    const tots = todayMeals.reduce((a, m) => ({ p: a.p + m.protein, c: a.c + m.carbs, f: a.f + m.fat, cal: a.cal + m.calories }), { p: 0, c: 0, f: 0, cal: 0 });
    const segBar = (cur, target, color) => { const filled = Math.round(Math.min(1, target ? cur / target : 0) * 12); return Array.from({ length: 12 }, (_, i) => ({ bg: i < filled ? color : 'var(--track)' })); };
    const macroBars = prof ? [
      { label: 'Protein', value: Math.round(tots.p) + 'g / ' + prof.protein + 'g', segs: segBar(tots.p, prof.protein, MACRO_COLORS.p) },
      { label: 'Carbs', value: Math.round(tots.c) + 'g / ' + prof.carbs + 'g', segs: segBar(tots.c, prof.carbs, MACRO_COLORS.c) },
      { label: 'Fat', value: Math.round(tots.f) + 'g / ' + prof.fat + 'g', segs: segBar(tots.f, prof.fat, MACRO_COLORS.f) },
    ] : [];
    const remaining = prof ? prof.calories - tots.cal : 0;
    const mx = prof ? {
      bars: macroBars,
      remaining: remaining >= 0 ? fmtKcal(remaining) : fmtKcal(-remaining) + ' over',
      remainColor: remaining >= 0 ? 'var(--accent)' : '#B0715E',
      hasMeals: todayMeals.length > 0, noMeals: todayMeals.length === 0,
      meals: todayMeals.map(m => ({ name: m.name, time: timeLabel(m.ts), macros: mealMacroLine(m), open: () => this.setState({ mealDetail: { id: m.id } }) })),
    } : null;
    const macroMeta = [
      { label: 'Protein', cur: tots.p, target: prof ? prof.protein : 0, color: MACRO_COLORS.p },
      { label: 'Carbs', cur: tots.c, target: prof ? prof.carbs : 0, color: MACRO_COLORS.c },
      { label: 'Fat', cur: tots.f, target: prof ? prof.fat : 0, color: MACRO_COLORS.f },
    ];
    const calPctNum = prof && prof.calories ? Math.min(100, Math.round(tots.cal / prof.calories * 100)) : 0;
    const nw = {
      hasData: !!prof && todayMeals.length > 0,
      empty: !prof || todayMeals.length === 0,
      rings: macroMeta.map(m => {
        const frac = m.target ? Math.min(1, m.cur / m.target) : 0;
        const deg = Math.round(frac * 360);
        return { label: m.label, color: m.color, pct: Math.round(frac * 100) + '%',
          value: Math.round(m.cur) + ' / ' + m.target + 'g',
          ring: 'conic-gradient(' + m.color + ' ' + deg + 'deg, var(--track) ' + deg + 'deg)' };
      }),
      calText: prof ? fmtKcal(tots.cal) + ' / ' + fmtKcal(prof.calories) : '',
      calPct: calPctNum + '%',
      calColor: 'var(--muted)',
    };
    // ===== body weight =====
    const wsList = (s.weights || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    const wLast = wsList[wsList.length - 1] || null;
    const wPrev = wsList.length > 1 ? wsList[wsList.length - 2] : null;
    const wDelta = (wLast && wPrev) ? Math.round((wLast.kg - wPrev.kg) * 10) / 10 : 0;
    const todayEntry = wsList.find(x => x.date === todayISO) || null;
    // Which way the goal wants the scale to move — a kilo up is progress on Gain Muscle
    // and a setback on Lose Weight, so the trend is coloured by intent, not direction.
    const goalDir = prof ? (prof.goal === 'Lose Weight' ? -1 : (prof.goal === 'Gain Muscle' ? 1 : 0)) : 0;
    const bw = {
      value: wLast ? wLast.kg.toFixed(1) : '—',
      dateLabel: wLast ? (wLast.date === todayISO ? 'Today' : fmtDateShort(wLast.date)) : 'No weigh-ins yet',
      ctaLabel: todayEntry ? 'Edit' : 'Log',
      trend: (wLast && wPrev)
        ? ((wDelta > 0 ? '↑ ' : (wDelta < 0 ? '↓ ' : '→ ')) + Math.abs(wDelta).toFixed(1) + ' kg vs ' + fmtDateShort(wPrev.date))
        : (wLast ? 'First weigh-in logged' : 'Tap Log to start tracking'),
      trendColor: (!wPrev || wDelta === 0 || !goalDir) ? 'var(--muted)' : ((wDelta > 0 ? 1 : -1) === goalDir ? '#4C7A5E' : '#A05B3C'),
      open: () => this.setState({ weightForm: { date: todayISO, value: String(todayEntry ? todayEntry.kg : (wLast ? wLast.kg : (prof ? prof.weight : ''))) } }),
    };
    const wfd = s.weightForm;
    const wfVal = wfd ? parseFloat(wfd.value) : NaN;
    const wfStep = (d) => {
      const f = this.state.weightForm; if (!f) return;
      const base = parseFloat(f.value);
      const next = Math.round(((Number.isNaN(base) ? (prof ? prof.weight : 70) : base) + d) * 10) / 10;
      this.setState({ weightForm: { ...f, value: String(Math.min(250, Math.max(30, next))) } });
    };
    const wf = wfd ? {
      dateLabel: wfd.date === todayISO ? ('Today · ' + fmtDateShort(wfd.date)) : fmtDateShort(wfd.date),
      value: wfd.value,
      onChange: (e) => this.setState({ weightForm: { ...this.state.weightForm, value: e.target.value } }),
      dec: () => wfStep(-0.1), inc: () => wfStep(0.1),
      canSave: wfVal >= 30 && wfVal <= 250,
      saveOpacity: (wfVal >= 30 && wfVal <= 250) ? '1' : '.45',
      err: (wfd.value !== '' && !(wfVal >= 30 && wfVal <= 250)) ? 'Weight must be between 30 and 250 kg.' : '',
      canRemove: !!todayEntry,
      save: () => this.saveWeightEntry(),
      remove: () => this.deleteWeightEntry(),
      close: () => this.setState({ weightForm: null }),
      recent: wsList.slice(-5).reverse().map((x, i, arr) => ({
        date: fmtDateShort(x.date), kg: x.kg.toFixed(1) + ' kg',
        divider: i === arr.length - 1 ? 'transparent' : 'var(--border)',
      })),
      hasRecent: wsList.length > 0,
    } : null;
    // Weight vs the trend the calorie target predicts, plus where the next
    // TDEE check-in stands. Drawn in a fixed 320×120 box, scaled by the view.
    const rcal = this.recalibration();
    const wchart = (() => {
      const pts = wsList.slice(-60);
      if (!pts.length) return { has: false, empty: true, emptyText: 'Log your weight from the home screen to see the trend here.' };
      const firstP = pts[0], lastP = pts[pts.length - 1];
      const spanD = Math.max(1, daySpan(firstP.date, lastP.date) - 1);
      const expRate = prof ? ((prof.calories - prof.tdee) * 7) / KCAL_PER_KG : 0;
      const expEnd = firstP.kg + expRate * (spanD / 7);
      const vals = pts.map(x => x.kg).concat(prof ? [expEnd] : []);
      let lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
      if (hi - lo < 1) { const mid = (hi + lo) / 2; lo = mid - 0.5; hi = mid + 0.5; }
      const W = 320, H = 120, pad = 12;
      // A lone weigh-in has no span to plot across, so it sits in the middle.
      const xOf = (iso) => pts.length === 1 ? W / 2 : pad + ((daySpan(firstP.date, iso) - 1) / spanD) * (W - pad * 2);
      const yOf = (kg) => H - pad - ((kg - lo) / (hi - lo)) * (H - pad * 2);
      const actRate = (lastP.kg - firstP.kg) / (spanD / 7);
      const sign = (n) => (n > 0 ? '+' : (n < 0 ? '−' : '')) + Math.abs(n).toFixed(2);
      return {
        has: true, empty: false,
        line: pts.map(x => xOf(x.date).toFixed(1) + ',' + yOf(x.kg).toFixed(1)).join(' '),
        dots: pts.map(x => ({ cx: xOf(x.date).toFixed(1), cy: yOf(x.kg).toFixed(1) })),
        showExpected: !!prof && pts.length > 1,
        expLine: xOf(firstP.date).toFixed(1) + ',' + yOf(firstP.kg).toFixed(1) + ' ' + xOf(lastP.date).toFixed(1) + ',' + yOf(expEnd).toFixed(1),
        hiLabel: hi.toFixed(1) + ' kg', loLabel: lo.toFixed(1) + ' kg',
        fromLabel: fmtDateShort(firstP.date), toLabel: fmtDateShort(lastP.date),
        current: lastP.kg.toFixed(1) + ' kg',
        rateLine: pts.length > 1
          ? ('Actual ' + sign(actRate) + ' kg/wk' + (prof ? ' · plan ' + sign(expRate) + ' kg/wk' : ''))
          : 'One weigh-in so far — log again to see a trend.',
        checkLine: rcal
          ? (rcal.ready
            ? 'Two-week check-in ready — targets adjust on your next weigh-in.'
            : 'Next TDEE check-in in ' + rcal.daysLeft + (rcal.daysLeft === 1 ? ' day.' : ' days.'))
          : 'Log weigh-ins 14 days apart and your calories auto-adjust.',
        lastAdjust: (prof && prof.calibration)
          ? ('Last adjustment: ' + fmtKcal(prof.calibration.from) + ' → ' + fmtKcal(prof.calibration.to) + ' kcal on ' + fmtDateShort(prof.calibratedAt))
          : '',
      };
    })();

    const pfDefaults = { name: '', height: '', weight: '', age: '', sex: 'Male', goal: 'Maintain', pace: 'Moderate', activity: 'Moderately Active' };
    const pfd = s.profileForm || (prof ? null : pfDefaults);
    const setPf = (patch) => this.setState({ profileForm: { ...(this.state.profileForm || pfDefaults), ...patch } });
    const pfPaced = pfd && GOAL_RULES[pfd.goal] && GOAL_RULES[pfd.goal].paces;
    const pf = pfd ? {
      name: pfd.name, height: pfd.height, weight: pfd.weight, age: pfd.age,
      onName: (e) => setPf({ name: e.target.value }),
      onHeight: (e) => setPf({ height: e.target.value }),
      onWeight: (e) => setPf({ weight: e.target.value }),
      onAge: (e) => setPf({ age: e.target.value }),
      sexOptions: ['Male', 'Female'].map(x => ({ label: x, bg: pfd.sex === x ? 'var(--accent)' : 'var(--surface-2)', color: pfd.sex === x ? '#fff' : 'var(--muted)', set: () => setPf({ sex: x }) })),
      goalOptions: GOALS.map(x => ({ label: x, bg: pfd.goal === x ? 'var(--accent)' : 'var(--surface-2)', color: pfd.goal === x ? '#fff' : 'var(--muted)', set: () => setPf({ goal: x }) })),
      showPace: !!pfPaced,
      paceLabel: pfd.goal === 'Lose Weight' ? 'Deficit pace' : 'Surplus pace',
      paceOptions: pfPaced ? PACES.map(x => ({ label: x, sub: pfd.goal === 'Lose Weight' ? (x === 'Moderate' ? '~15% deficit' : '~25% deficit') : (x === 'Moderate' ? '~10% surplus' : '~20% surplus'), bg: (pfd.pace || 'Moderate') === x ? 'var(--accent)' : 'var(--surface-2)', color: (pfd.pace || 'Moderate') === x ? '#fff' : 'var(--muted)', set: () => setPf({ pace: x }) })) : [],
      activityOptions: ACTIVITY.map(x => ({ label: x, bg: pfd.activity === x ? 'var(--accent)' : 'var(--surface-2)', color: pfd.activity === x ? '#fff' : 'var(--muted)', set: () => setPf({ activity: x }) })),
      save: () => {
        const f = { ...pfDefaults, ...(this.state.profileForm || {}) };
        if (!(+f.height) || !(+f.weight) || !(+f.age)) return;
        this.haptic(true);
        this.setState({ profileForm: null, profileEditOpen: false });
        this.save({ profile: this.computeTargets(f) }, 'the profile change');
      },
    } : null;
    // ===== onboarding =====
    const onbDefaults = ONB_DEFAULTS;
    const onf = s.onbForm || onbDefaults;
    const setOnb = (patch) => this.setState({ onbForm: { ...(this.state.onbForm || onbDefaults), ...patch } });
    const step = s.onbStep || 0;
    const onbActive = !s.loading && s.flowPhase === 'onboarding';
    const welcomeActive = s.flowPhase === 'welcome';
    const tutorialActive = s.flowPhase === 'tutorial';
    const welcomeName = (prof && prof.name ? prof.name : 'friend') + ',';
    const tutIdx = Math.min(TUT_STEPS.length - 1, Math.max(0, (s.tutStep | 0)));
    const tutS = TUT_STEPS[tutIdx];
    const tutRect = s.tutRect;
    const tutCardTop = tutRect && (tutRect.top + tutRect.height / 2) < 400 ? 'auto' : '92px';
    const tutCardBottom = tutRect && (tutRect.top + tutRect.height / 2) < 400 ? '28px' : 'auto';
    const tut = {
      counter: 'Step ' + (tutIdx + 1) + ' of ' + TUT_STEPS.length,
      dots: TUT_STEPS.map((_, i) => ({ bg: i === tutIdx ? 'var(--accent)' : 'var(--border)' })),
      title: tutS.title, text: tutS.text,
      hasNote: !!tutS.note, note: tutS.note || '',
      nextLabel: tutS.final ? "That's the tour. Ready to train? ▶" : 'Got it ▶',
      next: () => this.advanceTutorial(),
      skip: () => this.completeTutorial(true),
      hasSpot: !!tutRect, noSpot: !tutRect,
      spotTop: tutRect ? tutRect.top + 'px' : '0',
      spotLeft: tutRect ? tutRect.left + 'px' : '0',
      spotW: tutRect ? tutRect.width + 'px' : '0',
      spotH: tutRect ? tutRect.height + 'px' : '0',
      cardTop: tutCardTop, cardBottom: tutCardBottom,
    };
    const onbSteps = [
      { kicker: 'Welcome', title: 'What should we call you?', subtitle: "We'll use this to personalise your home screen.", valid: onf.name.trim().length > 0 },
      { kicker: 'Step 2 of 5', title: 'A little about you', subtitle: 'This helps estimate your energy needs.', valid: +onf.age >= 15 && +onf.age <= 100, err: (onf.age !== '' && !(+onf.age >= 15 && +onf.age <= 100)) ? 'Age must be between 15 and 100.' : '' },
      { kicker: 'Step 3 of 5', title: 'Your measurements', subtitle: 'Used to calculate your daily targets.', valid: +onf.height >= 100 && +onf.height <= 250 && +onf.weight >= 30 && +onf.weight <= 250, err: (onf.height !== '' && !(+onf.height >= 100 && +onf.height <= 250)) ? 'Height must be between 100 and 250 cm.' : ((onf.weight !== '' && !(+onf.weight >= 30 && +onf.weight <= 250)) ? 'Weight must be between 30 and 250 kg.' : '') },
      { kicker: 'Step 4 of 5', title: "What's your goal?", subtitle: 'We tune your macros to match.', valid: true },
      { kicker: 'Step 5 of 5', title: 'How active are you?', subtitle: 'On a typical week, including training.', valid: true },
    ];
    const cur = onbSteps[step] || onbSteps[0];
    const optBuild = (list, key) => list.map(x => ({ label: x, bg: onf[key] === x ? 'var(--accent)' : 'var(--surface-2)', color: onf[key] === x ? '#fff' : 'var(--muted)', set: () => setOnb({ [key]: x }) }));
    const onb = {
      dots: onbSteps.map((_, i) => ({ bg: i <= step ? 'var(--accent)' : 'var(--border)' })),
      kicker: cur.kicker, title: cur.title, subtitle: cur.subtitle,
      hasErr: !!cur.err, err: cur.err || '',
      s0: step === 0, s1: step === 1, s2: step === 2, s3: step === 3, s4: step === 4,
      name: onf.name, age: onf.age, height: onf.height, weight: onf.weight,
      onName: (e) => setOnb({ name: e.target.value }),
      onAge: (e) => setOnb({ age: e.target.value }),
      onHeight: (e) => setOnb({ height: e.target.value }),
      onWeight: (e) => setOnb({ weight: e.target.value }),
      sexOptions: optBuild(['Male', 'Female'], 'sex'),
      goalOptions: optBuild(GOALS, 'goal'),
      showPace: !!(GOAL_RULES[onf.goal] && GOAL_RULES[onf.goal].paces),
      paceLabel: onf.goal === 'Lose Weight' ? 'How aggressive a deficit?' : 'How aggressive a surplus?',
      paceOptions: (GOAL_RULES[onf.goal] && GOAL_RULES[onf.goal].paces) ? PACES.map(x => ({ label: x, sub: onf.goal === 'Lose Weight' ? (x === 'Moderate' ? '~15% below maintenance' : '~25% below maintenance') : (x === 'Moderate' ? '~10% above maintenance' : '~20% above maintenance'), bg: (onf.pace || 'Moderate') === x ? 'var(--accent)' : 'var(--surface-2)', color: (onf.pace || 'Moderate') === x ? '#fff' : 'var(--muted)', set: () => setOnb({ pace: x }) })) : [],
      activityOptions: optBuild(ACTIVITY, 'activity'),
      canBack: step > 0,
      back: () => this.setState({ onbStep: Math.max(0, (this.state.onbStep || 0) - 1) }),
      nextLabel: step === onbSteps.length - 1 ? 'Finish' : 'Continue',
      nextBg: cur.valid ? 'var(--text)' : 'var(--border)',
      nextFg: cur.valid ? 'var(--surface)' : 'var(--faint)',
      nextCursor: cur.valid ? 'pointer' : 'default',
      next: () => {
        if (!cur.valid) return;
        if (step < onbSteps.length - 1) { this.haptic(false); this.setState({ onbStep: step + 1 }); return; }
        this.finishOnboarding();
      },
    };
    // ===== greeting + profile popover =====
    const greetName = prof && prof.name ? prof.name : 'there';
    if (!this._greetTpl) {
      const h = new Date().getHours();
      const period = (h >= 5 && h < 12) ? 'morning' : (h >= 12 && h < 18) ? 'afternoon' : (h >= 18) ? 'evening' : 'night';
      const opts = {
        morning: ['Good morning, {n}', 'Rise and grind, {n}', "Let's go, {n}"],
        afternoon: ['Hey {n}', 'Keep it up, {n}', 'Afternoon grind, {n}'],
        evening: ['Evening session, {n}', "You've got this, {n}", 'Final push, {n}'],
        night: ['Late night training, {n}', 'Night owl, {n}', 'Push through, {n}'],
      }[period];
      this._greetTpl = opts[Math.floor(Math.random() * opts.length)];
    }
    const greetLine = this._greetTpl.replace('{n}', greetName);
    const pm = prof ? {
      rows: [
        { label: 'Name', value: prof.name || '—' },
        { label: 'Sex', value: prof.sex },
        { label: 'Age', value: String(prof.age) },
        { label: 'Height', value: prof.height + ' cm' },
        { label: 'Weight', value: prof.weight + ' kg' },
        { label: 'Goal', value: prof.goal + (prof.pace ? ' · ' + prof.pace : '') },
        { label: 'Activity', value: prof.activity },
      ],
      edit: () => this.setState({ profileMenu: false, profileEditOpen: true, profileForm: { name: prof.name || '', height: String(prof.height), weight: String(prof.weight), age: String(prof.age), sex: prof.sex, goal: prof.goal, pace: prof.pace || 'Moderate', activity: prof.activity } }),
      exportData: () => this.exportData(),
      importData: () => this.pickImport('menu'),
      recoveryProfile: () => this.setState({ profileMenu: false, recoveryView: true }),
    } : { rows: [] };
    const ma0 = s.mealAdd;
    const setMa = (p) => this.setState({ mealAdd: { ...this.state.mealAdd, ...p } });
    let ma = null;
    if (ma0) {
      const results = ma0.results || [];
      ma = {
        title: ma0.mode === 'custom' ? 'Create custom meal' : 'Add meal',
        onLog: ma0.mode !== 'custom', onCustom: ma0.mode === 'custom',
        mealName: ma0.mealName || '', onMealName: (e) => setMa({ mealName: e.target.value }),
        startSave: () => setMa({ mode: 'custom' }),
        saveOpacity: ((ma0.mealName || '').trim() && ma0.items.length) ? 1 : 0.4,
        saveCustom: () => {
          const f = this.state.mealAdd; if (!f || !f.items.length) return;
          const name = (f.mealName || '').trim(); if (!name) return;
          const cm = { id: 'cmeal_' + Date.now(), name, items: f.items.map(x => ({ ...x })), createdAt: new Date().toISOString() };
          this.haptic(true);
          this.setState({ mealAdd: null });
          this.save({ customMeals: [...(this.state.customMeals || []), cm] }, 'saving that meal');
          this.showToast('"' + name + '" saved to your meals.');
        },
        onText: ma0.tab === 'text', onPhoto: ma0.tab === 'photo',
        textTabBg: ma0.tab === 'text' ? 'var(--surface)' : 'transparent', textTabFg: ma0.tab === 'text' ? 'var(--text)' : 'var(--muted)',
        photoTabBg: ma0.tab === 'photo' ? 'var(--surface)' : 'transparent', photoTabFg: ma0.tab === 'photo' ? 'var(--text)' : 'var(--muted)',
        tabText: () => setMa({ tab: 'text' }), tabPhoto: () => setMa({ tab: 'photo' }),
        text: ma0.text, onTextInput: (e) => setMa({ text: e.target.value }),
        estimate: () => this.parseTextMeal(),
        estimateLabel: ma0.busy ? 'Looking up…' : 'Parse & estimate from USDA',
        search: ma0.search, onSearch: (e) => this.onMealSearch(e.target.value),
        searching: !!ma0.searching,
        hasSearchErr: !!ma0.searchErr, searchErr: ma0.searchErr || '',
        hasResults: results.length > 0,
        results: results.map((f, i) => ({
          name: f.name, info: Math.round(f.cal) + ' kcal / 100g',
          divider: i === results.length - 1 ? 'transparent' : 'var(--border)',
          add: () => setMa({ items: [...this.state.mealAdd.items, { food: f.name, qty: 100, pgP: f.p / 100, pgC: f.c / 100, pgF: f.f / 100, pgCal: f.cal / 100 }], search: '', results: [] }),
        })),
        busy: ma0.busy, hasError: !!ma0.error, error: ma0.error,
        photoLabel: ma0.photoName || 'Take or choose a photo',
        onPhotoPick: (e) => this.classifyPhoto(e),
        hasItems: ma0.items.length > 0,
        items: ma0.items.map((it, i) => ({
          food: it.food, qty: it.qty,
          macros: itemMacros(it), unit: it.unit || 'g',
          toggleUnit: () => { const arr = this.state.mealAdd.items.slice(); const u = (arr[i].unit || 'g') === 'oz' ? 'g' : 'oz'; const q = Math.round(arr[i].qty * GPU(arr[i]) / (u === 'oz' ? 28.35 : 1) * 10) / 10; arr[i] = { ...arr[i], unit: u, qty: q }; setMa({ items: arr }); },
          onQty: (e) => { const qty = Math.max(0, parseFloat(e.target.value) || 0); const arr = this.state.mealAdd.items.slice(); arr[i] = { ...arr[i], qty }; setMa({ items: arr }); },
          remove: () => setMa({ items: this.state.mealAdd.items.filter((_, x) => x !== i) }),
        })),
        total: mealMacroLine(sumItems(ma0.items)),
        onScan: ma0.tab === 'scan',
        scanTabBg: ma0.tab === 'scan' ? 'var(--surface)' : 'transparent', scanTabFg: ma0.tab === 'scan' ? 'var(--text)' : 'var(--muted)',
        tabScan: () => setMa({ tab: 'scan' }),
      };
      const sc0 = ma0.scan || { phase: 'idle' };
      const phase = sc0.phase || 'idle';
      const prod = sc0.product;
      const servings = sc0.qty === '' ? '' : (sc0.qty == null ? 1 : sc0.qty);
      let grams = 0, preview = '';
      if (prod) {
        grams = Math.max(1, Math.round(prod.servingG * Math.max(0.1, parseFloat(servings) || 1)));
        const mult = grams / 100;
        preview = 'P ' + Math.round(prod.per100.p * mult) + 'g · C ' + Math.round(prod.per100.c * mult) + 'g · F ' + Math.round(prod.per100.f * mult) + 'g · ' + fmtKcal(prod.per100.cal * mult) + ' kcal';
      }
      ma.scanOverlay = phase === 'camera' || phase === 'looking' || phase === 'found' || phase === 'notfound';
      ma.scan = {
        phase, detected: !!sc0.detected,
        showCam: phase === 'camera' || phase === 'looking',
        isLooking: phase === 'looking', isFound: phase === 'found', isNotFound: phase === 'notfound',
        notFoundTitle: sc0.netErr ? "Couldn't reach the database" : 'Product not found',
        notFoundBody: sc0.netErr ? 'Check your connection and try again — previously scanned products still work offline.' : '',
        isNetErr: !!sc0.netErr, notNetErr: !sc0.netErr,
        boxColor: sc0.detected ? '#22C55E' : 'rgba(255,255,255,.9)',
        camHint: sc0.detected ? 'Barcode detected' : 'Point camera at a barcode',
        barcode: sc0.barcode || '',
        manual: sc0.manual || '', onManual: (e) => this._setScan({ manual: e.target.value, camErr: '' }),
        submitManual: () => this.submitManual(),
        hasCamErr: !!sc0.camErr, camErr: sc0.camErr || '',
        openCamera: () => this.openCamera(), closeCamera: () => this.closeCamera(),
        product: prod ? { name: prod.name, brand: prod.brand, hasBrand: !!prod.brand, hasImage: !!prod.image, imageStyle: prod.image ? ('width:78px; height:78px; flex:none; border-radius:14px; background-color:#fff; background-size:cover; background-position:center; background-image:url("' + prod.image + '")') : '', source: prod.source, serving: prod.hasServing ? (Math.round(prod.servingG) + ' g / serving') : 'assuming 100 g / serving' } : null,
        servings, grams, preview,
        incServ: () => this._setScan({ qty: Math.round((Math.max(0.1, parseFloat(servings) || 1) + 0.5) * 10) / 10 }),
        decServ: () => this._setScan({ qty: Math.max(0.5, Math.round(((parseFloat(servings) || 1) - 0.5) * 10) / 10) }),
        onServ: (e) => { const v = e.target.value; this._setScan({ qty: v === '' ? '' : Math.max(0.1, parseFloat(v) || 0.1) }); },
        add: () => this.addScannedProduct(),
        tryAgain: () => this.openCamera(),
        toText: () => setMa({ tab: 'text', scan: { phase: 'idle', manual: '' } }),
      };
    }
    const md0 = s.mealDetail;
    const mdMeal = md0 ? (s.meals || []).find(m => m.id === md0.id) : null;
    const updateMeal = (patch) => this.save({ meals: this.state.meals.map(m => m.id === md0.id ? { ...m, ...patch } : m) }, 'that meal edit');
    const md = mdMeal ? {
      name: mdMeal.name, onName: (e) => updateMeal({ name: e.target.value }),
      time: fmtDate(mdMeal.date) + ' · ' + timeLabel(mdMeal.ts),
      items: (mdMeal.items || []).map((it, i) => ({
        food: it.food, qty: it.qty,
        macros: itemMacros(it), unit: it.unit || 'g',
        toggleUnit: () => { const u = (it.unit || 'g') === 'oz' ? 'g' : 'oz'; const q = Math.round(it.qty * GPU(it) / (u === 'oz' ? 28.35 : 1) * 10) / 10; const items = mdMeal.items.map((x, xi) => xi === i ? { ...x, unit: u, qty: q } : x); updateMeal({ items, ...sumItems(items) }); },
        onQty: (e) => { const qty = Math.max(0, parseFloat(e.target.value) || 0); const items = mdMeal.items.map((x, xi) => xi === i ? { ...x, qty } : x); updateMeal({ items, ...sumItems(items) }); },
        remove: () => { const items = mdMeal.items.filter((_, xi) => xi !== i); updateMeal({ items, ...sumItems(items) }); },
      })),
      total: mealMacroLine(mdMeal),
      deleteMeal: () => { const meals = this.state.meals.filter(m => m.id !== md0.id); this.setState({ mealDetail: null }); this.save({ meals }, 'deleting that meal'); },
    } : null;
    const cms = s.customMeals || [];
    const logCustom = (cm) => {
      const t = sumItems(cm.items);
      const nowD = new Date();
      const meal = { id: 'meal_' + Date.now(), date: localISO(nowD), ts: nowD.getTime(), name: cm.name, items: cm.items.map(x => ({ ...x })), ...t };
      this.haptic(true);
      this.save({ meals: [...(this.state.meals || []), meal] }, 'logging that meal');
      this.showToast('"' + cm.name + '" added to today.');
    };
    const sm = {
      has: cms.length > 0, none: cms.length === 0,
      create: () => this.setState({ mealAdd: { tab: 'text', mode: 'custom', mealName: '', text: '', search: '', results: [], searching: false, searchErr: '', items: [], busy: false, error: '', photoName: '' } }),
      list: cms.map(cm => ({
        name: cm.name,
        count: cm.items.length + (cm.items.length === 1 ? ' ingredient' : ' ingredients'),
        macros: mealMacroLine(sumItems(cm.items)),
        quickAdd: (e) => { e.stopPropagation(); logCustom(cm); },
        open: () => this.setState({ savedMealDetail: { id: cm.id } }),
      })),
    };
    const smd0 = s.savedMealDetail;
    const smdMeal = smd0 ? cms.find(m => m.id === smd0.id) : null;
    const updateCm = (patch) => this.save({ customMeals: (this.state.customMeals || []).map(m => m.id === smd0.id ? { ...m, ...patch } : m) }, 'that saved-meal edit');
    const smd = smdMeal ? {
      name: smdMeal.name, onName: (e) => updateCm({ name: e.target.value }),
      count: smdMeal.items.length + (smdMeal.items.length === 1 ? ' ingredient' : ' ingredients') + ' · saved meal',
      items: (smdMeal.items || []).map((it, i) => ({
        food: it.food, qty: it.qty,
        macros: itemMacros(it), unit: it.unit || 'g',
        toggleUnit: () => { const u = (it.unit || 'g') === 'oz' ? 'g' : 'oz'; const q = Math.round(it.qty * GPU(it) / (u === 'oz' ? 28.35 : 1) * 10) / 10; updateCm({ items: smdMeal.items.map((x, xi) => xi === i ? { ...x, unit: u, qty: q } : x) }); },
        onQty: (e) => { const qty = Math.max(0, parseFloat(e.target.value) || 0); updateCm({ items: smdMeal.items.map((x, xi) => xi === i ? { ...x, qty } : x) }); },
        remove: () => updateCm({ items: smdMeal.items.filter((_, xi) => xi !== i) }),
      })),
      total: mealMacroLine(sumItems(smdMeal.items)),
      addToToday: () => { this.setState({ savedMealDetail: null }); logCustom(smdMeal); },
      clone: () => {
        const copy = { id: 'cmeal_' + Date.now(), name: smdMeal.name + ' (copy)', items: smdMeal.items.map(x => ({ ...x })), createdAt: new Date().toISOString() };
        this.save({ customMeals: [...(this.state.customMeals || []), copy] }, 'duplicating that meal');
        this.setState({ savedMealDetail: { id: copy.id } });
        this.showToast('Cloned — edit the name and quantities.');
      },
      deleteMeal: () => { this.setState({ savedMealDetail: null }); this.save({ customMeals: (this.state.customMeals || []).filter(m => m.id !== smd0.id) }, 'deleting that saved meal'); this.showToast('Saved meal deleted.'); },
    } : null;
    const exf = s.exportForm;
    const exd = exf ? {
      from: exf.from, to: exf.to,
      onFrom: (e) => this.setState({ exportForm: { ...this.state.exportForm, from: e.target.value } }),
      onTo: (e) => this.setState({ exportForm: { ...this.state.exportForm, to: e.target.value } }),
      run: () => this.exportNutritionPdf(),
    } : null;
    const restState = screen === 'session' && (!at || at === 'Rest');
    const completionState = screen === 'session' && !!sx && !!asess && asess.completed && ad === s.todayKey && s.sessionPeek !== (ad + ':' + aslot);
    const sessionNormal = screen === 'session' && !!sx && !completionState;

    return {
      theme: s.theme,
      loading: s.loading,
      weather,
      goHome: () => this.setState({ screen: 'week', activeDay: null, activeProgramDay: null, activeBodyPart: null, menuOpen: false, reorderMode: null, drag: null }),
      greetLine, pm, onb, onbActive,
      welcomeActive, welcomeName, tutorialActive, tut,
      splashActive: !s.loading && s.flowPhase === 'splash',
      splashStart: () => { this.haptic(false); this.setState({ flowPhase: 'firstLaunch' }); },
      welcomeStart: () => this.setState({ flowPhase: 'tutorial', tutStep: 0, tutRect: null }, () => this._tutMeasureSoon(300)),
      wt: prof ? { cal: fmtKcal(prof.calories), p: prof.protein + 'g', c: prof.carbs + 'g', f: prof.fat + 'g' } : { cal: '—', p: '—', c: '—', f: '—' },
      firstLaunchActive: !s.loading && s.flowPhase === 'firstLaunch',
      chooseFresh: () => this.setState({ flowPhase: 'onboarding', onbStep: 0 }),
      chooseImport: () => this.pickImport('firstLaunch'),
      hasToast: !!s.toast, toast: s.toast || '',

      // ---- global undo ----
      // Hidden until something is on the stack, and while a flow (splash / first launch /
      // onboarding / tutorial) owns the screen — there is nothing of the user's to undo
      // yet and the button would land on top of a guided step.
      undoVisible: !s.loading && s.flowPhase === 'done' && (s.undoStack || []).length > 0,
      undoCount: (s.undoStack || []).length,
      undoLabel: 'Undo ' + (((s.undoStack || []).slice(-1)[0] || {}).label || 'last change'),
      doUndo: () => this.undo(),
      importingActive: !!s.importing,
      confirmImportOpen: !!s.confirmImport,
      confirmImportYes: () => this.doRestore(),
      confirmImportNo: () => this.setState({ confirmImport: false }),

      // ---- RPE + recovery ----
      rpeOpen: !!s.rpeSheet,
      rpe: s.rpeSheet ? {
        dayLabel: FULL[s.rpeSheet.day] || '',
        value: s.rpeSheet.rpe,
        notes: s.rpeSheet.notes,
        submitDisabled: s.rpeSheet.rpe == null,
        submitOpacity: s.rpeSheet.rpe == null ? 0.4 : 1,
        scale: RPE_SCALE.map(r => ({
          n: r.n, label: r.label, sub: r.sub,
          rowBg: s.rpeSheet.rpe === r.n ? 'var(--text)' : 'var(--surface-2)',
          rowFg: s.rpeSheet.rpe === r.n ? 'var(--surface)' : 'var(--text)',
          subFg: s.rpeSheet.rpe === r.n ? 'rgba(255,255,255,.7)' : 'var(--muted)',
          numBg: s.rpeSheet.rpe === r.n ? 'rgba(255,255,255,.18)' : (r.n >= 8 ? 'var(--accent-soft)' : 'var(--surface)'),
          pick: () => this.setState({ rpeSheet: { ...this.state.rpeSheet, rpe: r.n } }),
        })),
        onNotes: (e) => this.setState({ rpeSheet: { ...this.state.rpeSheet, notes: e.target.value } }),
        hasCardio: !!(s.rpeSheet.cardio && s.rpeSheet.cardio.length),
        cardio: (s.rpeSheet.cardio || []).map((c, ci) => {
          const setC = (patch) => { const arr = (this.state.rpeSheet.cardio || []).slice(); arr[ci] = { ...arr[ci], ...patch }; this.setState({ rpeSheet: { ...this.state.rpeSheet, cardio: arr } }); };
          return {
            name: c.name, duration: c.duration, distance: c.distance,
            onDuration: (e) => setC({ duration: numOrEmpty(e.target.value) }),
            onDistance: (e) => setC({ distance: numOrEmpty(e.target.value, true) }),
            efforts: this._effortChips(c.rpe, (n) => setC({ rpe: n })),
          };
        }),
        submit: () => this.submitRpe(),
      } : { scale: [], cardio: [] },

      recoveryOpen: !!s.recoveryPrompt,
      recovery: (() => {
        if (!s.recoveryPrompt) return { options: [] };
        const prof = s.recoveryProfile || DEFAULT_RECOVERY;
        const det = s.recoveryPrompt.det;
        const conf = prof.confidence || 0;
        let confLine, learnedLine;
        if (prof.sample_size < 5) { confLine = 'Still learning your patterns…'; }
        else if (prof.sample_size < 10) { confLine = 'Emerging pattern detected'; }
        else if (prof.sample_size < 20) { confLine = 'Based on your patterns'; }
        else { confLine = 'Confident in your tolerance'; }
        const gap = this._dayGapDays(s.sessionHistory);
        const recalibrating = gap > 14 && prof.sample_size > 0;
        if (recalibrating) confLine = "Haven't seen you in a while. Recalibrating your tolerance…";
        const personalized = conf >= 0.6 && !recalibrating;
        if (personalized) {
          const days = Math.round(prof.learned_consecutive_days);
          learnedLine = 'Based on your patterns, you typically need rest after about ' + days + ' intense ' + (days === 1 ? 'workout' : 'workouts') + '. (' + prof.sample_size + ' data points, ' + Math.round(conf * 100) + '% confident)';
        } else {
          learnedLine = confLine + (prof.sample_size ? ' (' + prof.sample_size + ' data points)' : '');
        }
        let reason;
        if (det.byConsec) reason = "You've logged " + det.consec + ' intense ' + (det.consec === 1 ? 'day' : 'days') + ' in a row. Rest up tomorrow?';
        else reason = 'Your weekly effort load is high (' + det.weeklyLoad + ' total RPE). Consider easing off tomorrow.';
        return {
          learnedLine, reason,
          options: [
            { key: 'good', label: "I'm good, let's go", pick: () => this.respondRecovery('good') },
            { key: 'lighter', label: 'I can go on (lighter day)', pick: () => this.respondRecovery('lighter') },
            { key: 'break', label: 'I need a break', pick: () => this.respondRecovery('break') },
          ],
        };
      })(),

      recoveryViewOpen: !!s.recoveryView,
      recoveryViewData: (() => {
        const prof = s.recoveryProfile || DEFAULT_RECOVERY;
        const conf = prof.confidence || 0;
        const gap = this._dayGapDays(s.sessionHistory);
        const recalibrating = gap > 14 && prof.sample_size > 0;
        const tolLabel = prof.tolerance.charAt(0).toUpperCase() + prof.tolerance.slice(1);
        const days = Math.round(prof.learned_consecutive_days);
        const log = (s.recoveryLog || []).slice().reverse();
        return {
          toleranceLabel: tolLabel + ' recovery',
          toleranceSub: "You're a " + prof.tolerance + '-recovery athlete',
          freqLine: 'Rest recommended after ~' + days + ' intense ' + (days === 1 ? 'session' : 'sessions'),
          loadLine: 'Weekly load threshold: ' + Math.round(prof.learned_weekly_load_threshold) + ' RPE',
          confPct: Math.round(conf * 100) + '%',
          confBarW: Math.round(conf * 100) + '%',
          statusLine: recalibrating ? 'Recalibrating — you\'ve been away a while' : (prof.sample_size < 5 ? 'Still learning your patterns…' : prof.sample_size < 10 ? 'Emerging pattern detected' : prof.sample_size < 20 ? 'Based on your patterns' : 'Confident in your tolerance'),
          hasLog: log.length > 0,
          noLog: log.length === 0,
          entries: log.map(e => ({
            date: new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            suggested: e.suggested ? 'Rest suggested' : 'No rest flag',
            choice: e.choice === 'break' ? 'Took a break' : e.choice === 'lighter' ? 'Went lighter' : e.choice === 'good' ? 'Pushed on' : '—',
            outcome: e.nextPerf ? (e.nextPerf.charAt(0).toUpperCase() + e.nextPerf.slice(1)) : 'Pending',
            outcomeColor: e.outcome === 'positive' ? 'var(--accent)' : e.outcome === 'negative' ? '#B0715E' : 'var(--muted)',
          })),
          close: () => this.setState({ recoveryView: false }),
        };
      })(),
      profileMenuOpen: !!s.profileMenu && !!prof,
      closeProfileMenu: () => this.setState({ profileMenu: false }),
      profileEditOpen: !!s.profileEditOpen,
      closeProfileEdit: () => this.setState({ profileEditOpen: false, profileForm: null }),
      greetPressStart: () => this.startGreetPress(),
      greetPressEnd: () => this.endGreetPress(),
      supplements: (s.supplements || []).map((name, i) => {
        const checked = !!(s.supplementsChecked || {})[name];
        return {
          name, check: checked ? '✓' : '',
          ringColor: checked ? 'var(--accent)' : 'var(--border)',
          fillColor: checked ? 'var(--accent)' : 'transparent',
          strike: checked ? 'line-through' : 'none',
          divider: i === s.supplements.length - 1 ? 'transparent' : 'var(--border)',
          toggle: () => { const m = { ...(s.supplementsChecked || {}) }; m[name] = !m[name]; this.save({ supplementsChecked: m }, 'that supplement tick'); },
        };
      }),
      supplementsEmpty: (s.supplements || []).length === 0,
      supplementsEditOpen: s.supplementsEditOpen,
      openSupplementsEdit: () => this.setState({ supplementsEditOpen: true, supplementsDraft: (s.supplements || []).slice(), newSupplementName: '' }),
      closeSupplementsEdit: () => { const list = s.supplementsDraft || s.supplements; this.setState({ supplementsEditOpen: false, supplementsDraft: null }); this.save({ supplements: list }, 'the supplement list'); },
      supplementsDraft: (s.supplementsDraft || []).map((name, i) => ({ name, remove: () => this.setState({ supplementsDraft: s.supplementsDraft.filter((_, idx) => idx !== i) }) })),
      newSupplementName: s.newSupplementName || '',
      onNewSupplementInput: (e) => this.setState({ newSupplementName: e.target.value }),
      addSupplement: () => { const n = (s.newSupplementName || '').trim(); if (!n) return; this.setState({ supplementsDraft: [...(s.supplementsDraft || []), n], newSupplementName: '' }); },
      isDark: s.theme === 'dark', notDark: s.theme !== 'dark',
      toggleTheme: () => this.toggleTheme(),
      menuOpen: s.menuOpen,
      menuItems,
      openMenu: () => this.setState({ menuOpen: true }),
      closeMenu: () => this.setState({ menuOpen: false }),
      onWeek: screen === 'week' && !s.loading, notWeek: screen !== 'week',
      onSession: screen === 'session', onProgram: screen === 'program', onProgramDay: screen === 'programDay', onHistory: screen === 'history', onDatabase: screen === 'database', onDatabaseDetail: screen === 'databaseDetail',
      onArchive: screen === 'archive', onArchiveDetail: screen === 'archiveDetail',
      onCardioDb: screen === 'cardioDb', onCardioDbDetail: screen === 'cardioDbDetail',
      headerTitle: ({ week: 'Lifts', session: 'Lifts', program: 'Current Program', programDay: pdx ? pdx.full : '', history: 'Session History', database: 'Exercise Database', databaseDetail: dbMeta ? dbMeta.label : '', archive: 'Archive', archiveDetail: 'Archive', meals: 'Meals', cardioDb: 'Cardio', cardioDbDetail: s.activeCardioType || 'Cardio' })[screen] || 'Lifts',
      headerSub: ({ week: tTrain ? dayTypeName(tt, tk, cl, true, (s.sessions[tk] || {}).label) + ' today' : 'Rest day today', session: restState ? 'Rest day' : 'Log your session', program: 'Recurring split', programDay: 'Label & exercises', history: 'Logged sessions', database: 'Body parts', databaseDetail: 'Exercises', archive: 'History', archiveDetail: 'History', meals: 'Nutrition & macros', cardioDb: 'Activities by type', cardioDbDetail: 'Activities' })[screen] || '',
      onMeals: screen === 'meals',
      mealsSetup: screen === 'meals' && (!prof || !!s.profileForm),
      mealsMain: screen === 'meals' && !!prof && !s.profileForm,
      pf, mx, nw, ma, md, exd,
      bw, wchart,
      weightFormOpen: !!s.weightForm, wf,
      openMeals: () => this.setState({ screen: 'meals', menuOpen: false }),
      editProfile: () => this.setState({ profileEditOpen: true, profileForm: { name: prof ? prof.name : '', height: String(prof ? prof.height : ''), weight: String(prof ? prof.weight : ''), age: String(prof ? prof.age : ''), sex: prof ? prof.sex : 'Male', goal: prof ? prof.goal : 'Maintain', pace: (prof && prof.pace) || 'Moderate', activity: prof ? prof.activity : 'Moderately Active' } }),
      openExport: () => this.setState({ exportForm: { from: localISO(Date.now() - 6 * 86400000), to: todayISO } }),
      exportOpen: !!exf,
      closeExport: () => this.setState({ exportForm: null }),
      openMealAdd: () => this.setState({ mealAdd: { tab: 'text', text: '', search: '', results: [], searching: false, searchErr: '', items: [], busy: false, error: '', photoName: '' } }),
      mealAddOpen: !!ma0,
      closeMealAdd: () => this.setState({ mealAdd: null }),
      sm, smd,
      savedMealDetailOpen: !!smdMeal,
      closeSavedMeal: () => this.setState({ savedMealDetail: null }),
      confirmMeal: () => {
        const f = this.state.mealAdd; if (!f || !f.items.length) return;
        const t = sumItems(f.items);
        const txt = (f.text || '').trim();
        let name = txt && txt.length <= 40 ? txt : f.items.map(i => i.food).slice(0, 3).join(', ');
        if (name.length > 48) name = name.slice(0, 48) + '…';
        name = name.charAt(0).toUpperCase() + name.slice(1);
        const nowD = new Date();
        const meal = { id: 'meal_' + Date.now(), date: localISO(nowD), ts: nowD.getTime(), name, items: f.items, ...t };
        this.haptic(true);
        this.setState({ mealAdd: null });
        this.save({ meals: [...(this.state.meals || []), meal] }, 'logging that meal');
      },
      mealDetailOpen: !!md,
      closeMealDetail: () => this.setState({ mealDetail: null }),
      restState, completionState, sessionNormal,
      peekSession: () => this.setState({ sessionPeek: ad + ':' + aslot }),
      wo, woActive: !!wo, wsx, wsOpenFlag: !!s.wsOpen,
      startWorkout: () => this.startWorkout(),
      printNutrition: !!s.nutritionPrint,
      np: s.nutritionPrint,
      showAmend: (screen === 'session' && !!ad) || (screen === 'programDay' && !!apd),
      amendAction: () => {
        if (screen === 'programDay' && apd) this.setState({ dayMenu: { day: apd, scope: 'every', source: 'program' }, dayConfirm: null });
        else if (screen === 'session' && ad) this.setState({ dayMenu: { day: ad, scope: 'once', source: 'week' }, dayConfirm: null });
      },
      topAction: () => {
        if (screen === 'session') this.setState({ screen: 'week', activeDay: null });
        else if (screen === 'archiveDetail') this.setState({ screen: 'archive' });
        else if (screen === 'programDay') this.setState({ screen: 'program', activeProgramDay: null, reorderMode: null, drag: null });
        else if (screen === 'history') this.setState({ screen: 'program' });
        else if (screen === 'databaseDetail') this.setState({ screen: 'database', activeBodyPart: null });
        else if (screen === 'cardioDbDetail') this.setState({ screen: 'cardioDb', activeCardioType: null });
        else this.setState({ screen: 'week' });
      },
      cardioTypes: CARDIO_TYPES.map((t, i) => ({ label: t, count: (s.cardioDb[t] || []).length + ' activities', divider: i === CARDIO_TYPES.length - 1 ? 'transparent' : 'var(--border)', open: () => this.setState({ screen: 'cardioDbDetail', activeCardioType: t }) })),
      cardioDetail: (() => {
        const t = s.activeCardioType; if (!t) return { list: [] };
        const list = (s.cardioDb[t] || []);
        return {
          hasItems: list.length > 0, empty: list.length === 0,
          list: list.map(a => ({
            name: a.name, description: a.description, equipment: a.equipment, durLabel: '~' + a.defaultDuration + ' min',
            addToProgram: () => this.setState({ cardioAddForm: { name: a.name, duration: a.defaultDuration, intensity: 'Moderate', day: DAYS[0] } }),
          })),
        };
      })(),
      bodyParts: BODY_PARTS.map((bp, i) => ({ ...bp, divider: i === BODY_PARTS.length - 1 ? 'transparent' : 'var(--border)', open: () => this.setState({ screen: 'databaseDetail', activeBodyPart: bp.key }) })),
      dbx, addDbExercise: () => this.setState({ dbForm: { key: abp, index: null, name: '', description: '', equipment: [''] } }),
      dbFormOpen: !!s.dbForm, dbf,
      closeDbForm: () => this.setState({ dbForm: null }),
      programAddOpen: !!s.programAddForm, paf,
      quickAddOpen, qa,
      closeQuickAdd: () => this.setState({ quickAdd: null }),
      dayMenuOpen: !!s.dayMenu, dm,
      closeProgramAdd: () => this.setState({ programAddForm: null }),
      cardioAddOpen: !!s.cardioAddForm,
      caf: (() => {
        const f = s.cardioAddForm; if (!f) return null;
        return {
          name: f.name, duration: f.duration,
          onDuration: (e) => this.setState({ cardioAddForm: { ...this.state.cardioAddForm, duration: numOrEmpty(e.target.value) } }),
          distance: f.distance != null ? f.distance : '',
          onDistance: (e) => this.setState({ cardioAddForm: { ...this.state.cardioAddForm, distance: numOrEmpty(e.target.value, true) } }),
          efforts: this._effortChips(f.rpe || 5, (n) => this.setState({ cardioAddForm: { ...this.state.cardioAddForm, rpe: n } })),
          days: DAYS.map(d => {
            const t = s.program[d].type; const acts = s.program[d].exercises || [];
            const strength = acts.filter(a => !a.cardio).length;
            const sub = t === 'Rest' ? 'Rest — becomes a cardio day' : (strength > 0 ? typeLabel(t) + ' · finisher after ' + strength : typeLabel(t) + ' day');
            return { label: FULL[d], sub, bg: f.day === d ? TYPE_COLOR.Cardio : 'var(--surface-2)', color: f.day === d ? '#fff' : 'var(--text)', pick: () => this.setState({ cardioAddForm: { ...this.state.cardioAddForm, day: d } }) };
          }),
          dayLabel: FULL[f.day],
          finisherNote: (() => { const acts = s.program[f.day].exercises || []; const strength = acts.filter(a => !a.cardio).length; return strength > 0 ? 'Adds after ' + strength + ' strength ' + (strength === 1 ? 'exercise' : 'exercises') + ' as a finisher.' : ''; })(),
          hasFinisher: (s.program[f.day].exercises || []).filter(a => !a.cardio).length > 0,
        };
      })(),
      closeCardioAdd: () => this.setState({ cardioAddForm: null }),
      confirmCardioAdd: () => {
        const f = s.cardioAddForm; if (!f) return;
        const cRpe = f.rpe || 5;
        this.addCardioToProgram(f.day, { name: f.name, duration: f.duration || 0, distance: +f.distance || 0, rpe: cRpe, intensity: rpeIntensity(cRpe) });
        this.haptic(true);
        this.setState({ cardioAddForm: null });
        this.showToast(f.name + ' added to ' + FULL[f.day] + '.');
      },
      confirmProgramAdd: () => {
        const f = s.programAddForm; if (!f) return;
        const variant = f.hasVariants ? f.variant : '';
        const displayName = variant ? f.name + ' — ' + variant : f.name;
        const item = { name: displayName, sets: f.sets || 0, reps: f.reps || 0, weight: 0, equipment: f.variant || '' };
        this.addExerciseToProgram(f.day, item);
        this.haptic(true);
        this.setState({ programAddForm: null });
      },
      saveDbExercise: () => {
        const f = s.dbForm; if (!f) return;
        const opts = (f.equipment || []).map(x => (x || '').trim()).filter(Boolean);
        const equipment = opts.length > 1 ? opts : (opts[0] || '');
        const list = (s.exerciseDb[f.key] || []).slice();
        const item = { name: f.name || 'Exercise', description: f.description || '', equipment };
        if (f.index === null) list.push(item); else list[f.index] = item;
        this.save({ exerciseDb: { ...s.exerciseDb, [f.key]: list } }, 'that exercise database change');
        this.setState({ dbForm: null });
      },
      deleteDbExercise: () => {
        const f = s.dbForm; if (!f || f.index === null) return;
        const list = (s.exerciseDb[f.key] || []).filter((_, i) => i !== f.index);
        this.save({ exerciseDb: { ...s.exerciseDb, [f.key]: list } }, 'that exercise database change');
        this.setState({ dbForm: null });
      },

      days,
      weekNav,
      weekSectionLabel: wOff === 0 ? 'This week' : (wOff < 0 ? (wOff === -1 ? 'Last week' : Math.abs(wOff) + ' weeks ago') : (wOff === 1 ? 'Next week' : 'In ' + wOff + ' weeks')),
      todayName: FULL[tk], todayProgram: tTrain ? dayTypeName(tt, tk, cl, true, (s.sessions[tk] || {}).label) : (restMode ? 'No workout due' : 'Rest day'),
      todaySub: tTrain ? (tSkipped ? 'Skipped this week — open it to log it anyway or unskip from the day menu' : (tCompleted ? (tt === 'Cardio' ? 'Session done for today — eat well & get some rest' : 'Lift done for today — eat well & get some rest') : 'Tap below to open and log your session')) : (restMode ? 'Rest mode is on — turn it off in the Menu to see your workouts' : 'Recover well — no lift scheduled today'),
      todayBg, todayFg,
      todayStatus: tTrain ? (s.sessions[tk] && s.sessions[tk].skipped ? 'Skipped' : (s.sessions[tk] && s.sessions[tk].completed ? 'Completed' : 'Scheduled')) : (restMode ? 'Rest mode' : 'Recovery'),
      todayPillBg: tTrain ? 'rgba(255,255,255,.2)' : 'var(--surface-2)',
      todayBtnBg: '#fff', todayBtnFg: tTrain ? TYPE_COLOR[tt] : 'var(--text)',
      todayMoveBorder: 'rgba(255,255,255,.5)',
      todayTrainDisplay: tTrain && !tCompleted ? 'block' : 'none',
      openToday: () => { if (tTrain) this.setState({ screen: 'session', activeDay: tk }); },
      openTodayMenu: () => this.setState({ dayMenu: { day: tk, scope: 'once', source: 'week' }, dayConfirm: null }),
      openMoveToday: () => { if (tTrain) this.setState({ activeDay: tk, moveSrc: null, moveConfirm: null, moveTargetOffset: null, movePath: null, moveOpen: true }); },

      sx,
      addExercise: () => {
        if (at === 'Cardio') this.setState({ quickAdd: { day: ad, slot: aslot, stage: 'browseCat', kind: 'cardio', cat: null, item: null, sets: 3, reps: 10, duration: 30, intensity: 'Moderate', recur: 'once', offset: 0 } });
        else this.setState({ exForm: this._exFormFrom({ name: '', sets: 3, reps: 10, weight: 20 }, { mode: 'session', day: ad, slot: aslot, index: null }) });
      },
      // Typing isn't an action: a keystroke per undo step would bury everything else on
      // the stack, and the field itself is right there to edit back.
      onNotes: (e) => this.save({ sessions: this.patchSlot(ad, aslot, { notes: e.target.value }) }, null),

      // ---- #55 bulk edit: every set, rep and weight on one screen ----
      openBulkEdit: () => {
        const sess = this.slotSession(ad, aslot); if (!sess) return;
        this.haptic(false);
        this.setState({
          bulkEdit: {
            day: ad, slot: aslot,
            rows: this.bulkRowsFor(sess),
          },
        });
      },
      bulkOpen: !!s.bulkEdit && screen === 'session',
      bulk: s.bulkEdit ? (() => {
        const f = s.bulkEdit;
        const setRow = (i, patch) => this.setState({ bulkEdit: { ...this.state.bulkEdit, rows: this.state.bulkEdit.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) } });
        return {
          title: 'Edit ' + FULL[f.day] + "'s workout",
          sub: 'Change sets, reps and weights across the whole session, then save once.',
          empty: f.rows.length === 0,
          rows: f.rows.map((r, i) => ({
            name: r.name, cardio: r.cardio,
            sets: r.sets, reps: r.reps, weight: r.weight, duration: r.duration, intensity: r.intensity,
            onSets: (e) => setRow(i, { sets: numOrEmpty(e.target.value) }),
            onReps: (e) => setRow(i, { reps: numOrEmpty(e.target.value) }),
            onWeight: (e) => setRow(i, { weight: numOrEmpty(e.target.value, true) }),
            onDuration: (e) => setRow(i, { duration: numOrEmpty(e.target.value) }),
            distance: r.distance,
            onDistance: (e) => setRow(i, { distance: numOrEmpty(e.target.value, true) }),
            efforts: this._effortChips(r.rpe, (n) => setRow(i, { rpe: n })),
            timed: !!r.timed,
            hasLogged: (r.logged || []).length > 0,
            logged: (r.logged || []).map((l, k) => ({
              label: 'Set ' + (k + 1), skipped: l.skipped,
              reps: l.reps, weight: l.weight,
              onReps: (e) => setRow(i, { logged: r.logged.map((x, m) => (m === k ? { ...x, reps: numOrEmpty(e.target.value) } : x)) }),
              secs: l.secs,
              onSecs: (e) => setRow(i, { logged: r.logged.map((x, m) => (m === k ? { ...x, secs: e.target.value } : x)) }),
              onWeight: (e) => setRow(i, { logged: r.logged.map((x, m) => (m === k ? { ...x, weight: numOrEmpty(e.target.value, true) } : x)) }),
            })),
            divider: i === f.rows.length - 1 ? 'transparent' : 'var(--border)',
          })),
          cancel: () => this.setState({ bulkEdit: null }),
          save: () => {
            const b = this.state.bulkEdit; if (!b) return;
            const sess = this.slotSession(b.day, b.slot); if (!sess) { this.setState({ bulkEdit: null }); return; }
            const bad = b.rows.some(r => !r.cardio && (!(+r.sets >= 0 && +r.sets <= 20) || !(+r.reps >= 0 && +r.reps <= 100) || !(+r.weight >= 0 && +r.weight <= 500)));
            if (bad) { this.showToast('Check the numbers: up to 20 sets, 100 reps and 500 kg.'); return; }
            const list = (sess.exercises || []).map((e, i) => {
              const r = b.rows[i]; if (!r) return e;
              if (e.cardio) return { ...e, duration: +r.duration || 0, distance: +r.distance || 0, rpe: r.rpe || 5, intensity: rpeIntensity(r.rpe || 5) };
              const next = { ...e, sets: +r.sets || 0, reps: +r.reps || 0, weight: +r.weight || 0 };
              // Corrections to sets already logged rewrite those entries in place —
              // timestamps, skips, rest and dropsets are left as they were.
              if ((e.logged || []).length) {
                next.logged = e.logged.map((l, k) => {
                  const rl = (r.logged || [])[k];
                  if (!rl || l.skipped) return l;
                  if (isTimed(e)) return { ...l, secs: parseSecs(rl.secs) || l.secs || 0, weight: +rl.weight || 0 };
                  return { ...l, reps: +rl.reps || 0, weight: +rl.weight || 0 };
                });
              }
              return next;
            });
            // The recurring template follows along for the main workout, so next week
            // starts from the corrected numbers rather than the old ones.
            let program = this.state.program;
            if (b.slot === 'a' && program[b.day]) {
              const prog = program[b.day];
              const pex = (prog.exercises || []).map((e, i) => {
                const li = list[i];
                if (!li || li.name !== e.name) return e;
                return e.cardio ? { ...e, duration: li.duration, distance: li.distance, rpe: li.rpe, intensity: li.intensity } : { ...e, sets: li.sets, reps: li.reps, weight: li.weight };
              });
              program = { ...program, [b.day]: { ...prog, exercises: pex } };
            }
            this.haptic(true);
            this.setState({ bulkEdit: null });
            this.saveSessionExercises(b.day, b.slot, list, { program });
            this.showToast('Workout updated' + (b.slot === 'a' ? ' — this week and your program.' : '.'));
          },
        };
      })() : null,
      // #57 — a completed workout stays editable: this opens it with every number editable.
      editCompletedWorkout: () => {
        const sess = this.slotSession(ad, aslot); if (!sess) return;
        this.setState({
          sessionPeek: ad + ':' + aslot,
          bulkEdit: {
            day: ad, slot: aslot,
            rows: this.bulkRowsFor(sess),
          },
        });
      },

      // ---- second workout for the day ----
      openAddWorkout: () => this.setState({ addWorkout: { day: ad, kind: 'Lift', name: '' } }),
      addWorkoutOpen: !!s.addWorkout,
      aw: s.addWorkout ? {
        dayFull: FULL[s.addWorkout.day],
        name: s.addWorkout.name,
        onName: (e) => this.setState({ addWorkout: { ...this.state.addWorkout, name: e.target.value } }),
        placeholder: s.addWorkout.kind === 'Cardio' ? 'Evening run' : (s.addWorkout.kind === 'Sports' ? 'Padel' : 'Evening lift'),
        kinds: ['Lift', 'Cardio', 'Sports'].map(k => ({
          label: k,
          bg: s.addWorkout.kind === k ? 'var(--accent)' : 'var(--surface-2)',
          color: s.addWorkout.kind === k ? '#fff' : 'var(--muted)',
          pick: () => this.setState({ addWorkout: { ...this.state.addWorkout, kind: k } }),
        })),
        close: () => this.setState({ addWorkout: null }),
        create: () => {
          const f = this.state.addWorkout; if (!f) return;
          const base = this.state.sessions[f.day]; if (!base) return;
          const label = (f.name || '').trim() || (f.kind === 'Cardio' ? 'Evening cardio' : (f.kind === 'Sports' ? 'Sports' : 'Second lift'));
          const extra = { type: f.kind === 'Cardio' ? 'Cardio' : 'Custom', kind: f.kind, label, exercises: [], completed: false, notes: '' };
          this.haptic(true);
          this.setState({ addWorkout: null, activeSlot: 'b', sessionPeek: null });
          this.save({ sessions: { ...this.state.sessions, [f.day]: { ...base, extra } } }, 'that second workout');
          this.showToast('"' + label + '" added to ' + FULL[f.day] + ' — log it on its own.');
        },
      } : null,
      removeExtraWorkout: () => {
        const base = this.state.sessions[ad]; if (!base || !base.extra) return;
        const next = { ...base }; delete next.extra;
        this.haptic(true);
        this.setState({ activeSlot: 'a', sessDrag: null });
        this.save({ sessions: { ...this.state.sessions, [ad]: next } }, 'removing that second workout');
        this.showToast('Second workout removed. Logged history is kept.');
      },
      toggleComplete: () => {
        this.haptic(true);
        if (!asess.completed) { this.setState({ confirmComplete: true }); return; }
        // Un-completing takes this week's record back out, so the day stops counting as
        // completed in history, stats and — once archived — the Archive (#8).
        const unrec = this.historyRecordFor(ad, aslot);
        this.save({ sessions: this.patchSlot(ad, aslot, { completed: false }), sessionHistory: (s.sessionHistory || []).filter(r => !unrec || r.id !== unrec.id), sessionPeek: null }, 'un-completing that session');
      },
      ccOpen: !!s.confirmComplete && !!asess,
      cc: (s.confirmComplete && asess) ? {
        sub: 'Check your ' + FULL[ad] + (aslot === 'b' ? ' ' + slotName('b') : '') + ' session before rating your effort.',
        exercises: (asess.exercises || []).map((e, i) => ({ name: e.name, scheme: scheme(e), divider: i === (asess.exercises || []).length - 1 ? 'transparent' : 'var(--border)' })),
        volume: fmt((asess.exercises || []).reduce((a, e) => a + this.exVol(e), 0)),
        close: () => this.setState({ confirmComplete: false }),
        confirm: () => {
          this.haptic(true);
          let sessionHistory = (this.state.sessionHistory || []).slice();
          const todayISO = localISO();
          const vol = (asess.exercises || []).reduce((a, e) => a + this.exVol(e), 0);
          const rec = { id: this.historyId(ad, aslot, todayISO), slot: aslot, date: todayISO, day: ad, type: at, label: aslot === 'b' ? slotName('b') : asess.label, exercises: (asess.exercises || []).map(x => ({ ...x })), volume: vol, completed: true };
          const idx = sessionHistory.findIndex(r => r.id === rec.id);
          if (idx >= 0) sessionHistory[idx] = { ...rec, rpe: sessionHistory[idx].rpe, notes: sessionHistory[idx].notes, perf: sessionHistory[idx].perf }; else sessionHistory.push(rec);
          const cardioActs = (asess.exercises || []).map((e, i) => ({ e, i })).filter(x => x.e.cardio).map(x => ({ idx: x.i, name: x.e.name, duration: x.e.duration || 0, distance: x.e.distance || '', rpe: cardioRpe(x.e) }));
          this.setState({ confirmComplete: false });
          this.save({ sessions: this.patchSlot(ad, aslot, { completed: true }), sessionHistory, sessionPeek: null, rpeSheet: { id: rec.id, day: ad, slot: aslot, type: at, rpe: null, notes: '', cardio: cardioActs } }, 'completing that session');
        },
      } : null,
      openMoveSession: () => this.setState({ moveSrc: null, moveConfirm: null, moveTargetOffset: null, movePath: null, moveOpen: true }),

      // ---- restart confirmation (session screen) ----
      restartConfirmOpen: !!s.restartAsk,
      rsc: s.restartAsk ? (() => {
        const r = s.restartAsk;
        const sess = this.slotSession(r.day, r.slot);
        const n = this.loggedSetCount(sess);
        return {
          sub: n === 1
            ? '1 logged set on ' + FULL[r.day] + ' will be cleared and the workout goes back to not started.'
            : n + ' logged sets on ' + FULL[r.day] + ' will be cleared and the workout goes back to not started.',
          close: () => this.setState({ restartAsk: null }),
          confirm: () => this.restartSession(r.day, r.slot),
        };
      })() : null,

      programDays,
      pdx,
      addProgramExercise: () => this.setState({ exForm: this._exFormFrom({ name: '', sets: 3, reps: 10, weight: 20 }, { mode: 'program', day: apd, index: null }) }),
      exitReorder: () => this.setState({ reorderMode: null, drag: null }),
      openHistory: () => this.setState({ screen: 'history' }),
      historyEmpty: (s.sessionHistory || []).length === 0,
      historyEntries,
      sendToArchive: () => {
        // Archiving retires the whole program: its name, the dates it ran, the days and
        // exercises it was made of, and every session logged under it travel together,
        // so the Archive reads as a list of past programs rather than loose weeks.
        const hist = s.sessionHistory || [];
        const snapshot = this.programSnapshot();
        let archive = s.archive;
        const today = this.todayISO();
        if (hist.length > 0 || snapshot.length > 0) {
          const sorted = hist.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
          const startDate = s.programStartDate || (sorted.length ? sorted[0].date : today);
          const endDate = today;
          const entry = {
            id: 'arc_' + Date.now(),
            name: s.programName || 'Program',
            startDate, endDate,
            label: 'From ' + fmtDate(startDate) + ' to ' + fmtDate(endDate),
            days: snapshot,
            sessions: sorted.map(h => ({ day: h.day, type: h.type, date: h.date, label: h.label, slot: h.slot, rpe: h.rpe, notes: h.notes, exercises: h.exercises, ...(h.completed === false ? { completed: false } : {}) })),
          };
          archive = [entry, ...s.archive];
        }
        const program = {}; DAYS.forEach(d => { program[d] = { type: 'Rest', exercises: [] }; });
        const recurring = {}; DAYS.forEach(d => { recurring[d] = 'Rest'; });
        const week = { ...recurring };
        this.haptic(true);
        this.save({ archive, program, recurring, week, sessions: {}, sessionHistory: [], programStartDate: today, programName: 'Program ' + (archive.length + 1), screen: 'week', activeDay: null, activeProgramDay: null }, 'archiving the program');
        this.showToast('"' + (s.programName || 'Program') + '" archived. Build your next program when you\'re ready.');
      },

      archiveWeeks,
      archiveEmpty: s.archive.length === 0,
      ad: adv,
      exportArchivePdf: () => this.exportProgramPdf(s.archiveId),
      exportCurrentProgramPdf: () => this.exportProgramPdf(null),

      // current program identity
      programName: s.programName || 'Program',
      openProgramRename: () => this.setState({ programRename: { value: s.programName || '' } }),
      programRenameOpen: !!s.programRename,
      prn: s.programRename ? {
        value: s.programRename.value,
        onChange: (e) => this.setState({ programRename: { value: e.target.value } }),
        close: () => this.setState({ programRename: null }),
        save: () => {
          const v = (this.state.programRename.value || '').trim();
          this.setState({ programRename: null });
          if (!v) { this.showToast('Give the program a name first.'); return; }
          this.save({ programName: v }, 'the rename');
          this.showToast('Program renamed to "' + v + '".');
        },
      } : null,

      exSheetOpen: !!ef0,
      ef,
      closeExSheet: () => this.setState({ exForm: null }),
      browseDb: () => { const f = this.state.exForm; if (!f) return; this.setState({ exForm: null, quickAdd: { day: f.day, stage: 'type', kind: null, cat: null, item: null, sets: 3, reps: 10, duration: 30, intensity: 'Moderate', recur: 'once', offset: 0 } }); },
      openTagRename: () => this.setState({ tagRename: { day: ad, value: this.effectiveDayLabel(ad) } }),
      tagRenameOpen: !!s.tagRename,
      tr: s.tagRename ? {
        dayFull: FULL[s.tagRename.day], value: s.tagRename.value,
        onChange: (e) => this.setState({ tagRename: { ...this.state.tagRename, value: e.target.value } }),
        close: () => this.setState({ tagRename: null }),
        reset: () => { const day = s.tagRename.day; const m = { ...(this.state.customLabels || {}) }; delete m[day]; const sp = this.sessionLabelPatch(day, ''); this.setState({ tagRename: null }); this.save({ customLabels: m, ...sp }, 'the day name'); this.showToast('Day tag reset to Custom.'); },
        save: () => {
          const day = this.state.tagRename.day;
          const v = (this.state.tagRename.value || '').trim();
          const m = { ...(this.state.customLabels || {}) };
          if (v) m[day] = v; else delete m[day];
          const sp = this.sessionLabelPatch(day, v);
          this.setState({ tagRename: null }); this.save({ customLabels: m, ...sp }, 'the day name');
          if (v) this.showToast('Day renamed to "' + v + '".');
        },
      } : null,
      saveExercise: () => {
        const f = s.exForm; if (!f) return;
        if (!f.cardio && f.repRange && !(+f.repsMax > +f.repsMin && +f.repsMin > 0)) { this.showToast('Set a rep range with a max higher than the min.'); return; }
        const item = this._exItemFromForm(f);
        this.haptic(false);
        const listIn = (exs) => (exs || [])[f.index] || null;
        if (f.mode === 'program') {
          const day = f.day; const p = s.program[day];
          const prev = f.index === null ? null : listIn(p.exercises);
          this.updateProgramDay(day, { exercises: this._applyExerciseEdit(p.exercises, f.index, item, prev && prev.supersetWith) });
        } else {
          const day = f.day; const slot = f.slot || 'a';
          const sess = this.slotSession(day, slot); if (!sess) { this.setState({ exForm: null }); return; }
          const prev = f.index === null ? null : listIn(sess.exercises);
          const list = this._applyExerciseEdit(sess.exercises, f.index, item, prev && prev.supersetWith);
          // The recurring template mirrors the day's main workout only — a second
          // workout is a one-off for that day and never rewrites the program.
          let extra = null;
          if (slot === 'a') {
            const prog = s.program[day];
            extra = prog ? { program: { ...s.program, [day]: { ...prog, exercises: this._applyExerciseEdit(prog.exercises, (f.index === null || f.index >= (prog.exercises || []).length) ? null : f.index, item, prev && prev.supersetWith).map(x => { const c = { ...x }; delete c.logged; return c; }) } } } : null;
          }
          this.saveSessionExercises(day, slot, list, extra);
        }
        if (item.supersetWith && f.supersetWith && this._supersetChoices(f).indexOf(f.supersetWith) < 0) this.showToast(f.supersetWith + ' added as a superset with ' + item.name + '.');
        this.setState({ exForm: null });
      },
      deleteExercise: () => {
        const f = s.exForm; if (!f || f.index === null) return;
        if (f.mode === 'program') {
          const day = f.day; const p = s.program[day]; const gone = (p.exercises || [])[f.index];
          const list = (p.exercises || []).filter((_, i) => i !== f.index).map(x => this._unpair(x, gone));
          this.updateProgramDay(day, { exercises: list });
        } else {
          const day = f.day; const slot = f.slot || 'a';
          const sess = this.slotSession(day, slot); if (!sess) { this.setState({ exForm: null }); return; }
          const gone = (sess.exercises || [])[f.index];
          const unpair = (x) => this._unpair(x, gone);
          const list = (sess.exercises || []).filter((_, i) => i !== f.index).map(unpair);
          let program = slot === 'a' ? this.removeProgramExerciseAt(day, f.index) : null;
          if (program && program[day]) program = { ...program, [day]: { ...program[day], exercises: (program[day].exercises || []).map(unpair) } };
          this.saveSessionExercises(day, slot, list, program ? { program } : null);
        }
        this.setState({ exForm: null });
      },

      moveOpen: s.moveOpen,
      moveTitle: breakMode ? 'Reschedule tomorrow' : ((mpath ? 'Rehome ' : 'Move ') + (mv ? FULL[mv.day] : '') + ' session'),
      moveSub: breakMode ? 'Rest day confirmed. Move this workout to a free day within the week.'
        : (mpath ? (FULL[mpath[mpath.length - 2].day] + ' is taking ' + FULL[mv.day] + ' — pick where this session goes instead.')
          : 'Shifts this one session only — your recurring schedule stays the same.'),
      moveTargets,
      // Cross-week target picker (hidden in break mode, which stays in-week).
      moveWeekNav: breakMode ? null : {
        label: this.weekPhrase(toOff),
        sub: this.weekLabelFor(toOff),
        prev: () => this.setState({ moveTargetOffset: Math.max(moveWeekLo, toOff - 1) }),
        next: () => this.setState({ moveTargetOffset: Math.min(moveWeekHi, toOff + 1) }),
        prevDisabled: toOff <= moveWeekLo,
        nextDisabled: toOff >= moveWeekHi,
        prevOpacity: toOff <= moveWeekLo ? '.3' : '1',
        nextOpacity: toOff >= moveWeekHi ? '.3' : '1',
      },
      moveConfirmOpen: !!mc,
      moveConfirmTitle: mc ? (FULL[mc.to] + (mc.toOff !== srcOff ? ' (' + this.weekPhrase(mc.toOff).toLowerCase() + ')' : '') + ' already has a workout') : '',
      moveConfirmBody: mc ? ('Move its ' + mcName + ' session to another day, or skip it? Skipping drops that session from the week.') : '',
      moveConfirmRelocateLabel: mc ? ('Move ' + mcName + ' to another day') : '',
      // Both branches extend the chain with the contested slot; relocating keeps picking,
      // skipping commits and lets the chain's tail fall away.
      moveConfirmRelocate: () => { if (mc) this.setState({ movePath: mc.path.concat([{ day: mc.to, off: mc.toOff }]), moveSrc: { day: mc.to, offset: mc.toOff }, moveTargetOffset: mc.toOff, moveConfirm: null }); },
      moveConfirmSkip: () => { if (mc) this.commitMovePath(mc.path.concat([{ day: mc.to, off: mc.toOff }]), mcName); },
      moveConfirmCancel: () => this.setState({ moveConfirm: null }),
      closeMove: () => this.setState({ moveOpen: false, moveSrc: null, moveConfirm: null, moveTargetOffset: null, movePath: null, breakMode: false }),
    };
  }

  render() {
    const v = this.renderVals();
    return <Shell v={v} s={s} />;
  }
}
