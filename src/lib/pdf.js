// Program report -> a real PDF file (#9).
//
// The report used to be printed through window.print(), which an installed iOS PWA
// ignores without an error, so "Export PDF" looked like a dead button. This draws the
// same report (buildProgramReport's shape) with jsPDF and hands the file over: the share
// sheet in an installed app (where a download link has nowhere to go), a normal download
// everywhere else. jsPDF is loaded on demand so it stays out of the main bundle;
// preloadPdf() warms it when a screen with an export button opens, so the share sheet is
// still reached while the tap's user activation is fresh.

let jsPdfPromise = null;
export function preloadPdf() {
  if (!jsPdfPromise) jsPdfPromise = import('jspdf').then(m => m.jsPDF || m.default);
  return jsPdfPromise;
}

// The standard PDF fonts only cover WinAnsi; anything outside it would print as junk.
const SUBST = { '→': '->', '▾': ' drop ', '−': '-', '✓': '', ' ': ' ', ' ': ' ' };
const clean = (t) => String(t == null ? '' : t)
  .replace(/[→▾−✓  ]/g, ch => SUBST[ch])
  .replace(/[^\x20-\x7e -ÿ–—·×‘’“”•…]/g, '');

function render(JsPDF, r) {
  const doc = new JsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const M = 42, right = W - M;
  let y = M;
  const ensure = (h) => { if (y + h > H - M) { doc.addPage(); y = M; } };
  const font = (size, bold, gray) => { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.setTextColor(gray == null ? 17 : gray); };
  const rule = (weight) => { doc.setDrawColor(weight > 1 ? 51 : 210); doc.setLineWidth(weight || .6); doc.line(M, y, right, y); };
  // A left label and a right value on one line; a long left side wraps under itself.
  const row = (left, rightText, opts) => {
    const o = opts || {};
    font(o.size || 10, o.bold, o.gray);
    const rw = rightText ? doc.getTextWidth(clean(rightText)) + 12 : 0;
    const lines = doc.splitTextToSize(clean(left), right - M - rw);
    const lh = (o.size || 10) * 1.35;
    ensure(lines.length * lh + 2);
    doc.text(lines, M, y + (o.size || 10));
    if (rightText) { font(o.size || 10, o.rightBold, o.rightGray); doc.text(clean(rightText), right, y + (o.size || 10), { align: 'right' }); }
    y += lines.length * lh + (o.after || 3);
  };
  const heading = (t) => { ensure(40); y += 12; rule(1.2); y += 8; row(t, '', { size: 13, bold: true, after: 4 }); };

  row(r.name, '', { size: 20, bold: true, after: 2 });
  row((r.status ? r.status + ' · ' : '') + r.range, '', { size: 10.5, gray: 85, after: 6 });

  heading('Summary');
  (r.summary || []).forEach(s => row(s.label, s.value, { gray: 51, rightBold: true }));

  if ((r.planDays || []).length) {
    heading('Program');
    r.planDays.forEach(d => {
      y += 2; row(d.title, '', { bold: true, after: 2 });
      d.exercises.forEach(ex => row('   ' + ex.name, ex.scheme, { size: 9.5, gray: 51, rightGray: 102 }));
    });
  }

  if (r.hasWeeks) {
    heading('Volume by week');
    r.weeks.forEach(w => row(w.label + ' · ' + w.count, w.volume, { gray: 51, rightBold: true }));
  }

  if (r.hasTrends) {
    heading('Progression');
    row('Top working weight, first logged session to last.', '', { size: 9, gray: 120, after: 4 });
    r.trends.forEach(t => row(t.name, t.line + '   ' + t.delta, { gray: 51 }));
  }

  heading('Completed days');
  if (!r.hasDays) row('No days were completed while this program ran.', '', { gray: 120 });
  (r.days || []).forEach(d => {
    ensure(48);
    y += 6; rule(.6); y += 6;
    row(d.title, d.volume, { size: 11, bold: true, rightBold: true, after: 1 });
    row(d.dateLabel + (d.rpe ? ' · ' + d.rpe : ''), '', { size: 9, gray: 120, after: 4 });
    d.exercises.forEach(ex => row('   ' + ex.name + ':  ' + ex.detail, ex.volume, { size: 9.5, gray: 51, rightGray: 140 }));
    if (d.notes) row('   “' + d.notes + '”', '', { size: 9, gray: 100 });
  });

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); font(8, false, 150);
    doc.text('Cadence · ' + clean(r.name) + ' · page ' + i + ' of ' + pages, W / 2, H - 20, { align: 'center' });
  }
  return doc;
}

// Resolves 'shared', 'downloaded' or 'cancelled'; rejects if the PDF can't be built.
export async function downloadProgramPdf(report, filename) {
  const JsPDF = await preloadPdf();
  const blob = render(JsPDF, report).output('blob');
  const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (standalone && typeof File === 'function' && navigator.canShare) {
    const file = new File([blob], filename, { type: 'application/pdf' });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: report.name }); return 'shared'; }
      catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
        // Activation expired or sharing refused: fall through to a plain download.
        console.warn('[cadence] PDF share failed, downloading instead', e);
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
  return 'downloaded';
}
