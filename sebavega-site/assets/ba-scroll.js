/* =====================================================================
   BA-SCROLL.JS — "Before & after": current and updated app screens
   • With motion: the section pins under the navbar, centred on the page,
     and scrolling steps through each part of the app. The caption, the
     current screen and the updated screens fade together, one part at a
     time, so a caption never sits above the wrong screens. Scrolling back reverses it; tabs jump
     to a part.
   • Reduced motion, very short screens, or no JavaScript: every pair as
     a plain list.
   The position comes straight from where the section is on screen each
   frame (no stored scroll positions), so late-loading fonts or images
   can't knock it out of step.
   ===================================================================== */

(() => {
  const root = document.querySelector('[data-ba]');
  if (!root) return;

  const steps = [...root.querySelectorAll('.ba-step')];
  const tabsList = root.querySelector('.ba-tabs');
  const sticky = root.querySelector('.ba-sticky');
  const header = document.querySelector('.site-header');
  const N = steps.length;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tall = matchMedia('(min-height: 480px)');
  const stackedQ = matchMedia('(max-width: 899.98px), (orientation: portrait) and (max-width: 1100px)');

  const HOLD = 0.28;   // each pair stays fully visible for ±0.28 of a step…
  const FADE = 0.2;    // …then fades out over the next 0.2 (a short gap between pairs)

  // Tabs
  const tabs = steps.map((step, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = step.dataset.label;
    b.addEventListener('click', () => jumpTo(i));
    li.appendChild(b);
    tabsList.appendChild(li);
    return b;
  });

  let mode = null;
  let frame = 0;
  let current = -1;

  const headerH = () => header?.offsetHeight || 0;

  // 0 at the moment the section pins, 1 when it lets go.
  function progress() {
    const r = root.getBoundingClientRect();
    const run = r.height - sticky.offsetHeight;
    if (run <= 0) return 0;
    return Math.min(1, Math.max(0, (headerH() - r.top) / run));
  }

  function draw() {
    frame = 0;
    if (mode !== 'scrub') return;
    const pos = progress() * (N - 1);
    steps.forEach((step, i) => {
      const d = Math.abs(pos - i);
      const o = Math.max(0, Math.min(1, 1 - (d - HOLD) / FADE));
      step.style.opacity = o.toFixed(3);
      step.style.transform = o < 1 ? `translateY(${Math.round((pos < i ? 1 : -1) * (1 - o) * 14)}px)` : '';
    });
    const now = Math.round(pos);
    if (now !== current) {
      current = now;
      steps.forEach((s, i) => s.classList.toggle('is-current', i === now));
      tabs.forEach((t, i) => {
        if (i === now) {
          t.setAttribute('aria-current', 'true');
          // keep the active tab in view on phones
          // (scrolling just the tab row, so a jump in progress isn't interrupted)
          if (root.dataset.layout === 'stacked') {
            tabsList.scrollTo({ left: t.parentElement.offsetLeft - (tabsList.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
          }
        } else t.removeAttribute('aria-current');
      });
    }
  }

  const queue = () => { if (!frame) frame = requestAnimationFrame(draw); };

  function jumpTo(i) {
    const r = root.getBoundingClientRect();
    const run = r.height - sticky.offsetHeight;
    const top = window.scrollY + r.top - headerH() + run * (i / (N - 1));
    window.scrollTo({ top: Math.round(top) + 1, behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  // Parts with more screens than fit on a phone get the same arrows and
  // pixel squares as the Final Design carousel (and still swipe).
  const pagers = [];
  steps.forEach((step) => {
    const shots = step.querySelector('.ba-shots');
    const items = [...shots.querySelectorAll('.ba-shot')];
    if (items.length < 3) return;
    const nav = document.createElement('div');
    nav.className = 'ba-pager';
    nav.innerHTML = '<button type="button" class="ba-arrow" data-dir="-1" aria-label="Previous screens"><span aria-hidden="true"></span></button>'
      + '<div class="ba-dots"></div>'
      + '<button type="button" class="ba-arrow" data-dir="1" aria-label="Next screens"><span aria-hidden="true"></span></button>';
    shots.after(nav);
    const dotsBox = nav.querySelector('.ba-dots');
    const [prev, next] = nav.querySelectorAll('.ba-arrow');
    // one stop per screen that can sit at the left edge
    const stops = () => items.map((it) => Math.min(it.offsetLeft - items[0].offsetLeft, shots.scrollWidth - shots.clientWidth))
      .filter((v, i, a) => i === 0 || v > a[i - 1] + 2);
    let dots = [];
    const build = () => {
      const st = stops();
      dotsBox.innerHTML = '';
      dots = st.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ba-dot';
        b.setAttribute('aria-label', `Show screens ${i + 1} of ${st.length}`);
        b.addEventListener('click', () => shots.scrollTo({ left: stops()[i], behavior: reduced.matches ? 'auto' : 'smooth' }));
        dotsBox.appendChild(b);
        return b;
      });
      sync();
    };
    const at = () => {
      const st = stops();
      let k = 0;
      st.forEach((v, i) => { if (Math.abs(shots.scrollLeft - v) < Math.abs(shots.scrollLeft - st[k])) k = i; });
      return k;
    };
    const sync = () => {
      const k = at();
      dots.forEach((d, i) => (i === k ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
      prev.disabled = k === 0;
      next.disabled = k === dots.length - 1;
    };
    const go = (dir) => {
      const st = stops();
      const k = Math.max(0, Math.min(st.length - 1, at() + dir));
      shots.scrollTo({ left: st[k], behavior: reduced.matches ? 'auto' : 'smooth' });
    };
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    shots.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    pagers.push(build);
  });

  // Make room: on wide screens the stage leaves the text column and is
  // centred on the page (clear of the section rail); then each part's
  // phones are sized to fit that space and the screen height.
  function fit() {
    const stacked = stackedQ.matches;
    root.dataset.layout = stacked ? 'stacked' : 'wide';
    if (mode !== 'scrub') {
      root.style.removeProperty('--ba-w');
      root.style.removeProperty('--ba-shift');
      steps.forEach((s) => { s.style.removeProperty('--ba-phone-h'); s.classList.remove('has-more'); });
      return;
    }
    const page = document.documentElement.clientWidth;
    const box = root.getBoundingClientRect();
    let width = root.clientWidth;
    if (!stacked) {
      const rail = document.querySelector('.csx-toc');
      const railRight = rail && page >= 1024 ? rail.getBoundingClientRect().right : 0;
      const edge = Math.max(railRight + 24, 32);
      width = Math.max(root.clientWidth, Math.min(page - 2 * edge, 1640));
    }
    const shift = stacked ? 0 : Math.round((page - width) / 2 - box.left);
    root.style.setProperty('--ba-w', `${Math.round(width)}px`);
    root.style.setProperty('--ba-shift', `${shift}px`);

    const stickyH = window.innerHeight - headerH() - 24;
    const tabsH = tabsList.offsetHeight + 6;
    steps.forEach((step) => {
      const shots = step.querySelector('.ba-shots');
      const n = step.querySelectorAll('.ba-shot').length;
      const cs = getComputedStyle(shots);
      const gap = parseFloat(cs.columnGap) || 16;
      const arrow = parseFloat(cs.getPropertyValue('--ba-arrow')) || 40;
      const copyH = step.querySelector('.ba-copy').offsetHeight;
      const moreH = stacked && n > 2 ? 44 : 0;   // the arrows and squares row
      const capH = 34 + 10;   // the label under each screen, plus a little breathing room
      const byHeight = stickyH - tabsH - copyH - (stacked ? 12 : 18) * (moreH ? 2 : 1) - moreH - capH;
      const fitN = stacked ? Math.min(n, 2) : n;   // phones: two across, the rest scroll
      const byWidth = ((width - 8 - (fitN - 1) * gap - arrow) / fitN) * 3356 / 1627;
      const h = Math.max(220, Math.floor(Math.min(byHeight, byWidth, 720)));
      step.style.setProperty('--ba-phone-h', `${h}px`);
      step.classList.toggle('has-more', stacked && n > 2);
    });
    requestAnimationFrame(() => pagers.forEach((b) => b()));
  }

  function applyMode() {
    const next = reduced.matches || !tall.matches ? 'list' : 'scrub';
    mode = next;
    root.dataset.mode = mode;
    tabsList.hidden = mode !== 'scrub';
    if (mode !== 'scrub') {
      steps.forEach((s) => { s.style.opacity = ''; s.style.transform = ''; s.classList.remove('is-current'); });
      current = -1;
    }
    fit();
    draw();
  }

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', () => { fit(); queue(); });
  [reduced, tall, stackedQ].forEach((q) => q.addEventListener('change', applyMode));
  applyMode();
  // Captions change height once the fonts arrive; refit then.
  document.fonts?.ready.then(() => { fit(); queue(); });
  window.addEventListener('load', () => { fit(); queue(); });
})();
