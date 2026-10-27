# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Testing the meal photo flow

The meal **Photo** tab recognises a plate on-device with TensorFlow.js
(`public/models/food_v1.tflite`) and then looks up macros — USDA FoodData
Central first, with Open Food Facts as a fallback for foods USDA doesn't have.

**Prerequisite:** a USDA API key must be set before search/lookup will work.
Get a free one at <https://fdc.nal.usda.gov/api-key-signup> and put it in
`.env.local` (gitignored) as `VITE_USDA_API_KEY=...` — it is embedded at build
time, so it must be present before `npm run build`. See `.env.example`.

**Manual end-to-end check:**

1. `npm run dev`, open the app, go to **Meals → + Add Meal → Photo**.
2. Upload a clear photo of a single, common dish (e.g. a burger).
3. Expect: a brief "Estimating your meal…" state, then a **This meal** row with
   the recognised food and its macros, plus a **Meal total** and **Log meal**.

Notes:
- Classification is fully local (no rate limit); only the macro lookup hits the
  network, so a missing/rate-limited USDA key shows up as a failed lookup, not a
  failed classification.
- The model's label set skews toward common Western dishes; very exotic or
  international foods may not resolve in either database and will fall through to
  manual entry rather than logging a wrong match.

## Programs, PDF export and weigh-ins

**Programs & Archive.** The current program has a name (Current Program → Rename).
*Send to Archive* retires it: the Archive (Menu → Archive) lists past **programs**,
each with its name, the dates it ran (start → archive date), the exercises it was
built from, and every session logged under it. Entries archived before this change
are migrated on load — they get a name (`Program N`), a date range and an exercise
list derived from their sessions.

**PDF export.** *Export PDF* on the Program screen (current program) or on an
archived program's detail screen renders a report into the hidden print area and
calls `window.print()`: summary stats (total volume, volume/week, sessions, days
completed vs rest days, average RPE), the program's days and exercises, volume by
week, per-exercise progression (first → last top working weight), and the
day-by-day history with the sets actually logged and the RPE for each session.

**Weigh-ins & TDEE recalibration.** The home screen logs body weight above the
Supplements card (one entry per day; the card shows the date, the weight and the
trend against the previous weigh-in). The Meals tab charts the weigh-ins against
the trend the calorie target predicts. Every 14 days, the first weigh-in after the
window closes triggers a recalibration: observed maintenance = intake (logged meals
when ≥70% of the window's days are tracked, otherwise the calorie target) minus the
energy the actual weight change accounts for, capped at ±15% of the standing TDEE
estimate per check-in. Setting targets by hand (onboarding or Edit Profile) restarts
the 14-day clock.

**Manual check:** log a weight, confirm the home card and the Meals chart update;
archive a program and confirm it appears in the Archive with its name, range and
exercises; export both a current and an archived program to PDF.


## Two workouts a day, logging extras and editing after the fact

**Second workout (slot B).** A day holds a main workout (`sessions[day]`) and an optional
second one (`sessions[day].extra`) — a morning lift plus an evening run or sports session.
Add it from the day's session screen ("Add another workout": Lift / Cardio / Sports, with
its own name); a switcher at the top picks which one you are looking at. Each is logged,
completed and rated on its own and reaches `sessionHistory` as a separate record carrying
`slot: 'b'`, so volume, RPE, stats and PDF reports never merge the two. The second workout
is a one-off for that day: it never writes to the recurring program.

**Restart / overview.** *Restart* clears every logged set for the session (exercises
untouched, any history record for today dropped) after a confirmation, and puts the day
back to not started. It sits in two places, both backed by `restartSession(day, slot)`:
inside workout mode next to the header, and on the session screen beside *Resume workout*
(see "Start vs Resume" below). The eye icon in workout mode opens a read-only overview of
the whole session — every exercise, every set, with the current position marked. Tapping
the overview closes it and returns to the set in progress.

**Bulk edit.** *Edit all* on the session screen opens the whole workout as one editable
list: sets, reps and weight per exercise, plus every logged set so a completed session can
be corrected in place (timestamps, skips and dropsets survive). Saving writes the session,
the recurring template (main workout only) and — when the session is already completed —
the logged history record, so stats follow the correction.

**Supersets & dropsets.** The exercise sheet can pair an exercise with another on the same
day ("Superset with…") or mark it as a dropset at 60–90% of the working weight. In workout
mode a superset jumps straight into its partner with no rest in between, and a dropset
prompts for the lighter follow-up right after the set it belongs to; it is stored on that
set (`logged[i].drop`) and counts toward volume.

**Edit after completion.** The completion screen has *Edit workout*, which reopens the
session with every number editable. The workout stays complete and the logged record is
rewritten to match.

**Last weight used.** The set logger, and exercises added from the database, start from the
last non-skipped set logged for that exercise across history and archived programs, not
from the template number. The logger also shows "Last time 80 kg × 8 · Oct 5".

**Printing.** The print stylesheet drops the phone frame out of layout
(`[data-lt-phone] { display:none }`) — while it was merely `visibility:hidden` it still
took its 390px of the flex row and squeezed every PDF export into a ~200px column.


## Start vs Resume, and why logged sets expire

`state.sessions` is keyed by **weekday**, not by date, and a session keeps its `logged`
arrays indefinitely — so last Monday's sets sit on this Monday. That is what made an
untouched workout read as **"Resume workout"**: the label only asked whether `logged` was
non-empty. It also meant `_nextPos` resumed mid-way through and `exVol` counted the old
sets again.

