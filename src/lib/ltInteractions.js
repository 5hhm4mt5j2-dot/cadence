// Ported from the Claude Design export's lt-interactions.js.
// Sets up window.LTTheme, window.LT (pull-to-refresh) and mount animations.
// Imported for its side effects from main.jsx.

(function () {
  // Theme resolution: system preference, cached to localStorage
  window.LTTheme = {
    resolve: function () {
      try {
        var stored = localStorage.getItem('lt_theme');
        if (stored) return stored;
        var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return dark ? 'dark' : 'light';
      } catch (e) { return 'light'; }
    },
    set: function (t) {
      try { localStorage.setItem('lt_theme', t); } catch (e) {}
      window.dispatchEvent(new CustomEvent('lt-theme', { detail: t }));
    }
  };

  // Pull-to-refresh + subtle entrance/sheet animations
  window.LT = {
    attach: function (opts) {
      opts = opts || {};
      var scroller = document.querySelector('[data-lt-scroll]');
      var ptr = document.querySelector('[data-lt-ptr]');
      if (!scroller) return function () {};

      var startY = null, pulling = false, refreshing = false, dist = 0;
      var THRESHOLD = 64;

      function setPtr(d) {
        if (!ptr) return;
        var pct = Math.min(1, d / THRESHOLD);
        ptr.style.height = Math.min(d, THRESHOLD + 12) + 'px';
        ptr.style.opacity = pct;
        ptr.textContent = refreshing ? 'Refreshing…' : (pct >= 1 ? 'Release to refresh' : 'Pull to refresh');
      }

      function onStart(e) {
        if (scroller.scrollTop > 0 || refreshing) { startY = null; return; }
        startY = (e.touches ? e.touches[0].clientY : e.clientY);
        pulling = true;
      }
      function onMove(e) {
        if (!pulling || startY === null) return;
        var y = (e.touches ? e.touches[0].clientY : e.clientY);
        dist = Math.max(0, y - startY);
        if (dist > 0) { e.preventDefault && e.preventDefault(); setPtr(dist); }
      }
      function onEnd() {
        if (!pulling) return;
        pulling = false;
        if (dist >= THRESHOLD && !refreshing) {
          refreshing = true;
          setPtr(THRESHOLD);
          var p = opts.onRefresh ? opts.onRefresh() : Promise.resolve();
          Promise.resolve(p).then(function () {
            refreshing = false;
            dist = 0;
            setPtr(0);
            if (ptr) { ptr.style.height = '0px'; ptr.style.opacity = 0; }
          });
        } else {
          dist = 0;
          setPtr(0);
          if (ptr) { ptr.style.height = '0px'; ptr.style.opacity = 0; }
        }
      }

      scroller.addEventListener('touchstart', onStart, { passive: true });
      scroller.addEventListener('touchmove', onMove, { passive: false });
      scroller.addEventListener('touchend', onEnd, { passive: true });
      scroller.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      if (ptr) {
        ptr.style.height = '0px';
        ptr.style.opacity = '0';
        ptr.style.overflow = 'hidden';
        ptr.style.display = 'flex';
        ptr.style.alignItems = 'center';
        ptr.style.justifyContent = 'center';
        ptr.style.fontSize = '11.5px';
        ptr.style.fontWeight = '700';
        ptr.style.color = 'var(--muted)';
        ptr.style.transition = 'height .15s ease';
      }

      return function detach() {
        scroller.removeEventListener('touchstart', onStart);
        scroller.removeEventListener('touchmove', onMove);
        scroller.removeEventListener('touchend', onEnd);
        scroller.removeEventListener('mousedown', onStart);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEnd);
      };
    }
  };

  // Lightweight entrance animations for sheets/backdrops/bounce elements as they mount
  function animate() {
    document.querySelectorAll('[data-lt-sheet]').forEach(function (el) {
      if (el.dataset.ltAnimated) return;
      el.dataset.ltAnimated = '1';
      el.style.animation = 'slideUp .3s cubic-bezier(.22,1,.36,1)';
    });
    document.querySelectorAll('[data-lt-backdrop]').forEach(function (el) {
      if (el.dataset.ltAnimated) return;
      el.dataset.ltAnimated = '1';
      el.style.animation = 'appfade .18s ease-out';
    });
    document.querySelectorAll('[data-lt-bounce]').forEach(function (el) {
      if (el.dataset.ltAnimated) return;
      el.dataset.ltAnimated = '1';
      el.style.animation = 'slideUp .34s cubic-bezier(.22,1,.36,1)';
    });
  }
  var mo = new MutationObserver(animate);
  function start() {
    animate();
    mo.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
