// Cadence — application controller.
// The logic (state, all methods, and renderVals) is preserved verbatim from the
// Claude Design export (Lifts.dc.html). Only the host class changes: DCLogic ->
// React.Component (their setState/state/lifecycle contracts are identical), and
// render() below maps the view-model onto JSX screen/overlay/sheet components.

import React from 'react';
import {
  DAYS, FULL, TYPES, TYPE_COLOR, TYPE_TINT, DUMBBELL, SNEAKER, HEART, MOON, TYPE_ICON,
  INTENSITIES, typeLabel, TUT_STEPS, ONB_DEFAULTS, DEFAULT_EX, CARDIO_TYPES, seedCardioDb,
  migrateCardioDb, fmt, fmtDate, MONTH_ABBR, migrateArchive, exVol, W_DEFAULTS, scheme,
  seedSessions, seedExerciseDb, migrateExerciseDb, eqToOptions, eqLabel, KEY, BODY_PARTS,
  PLATE, MACRO_COLORS, ACTIVITY, ACTIVITY_MULT, GOALS, GOAL_RULES, DEFAULT_RECOVERY,
  RPE_SCALE, FOOD_DB, fmtKcal, mealMacroLine, GPU, itemMacros, sumItems, timeLabel,
  numOrEmpty,
} from './lib/data';
import { s } from './lib/helpers';
import Shell from './components/Shell';

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
      programStartDate: new Date().toISOString().slice(0, 10),
      archiveId: null,
      moveOpen: false,
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
      supplements: ['Creatine', 'Omega-3', 'ZMA'],
      supplementsChecked: {},
      supplementsDate: new Date().toISOString().slice(0, 10),
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

  isNightNow() { const h = new Date().getHours(); return h < 6 || h >= 19; }

  checkSupplementsReset() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.supplementsDate !== today) this.save({ supplementsChecked: {}, supplementsDate: today });
  }

  applyAutoTheme() {
    if (!this.state.themeAuto) return;
    const systemDark = this._mq && this._mq.matches;
    const dark = systemDark || this.isNightNow();
    this.setState({ theme: dark ? 'dark' : 'light' });
  }

  componentDidMount() {
    try { const wc = JSON.parse(localStorage.getItem('lt_workout_settings') || 'null'); if (wc) this.setState({ wcfg: { ...W_DEFAULTS, ...wc } }); } catch (e) {}
    this._woVis = () => { if (document.visibilityState === 'visible' && this.state.workout) this._woWake(); };
    document.addEventListener('visibilitychange', this._woVis);
    try {
      const savedAuto = localStorage.getItem('lt_theme_auto');
      const auto = savedAuto === null ? true : savedAuto === 'true';
      this.setState({ themeAuto: auto }, () => {
        if (!auto) { const t = localStorage.getItem('lt_theme'); if (t) this.setState({ theme: t }); }
        else this.applyAutoTheme();
      });
    } catch (e) {}
    try { this._mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)'); this._mqHandler = () => this.applyAutoTheme(); this._mq && this._mq.addEventListener && this._mq.addEventListener('change', this._mqHandler); } catch (e) {}
    this._autoTimer = setInterval(() => { this.applyAutoTheme(); this.checkSupplementsReset(); this.maybeRefreshWeather(); }, 5 * 60 * 1000);
    try { const raw = localStorage.getItem(KEY); if (raw) { const d = JSON.parse(raw); const wk = this.reconcileWeekOverrides(d); this.setState({ recurring: d.recurring || this.state.recurring, week: wk.week || d.week || this.state.week, sessions: wk.sessions || d.sessions || this.state.sessions, weekOverrides: wk.weekOverrides, program: d.program || this.state.program, sessionHistory: d.sessionHistory || this.state.sessionHistory, programStartDate: d.programStartDate || this.state.programStartDate, archive: migrateArchive(d.archive || this.state.archive), supplements: d.supplements || this.state.supplements, supplementsChecked: d.supplementsChecked || this.state.supplementsChecked, supplementsDate: d.supplementsDate || this.state.supplementsDate, exerciseDb: migrateExerciseDb(d.exerciseDb), profile: d.profile || null, meals: d.meals || [], customMeals: d.customMeals || [], tutorialDone: !!d.tutorialDone, recoveryProfile: d.recoveryProfile || { ...DEFAULT_RECOVERY }, recoveryLog: d.recoveryLog || [], cardioDb: migrateCardioDb(d.cardioDb), customLabels: d.customLabels || {}, flowPhase: (d.profile ? (d.tutorialDone ? 'done' : 'tutorial') : 'onboarding'), tutStep: (d.profile && !d.tutorialDone) ? Math.min(TUT_STEPS.length - 1, Math.max(0, parseInt(localStorage.getItem('lt_tut_step') || '0', 10) || 0)) : 0 }, () => { this.checkSupplementsReset(); this._tutMeasureSoon(1100); }); } else { this.setState({ flowPhase: 'splash' }); this.checkSupplementsReset(); } } catch (e) {}
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
    clearTimeout(this._loadTimer); clearInterval(this._autoTimer); this._ptrDetach && this._ptrDetach();
    clearInterval(this._woTick); clearTimeout(this._woIdleT); this._woHoldEnd();
    try { this._wl && this._wl.release(); } catch (e) {}
    try { document.removeEventListener('visibilitychange', this._woVis); } catch (e) {}
    try { this._scrollRoot && this._scrollRoot.removeEventListener('scroll', this._onAnyScroll, { capture: true }); } catch (e) {}
    try { this._mq && this._mq.removeEventListener && this._mq.removeEventListener('change', this._mqHandler); } catch (e) {}
  }

  toggleTheme() {
    const next = this.state.theme === 'dark' ? 'light' : 'dark';
    this.setState({ theme: next, themeAuto: false });
    try { localStorage.setItem('lt_theme', next); localStorage.setItem('lt_theme_auto', 'false'); } catch (e) {}
  }

  save(patch) {
    this.setState(patch, () => {
      try { localStorage.setItem(KEY, JSON.stringify({ recurring: this.state.recurring, week: this.state.week, sessions: this.state.sessions, weekOverrides: this.state.weekOverrides, program: this.state.program, sessionHistory: this.state.sessionHistory, programStartDate: this.state.programStartDate, archive: this.state.archive, supplements: this.state.supplements, supplementsChecked: this.state.supplementsChecked, supplementsDate: this.state.supplementsDate, exerciseDb: this.state.exerciseDb, cardioDb: this.state.cardioDb, profile: this.state.profile, meals: this.state.meals, customMeals: this.state.customMeals, tutorialDone: this.state.tutorialDone, recoveryProfile: this.state.recoveryProfile, recoveryLog: this.state.recoveryLog, customLabels: this.state.customLabels })); this._saveFailed = false; } catch (e) { if (!this._saveFailed) { this._saveFailed = true; this.showToast("Couldn't save — device storage may be full or blocked (private browsing). Recent changes won't persist."); } }
    });
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
    const fn = 'cadence-backup-' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '-' + pad(d.getHours()) + '-' + pad(d.getMinutes()) + '-' + pad(d.getSeconds()) + '.json';
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
        const d = JSON.parse(raw);
        const rwk = this.reconcileWeekOverrides(d);
        this.setState({
          recurring: d.recurring || this.state.recurring, week: rwk.week || d.week || this.state.week, sessions: rwk.sessions || d.sessions || {}, weekOverrides: rwk.weekOverrides,
          program: d.program || this.state.program, sessionHistory: d.sessionHistory || [], programStartDate: d.programStartDate || this.state.programStartDate,
          archive: migrateArchive(d.archive || this.state.archive), supplements: d.supplements || this.state.supplements,
          supplementsChecked: d.supplementsChecked || {}, supplementsDate: d.supplementsDate || this.state.supplementsDate,
          exerciseDb: migrateExerciseDb(d.exerciseDb), profile: d.profile || null, meals: d.meals || [], customMeals: d.customMeals || [], tutorialDone: !!d.tutorialDone,
          recoveryProfile: d.recoveryProfile || { ...DEFAULT_RECOVERY }, recoveryLog: d.recoveryLog || [], cardioDb: migrateCardioDb(d.cardioDb), customLabels: d.customLabels || {},
          flowPhase: (d.profile ? (d.tutorialDone ? 'done' : 'tutorial') : 'onboarding'), tutStep: (d.profile && !d.tutorialDone) ? Math.min(TUT_STEPS.length - 1, Math.max(0, parseInt(localStorage.getItem('lt_tut_step') || '0', 10) || 0)) : 0, importing: false, confirmImport: false, profileMenu: false, screen: 'week', activeDay: null, loading: false,
        }, () => { this.checkSupplementsReset(); this._tutMeasureSoon(1100); });
      } else { this.setState({ importing: false }); }
    } catch (e) { this.setState({ importing: false }); }
    try { const t = localStorage.getItem('lt_theme'), auto = localStorage.getItem('lt_theme_auto'); if (auto === 'false' && t) this.setState({ theme: t, themeAuto: false }); else this.applyAutoTheme(); } catch (e) {}
    this.initWeather();
  }

  updateProgramDay(day, patch) {
    const p = { ...this.state.program[day], ...patch };
    const program = { ...this.state.program, [day]: p };
    const recurring = { ...this.state.recurring, [day]: p.type };
    const week = { ...this.state.week };
    const wasMoved = this.state.week[day] !== this.state.recurring[day];
    if (!wasMoved) week[day] = p.type;
    const sessions = { ...this.state.sessions };
    if (week[day] && week[day] !== 'Rest') {
      const prev = sessions[day];
      sessions[day] = { exercises: p.exercises.map(x => ({ ...x })), completed: (prev && prev.completed) || false, notes: (prev && prev.notes) || '' };
    } else {
      delete sessions[day];
    }
    this.save({ program, recurring, week, sessions });
  }

  _beginReorderPress(idx) {
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
    const sess = this.state.sessions[ad]; if (!sess) return;
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
    const move = (arr) => { const l = arr.slice(); const [m] = l.splice(dr.fromIndex, 1); l.splice(dr.newPos, 0, m); return l; };
    const sess = this.state.sessions[ad];
    const sessions = { ...this.state.sessions, [ad]: { ...sess, exercises: move(sess.exercises || []) } };
    const patch = { sessions };
    // carry the same order into the recurring template when it mirrors this session
    const prog = this.state.program[ad];
    const se = sess.exercises || [];
    let syncedTemplate = false;
    if (prog && prog.exercises && prog.exercises.length === se.length && prog.exercises.every((e, i) => e.name === se[i].name)) {
      const program = { ...this.state.program, [ad]: { ...prog, exercises: move(prog.exercises) } };
      patch.program = program;
      syncedTemplate = true;
    }
    this.haptic(true);
    this.save(patch);
    this.showToast(syncedTemplate ? 'Order saved — applies every week.' : 'Order saved for this week.');
  }

  addExerciseToProgram(day, item) {
    const p = this.state.program[day];
    const type = p.type === 'Rest' ? 'Custom' : p.type;
    const exercises = (p.exercises || []).concat([{ ...item }]);
    this.updateProgramDay(day, { type, exercises });
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

  weekKey(offset) {
    const m = this.weekMonday(offset);
    const pad = (n) => String(n).padStart(2, '0');
    return m.getFullYear() + '-' + pad(m.getMonth() + 1) + '-' + pad(m.getDate());
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
      const pad = (n) => String(n).padStart(2, '0');
      const iso = (dt) => dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
      const dayDates = {};
      DAYS.forEach((d, i) => { dayDates[iso(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i))] = d; });
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
        types[d] = h.type || types[d];
        sessions[d] = { exercises: (h.exercises || []).map(e => ({ ...e })), completed: true, notes: h.notes || '', rpe: h.rpe };
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
      this.save({ week, sessions });
      return;
    }
    const view = this.viewWeek(offset);
    const prevType = view.types[day];
    const type = (prevType && prevType !== 'Rest') ? prevType : (cardio ? 'Cardio' : 'Custom');
    const base = view.sessions[day] || { exercises: [], completed: false, notes: '' };
    const ex = cardio ? { ...item, cardio: true } : { ...item };
    const session = { ...base, exercises: (base.exercises || []).concat([ex]) };
    this.save({ weekOverrides: this.writeOverride(offset, day, type, session) });
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
      this.save({ week, sessions });
    } else {
      const session = type === 'Rest' ? null : { exercises: [], completed: false, notes: '' };
      this.save({ weekOverrides: this.writeOverride(offset, day, type, session) });
    }
    this.haptic(true);
  }

  syncProgramExercise(day, index, item) {
    const p = this.state.program[day];
    if (!p) return this.state.program;
    const exercises = (p.exercises || []).slice();
    if (index === null || index >= exercises.length) exercises.push({ ...item });
    else exercises[index] = { ...item };
    return { ...this.state.program, [day]: { ...p, exercises } };
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
  _nextPos(exs) { for (let i = 0; i < exs.length; i++) { const e = exs[i]; if (e.cardio) continue; if ((e.logged || []).length < (e.sets || 0)) return { exIdx: i, setIdx: (e.logged || []).length }; } return null; }
  startWorkout() {
    const ad = this.state.activeDay; const sess = ad && this.state.sessions[ad]; if (!sess) return;
    const exs = sess.exercises || [];
    if (!exs.some(e => !e.cardio && (e.sets || 0) > 0)) { this.showToast('Add a lift exercise first.'); return; }
    const pos = this._nextPos(exs);
    this.haptic(true);
    let workout;
    if (!pos) workout = { day: ad, phase: 'summary' };
    else { const e = exs[pos.exIdx]; const last = (e.logged || []).filter(l => !l.skipped).slice(-1)[0]; workout = { day: ad, exIdx: pos.exIdx, setIdx: pos.setIdx, phase: 'set', reps: String(last ? last.reps : (e.reps || 0)), weight: String(last ? last.weight : (e.weight || 0)), editSet: null }; }
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
    if (cfg.vibrate) { try { navigator.vibrate && navigator.vibrate([90, 60, 90]); } catch (e) {} }
    this._woSound();
    this.setState({ workout: { ...w, phase: 'ready', editSet: null }, workoutIdle: false });
    this._woIdleReset();
  }
  _woSound(type) {
    const t = type || (this.state.wcfg || W_DEFAULTS).sound;
    if (!t || t === 'silent') return;
    try {
      const ctx = this._actx || (this._actx = new (window.AudioContext || window.webkitAudioContext)());
      if (ctx.state === 'suspended') ctx.resume();
      const mk = (f, at, dur) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = t === 'beep' ? 'square' : 'sine'; o.frequency.value = f; const t0 = ctx.currentTime + at; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(t === 'beep' ? .12 : .2, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + dur + .05); };
      if (t === 'beep') { mk(660, 0, .16); mk(660, .26, .16); } else { mk(880, 0, .5); mk(1174.66, .16, .6); }
    } catch (e) {}
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
      const cur = parseFloat(obj[field]); const base = isNaN(cur) ? 0 : cur;
      const max = field === 'reps' ? 100 : 500;
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
    const sess = this.state.sessions[w.day]; if (!sess) { this.endWorkout(); return; }
    const exs = (sess.exercises || []).map(x => ({ ...x }));
    const e = exs[w.exIdx]; if (!e) { this.endWorkout(); return; }
    const reps = parseFloat(w.reps), weight = parseFloat(w.weight);
    if (!skipped) {
      if (!(reps > 0 && reps <= 100)) { this.showToast('Reps must be between 0.5 and 100.'); return; }
      if (!(weight >= 0 && weight <= 500)) { this.showToast('Weight must be between 0 and 500 kg.'); return; }
    }
    const entry = skipped ? { set: w.setIdx + 1, skipped: true, ts: Date.now() } : { set: w.setIdx + 1, reps, weight, ts: Date.now() };
    const logged = (e.logged || []).concat([entry]);
    exs[w.exIdx] = { ...e, logged };
    const cfg = this.state.wcfg || W_DEFAULTS;
    this.haptic(!skipped);
    let workout;
    if (logged.length < (e.sets || 0)) {
      workout = skipped
        ? { ...w, setIdx: w.setIdx + 1, phase: 'set', editSet: null }
        : { ...w, setIdx: w.setIdx + 1, phase: 'rest', restLeft: cfg.rest, restTotal: cfg.rest, paused: false, editSet: null, restStart: Date.now() };
    } else {
      const pos = this._nextPos(exs);
      if (pos) { const ne = exs[pos.exIdx]; const last = (ne.logged || []).filter(l => !l.skipped).slice(-1)[0]; workout = { day: w.day, exIdx: pos.exIdx, setIdx: pos.setIdx, phase: 'set', reps: String(last ? last.reps : (ne.reps || 0)), weight: String(last ? last.weight : (ne.weight || 0)), editSet: null }; }
      else workout = { day: w.day, phase: 'summary' };
    }
    this.setState({ workout });
    this.save({ sessions: { ...this.state.sessions, [w.day]: { ...sess, exercises: exs } } });
  }
  _woStartSet() {
    const w = this.state.workout; if (!w) return;
    const sess = this.state.sessions[w.day]; if (!sess) { this.endWorkout(); return; }
    const exs = (sess.exercises || []).map(x => ({ ...x }));
    const e = exs[w.exIdx]; if (!e) { this.endWorkout(); return; }
    if (w.restStart) {
      const lg = (e.logged || []).slice(); const li = lg.length - 1;
      if (li >= 0 && lg[li].restAfter == null) {
        lg[li] = { ...lg[li], restAfter: Math.round((Date.now() - w.restStart) / 1000) };
        exs[w.exIdx] = { ...e, logged: lg };
        this.save({ sessions: { ...this.state.sessions, [w.day]: { ...sess, exercises: exs } } });
      }
    }
    const last = (e.logged || []).filter(l => !l.skipped).slice(-1)[0];
    this.haptic(false);
    this.setState({ workout: { day: w.day, exIdx: w.exIdx, setIdx: w.setIdx, phase: 'set', reps: String(last ? last.reps : (e.reps || 0)), weight: String(last ? last.weight : (e.weight || 0)), editSet: null } });
  }
  _woEditSave() {
    const w = this.state.workout; if (!w || !w.editSet) return;
    const es = w.editSet;
    const reps = parseFloat(es.reps), weight = parseFloat(es.weight);
    if (!(reps > 0 && reps <= 100)) { this.showToast('Reps must be between 0.5 and 100.'); return; }
    if (!(weight >= 0 && weight <= 500)) { this.showToast('Weight must be between 0 and 500 kg.'); return; }
    const sess = this.state.sessions[w.day]; if (!sess) return;
    const exs = (sess.exercises || []).map(x => ({ ...x }));
    const e = exs[w.exIdx]; const lg = (e.logged || []).slice();
    if (lg[es.idx]) lg[es.idx] = { ...lg[es.idx], reps, weight };
    exs[w.exIdx] = { ...e, logged: lg };
    this.haptic(false);
    this.setState({ workout: { ...w, editSet: null } });
    this.save({ sessions: { ...this.state.sessions, [w.day]: { ...sess, exercises: exs } } });
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
    this.save({ profile: this.computeTargets({ ...ONB_DEFAULTS, ...(this.state.onbForm || {}) }) });
  }

  completeTutorial(skipped) {
    this.haptic(true);
    this.setState({ flowPhase: 'done', tutRect: null, tutStep: 0 });
    this.save({ tutorialDone: true });
    try { localStorage.setItem('cadenceTutorialComplete', 'true'); localStorage.setItem('lt_tut_step', '0'); } catch (e) {}
    if (skipped) this.showToast('You can re-run tutorial in Menu → Help');
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
        const p = phone.getBoundingClientRect(), r = el.getBoundingClientRect();
        rect = { top: Math.round(r.top - p.top) - 6, left: Math.round(r.left - p.left) - 6, width: Math.round(r.width) + 12, height: Math.round(r.height) + 12 };
      }
    }
    const cur = this.state.tutRect;
    const same = (!cur && !rect) || (cur && rect && cur.top === rect.top && cur.left === rect.left && cur.width === rect.width && cur.height === rect.height);
    if (!same) this.setState({ tutRect: rect });
  }

  componentDidUpdate(prevProps) {
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
    const cal = Math.round(tdee * (1 + r.adj));
    return { name: (f.name || '').trim(), height: h, weight: w, age, sex: f.sex, goal: f.goal, activity: f.activity, tdee, calories: cal, protein: Math.round(r.pk * w), carbs: Math.round(cal * r.c / 4), fat: Math.round(cal * r.f / 9) };
  }

  _setMa(p) { if (this.state.mealAdd) this.setState({ mealAdd: { ...this.state.mealAdd, ...p } }); }

  // ---- USDA FoodData Central ----
  async usdaSearch(query, pageSize) {
    const key = (this.props.usdaApiKey || '').trim() || 'd2d392gnQVEh9d5apOjnR84Yz03rbmQD4lFmKVT0';
    const url = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=' + encodeURIComponent(key)
      + '&query=' + encodeURIComponent(query)
      + '&pageSize=' + (pageSize || 8)
      + '&dataType=' + encodeURIComponent('Foundation,SR Legacy,Survey (FNDDS)');
    const res = await fetch(url);
    if (!res.ok) throw new Error('usda ' + res.status);
    const json = await res.json();
    return (json.foods || []).map(f => this._usdaToFood(f)).filter(Boolean);
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
      for (const part of parts) {
        const foods = await this.usdaSearch(part.name, 1);
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
        const matches = await this.usdaSearch(best.label.toLowerCase(), 1);
        if (!matches || !matches[0]) throw new Error('none in usda');
        const f = matches[0];
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
    this.setState({ nutritionPrint: np, exportForm: null }, () => {
      setTimeout(() => { window.print(); setTimeout(() => this.setState({ nutritionPrint: null }), 400); }, 60);
    });
  }

  weekVolume(sessions) {
    let v = 0;
    Object.keys(sessions || {}).forEach(d => { (sessions[d].exercises || []).forEach(e => { v += exVol(e); }); });
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
    if (this.props.weatherCondition && this.props.weatherCondition !== 'auto') { this.setState({ weatherStatus: 'ready' }); return; }
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
    if (this.props.weatherCondition && this.props.weatherCondition !== 'auto') return;
    let stale = true;
    try {
      const c = JSON.parse(localStorage.getItem('lt_weather_cache') || 'null');
      if (c && c.data && (Date.now() - c.ts) < 30 * 60 * 1000) stale = false;
    } catch (e) {}
    if (stale) this._wxFetchStored().catch(() => {});
  }

  refreshWeather() {
    if (this.props.weatherCondition && this.props.weatherCondition !== 'auto') { this.setState({ weatherStatus: 'ready' }); return; }
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
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
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
      r.cardio.forEach(c => { if (exs[c.idx]) exs[c.idx] = { ...exs[c.idx], duration: c.duration, intensity: c.intensity }; });
      history[idx] = { ...history[idx], exercises: exs };
      const live = this.state.sessions[r.day];
      if (live) {
        const lexs = (live.exercises || []).map(x => ({ ...x }));
        r.cardio.forEach(c => { if (lexs[c.idx]) lexs[c.idx] = { ...lexs[c.idx], duration: c.duration, intensity: c.intensity }; });
        sessions = { ...this.state.sessions, [r.day]: { ...live, exercises: lexs } };
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
      this.save({ sessions, sessionHistory: history, recoveryLog: log, recoveryProfile: profile, rpeSheet: null, recoveryPrompt: { id: r.id, det, choice: null } });
    } else {
      this.save({ sessions, sessionHistory: history, recoveryLog: log, recoveryProfile: profile, rpeSheet: null });
      this.showToast('Logged RPE ' + r.rpe + '. Recovery tracking active.');
    }
  }

  respondRecovery(choice) {
    const rp = this.state.recoveryPrompt; if (!rp) return;
    const ignored = choice !== 'break';
    const entry = { id: rp.id, date: new Date().toISOString().slice(0, 10), suggested: true, ignored, choice, action: null, nextPerf: null, outcome: null };
    const log = (this.state.recoveryLog || []).concat([entry]);
    if (choice === 'break') {
      // navigate to tomorrow's workout in reschedule mode
      const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const jsDay = new Date().getDay(); // 0=Sun
      const todayKey = order[(jsDay + 6) % 7];
      const tomKey = order[(order.indexOf(todayKey) + 1) % 7];
      const tomType = this.state.week[tomKey];
      if (!tomType || tomType === 'Rest') {
        this.save({ recoveryLog: log, recoveryPrompt: null, screen: 'home', activeDay: null });
        this.showToast('Tomorrow is already a rest day. Rest well.');
      } else {
        this.save({ recoveryLog: log, recoveryPrompt: null, screen: 'week', activeDay: tomKey, breakMode: true, moveOpen: true });
      }
    } else {
      this.save({ recoveryLog: log, recoveryPrompt: null, screen: 'home', activeDay: null });
      this.showToast(choice === 'lighter' ? 'Noted — take it lighter tomorrow.' : "You're good to go. Keep the cadence.");
    }
  }

  renderVals() {
    const s = this.state;
    const now = new Date();
    const hour = now.getHours();
    const isNightTime = hour < 6 || hour >= 19;
    const dayIdx = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000) % 4;
    const baseCond = ['sunny', 'cloudy', 'rainy', 'snowy'][dayIdx];
    const autoCond = isNightTime ? (baseCond === 'sunny' ? 'clear-night' : baseCond + '-night') : baseCond;
    const TEMP = { sunny: 24, cloudy: 18, rainy: 15, snowy: 1, 'clear-night': 17, 'cloudy-night': 16, 'rainy-night': 13, 'snowy-night': -1 };
    const LABEL = { sunny: 'Sunny', cloudy: 'Partly Cloudy', rainy: 'Rainy', snowy: 'Snowy', 'clear-night': 'Clear Night', 'cloudy-night': 'Partly Cloudy', 'rainy-night': 'Rainy', 'snowy-night': 'Snowy' };
    // Tweak override forces a demo condition; otherwise use live Open-Meteo data.
    const wxOverride = this.props.weatherCondition && this.props.weatherCondition !== 'auto';
    const wd = s.weatherData;
    const wxStatus = wxOverride ? 'ready' : (s.weatherStatus || 'loading');
    let cond, tempLabel, condLabel, location, high, low, sunrise, sunset;
    if (wxOverride) {
      cond = this.props.weatherCondition;
      tempLabel = TEMP[cond] + '°'; condLabel = LABEL[cond]; location = 'Nicosia';
      high = TEMP[cond] + 5; low = TEMP[cond] - 6; sunrise = '6:12'; sunset = '19:48';
    } else if (wd) {
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
      showRefresh: wxStatus === 'ready' || wxStatus === 'error',
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
    const openDay = (d) => () => this.setState({ screen: 'session', activeDay: d, sessionPeek: null });

    const wOff = s.weekOffset || 0;
    const wView = this.viewWeek(wOff);
    const isCurWeek = wOff === 0;

    const days = DAYS.map((d, i) => {
      const t = wView.types[d];
      const training = t && t !== 'Rest';
      const isToday = isCurWeek && d === s.todayKey;
      const moved = t !== s.recurring[d];
      const sess = wView.sessions[d];
      const openThis = isCurWeek ? openDay(d) : () => { this.haptic(false); this.setState({ dayMenu: { day: d, scope: 'once', source: 'week', offset: wOff }, dayConfirm: null }); };
      return {
        key: d, letter: d.charAt(0), short: training ? t : 'Rest', full: FULL[d],
        chipBg: training ? TYPE_TINT[t] : 'var(--surface-2)',
        chipRing: isToday ? ('0 0 0 2px ' + (training ? TYPE_COLOR[t] : 'var(--muted)')) : 'none',
        dot: training ? TYPE_COLOR[t] : 'var(--border)',
        labelColor: training ? 'var(--text)' : 'var(--muted)',
        movedDisplay: moved ? 'block' : 'none',
        tint: training ? TYPE_TINT[t] : TYPE_TINT.Rest,
        iconColor: training ? TYPE_COLOR[t] : 'var(--muted)',
        iconPath: training ? DUMBBELL : MOON,
        divider: i === DAYS.length - 1 ? 'transparent' : 'var(--border)',
        rowSub: (training ? ((t === 'Custom' && (this.state.customLabels || {})[d]) || (t + ' day')) : 'Rest day') + (moved ? ' · this week only' : ''),
        rowRight: training && sess ? (sess.completed ? 'Done' : fmt(this.weekVolume({ x: sess }))) : '',
        open: openThis,
        openMenu: () => { this.haptic(false); this.setState({ dayMenu: { day: d, scope: 'once', source: 'week', offset: wOff }, dayConfirm: null }); },
      };
    });

    const weekDots = [-3, -2, -1, 0, 1, 2, 3].map(o => ({
      active: o === wOff, isToday: o === 0,
      w: o === wOff ? '18px' : '6px',
      bg: o === wOff ? 'var(--accent)' : (o === 0 ? 'var(--muted)' : 'var(--border)'),
      go: () => this.goWeek(o - wOff),
    }));
    const weekNav = {
      label: this.weekLabelFor(wOff),
      isCurrent: isCurWeek,
      todayBadgeDisplay: isCurWeek ? 'inline-flex' : 'none',
      prevDisabled: wOff <= -3, nextDisabled: wOff >= 3,
      prevOpacity: wOff <= -3 ? '.32' : '1', nextOpacity: wOff >= 3 ? '.32' : '1',
      goPrev: () => this.goWeek(-1), goNext: () => this.goWeek(1),
      goToday: () => { if (!isCurWeek) this.setState({ weekOffset: 0 }); },
      dots: weekDots,
      touchStart: (e) => { const t = e.touches ? e.touches[0] : e; this._wsx = t.clientX; this._wsy = t.clientY; this._wsw = false; },
      touchMove: (e) => { if (this._wsx == null) return; const t = e.touches ? e.touches[0] : e; if (Math.abs(t.clientX - this._wsx) > Math.abs(t.clientY - this._wsy) && Math.abs(t.clientX - this._wsx) > 10) this._wsw = true; },
      touchEnd: (e) => { if (this._wsx == null) return; const t = (e.changedTouches ? e.changedTouches[0] : e); const dx = t.clientX - this._wsx; const isMouse = !e.changedTouches; this._wsx = null; if ((!isMouse && !this._wsw) || Math.abs(dx) < 45) return; this.goWeek(dx < 0 ? 1 : -1); },
    };

    // today card
    const tk = s.todayKey;
    const tt = s.week[tk];
    const tTrain = tt && tt !== 'Rest';
    const todayBg = tTrain ? TYPE_COLOR[tt] : 'var(--surface)';
    const todayFg = tTrain ? '#fff' : 'var(--text)';
    const tCompleted = !!(tTrain && s.sessions[tk] && s.sessions[tk].completed);

    // active session
    const ad = s.activeDay;
    const asess = ad ? s.sessions[ad] : null;
    const at = ad ? s.week[ad] : null;
    let sx = null;
    if (asess) {
      const exs = asess.exercises || [];
      const total = exs.reduce((a, e) => a + exVol(e), 0);
      sx = {
        type: typeLabel(at), typeLine: (at === 'Custom' && (this.state.customLabels || {})[ad]) ? (this.state.customLabels || {})[ad] : (typeLabel(at) + ' day'), renameDisplay: at === 'Custom' ? 'inline-flex' : 'none', dayFull: FULL[ad], tint: TYPE_TINT[at] || TYPE_TINT.Custom, color: TYPE_COLOR[at] || '#00B8D4', iconPath: TYPE_ICON[at] || DUMBBELL,
        statusText: asess.completed ? 'Completed' : 'In progress',
        statusColor: asess.completed ? 'var(--accent)' : 'var(--muted)',
        statusBg: asess.completed ? 'var(--accent-soft)' : 'var(--surface-2)',
        hasExercises: exs.length > 0,
        empty: exs.length === 0,
        multi: exs.length > 1,
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
          return {
            name: e.name, scheme: scheme(e) + (!e.cardio && (e.logged || []).length ? ' · ' + Math.min((e.logged || []).length, e.sets || 0) + '/' + (e.sets || 0) + ' logged' : ''), volume: e.cardio ? ((e.duration || 0) + 'm') : fmt(exVol(e)), volLabel: e.cardio ? 'cardio' : 'volume',
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
            edit: () => { if (s.sessDrag) return; this.setState({ exForm: { day: ad, index: idx, name: e.name, cardio: !!e.cardio, sets: e.sets, reps: e.reps, weight: e.weight, duration: e.duration, intensity: e.intensity } }); },
          };
        }),
        exCount: exs.length,
        showVolume: at !== 'Cardio' && exs.some(e => !e.cardio),
        listLabel: at === 'Cardio' ? 'Activities' : 'Exercises',
        doneTitle: at === 'Cardio' ? 'Session Done for Today.' : 'Lift Done for Today.',
        emptyTitle: at === 'Cardio' ? 'No activities yet' : 'No exercises yet',
        emptySub: at === 'Cardio' ? 'Tap + to add a cardio activity' : 'Tap + to log your first exercise',
        totalVolume: fmt(total),
        notes: asess.notes || '',
        showStart: !asess.completed && exs.some(e => !e.cardio && (e.sets || 0) > 0),
        startLabel: exs.some(e => !e.cardio && (e.logged || []).length > 0) ? 'Resume workout' : 'Start workout',
        completeText: asess.completed ? 'Completed' : 'Mark completed',
        completeIcon: asess.completed ? '✓' : '○',
        completeBg: asess.completed ? 'var(--accent-soft)' : 'var(--accent)',
        completeFg: asess.completed ? 'var(--accent)' : '#fff',
      };
    }

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
        sub: empty ? 'Empty — tap to set up' : (typeLabel(p.type) + ' day · ' + p.exercises.length + ' exercise' + (p.exercises.length === 1 ? '' : 's')),
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
          label: typeLabel(t),
          bg: p.type === t ? TYPE_COLOR[t] : 'var(--surface-2)',
          color: p.type === t ? '#fff' : 'var(--muted)',
          set: () => this.updateProgramDay(apd, { type: t }),
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
          return {
            name: e.name, scheme: scheme(e), dx: dx + 'px',
            ty, z, jiggle: jig, cardShadow, tyTransition, deleteBg: inReorder ? 'transparent' : '#EF4444',
            onTouchStart: (ev) => {
              if (inReorder) { startDragFrom(ev.touches[0].clientY, ev); return; }
              this._swipeStartX = ev.touches[0].clientX; this._lpX = ev.touches[0].clientX; this._lpY = ev.touches[0].clientY;
              this._beginReorderPress(idx);
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
                this._lpX = ev.clientX; this._lpY = ev.clientY; this._beginReorderPress(idx);
                const mm = (e) => { if (Math.abs(e.clientX - this._lpX) > 8 || Math.abs(e.clientY - this._lpY) > 8) this._cancelReorderPress(); };
                const mu = () => { this._cancelReorderPress(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
                document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu);
              }
            },
            edit: () => {
              if (inReorder) return;
              if (swActive && dx === -88) { this.setState({ swipe: null }); return; }
              this.setState({ exForm: { mode: 'program', day: apd, index: idx, name: e.name, cardio: !!e.cardio, sets: e.sets, reps: e.reps, weight: e.weight, duration: e.duration, intensity: e.intensity } });
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
    const archiveWeeks = s.archive.map(w => {
      let vol = 0; w.sessions.forEach(se => se.exercises.forEach(e => { vol += exVol(e); }));
      const asw = s.archiveSwipe;
      const active = asw && asw.id === w.id;
      const dx = active ? asw.dx : 0;
      return {
        label: w.label, volume: fmt(vol), count: w.sessions.length, dx: dx + 'px',
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
          if (this.state.confirmArchiveDelete === w.id) { this.setState({ confirmArchiveDelete: null, archiveSwipe: null }); this.save({ archive: s.archive.filter(x => x.id !== w.id) }); this.showToast('Week deleted from archive.'); }
          else { this.setState({ confirmArchiveDelete: w.id }); this.showToast('Tap delete again to confirm — this can\'t be undone.'); }
        },
      };
    });
    const aw = s.archive.find(w => w.id === s.archiveId);
    let adv = null;
    if (aw) {
      let tv = 0; aw.sessions.forEach(se => se.exercises.forEach(e => { tv += exVol(e); }));
      adv = {
        label: aw.label, volume: fmt(tv), count: aw.sessions.length,
        sessions: aw.sessions.map(se => {
          let v = 0; se.exercises.forEach(e => { v += exVol(e); });
          return { title: FULL[se.day] + ' · ' + typeLabel(se.type), volume: fmt(v), hasDate: !!se.date, dateLabel: se.date ? fmtDate(se.date) : '', exercises: se.exercises.map((e, i) => ({ name: e.name, scheme: scheme(e), divider: i === se.exercises.length - 1 ? 'transparent' : 'var(--border)' })) };
        }),
      };
    }

    // exercise form
    const ef0 = s.exForm;
    const ef = ef0 ? {
      heading: ef0.index === null ? 'Add exercise' : (ef0.cardio ? 'Edit cardio' : 'Edit exercise'),
      isCardio: !!ef0.cardio, isStrength: !ef0.cardio,
      nameLabel: ef0.cardio ? 'Activity' : 'Exercise',
      name: ef0.name, sets: ef0.sets, reps: ef0.reps, weight: ef0.weight,
      duration: ef0.duration, intensity: ef0.intensity,
      intensities: INTENSITIES.map(x => ({ label: x, bg: ef0.intensity === x ? TYPE_COLOR.Cardio : 'var(--surface-2)', color: ef0.intensity === x ? '#fff' : 'var(--text)', pick: () => this.setState({ exForm: { ...this.state.exForm, intensity: x } }) })),
      volume: fmt(exVol(ef0)),
      deleteDisplay: ef0.index === null ? 'none' : 'block',
      browseDisplay: (ef0.mode === 'session' && ef0.index === null) ? 'inline-flex' : 'none',
      onName: (e) => this.setState({ exForm: { ...s.exForm, name: e.target.value } }),
      onSets: (e) => this.setState({ exForm: { ...s.exForm, sets: numOrEmpty(e.target.value) } }),
      onReps: (e) => this.setState({ exForm: { ...s.exForm, reps: numOrEmpty(e.target.value) } }),
      onWeight: (e) => this.setState({ exForm: { ...s.exForm, weight: numOrEmpty(e.target.value, true) } }),
      onDuration: (e) => this.setState({ exForm: { ...s.exForm, duration: numOrEmpty(e.target.value) } }),
    } : null;

    // session history
    const sortedHistory = (s.sessionHistory || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const historyEntries = sortedHistory.map(h => ({
      title: FULL[h.day] + ' · ' + typeLabel(h.type),
      dateLabel: fmtDate(h.date),
      volume: fmt(h.volume),
      exercises: h.exercises.map((e, i) => ({ name: e.name, scheme: scheme(e), divider: i === h.exercises.length - 1 ? 'transparent' : 'var(--border)' })),
    }));

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
          label: FULL[d] + ' – ' + (t === 'Rest' ? 'Rest day' : typeLabel(t) + ' Day'),
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
      const configLabel = isCardioKind ? ((qa0.duration || 0) + ' min · ' + qa0.intensity) : ((qa0.sets || 0) + ' sets × ' + (qa0.reps || 0) + ' reps');
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
        intensities: INTENSITIES.map(x => ({ label: x, bg: qa0.intensity === x ? TYPE_COLOR.Cardio : 'var(--surface-2)', color: qa0.intensity === x ? '#fff' : 'var(--text)', pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, intensity: x } }) })),
        itemName: qa0.item ? qa0.item.name : '', configLabel,
        toRecur: () => this.setState({ quickAdd: { ...this.state.quickAdd, stage: 'recur' } }),
        recurOptions: [
          { k: 'once', label: 'Just today', sub: 'One-time — ' + FULL[day] + ' stays empty next week' },
          { k: 'every', label: 'Every ' + FULL[day], sub: 'Repeats weekly in your program' },
        ].map(o => {
          const sel = qa0.recur === o.k;
          return { label: o.label, sub: o.sub, border: sel ? 'var(--accent)' : 'var(--border)', bg: sel ? 'var(--accent-soft)' : 'var(--surface-2)', dotBorder: sel ? 'var(--accent)' : 'var(--border)', dotInner: sel ? 'var(--accent)' : 'transparent', pick: () => this.setState({ quickAdd: { ...this.state.quickAdd, recur: o.k } }) };
        }),
        back: () => { const st = this.state.quickAdd; if (!st) return; this.setState({ quickAdd: { ...st, stage: backMap[st.stage] || 'type' } }); },
        confirm: () => {
          const st = this.state.quickAdd; if (!st || !st.item) return;
          const cardio = st.kind === 'cardio' || st.kind === 'sport';
          const item = cardio ? { name: st.item.name, duration: st.duration || 0, intensity: st.intensity } : { name: st.item.name, sets: st.sets || 0, reps: st.reps || 0, weight: 0, equipment: st.item.equipment || '' };
          if (st.recur === 'every') { if (cardio) this.addCardioToProgram(st.day, item); else this.addExerciseToProgram(st.day, item); }
          else { this.addOneTimeToWeek(st.day, item, cardio, st.offset || 0); }
          this.haptic(true);
          this.setState({ quickAdd: null });
          this.showToast(st.item.name + ' added to ' + FULL[st.day] + (st.recur === 'every' ? ' — every week.' : (st.offset ? ' — that week.' : ' — just this week.')));
        },
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
      const exs = src === 'week'
        ? (mView ? ((mView.sessions[day] && mView.sessions[day].exercises) || []) : ((s.sessions[day] && s.sessions[day].exercises) || []))
        : (p.exercises || []);
      const isLiftType = ['Push', 'Pull', 'Legs', 'Custom'].includes(type);
      const strengthN = exs.filter(e => !e.cardio).length;
      const cardioN = exs.filter(e => e.cardio).length;
      const hasActivities = exs.length > 0;
      const scope = dm0.scope;
      const onceLabelSuffix = mOff ? ' — that week.' : ' — this week.';
      const curLabel = type === 'Rest' ? 'Rest day' : (typeLabel(type) + ' day');
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
        peekItems: mOff !== 0 ? exs.map(e => ({ name: e.name, detail: e.cardio ? ((e.duration || 0) + ' min · ' + (e.intensity || 'Moderate')) : ((e.sets || 0) + '×' + (e.reps || 0) + (e.weight ? ' · ' + e.weight + 'kg' : '')) })) : [],
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
        showEdit: hasActivities,
        addActivity: () => {
          const qk = type === 'Cardio' ? 'cardio' : (isLiftType && hasActivities ? 'lift' : null);
          this.setState({ dayMenu: null, quickAdd: { day, stage: qk ? 'browseCat' : 'type', kind: qk, cat: null, item: null, sets: 3, reps: 10, duration: 30, intensity: 'Moderate', recur: scope, offset: mOff } });
        },        editDay: () => this.setState({ dayMenu: null, screen: 'programDay', activeProgramDay: day }),
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
    const moveTargets = ad ? DAYS.filter(d => d !== ad).map((d, i, arr) => {
      const occupied = s.week[d] && s.week[d] !== 'Rest';
      const disabled = breakMode && occupied;
      return {
        full: FULL[d],
        current: occupied ? typeLabel(s.week[d]) + ' day' : 'Rest',
        divider: i === arr.length - 1 ? 'transparent' : 'var(--border)',
        rowOpacity: disabled ? 0.4 : 1,
        rowCursor: disabled ? 'not-allowed' : 'pointer',
        pick: () => {
          if (disabled) { this.showToast('That day already has a workout — pick a free day.'); return; }
          const from = ad, to = d, type = s.week[from], sess = s.sessions[from];
          const week = { ...s.week }; week[to] = type; week[from] = 'Rest';
          const sessions = { ...s.sessions }; sessions[to] = sess; delete sessions[from];
          this.haptic(false);
          if (breakMode) {
            let log = (s.recoveryLog || []).slice();
            for (let k = log.length - 1; k >= 0; k--) { if (log[k].choice === 'break' && !log[k].action) { log[k] = { ...log[k], action: 'moved_to_' + to }; break; } }
            this.save({ week, sessions, recoveryLog: log, breakMode: false, moveOpen: false, activeDay: null, screen: 'home' });
            this.showToast('Workout moved to ' + FULL[to] + '. Rest well.');
          } else {
            this.save({ week, sessions, activeDay: to, moveOpen: false });
          }
        },
      };
    }) : [];

    const menuItems = [
      { label: 'Current Program', iconPath: DUMBBELL, iconColor: TYPE_COLOR.Push, tint: TYPE_TINT.Push, select: () => this.setState({ screen: 'program', menuOpen: false }) },
      { label: 'Exercise Database', iconPath: 'M4 4h11a2 2 0 0 1 2 2v13.5a1.5 1.5 0 0 1-1.5 1.5H6a2 2 0 0 1-2-2V4z M4 8h2 M4 12h2 M4 16h2 M14.5 9.5l3.8-3.8a1 1 0 0 1 1.4 1.4L16 11 13.5 12z', iconColor: TYPE_COLOR.Pull, tint: TYPE_TINT.Pull, select: () => this.setState({ screen: 'database', menuOpen: false }) },
      { label: 'Cardio Database', iconPath: HEART, iconColor: TYPE_COLOR.Cardio, tint: TYPE_TINT.Cardio, select: () => this.setState({ screen: 'cardioDb', activeCardioType: null, menuOpen: false }) },
      { label: 'Meals', iconPath: PLATE, iconColor: TYPE_COLOR.Custom, tint: TYPE_TINT.Custom, select: () => this.setState({ screen: 'meals', menuOpen: false }) },
      { label: 'Archive', iconPath: 'M4 7h16v3H4V7zM5 10v9h14v-9M10 14h4', iconColor: TYPE_COLOR.Legs, tint: TYPE_TINT.Legs, select: () => this.setState({ screen: 'archive', menuOpen: false }) },
      { label: 'Workout Settings', iconPath: 'M10 2h4M12 9v4l2.5 2.5M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', iconColor: 'var(--accent)', tint: 'var(--accent-soft)', select: () => this.setState({ menuOpen: false, wsOpen: true }) },
      { label: 'Replay Tutorial', iconPath: 'M4 4v5h5M4 9a8 8 0 1 1-1 5', iconColor: TYPE_COLOR.Custom, tint: TYPE_TINT.Custom, select: () => this.setState({ menuOpen: false, screen: 'week', weekOffset: 0, activeDay: null, flowPhase: 'tutorial', tutStep: 0, tutRect: null }, () => this._tutMeasureSoon(300)) },
    ].map(m => ({ ...m, bg: 'transparent' }));

    // ===== workout mode (gym companion) =====
    const wcfg = s.wcfg || W_DEFAULTS;
    const wk = s.workout;
    let wo = null;
    if (wk) {
      const wsess = s.sessions[wk.day] || { exercises: [] };
      const wexs = wsess.exercises || [];
      const we = wexs[wk.exIdx];
      const phase = wk.phase;
      const circ = 2 * Math.PI * 98;
      const wRestTotal = Math.max(1, wk.restTotal || 1);
      const frac = Math.max(0, Math.min(1, (wk.restLeft || 0) / wRestTotal));
      const mmss = (t) => { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
      const loggedCount = we ? (we.logged || []).length : 0;
      const lastLg = we ? (we.logged || [])[loggedCount - 1] : null;
      const liftRows = wexs.filter(e => !e.cardio);
      const sumRows = liftRows.map((e, i) => {
        const lg = (e.logged || []).filter(l => !l.skipped);
        return { name: e.name, detail: lg.length + ' of ' + (e.sets || 0) + ' sets logged', vol: fmt(lg.reduce((a, l) => a + (l.reps || 0) * (l.weight || 0), 0)), divider: i === liftRows.length - 1 ? 'transparent' : 'var(--border)' };
      });
      const totVol = liftRows.reduce((a, e) => a + (e.logged || []).filter(l => !l.skipped).reduce((x, l) => x + (l.reps || 0) * (l.weight || 0), 0), 0);
      const es = wk.editSet;
      wo = {
        dayLabel: FULL[wk.day] || '',
        exName: phase === 'summary' ? 'Session summary' : (we ? we.name : ''),
        setLine: we ? 'Set ' + (wk.setIdx + 1) + ' of ' + (we.sets || 0) : '',
        targetLine: we ? 'Target ' + (we.reps || 0) + ' reps × ' + (we.weight || 0) + ' kg' : '',
        dots: we ? Array.from({ length: we.sets || 0 }, (_, i) => ({ bg: i < loggedCount ? 'var(--accent)' : (i === wk.setIdx && phase === 'set' ? 'var(--text)' : 'var(--track)') })) : [],
        phaseSet: phase === 'set', phaseRest: phase === 'rest' && !es, phaseReady: phase === 'ready', phaseSummary: phase === 'summary', editing: phase === 'rest' && !!es,
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
        time: mmss(wk.restLeft || 0), circ: String(circ), dash: String(circ * (1 - frac)),
        arcColor: wk.paused ? 'var(--muted)' : 'var(--accent)',
        pauseHint: wk.paused ? 'paused' : 'tap to pause',
        restSub: wk.paused ? 'Timer paused — tap the ring to resume.' : 'Ready for set ' + (wk.setIdx + 1) + ' when the timer ends.',
        togglePause: () => this.setState(s2 => s2.workout && s2.workout.phase === 'rest' ? { workout: { ...s2.workout, paused: !s2.workout.paused } } : null),
        plus30: () => this.setState(s2 => { const w = s2.workout; if (!w || w.phase !== 'rest') return null; const nl = (w.restLeft || 0) + 30; return { workout: { ...w, restLeft: nl, restTotal: Math.max(w.restTotal || 0, nl) } }; }),
        minus30: () => this.setState(s2 => { const w = s2.workout; if (!w || w.phase !== 'rest') return null; const nl = Math.max(0, (w.restLeft || 0) - 30); if (nl === 0) setTimeout(() => this._woRestDone(), 0); return { workout: { ...w, restLeft: nl } }; }),
        skipRest: () => this._woStartSet(), startSet: () => this._woStartSet(),
        startNLabel: 'Start set ' + (wk.setIdx + 1),
        restMore: () => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, phase: 'rest', restLeft: wcfg.rest, restTotal: wcfg.rest, paused: false, editSet: null } } : null),
        hasEditable: !!(lastLg && !lastLg.skipped),
        justLogged: (lastLg && !lastLg.skipped) ? 'Set ' + lastLg.set + ' ✓ · ' + lastLg.reps + ' × ' + lastLg.weight + ' kg' : '',
        lastSetN: lastLg ? lastLg.set : 0,
        editLast: () => { if (!lastLg || lastLg.skipped) return; this.setState(s2 => s2.workout ? { workout: { ...s2.workout, editSet: { idx: loggedCount - 1, n: lastLg.set, reps: String(lastLg.reps), weight: String(lastLg.weight) } } } : null); },
        editN: es ? es.n : 0,
        esReps: es ? es.reps : '', esWeight: es ? es.weight : '',
        onEsReps: (e) => this.setState(s2 => s2.workout && s2.workout.editSet ? { workout: { ...s2.workout, editSet: { ...s2.workout.editSet, reps: e.target.value } } } : null),
        onEsWeight: (e) => this.setState(s2 => s2.workout && s2.workout.editSet ? { workout: { ...s2.workout, editSet: { ...s2.workout.editSet, weight: e.target.value } } } : null),
        editSave: () => this._woEditSave(),
        editCancel: () => this.setState(s2 => s2.workout ? { workout: { ...s2.workout, editSet: null } } : null),
        sumRows, totVol: fmt(totVol),
        finish: () => { this.endWorkout(); this.setState({ confirmComplete: true }); },
        exit: () => this.endWorkout(phase === 'summary' ? null : 'Progress saved — resume anytime.'),
        activity: () => this._woIdleReset(),
        dim: s.workoutIdle ? 'brightness(' + ((wcfg.idleDim || 30) / 100) + ') grayscale(.35)' : 'none',
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
    const todayISO = new Date().toISOString().slice(0, 10);
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
    const pfDefaults = { name: '', height: '', weight: '', age: '', sex: 'Male', goal: 'Maintain', activity: 'Moderately Active' };
    const pfd = s.profileForm || (prof ? null : pfDefaults);
    const setPf = (patch) => this.setState({ profileForm: { ...(this.state.profileForm || pfDefaults), ...patch } });
    const pf = pfd ? {
      name: pfd.name, height: pfd.height, weight: pfd.weight, age: pfd.age,
      onName: (e) => setPf({ name: e.target.value }),
      onHeight: (e) => setPf({ height: e.target.value }),
      onWeight: (e) => setPf({ weight: e.target.value }),
      onAge: (e) => setPf({ age: e.target.value }),
      sexOptions: ['Male', 'Female'].map(x => ({ label: x, bg: pfd.sex === x ? 'var(--accent)' : 'var(--surface-2)', color: pfd.sex === x ? '#fff' : 'var(--muted)', set: () => setPf({ sex: x }) })),
      goalOptions: GOALS.map(x => ({ label: x, bg: pfd.goal === x ? 'var(--accent)' : 'var(--surface-2)', color: pfd.goal === x ? '#fff' : 'var(--muted)', set: () => setPf({ goal: x }) })),
      activityOptions: ACTIVITY.map(x => ({ label: x, bg: pfd.activity === x ? 'var(--accent)' : 'var(--surface-2)', color: pfd.activity === x ? '#fff' : 'var(--muted)', set: () => setPf({ activity: x }) })),
      save: () => {
        const f = { ...pfDefaults, ...(this.state.profileForm || {}) };
        if (!(+f.height) || !(+f.weight) || !(+f.age)) return;
        this.haptic(true);
        this.setState({ profileForm: null, profileEditOpen: false });
        this.save({ profile: this.computeTargets(f) });
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
        { label: 'Goal', value: prof.goal },
        { label: 'Activity', value: prof.activity },
      ],
      edit: () => this.setState({ profileMenu: false, profileEditOpen: true, profileForm: { name: prof.name || '', height: String(prof.height), weight: String(prof.weight), age: String(prof.age), sex: prof.sex, goal: prof.goal, activity: prof.activity } }),
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
          this.save({ customMeals: [...(this.state.customMeals || []), cm] });
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
    const updateMeal = (patch) => this.save({ meals: this.state.meals.map(m => m.id === md0.id ? { ...m, ...patch } : m) });
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
      deleteMeal: () => { const meals = this.state.meals.filter(m => m.id !== md0.id); this.setState({ mealDetail: null }); this.save({ meals }); },
    } : null;
    const cms = s.customMeals || [];
    const logCustom = (cm) => {
      const t = sumItems(cm.items);
      const nowD = new Date();
      const meal = { id: 'meal_' + Date.now(), date: nowD.toISOString().slice(0, 10), ts: nowD.getTime(), name: cm.name, items: cm.items.map(x => ({ ...x })), ...t };
      this.haptic(true);
      this.save({ meals: [...(this.state.meals || []), meal] });
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
    const updateCm = (patch) => this.save({ customMeals: (this.state.customMeals || []).map(m => m.id === smd0.id ? { ...m, ...patch } : m) });
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
        this.save({ customMeals: [...(this.state.customMeals || []), copy] });
        this.setState({ savedMealDetail: { id: copy.id } });
        this.showToast('Cloned — edit the name and quantities.');
      },
      deleteMeal: () => { this.setState({ savedMealDetail: null }); this.save({ customMeals: (this.state.customMeals || []).filter(m => m.id !== smd0.id) }); this.showToast('Saved meal deleted.'); },
    } : null;
    const exf = s.exportForm;
    const exd = exf ? {
      from: exf.from, to: exf.to,
      onFrom: (e) => this.setState({ exportForm: { ...this.state.exportForm, from: e.target.value } }),
      onTo: (e) => this.setState({ exportForm: { ...this.state.exportForm, to: e.target.value } }),
      run: () => this.exportNutritionPdf(),
    } : null;
    const restState = screen === 'session' && (!at || at === 'Rest');
    const completionState = screen === 'session' && !!sx && !!asess && asess.completed && ad === s.todayKey && s.sessionPeek !== ad;
    const sessionNormal = screen === 'session' && !!sx && !completionState;

    return {
      theme: s.theme,
      loading: s.loading,
      weather,
      goHome: () => this.setState({ screen: 'week', activeDay: null, activeProgramDay: null, activeBodyPart: null, menuOpen: false, reorderMode: null, drag: null }),
      greetName, greetLine, pm, onb, onbActive,
      welcomeActive, welcomeName, tutorialActive, tut,
      splashActive: !s.loading && s.flowPhase === 'splash',
      splashStart: () => { this.haptic(false); this.setState({ flowPhase: 'firstLaunch' }); },
      welcomeStart: () => this.setState({ flowPhase: 'tutorial', tutStep: 0, tutRect: null }, () => this._tutMeasureSoon(300)),
      wt: prof ? { cal: fmtKcal(prof.calories), p: prof.protein + 'g', c: prof.carbs + 'g', f: prof.fat + 'g' } : { cal: '—', p: '—', c: '—', f: '—' },
      firstLaunchActive: !s.loading && s.flowPhase === 'firstLaunch',
      chooseFresh: () => this.setState({ flowPhase: 'onboarding', onbStep: 0 }),
      chooseImport: () => this.pickImport('firstLaunch'),
      hasToast: !!s.toast, toast: s.toast || '',
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
        canSubmit: s.rpeSheet.rpe != null,
        submitDisabled: s.rpeSheet.rpe == null,
        submitOpacity: s.rpeSheet.rpe == null ? 0.4 : 1,
        scale: RPE_SCALE.map(r => ({
          n: r.n, label: r.label, sub: r.sub,
          selected: s.rpeSheet.rpe === r.n,
          rowBg: s.rpeSheet.rpe === r.n ? 'var(--text)' : 'var(--surface-2)',
          rowFg: s.rpeSheet.rpe === r.n ? 'var(--surface)' : 'var(--text)',
          subFg: s.rpeSheet.rpe === r.n ? 'rgba(255,255,255,.7)' : 'var(--muted)',
          numBg: s.rpeSheet.rpe === r.n ? 'rgba(255,255,255,.18)' : (r.n >= 8 ? 'var(--accent-soft)' : 'var(--surface)'),
          pick: () => this.setState({ rpeSheet: { ...this.state.rpeSheet, rpe: r.n } }),
        })),
        onNotes: (e) => this.setState({ rpeSheet: { ...this.state.rpeSheet, notes: e.target.value } }),
        hasCardio: !!(s.rpeSheet.cardio && s.rpeSheet.cardio.length),
        cardio: (s.rpeSheet.cardio || []).map((c, ci) => ({
          name: c.name, duration: c.duration,
          onDuration: (e) => { const arr = (this.state.rpeSheet.cardio || []).slice(); arr[ci] = { ...arr[ci], duration: parseInt(e.target.value) || 0 }; this.setState({ rpeSheet: { ...this.state.rpeSheet, cardio: arr } }); },
          intensities: INTENSITIES.map(x => ({ label: x, bg: c.intensity === x ? TYPE_COLOR.Cardio : 'var(--surface-2)', color: c.intensity === x ? '#fff' : 'var(--text)', pick: () => { const arr = (this.state.rpeSheet.cardio || []).slice(); arr[ci] = { ...arr[ci], intensity: x }; this.setState({ rpeSheet: { ...this.state.rpeSheet, cardio: arr } }); } })),
        })),
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
          samples: prof.sample_size,
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
          toggle: () => { const m = { ...(s.supplementsChecked || {}) }; m[name] = !m[name]; this.save({ supplementsChecked: m }); },
        };
      }),
      supplementsEmpty: (s.supplements || []).length === 0,
      supplementsEditOpen: s.supplementsEditOpen,
      openSupplementsEdit: () => this.setState({ supplementsEditOpen: true, supplementsDraft: (s.supplements || []).slice(), newSupplementName: '' }),
      closeSupplementsEdit: () => { const list = s.supplementsDraft || s.supplements; this.setState({ supplementsEditOpen: false, supplementsDraft: null }); this.save({ supplements: list }); },
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
      headerSub: ({ week: tTrain ? typeLabel(tt) + ' day today' : 'Rest day today', session: restState ? 'Rest day' : 'Log your session', program: 'Recurring split', programDay: 'Label & exercises', history: 'Logged sessions', database: 'Body parts', databaseDetail: 'Exercises', archive: 'History', archiveDetail: 'History', meals: 'Nutrition & macros', cardioDb: 'Activities by type', cardioDbDetail: 'Activities' })[screen] || '',
      onMeals: screen === 'meals',
      mealsSetup: screen === 'meals' && (!prof || !!s.profileForm),
      mealsMain: screen === 'meals' && !!prof && !s.profileForm,
      pf, mx, nw, ma, md, exd,
      openMeals: () => this.setState({ screen: 'meals', menuOpen: false }),
      editProfile: () => this.setState({ profileEditOpen: true, profileForm: { name: prof ? prof.name : '', height: String(prof ? prof.height : ''), weight: String(prof ? prof.weight : ''), age: String(prof ? prof.age : ''), sex: prof ? prof.sex : 'Male', goal: prof ? prof.goal : 'Maintain', activity: prof ? prof.activity : 'Moderately Active' } }),
      openExport: () => this.setState({ exportForm: { from: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10), to: todayISO } }),
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
        const meal = { id: 'meal_' + Date.now(), date: nowD.toISOString().slice(0, 10), ts: nowD.getTime(), name, items: f.items, ...t };
        this.haptic(true);
        this.setState({ mealAdd: null });
        this.save({ meals: [...(this.state.meals || []), meal] });
      },
      mealDetailOpen: !!md,
      closeMealDetail: () => this.setState({ mealDetail: null }),
      restState, completionState, sessionNormal,
      peekSession: () => this.setState({ sessionPeek: ad }),
      wo, woActive: !!wo, wsx, wsOpenFlag: !!s.wsOpen,
      startWorkout: () => this.startWorkout(),
      printNutrition: !!s.nutritionPrint,
      np: s.nutritionPrint,
      printArchive: !!adv && !s.nutritionPrint,
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
          onDuration: (e) => this.setState({ cardioAddForm: { ...this.state.cardioAddForm, duration: parseInt(e.target.value) || 0 } }),
          intensities: INTENSITIES.map(x => ({ label: x, bg: f.intensity === x ? TYPE_COLOR.Cardio : 'var(--surface-2)', color: f.intensity === x ? '#fff' : 'var(--text)', pick: () => this.setState({ cardioAddForm: { ...this.state.cardioAddForm, intensity: x } }) })),
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
        this.addCardioToProgram(f.day, { name: f.name, duration: f.duration || 0, intensity: f.intensity });
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
        this.save({ exerciseDb: { ...s.exerciseDb, [f.key]: list } });
        this.setState({ dbForm: null });
      },
      deleteDbExercise: () => {
        const f = s.dbForm; if (!f || f.index === null) return;
        const list = (s.exerciseDb[f.key] || []).filter((_, i) => i !== f.index);
        this.save({ exerciseDb: { ...s.exerciseDb, [f.key]: list } });
        this.setState({ dbForm: null });
      },

      days,
      weekNav,
      weekSectionLabel: wOff === 0 ? 'This week' : (wOff < 0 ? (wOff === -1 ? 'Last week' : Math.abs(wOff) + ' weeks ago') : (wOff === 1 ? 'Next week' : 'In ' + wOff + ' weeks')),
      todayName: FULL[tk], todayProgram: tTrain ? ((tt === 'Custom' && (this.state.customLabels || {})[tk]) || (typeLabel(tt) + ' day')) : 'Rest day',
      todaySub: tTrain ? (tCompleted ? (tt === 'Cardio' ? 'Session done for today — eat well & get some rest' : 'Lift done for today — eat well & get some rest') : 'Tap below to open and log your session') : 'Recover well — no lift scheduled today',
      todayBg, todayFg,
      todayStatus: tTrain ? (s.sessions[tk] && s.sessions[tk].completed ? 'Completed' : 'Scheduled') : 'Recovery',
      todayPillBg: tTrain ? 'rgba(255,255,255,.2)' : 'var(--surface-2)',
      todayBtnBg: '#fff', todayBtnFg: tTrain ? TYPE_COLOR[tt] : 'var(--text)',
      todayMoveBorder: 'rgba(255,255,255,.5)',
      todayTrainDisplay: tTrain && !tCompleted ? 'block' : 'none',
      openToday: () => { if (tTrain) this.setState({ screen: 'session', activeDay: tk }); },
      openTodayMenu: () => this.setState({ dayMenu: { day: tk, scope: 'once', source: 'week' }, dayConfirm: null }),
      openMoveToday: () => { if (tTrain) this.setState({ activeDay: tk, moveOpen: true }); },

      sx,
      addExercise: () => {
        if (at === 'Cardio') this.setState({ quickAdd: { day: ad, stage: 'browseCat', kind: 'cardio', cat: null, item: null, sets: 3, reps: 10, duration: 30, intensity: 'Moderate', recur: 'once', offset: 0 } });
        else this.setState({ exForm: { mode: 'session', day: ad, index: null, name: '', sets: 3, reps: 10, weight: 20 } });
      },
      onNotes: (e) => this.save({ sessions: { ...s.sessions, [ad]: { ...asess, notes: e.target.value } } }),
      toggleComplete: () => {
        this.haptic(true);
        if (!asess.completed) { this.setState({ confirmComplete: true }); return; }
        this.save({ sessions: { ...s.sessions, [ad]: { ...asess, completed: false } }, sessionHistory: (s.sessionHistory || []).slice(), sessionPeek: null });
      },
      ccOpen: !!s.confirmComplete && !!asess,
      cc: (s.confirmComplete && asess) ? {
        sub: 'Check your ' + FULL[ad] + ' session before rating your effort.',
        exercises: (asess.exercises || []).map((e, i) => ({ name: e.name, scheme: scheme(e), divider: i === (asess.exercises || []).length - 1 ? 'transparent' : 'var(--border)' })),
        volume: fmt((asess.exercises || []).reduce((a, e) => a + exVol(e), 0)),
        close: () => this.setState({ confirmComplete: false }),
        confirm: () => {
          this.haptic(true);
          let sessionHistory = (this.state.sessionHistory || []).slice();
          const todayISO = new Date().toISOString().slice(0, 10);
          const vol = (asess.exercises || []).reduce((a, e) => a + exVol(e), 0);
          const rec = { id: ad + '_' + todayISO, date: todayISO, day: ad, type: at, exercises: (asess.exercises || []).map(x => ({ ...x })), volume: vol };
          const idx = sessionHistory.findIndex(r => r.id === rec.id);
          if (idx >= 0) sessionHistory[idx] = { ...rec, rpe: sessionHistory[idx].rpe, notes: sessionHistory[idx].notes, perf: sessionHistory[idx].perf }; else sessionHistory.push(rec);
          const cardioActs = (asess.exercises || []).map((e, i) => ({ e, i })).filter(x => x.e.cardio).map(x => ({ idx: x.i, name: x.e.name, duration: x.e.duration || 0, intensity: x.e.intensity || 'Moderate' }));
          this.setState({ confirmComplete: false });
          this.save({ sessions: { ...this.state.sessions, [ad]: { ...asess, completed: true } }, sessionHistory, sessionPeek: null, rpeSheet: { id: rec.id, day: ad, type: at, rpe: null, notes: '', cardio: cardioActs } });
        },
      } : null,
      openMoveSession: () => this.setState({ moveOpen: true }),

      programDays,
      pdx,
      addProgramExercise: () => this.setState({ exForm: { mode: 'program', day: apd, index: null, name: '', sets: 3, reps: 10, weight: 20 } }),
      exitReorder: () => this.setState({ reorderMode: null, drag: null }),
      openHistory: () => this.setState({ screen: 'history' }),
      historyEmpty: sortedHistory.length === 0,
      historyEntries,
      sendToArchive: () => {
        const hist = s.sessionHistory || [];
        let archive = s.archive;
        if (hist.length > 0) {
          const sorted = hist.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
          const startDate = s.programStartDate || sorted[0].date;
          const endDate = sorted[sorted.length - 1].date;
          const entry = {
            id: 'arc_' + Date.now(),
            label: 'From ' + fmtDate(startDate) + ' to ' + fmtDate(endDate),
            sessions: sorted.map(h => ({ day: h.day, type: h.type, date: h.date, exercises: h.exercises })),
          };
          archive = [entry, ...s.archive];
        }
        const program = {}; DAYS.forEach(d => { program[d] = { type: 'Rest', exercises: [] }; });
        const recurring = {}; DAYS.forEach(d => { recurring[d] = 'Rest'; });
        const week = { ...recurring };
        this.haptic(true);
        this.save({ archive, program, recurring, week, sessions: {}, sessionHistory: [], programStartDate: new Date().toISOString().slice(0, 10), screen: 'week', activeDay: null, activeProgramDay: null });
      },

      archiveWeeks,
      ad: adv,
      exportArchivePdf: () => window.print(),

      exSheetOpen: !!ef0,
      ef,
      closeExSheet: () => this.setState({ exForm: null }),
      browseDb: () => { const f = this.state.exForm; if (!f) return; this.setState({ exForm: null, quickAdd: { day: f.day, stage: 'type', kind: null, cat: null, item: null, sets: 3, reps: 10, duration: 30, intensity: 'Moderate', recur: 'once', offset: 0 } }); },
      openTagRename: () => this.setState({ tagRename: { day: ad, value: (this.state.customLabels || {})[ad] || '' } }),
      tagRenameOpen: !!s.tagRename,
      tr: s.tagRename ? {
        dayFull: FULL[s.tagRename.day], value: s.tagRename.value,
        onChange: (e) => this.setState({ tagRename: { ...this.state.tagRename, value: e.target.value } }),
        close: () => this.setState({ tagRename: null }),
        reset: () => { const m = { ...(this.state.customLabels || {}) }; delete m[s.tagRename.day]; this.setState({ tagRename: null }); this.save({ customLabels: m }); this.showToast('Day tag reset to Custom.'); },
        save: () => {
          const v = (this.state.tagRename.value || '').trim();
          const m = { ...(this.state.customLabels || {}) };
          if (v) m[this.state.tagRename.day] = v; else delete m[this.state.tagRename.day];
          this.setState({ tagRename: null }); this.save({ customLabels: m });
          if (v) this.showToast('Day renamed to "' + v + '".');
        },
      } : null,
      saveExercise: () => {
        const f = s.exForm; if (!f) return;
        const item = f.cardio
          ? { name: f.name || 'Cardio', cardio: true, duration: f.duration || 0, intensity: f.intensity || 'Moderate' }
          : { name: f.name || 'Exercise', sets: f.sets || 0, reps: f.reps || 0, weight: f.weight || 0 };
        this.haptic(false);
        if (f.mode === 'program') {
          const day = f.day; const p = s.program[day]; const list = (p.exercises || []).slice();
          if (f.index === null) list.push(item); else list[f.index] = item;
          this.updateProgramDay(day, { exercises: list });
        } else {
          const day = f.day; const sess = s.sessions[day]; const list = (sess.exercises || []).slice();
          if (f.index === null) list.push(item); else list[f.index] = item;
          const program = this.syncProgramExercise(day, f.index, item);
          this.save({ sessions: { ...s.sessions, [day]: { ...sess, exercises: list } }, program });
        }
        this.setState({ exForm: null });
      },
      deleteExercise: () => {
        const f = s.exForm; if (!f || f.index === null) return;
        if (f.mode === 'program') {
          const day = f.day; const p = s.program[day]; const list = (p.exercises || []).filter((_, i) => i !== f.index);
          this.updateProgramDay(day, { exercises: list });
        } else {
          const day = f.day; const sess = s.sessions[day]; const list = (sess.exercises || []).filter((_, i) => i !== f.index);
          const program = this.removeProgramExerciseAt(day, f.index);
          this.save({ sessions: { ...s.sessions, [day]: { ...sess, exercises: list } }, program });
        }
        this.setState({ exForm: null });
      },

      moveOpen: s.moveOpen,
      moveType: ad ? s.week[ad] : '',
      moveTitle: breakMode ? 'Reschedule tomorrow' : ('Move ' + (ad ? s.week[ad] : '') + ' session'),
      moveSub: breakMode ? 'Rest day confirmed. Move this workout to a free day within the week.' : 'Shifts this one session only — your recurring schedule stays the same.',
      moveTargets,
      closeMove: () => this.setState({ moveOpen: false, breakMode: false }),
    };
  }

  render() {
    const v = this.renderVals();
    return <Shell v={v} s={s} />;
  }
}
