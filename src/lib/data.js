// Cadence — constants, database seeds, and pure helpers.
// Extracted verbatim from the Claude Design export (Lifts.dc.html lines 2214–2578).

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const TYPES = ['Push', 'Pull', 'Legs', 'Cardio', 'Rest', 'Custom'];
const TYPE_COLOR = { Push: '#7B8C6E', Pull: '#9C7F66', Legs: '#C0895A', Cardio: '#B26658', Custom: '#6E8B9C', Rest: '#A89F92' };
const TYPE_TINT = { Push: 'rgba(123,140,110,.16)', Pull: 'rgba(156,127,102,.16)', Legs: 'rgba(192,137,90,.16)', Cardio: 'rgba(178,102,88,.16)', Custom: 'rgba(110,139,156,.16)', Rest: 'rgba(168,159,146,.16)' };
// SF-style glyph paths per type (dumbbell for training, moon for rest)
const DUMBBELL = 'M3 9.5v5M6 7.5v9M18 7.5v9M21 9.5v5M6 12h12';
const SNEAKER = 'M2 16.5h20a0 0 0 0 1 0 0v1.5a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 18zM2 16.5l1.2-4.2a2 2 0 0 1 1.6-1.4l3.2-.5 3 2.3 4 .8a4 4 0 0 1 3 2l1 1H2z M8 10.4l1 1.9';
const HEART = 'M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.66-3.4 6.74-8.55 11.48z';
const MOON = 'M20 13.2A8 8 0 1 1 10.8 4 6.3 6.3 0 0 0 20 13.2z';
const TYPE_ICON = { Push: DUMBBELL, Pull: DUMBBELL, Legs: DUMBBELL, Cardio: HEART, Custom: DUMBBELL, Rest: MOON };
const INTENSITIES = ['Easy', 'Moderate', 'Hard'];
const typeLabel = (t) => t === 'Legs' ? 'Leg' : t;
const TUT_STEPS = [
  { title: 'Welcome to Cadence', text: "Welcome to Cadence, your personal fitness companion. We'll walk you through every feature in just a few minutes. This app is built for tracking lifts, cardio, nutrition and recovery. Everything stays private on your device. Let's get started." },
  { title: 'Your Profile', text: "This is your personal greeting. It changes throughout the day based on when you're training. Long-press it anytime to edit your profile, update your weight, age or training goals, and your daily nutrition targets adjust automatically.", target: 'greet' },
  { title: 'Weather Widget', text: "This shows today's weather based on your location. It helps you plan outdoor activities like running or cycling. Tap it anytime to refresh or see a forecast. Your location is rounded for privacy and nothing leaves your device.", target: 'weather' },
  { title: 'Lifts Card', text: "This is your workout for today. Tap it to log your lifts. You'll see every exercise in your program, log each set individually, and rest between sets with a built-in timer. The app learns your recovery patterns and adapts over time.", target: 'today' },
  { title: 'Supplements Checklist', text: "Check off your daily supplements here. It's a simple checklist to help you stay consistent with your stack. Mark them as you take them throughout the day.", target: 'supps' },
  { title: 'Nutrition Widget', text: "These are your daily nutrition targets. The bars fill up as you log meals. Green is protein, gold is carbs, terracotta is fat. The circle shows overall calorie progress. Your targets were calculated based on your profile and activity level.", target: 'nutri' },
  { title: 'Weekly Calendar', text: "This is your training schedule for the week. Each circle represents a day. Green is a lift day, blue is cardio, gray is a rest day. Tap any day to see or edit that day's activities. You can see up to three weeks ahead or back in time to review past workouts.", target: 'week' },
  { title: 'Swipe Navigation', text: "Swipe left to see next week or swipe right to see last week. It's smooth and fast. You can track your entire training history or plan weeks in advance.", target: 'week' },
  { title: 'Tap a Day', text: "Tap any day to open its details. You'll see all the exercises for that day, your past performance if you've already trained, and options to edit or move activities around. Everything syncs across your calendar.", target: 'week' },
  { title: 'Edit and Day Types', text: "Tap Edit to change a day's type. You can make it a Lift Day, Cardio Day or Rest Day. Add or remove exercises on the fly. If you change a recurring day, you can apply the change to just that week or to every instance of that day going forward.", target: 'today' },
  { title: 'Set-by-Set Logging', text: "When you train, log each set individually. Tap the reps and weight fields and adjust with plus and minus buttons. After you log your last set, you'll rate how hard the workout felt on a scale of 1 to 10. The app tracks this to learn your recovery needs." },
  { title: 'Rest Timer', text: "After each set, the rest timer starts automatically. It counts down visually with a circular progress bar. You can skip it, add 30 seconds, or subtract 30 seconds. When it completes, you'll feel a vibration and hear a sound. Your phone stays awake so you never miss the cue." },
  { title: 'Idle Display Mode', text: "During rest, your screen dims to 30 percent brightness to save battery. The timer stays visible and bright. Your phone refreshes at 1 hertz so it's easier to read in bright gyms. Tap anywhere to wake the screen back up. This keeps your hands free for stretching or recovery." },
  { title: 'Exercise Reordering', text: "Long-press the three-dot handle on the left side of any exercise to drag and reorder. The app saves your new order automatically. No need to confirm, just drag, drop and go. Useful when you want to adjust your warm-up or exercise flow." },
  { title: 'Cardio and Sports Database', text: "Not just lifting. Open the Cardio menu to log running, cycling, rowing, machines and sports like tennis, padel or boxing. Each has its own settings for duration, intensity and recovery tracking. Mix and match with your lift days or go full cardio if that's your thing.", target: 'menu' },
  { title: 'Meal Logging', text: "The Meals tab is where nutrition happens. You can search for foods by typing their name, take a photo of your meal to auto-recognize what's in it, or scan a barcode on any packaged food. All three methods pull real nutrition data so your macro tracking stays accurate.", target: 'nutri' },
  { title: 'Barcode Scanning', text: "Tap the barcode button to scan any food packaging. Point your camera at the barcode and the app instantly looks it up. You'll see the food name, nutrition facts and serving size. Adjust the quantity if you're eating more or less than one serving, then tap Confirm. It's the fastest way to log packaged foods accurately." },
  { title: 'Privacy, Backup and Feedback', text: "Your health data is stored locally on your device and never leaves the app. Nothing is encrypted or sent anywhere. You can export your data anytime as a backup and import it on a new device. Use the Feedback tab to report bugs or suggest features. Everything you do here is just for you. Ready to train?", target: 'menu', final: true },
];
const ONB_DEFAULTS = { name: '', sex: 'Male', age: '', height: '', weight: '', goal: 'Maintain', activity: 'Moderately Active' };