Each logged entry carries the `ts` it was written at, which is what separates this week's
work from last week's:

- `weekStartTs()` — this week's Monday, 00:00 local.
- `freshSession(sess)` — the session with every set logged before that dropped; returns the
  *same object* when there was nothing to drop, so callers can test identity.
- `loggedSetCount(sess)` — lift sets logged **this week**. `sx.startLabel` ("Resume" vs
  "Start") and `sx.showRestart` are both driven by this, so a day only reads as in progress
  when this week put sets in it.

Stale sets are pruned, not merely ignored, so everything downstream (volume, the "2/3
logged" line, where the logger resumes) agrees. Pruning happens in `normalizeCompletions()`
— on load, on the 5-minute housekeeping tick, and now also when the app becomes visible
again (returning from the background is the usual way to cross a week boundary) — plus
synchronously in `startWorkout()`, so a fresh week always opens at set 1. Nothing is lost
that was recorded: a completed session's sets are copied into `sessionHistory` at
completion, which is already the source of truth for "completed this week".

### Day rollover

`state.todayKey` (the weekday the app believes it is) was computed once in the constructor,
so an app left open overnight kept highlighting yesterday on the week strip, kept
yesterday's workout on the home card, and kept showing "Lift Done for Today" for a session
finished the day before. `refreshToday()` re-checks it and, when the day has changed, runs
`normalizeCompletions()` too — a new day can also be a new week. It is driven from three
places, because none of them is sufficient alone: `_armMidnight()` sets a single timeout
for two seconds past the next local midnight and re-arms it each time it fires; the
5-minute housekeeping tick calls it; and so does every return from the background, since a
sleeping device simply doesn't fire the timeout on time.

Nothing is reset on rollover beyond the key itself — a workout in progress at midnight
keeps its own `workout.day`, and history records are stamped from `todayISO()`, which was
always read fresh.

**Manual check:** leave the app open past midnight (or set the device clock forward and
background/foreground it) — the week strip's "today" ring, the home card and the header
subtitle should all move to the new day.

**Known edge:** moving a part-logged session into a *future* week leaves its sets stamped
with the old week, so they are pruned when that week arrives. The sets belong to the week
they were performed in; re-stamping them would claim work that never happened then.

**Manual check:** open a workout you haven't touched → *Start workout*, no *Restart*. Log
one set, leave the screen, come back → *Resume workout* with *Restart* beside it. Tap
*Restart*, confirm → the sets clear, the status chip goes back to "In progress" with
nothing logged, and the button reads *Start workout* again.


## Global undo

Every write to the user's data funnels through `save(patch, undoLabel)`, so one undo step
is just "put back the slice of state that write replaced". `_pushUndo` snapshots only the
`UNDO_KEYS` a patch actually touches, and only when the value really changed (the app
updates immutably, so reference equality is enough) — which keeps the stack small and makes
one tap revert exactly one action. Depth is capped at `UNDO_MAX` (25) and the stack is
session-only: it is deliberately never persisted, so a reload starts clean.

`undoLabel` names the action in the confirmation toast ("Undone — the move."). Two opt-outs
matter:

- **`null` keeps a write off the stack.** Housekeeping — the 03:00 supplement reset, the
  week-rollover normalize, onboarding/tutorial completion, TDEE recalibration, rest-time
  bookkeeping on the previous set — isn't something the user did.
- **Typing notes is `null` too.** A keystroke per undo step would bury everything else, and
  the field is right there to edit back.

The button floats bottom-left inside the phone frame at `z-index: 38` — above the screens,
below every sheet backdrop (the lowest is 40) and below workout mode's opaque overlay
(70), which has its own *Undo & re-log this set* and *Restart*. It only exists while the
stack is non-empty, and is hidden during the splash / first-launch / onboarding / tutorial
flows. Undoing closes any half-open editor or drag (they point at data that is about to
change shape) and `_resyncWorkout()` puts the set logger back on whatever the session now
says is next.

**Manual check:** log a set and tap Undo → the set goes, the toast reads "Undone — that
logged set." Move a lift, then Undo → the week and both sessions are exactly as before.
Log a set, skip the day, then tap Undo twice → the skip goes first, then the set. Type in
the notes field and confirm no undo button appears.


## Portrait lock

Three layers, because no single one covers every install:

1. `public/manifest.webmanifest` — `"orientation": "portrait"`, honoured by installed
   Android PWAs.
2. `src/main.jsx` — `screen.orientation.lock('portrait')`, which only resolves in an
   installed/fullscreen context and rejects (harmlessly) everywhere else.
3. `#lt-rotate` in `index.html`, styled in `src/index.css` — the fallback for browsers
   that ignore the manifest, iOS Safari included. It is in the document rather than in
   React so it works before the bundle mounts, and it only takes over on a landscape
   **touch** screen under 560px tall: `(hover: none) and (pointer: coarse)` keeps the
   desktop phone mockup alone, and the height ceiling keeps a short desktop window out of
   it. The app keeps running behind it (timers, wake lock) but `.app-canvas` goes
   `pointer-events: none` so it can't be tapped through. The overlay sits outside
   `[data-theme]`, so it follows the system colour scheme like the `html` background does.

**Manual check:** rotate the phone → the rotate prompt appears and the UI underneath is
untappable; rotate back → it disappears. On an installed Android PWA the screen should not
rotate at all.