const DEFAULT_EX = {
  Push: [
    { name: 'Bench Press', sets: 4, reps: 8, weight: 60 },
    { name: 'Overhead Press', sets: 3, reps: 10, weight: 40 },
    { name: 'Incline DB Press', sets: 3, reps: 12, weight: 24 },
    { name: 'Triceps Pushdown', sets: 4, reps: 15, weight: 25 },
  ],
  Pull: [
    { name: 'Deadlift', sets: 4, reps: 6, weight: 100 },
    { name: 'Pull-Up', sets: 4, reps: 8, weight: 0 },
    { name: 'Barbell Row', sets: 4, reps: 10, weight: 60 },
    { name: 'Bicep Curl', sets: 3, reps: 12, weight: 16 },
  ],
  Legs: [
    { name: 'Back Squat', sets: 4, reps: 8, weight: 80 },
    { name: 'Leg Press', sets: 4, reps: 12, weight: 140 },
    { name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 70 },
    { name: 'Calf Raise', sets: 4, reps: 15, weight: 45 },
  ],
  Custom: [],
};

const CARDIO_TYPES = ['Running / Sprinting', 'Cycling', 'Rowing', 'Machines', 'Sports', 'Other'];
function seedCardioDb() {
  const mk = (name, description, equipment, defaultDuration, type) => ({ name, description, equipment, defaultDuration, type });
  return {
    'Running / Sprinting': [
      mk('Steady-State Running', 'Continuous running at a conversational pace. Builds aerobic base and endurance.', 'Treadmill or outdoors', 30, 'Running / Sprinting'),
      mk('Interval Running (HIIT)', 'Alternating hard sprints and recovery jogs. Torches calories and boosts VO2 max.', 'Treadmill or outdoors', 20, 'Running / Sprinting'),
      mk('Tempo Running', 'Sustained effort at a comfortably-hard pace. Raises your lactate threshold.', 'Treadmill or outdoors', 25, 'Running / Sprinting'),
      mk('Long-Distance Running', 'Extended low-intensity run. Deep aerobic conditioning and mental resilience.', 'Outdoors', 45, 'Running / Sprinting'),
    ],
    'Cycling': [
      mk('Stationary Bike', 'Low-impact cardio using a stationary bike. Great for leg endurance and recovery days.', 'Stationary bike', 20, 'Cycling'),
      mk('Spin Class', 'High-energy guided cycling with intervals and climbs. Strong calorie burn.', 'Spin bike', 45, 'Cycling'),
      mk('Road Cycling', 'Outdoor cycling over varied terrain. Builds endurance and leg power.', 'Road bike', 60, 'Cycling'),
      mk('Mountain Biking', 'Off-road cycling with climbs and technical descents. Full-body engagement.', 'Mountain bike', 50, 'Cycling'),
    ],
    'Rowing': [
      mk('Rowing Machine', 'Full-body cardio combining legs, core and back. Efficient low-impact conditioning.', 'Rowing machine', 20, 'Rowing'),
      mk('Water Rowing', 'Rowing on open water. Adds balance and real resistance to the stroke.', 'Rowing shell', 30, 'Rowing'),
    ],
    'Machines': [
      mk('Stairmaster', 'Continuous stair climbing. Hits glutes and calves while spiking the heart rate.', 'Stair machine', 20, 'Machines'),
      mk('Elliptical Machine', 'Smooth low-impact full-body cardio. Kind on the joints.', 'Elliptical', 25, 'Machines'),
      mk('Treadmill Sprint', 'Short maximal sprints with rest. Explosive power and conditioning.', 'Treadmill', 15, 'Machines'),
    ],
    'Sports': [
      mk('Tennis', 'Fast-paced racket sport with sprints, lunges and rotation. Sharpens agility and reflexes.', 'Racket, court', 60, 'Sports'),
      mk('Padel', 'Doubles racket sport in an enclosed court. Constant movement and quick exchanges.', 'Padel racket, court', 60, 'Sports'),
      mk('Squash', 'High-intensity racket sport in a walled court. Relentless sprinting and direction changes.', 'Racket, court', 45, 'Sports'),
      mk('Badminton', 'Explosive racket sport with jumps and quick footwork. Great for speed and coordination.', 'Racket, shuttlecock', 60, 'Sports'),
      mk('Pickleball', 'Paddle sport blending tennis and ping-pong. Social, fast and joint-friendly.', 'Paddle, court', 60, 'Sports'),
      mk('Basketball', 'Team sport with sprints, jumps and cuts. Builds explosive power and endurance.', 'Ball, court', 60, 'Sports'),
      mk('Volleyball', 'Team sport built on jumps, dives and quick reactions. Strong lower-body conditioning.', 'Ball, net, court', 60, 'Sports'),
      mk('Futsal', 'Fast indoor five-a-side football. Continuous movement and ball control.', 'Ball, court', 60, 'Sports'),
      mk('Football (Soccer)', 'Endurance team sport with sprints and jogging over a large pitch. Deep aerobic work.', 'Ball, pitch', 90, 'Sports'),
      mk('Rugby', 'Physical contact team sport combining sprints, tackles and collisions. Full-body demand.', 'Ball, pitch', 80, 'Sports'),
      mk('Boxing', 'Striking sport with rounds of punching, footwork and defence. Huge conditioning burn.', 'Gloves, bag or partner', 45, 'Sports'),
      mk('MMA', 'Mixed martial arts combining striking and grappling. Total-body, high-intensity training.', 'Gloves, mats', 60, 'Sports'),
      mk('Brazilian Jiu-Jitsu', 'Grappling martial art focused on ground control and submissions. Strength and stamina.', 'Gi or no-gi, mats', 60, 'Sports'),
      mk('Judo', 'Throwing and grappling martial art. Explosive power, grip and core strength.', 'Gi, mats', 60, 'Sports'),
      mk('Karate', 'Striking martial art with kata and sparring. Balance, speed and discipline.', 'Gi, mats', 60, 'Sports'),
      mk('Muay Thai', 'Stand-up striking with fists, elbows, knees and shins. Brutal all-round conditioning.', 'Gloves, pads or bag', 60, 'Sports'),
      mk('Swimming (Competitive)', 'Structured lap swimming with intervals and drills. Full-body, high aerobic output.', 'Pool', 60, 'Sports'),
      mk('Surfing', 'Paddling and riding waves. Upper-body endurance, balance and core control.', 'Surfboard, wetsuit', 90, 'Sports'),
      mk('Kayaking', 'Paddling across water. Sustained upper-body and core conditioning.', 'Kayak, paddle', 60, 'Sports'),
      mk('Water Polo', 'Team water sport combining treading, sprint swimming and passing. Elite conditioning.', 'Ball, pool', 60, 'Sports'),
    ],
    'Other': [
      mk('Jump Rope', 'Fast-paced skipping. Builds coordination, calf endurance and quick feet.', 'Jump rope', 10, 'Other'),
      mk('Swimming', 'Full-body low-impact cardio. Excellent for recovery and lung capacity.', 'Pool', 30, 'Other'),
      mk('Kickboxing', 'Striking combos and footwork. High-intensity, full-body and core-heavy.', 'Bag or bodyweight', 30, 'Other'),
      mk('Battle Ropes', 'Explosive wave and slam patterns. Conditioning for shoulders and grip.', 'Battle ropes', 12, 'Other'),
      mk('Sled Push', 'Driving a weighted sled. Brutal leg and cardio finisher.', 'Prowler sled', 12, 'Other'),
    ],
  };
}
function migrateCardioDb(saved) {
  const seed = seedCardioDb();
  if (!saved) return seed;
  const out = {};
  CARDIO_TYPES.forEach(t => { out[t] = Array.isArray(saved[t]) ? saved[t] : (seed[t] || []); });
  return out;
}

const fmt = (n) => Math.round(n).toLocaleString() + ' kg';
const fmtDate = (iso) => { try { return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return iso; } };
const MONTH_ABBR = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
function migrateArchive(arr) {
  return (arr || []).map(w => {
    let sessions = w.sessions || [];
    let dates = sessions.map(se => se.date).filter(Boolean).sort();
    if (!dates.length) {
      const m = /^Week of\s+(\d{1,2})\s+([A-Za-z]{3,})/i.exec(w.label || '');
      if (m) {
        const day = parseInt(m[1], 10);
        const mi = MONTH_ABBR.indexOf(m[2].toLowerCase().slice(0, 3));
        if (mi >= 0) {
          const start = new Date(2026, mi, day);
          sessions = sessions.map(se => {
            const offset = DAYS.indexOf(se.day);
            const d = new Date(start); d.setDate(d.getDate() + (offset >= 0 ? offset : 0));
            return se.date ? se : { ...se, date: d.toISOString().slice(0, 10) };
          });
          dates = sessions.map(se => se.date).filter(Boolean).sort();
        }
      }
    }
    if (dates.length) return { ...w, sessions, label: 'From ' + fmtDate(dates[0]) + ' to ' + fmtDate(dates[dates.length - 1]) };
    return { ...w, sessions };
  });
}
const exVol = (e) => { if (e.cardio) return 0; const lg = e.logged || []; const sets = e.sets || 0; const t = (e.reps || 0) * (e.weight || 0); let v = 0; for (let i = 0; i < sets; i++) { const l = lg[i]; v += l ? (l.skipped ? 0 : (l.reps || 0) * (l.weight || 0)) : t; } return v; };
// Numeric-input value: keep the field empty when cleared (so typing a fresh
// digit replaces cleanly) instead of snapping back to a leading 0.
const numOrEmpty = (raw, float) => { if (raw === '' || raw == null) return ''; const n = float ? parseFloat(raw) : parseInt(raw, 10); return Number.isNaN(n) ? '' : n; };
const W_DEFAULTS = { rest: 90, vibrate: true, sound: 'ding', keepAwake: true, idleDelay: 10, idleDim: 30 };
const scheme = (e) => e.cardio ? ((e.duration || 0) + ' min · ' + (e.intensity || 'Moderate')) : ((e.sets || 0) + ' × ' + (e.reps || 0) + ' × ' + (e.weight || 0) + 'kg');

function seedSessions(week, program) {
  const s = {};
  DAYS.forEach(d => {
    const t = week[d];
    if (t && t !== 'Rest') {
      const templ = program && program[d] ? program[d].exercises : (DEFAULT_EX[t] || []);
      s[d] = { exercises: templ.map(x => ({ ...x })), completed: false, notes: '' };
    }
  });
  return s;
}

function seedExerciseDb() {
  const mk = (name, description, equipment) => ({ name, description, equipment });
  return {
    chest: [
      mk('Barbell Bench Press', 'Flat-bench horizontal press with a barbell; the primary compound chest builder.', 'Barbell, flat bench'),
      mk('Incline Barbell Bench Press', 'Barbell press on a 30–45° incline targeting the upper chest.', 'Barbell, incline bench'),
      mk('Decline Barbell Bench Press', 'Barbell press on a declined bench emphasising the lower chest.', 'Barbell, decline bench'),
      mk('Dumbbell Bench Press', 'Flat-bench dumbbell press for greater range of motion than the barbell.', 'Dumbbells, flat bench'),
      mk('Incline Dumbbell Press', 'Dumbbell press on an incline bench for the upper chest.', 'Dumbbells, incline bench'),
      mk('Decline Dumbbell Press', 'Dumbbell press on a decline bench for the lower chest.', 'Dumbbells, decline bench'),
      mk('Dumbbell Fly', 'Wide arcing movement on a flat bench to stretch and isolate the chest.', 'Dumbbells, flat bench'),
      mk('Incline Dumbbell Fly', 'Fly on an incline bench to bias the upper chest.', 'Dumbbells, incline bench'),
      mk('Cable Crossover', 'Standing cable fly bringing both handles together for constant tension.', 'Cable machine — dual D-handle attachments'),
      mk('Low-to-High Cable Fly', 'Cable fly driven upward to target the upper chest.', 'Cable machine — dual D-handle attachments'),
      mk('Machine Chest Press', 'Seated press on a plate- or pin-loaded machine.', 'Chest press machine'),
      mk('Pec Deck', 'Seated machine fly isolating the chest through a fixed arc.', 'Pec deck machine'),
      mk('Push-Up', 'Bodyweight horizontal press from the floor.', 'Bodyweight'),
      mk('Incline Push-Up', 'Push-up with hands elevated to reduce load.', 'Bodyweight, bench or elevated surface'),
      mk('Chest Dip', 'Forward-leaning dip on parallel bars to load the lower chest.', 'Dip bars'),
    ],
    back: [
      mk('Deadlift', 'Full-body hip-hinge lifting a barbell from the floor.', 'Barbell'),
      mk('Rack Pull', 'Partial deadlift from an elevated rack to overload the upper back and lockout.', 'Barbell, power rack'),
      mk('Pull-Up', 'Bodyweight vertical pull with an overhand grip.', 'Pull-up bar'),
      mk('Chin-Up', 'Vertical pull with an underhand grip, biasing the biceps.', 'Pull-up bar'),
      mk('Wide-Grip Lat Pulldown', 'Cable pulldown with a wide grip for lat width.', ['Wide lat bar', 'Close-grip / V-bar', 'Straight bar']),
      mk('Close-Grip Lat Pulldown', 'Pulldown with a close/neutral grip for lat thickness.', ['V-bar', 'Close-grip handle', 'Wide lat bar']),
      mk('Bent-Over Barbell Row', 'Hinged-torso barbell row to the waist for back thickness.', 'Barbell'),
      mk('Pendlay Row', 'Explosive barbell row from a dead stop each rep.', 'Barbell'),
      mk('T-Bar Row', 'Landmine row for mid-back thickness.', ['V-handle', 'Wide grip', 'Close grip']),
      mk('Seated Cable Row', 'Seated horizontal cable pull to the torso.', ['V-bar', 'Wide bar', 'Rope']),
      mk('Single-Arm Dumbbell Row', 'One-arm dumbbell row braced on a bench.', 'Dumbbell, flat bench'),
      mk('Chest-Supported Row', 'Row face-down on an incline bench to remove lower-back strain.', 'Dumbbells or machine, incline bench'),
      mk('Straight-Arm Pulldown', 'Cable pullover-style movement isolating the lats.', ['Straight bar', 'Rope']),
      mk('Face Pull', 'High cable pull to the face for rear delts and upper back.', 'Cable machine — rope attachment'),
      mk('Back Extension', 'Hip-hinge extension on a roman chair for the lower back and glutes.', 'Back extension bench'),
    ],
    shoulders: [
      mk('Overhead Barbell Press', 'Standing vertical barbell press overhead.', 'Barbell'),
      mk('Seated Dumbbell Shoulder Press', 'Seated overhead press with dumbbells.', 'Dumbbells, bench'),
      mk('Arnold Press', 'Rotating dumbbell overhead press hitting all three delt heads.', 'Dumbbells, bench'),
      mk('Push Press', 'Overhead press using a slight leg drive for heavier loads.', 'Barbell'),
      mk('Lateral Raise', 'Dumbbell raise out to the sides for medial delt width.', 'Dumbbells'),
      mk('Cable Lateral Raise', 'Single-arm cable lateral for constant tension.', 'Cable machine — D-handle attachment'),
      mk('Front Raise', 'Raise to the front for the anterior delt.', ['Dumbbells', 'Barbell', 'Cable']),
      mk('Rear Delt Fly', 'Bent-over reverse fly for the rear delts.', 'Dumbbells'),
      mk('Reverse Pec Deck', 'Machine reverse fly isolating the rear delts.', 'Pec deck machine'),
      mk('Face Pull', 'High cable pull to the face for rear delts and upper back.', 'Cable machine — rope attachment'),
      mk('Upright Row', 'Vertical pull to the collarbone for delts and traps.', ['EZ-bar', 'Straight bar', 'Rope', 'Dumbbells']),
      mk('Barbell Shrug', 'Straight-up trap shrug with a barbell.', 'Barbell'),
      mk('Dumbbell Shrug', 'Trap shrug holding dumbbells at the sides.', 'Dumbbells'),
    ],
    biceps: [
      mk('Barbell Curl', 'Standing two-arm curl with a straight barbell.', 'Barbell'),
      mk('EZ-Bar Curl', 'Curl on an angled EZ-bar to ease wrist strain.', 'EZ-bar'),
      mk('Dumbbell Curl', 'Standing curl with dumbbells, one or both arms.', 'Dumbbells'),
      mk('Hammer Curl', 'Neutral-grip dumbbell curl for the brachialis and forearms.', 'Dumbbells'),
      mk('Incline Dumbbell Curl', 'Curl seated back on an incline bench for a deeper stretch.', 'Dumbbells, incline bench'),
      mk('Preacher Curl', 'Curl braced on a preacher bench to isolate the biceps.', ['EZ-bar — preacher bench', 'Dumbbells — preacher bench']),
      mk('Concentration Curl', 'Seated single-arm curl braced against the thigh.', 'Dumbbell'),
      mk('Cable Curl', 'Standing curl against constant cable tension.', ['Straight bar', 'EZ-bar', 'Rope']),
      mk('Spider Curl', 'Curl lying face-down on an incline bench for peak contraction.', ['Dumbbells — incline bench', 'EZ-bar — incline bench']),
    ],
    triceps: [
      mk('Close-Grip Bench Press', 'Narrow-grip barbell press emphasising the triceps.', 'Barbell, flat bench'),
      mk('Tricep Pushdown', 'Standing cable pushdown for the triceps.', ['Rope', 'V-bar', 'Straight bar']),
      mk('Rope Pushdown', 'Pushdown with a rope for a stronger contraction at the bottom.', 'Cable machine — rope attachment'),
      mk('Overhead Tricep Extension', 'Overhead extension stretching the long head.', ['Dumbbell', 'EZ-bar']),
      mk('Overhead Cable Extension', 'Overhead triceps extension against cable tension.', ['Rope', 'Straight bar']),
      mk('Skull Crusher', 'Lying triceps extension lowering the bar to the forehead.', ['EZ-bar — flat bench', 'Dumbbells — flat bench']),
      mk('Tricep Dip', 'Upright dip on parallel bars to load the triceps.', 'Dip bars'),
      mk('Bench Dip', 'Dip with hands on a bench and feet out front.', 'Bench'),
      mk('Tricep Kickback', 'Bent-over dumbbell extension behind the body.', ['Dumbbells', 'Cable']),
      mk('Diamond Push-Up', 'Close-hand push-up biasing the triceps.', 'Bodyweight'),
    ],
    quads: [
      mk('Back Squat', 'Barbell squat with the bar on the upper back; the core lower-body lift.', 'Barbell, squat rack'),
      mk('Front Squat', 'Squat with the bar racked on the front delts, biasing the quads.', 'Barbell, squat rack'),
      mk('Hack Squat', 'Machine squat on a fixed sled angle.', 'Hack squat machine'),
      mk('Leg Press', 'Seated press driving a loaded sled with the legs.', 'Leg press machine'),
      mk('Walking Lunge', 'Alternating forward lunges covering ground.', ['Bodyweight', 'Dumbbells']),
      mk('Bulgarian Split Squat', 'Rear-foot-elevated single-leg squat.', ['Bodyweight', 'Dumbbells — bench']),
      mk('Step-Up', 'Stepping onto a raised platform under load.', ['Bodyweight', 'Dumbbells — box/bench']),
      mk('Goblet Squat', 'Squat holding a single dumbbell or kettlebell at the chest.', ['Dumbbell', 'Kettlebell']),
      mk('Leg Extension', 'Seated machine extension isolating the quads.', 'Leg extension machine'),
    ],
    hamstrings: [
      mk('Romanian Deadlift', 'Hip-hinge with soft knees loading the hamstrings and glutes.', ['Barbell', 'Dumbbells']),
      mk('Stiff-Leg Deadlift', 'Straighter-leg deadlift for a deeper hamstring stretch.', 'Barbell'),
      mk('Leg Curl', 'Lying machine curl for the hamstrings.', 'Leg curl machine'),
      mk('Seated Leg Curl', 'Seated machine hamstring curl.', 'Seated leg curl machine'),
      mk('Hip Thrust', 'Barbell glute bridge with shoulders on a bench.', 'Barbell, bench'),
    ],
    calves: [
      mk('Standing Calf Raise', 'Standing plantarflexion for the gastrocnemius.', ['Standing calf raise machine', 'Dumbbells']),
      mk('Seated Calf Raise', 'Seated raise biasing the soleus.', 'Seated calf raise machine'),
    ],
    'rear-delts': [],
    abdominals: [
      mk('Plank', 'Isometric forearm hold bracing the core.', 'Bodyweight'),
      mk('Side Plank', 'Isometric side hold for the obliques.', 'Bodyweight'),
      mk('Hanging Leg Raise', 'Hanging straight-leg raise to hip/waist height.', 'Pull-up bar'),
      mk('Hanging Knee Raise', 'Hanging knee tuck, an easier progression.', 'Pull-up bar'),
      mk('Cable Crunch', 'Kneeling crunch against cable resistance.', 'Cable machine — rope attachment'),
      mk('Crunch', 'Short-range floor crunch for the upper abs.', 'Bodyweight'),
      mk('Sit-Up', 'Full-range floor sit-up.', 'Bodyweight'),
      mk('Russian Twist', 'Seated rotational twist for the obliques.', ['Bodyweight', 'Weight plate', 'Dumbbell']),
      mk('Ab Wheel Rollout', 'Kneeling rollout for anti-extension strength.', 'Ab wheel'),
      mk('Bicycle Crunch', 'Alternating elbow-to-knee crunch for the obliques.', 'Bodyweight'),
      mk('Mountain Climber', 'Plank-position knee drives.', 'Bodyweight'),
      mk('Dead Bug', 'Supine limb-lowering drill for core stability.', 'Bodyweight'),
      mk('Leg Raise', 'Lying straight-leg raise for the lower abs.', 'Bodyweight'),
    ],
  };
}

function migrateExerciseDb(saved) {
  const seed = seedExerciseDb();
  if (!saved) return seed;
  const out = {};
  Object.keys(seed).forEach(k => {
    const seedList = seed[k];
    const seedNames = new Set(seedList.map(x => x.name));
    const extras = (saved[k] || []).filter(x => x && !seedNames.has(x.name)).map(x => ({ name: x.name, description: x.description || '', equipment: x.equipment != null ? x.equipment : '' }));
    out[k] = seedList.concat(extras);
  });
  Object.keys(saved).forEach(k => { if (!out[k]) out[k] = saved[k]; });
  return out;
}

function eqToOptions(eq) { return Array.isArray(eq) ? eq.slice() : (eq ? [eq] : ['']); }
function eqLabel(eq) { return Array.isArray(eq) ? eq.join(' · ') : (eq || ''); }

const KEY = 'lt_lifts_v1';
const BODY_PARTS = [
  { key: 'chest', label: 'Chest', tint: 'rgba(123,140,110,.16)' },
  { key: 'shoulders', label: 'Shoulders', tint: 'rgba(192,137,90,.16)' },
  { key: 'biceps', label: 'Biceps', tint: 'rgba(156,127,102,.16)' },
  { key: 'triceps', label: 'Triceps', tint: 'rgba(156,127,102,.16)' },
  { key: 'back', label: 'Back', tint: 'rgba(110,139,156,.16)' },
  { key: 'rear-delts', label: 'Rear Delts', tint: 'rgba(192,137,90,.16)' },
  { key: 'hamstrings', label: 'Hamstrings', tint: 'rgba(168,159,146,.16)' },
  { key: 'quads', label: 'Quads', tint: 'rgba(168,159,146,.16)' },
  { key: 'calves', label: 'Calves', tint: 'rgba(123,140,110,.16)' },
  { key: 'abdominals', label: 'Abdominals', tint: 'rgba(110,139,156,.16)' },
];

const PLATE = 'M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z M3.2 3v4a1.3 1.3 0 0 0 2.6 0V3 M4.5 3v18 M20.8 3c-1.3 1.5-1.9 3.2-1.9 5.4 0 1.5.6 2.2 1.9 2.5V21';
const MACRO_COLORS = { p: '#6E8B7E', c: '#C0895A', f: '#B0715E' };
const ACTIVITY = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'];
const ACTIVITY_MULT = { 'Sedentary': 1.2, 'Lightly Active': 1.375, 'Moderately Active': 1.55, 'Very Active': 1.725, 'Extremely Active': 1.9 };
const GOALS = ['Lose Weight', 'Maintain', 'Gain Muscle'];
const GOAL_RULES = { 'Lose Weight': { pk: 1.6, c: .40, f: .25, adj: -.15 }, 'Maintain': { pk: 1.6, c: .45, f: .30, adj: 0 }, 'Gain Muscle': { pk: 1.8, c: .50, f: .25, adj: .10 } };
const DEFAULT_RECOVERY = { tolerance: 'moderate', learned_consecutive_days: 2, learned_weekly_load_threshold: 40, confidence: 0, sample_size: 0, last_updated: null };
const RPE_SCALE = [
  { n: 1, label: 'Very easy', sub: 'Warm-up level' },
  { n: 2, label: 'Easy', sub: '' },
  { n: 3, label: 'Easy-moderate', sub: '' },
  { n: 4, label: 'Moderate', sub: '' },
  { n: 5, label: 'Moderate-hard', sub: '' },
  { n: 6, label: 'Hard', sub: '' },
  { n: 7, label: 'Very hard', sub: '' },
  { n: 8, label: 'Intense', sub: 'Close to max' },
  { n: 9, label: 'Very intense', sub: 'Near failure' },
  { n: 10, label: 'Maximal', sub: 'Absolute limit' },
];
// per 100g: kcal, protein, carbs, fat
const FOOD_DB = [
  { name: 'Chicken breast (cooked)', cal: 165, p: 31, c: 0, f: 3.6 },
  { name: 'White rice (cooked)', cal: 130, p: 2.7, c: 28, f: 0.3 },
  { name: 'Brown rice (cooked)', cal: 112, p: 2.3, c: 24, f: 0.8 },
  { name: 'Egg (whole)', cal: 155, p: 13, c: 1.1, f: 11 },
  { name: 'Oats (dry)', cal: 389, p: 17, c: 66, f: 7 },
  { name: 'Banana', cal: 89, p: 1.1, c: 23, f: 0.3 },
  { name: 'Apple', cal: 52, p: 0.3, c: 14, f: 0.2 },
  { name: 'Whole milk', cal: 61, p: 3.2, c: 4.8, f: 3.3 },
  { name: 'Greek yogurt', cal: 97, p: 9, c: 3.9, f: 5 },
  { name: 'Salmon (cooked)', cal: 208, p: 20, c: 0, f: 13 },
  { name: 'Beef mince 5% (cooked)', cal: 137, p: 21, c: 0, f: 5 },
  { name: 'Tuna (canned in water)', cal: 116, p: 26, c: 0, f: 1 },
  { name: 'Pasta (cooked)', cal: 158, p: 5.8, c: 31, f: 0.9 },
  { name: 'White bread', cal: 265, p: 9, c: 49, f: 3.2 },
  { name: 'Potato (boiled)', cal: 87, p: 1.9, c: 20, f: 0.1 },
  { name: 'Sweet potato (baked)', cal: 86, p: 1.6, c: 20, f: 0.1 },
  { name: 'Olive oil', cal: 884, p: 0, c: 0, f: 100 },
  { name: 'Peanut butter', cal: 588, p: 25, c: 20, f: 50 },
  { name: 'Whey protein powder', cal: 400, p: 80, c: 8, f: 6 },
  { name: 'Broccoli', cal: 34, p: 2.8, c: 7, f: 0.4 },
  { name: 'Avocado', cal: 160, p: 2, c: 9, f: 15 },
  { name: 'Cheddar cheese', cal: 403, p: 25, c: 1.3, f: 33 },
  { name: 'Halloumi', cal: 321, p: 22, c: 2.2, f: 25 },
  { name: 'Almonds', cal: 579, p: 21, c: 22, f: 50 },
  { name: 'Honey', cal: 304, p: 0.3, c: 82, f: 0 },
  { name: 'Lentils (cooked)', cal: 116, p: 9, c: 20, f: 0.4 },
];
const fmtKcal = (n) => Math.round(n).toLocaleString();
const mealMacroLine = (m) => 'P ' + Math.round(m.protein) + 'g · C ' + Math.round(m.carbs) + 'g · F ' + Math.round(m.fat) + 'g · ' + fmtKcal(m.calories) + ' kcal';
const GPU = (it) => it.unit === 'oz' ? 28.35 : 1;
const itemMacros = (it) => { const g = GPU(it); return 'P ' + Math.round(it.pgP * it.qty * g) + ' · C ' + Math.round(it.pgC * it.qty * g) + ' · F ' + Math.round(it.pgF * it.qty * g) + ' · ' + Math.round(it.pgCal * it.qty * g) + ' kcal'; };
const sumItems = (items) => (items || []).reduce((a, it) => ({ protein: a.protein + it.pgP * it.qty * GPU(it), carbs: a.carbs + it.pgC * it.qty * GPU(it), fat: a.fat + it.pgF * it.qty * GPU(it), calories: a.calories + it.pgCal * it.qty * GPU(it) }), { protein: 0, carbs: 0, fat: 0, calories: 0 });
const timeLabel = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export {
  DAYS, FULL, TYPES, TYPE_COLOR, TYPE_TINT, DUMBBELL, SNEAKER, HEART, MOON, TYPE_ICON,
  INTENSITIES, typeLabel, TUT_STEPS, ONB_DEFAULTS, DEFAULT_EX, CARDIO_TYPES, seedCardioDb,
  migrateCardioDb, fmt, fmtDate, MONTH_ABBR, migrateArchive, exVol, W_DEFAULTS, scheme,
  seedSessions, seedExerciseDb, migrateExerciseDb, eqToOptions, eqLabel, KEY, BODY_PARTS,
  PLATE, MACRO_COLORS, ACTIVITY, ACTIVITY_MULT, GOALS, GOAL_RULES, DEFAULT_RECOVERY,
  RPE_SCALE, FOOD_DB, fmtKcal, mealMacroLine, GPU, itemMacros, sumItems, timeLabel,
  numOrEmpty,
};
