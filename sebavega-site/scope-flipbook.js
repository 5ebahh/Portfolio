/* =====================================================================
   SCOPE-FLIPBOOK.JS — the self-hosted Scope flipbook
   Built on StPageFlip (page-flip 2.0.7, MIT), loaded from jsDelivr; if the
   CDN can't be reached it falls back to assets/page-flip.browser.js.
   • Desktop: two-page spreads. Phones (or any narrow space): one page at a
     time. The book is sized to fit on screen below the navbar.
   • The cover shows on its own first (showCover).
   • Turn pages by dragging a corner (hover a corner for a peel hint),
     clicking a page, swiping, the arrow keys, or the small buttons.
   • Page images load lazily: nothing until the book is near the screen,
     then only the pages around the one you're on.
   • Reduced motion: pages change instantly (no curl, no peel).
   ===================================================================== */

(() => {
  const root = document.querySelector('[data-flipbook]');
  if (!root) return;

  const stage = root.querySelector('.sfb-stage');
  const prevBtn = root.querySelector('.sfb-prev');
  const nextBtn = root.querySelector('.sfb-next');
  const count = root.querySelector('.sfb-count');
  const fullBtn = root.querySelector('.sfb-full');
  const header = document.querySelector('.site-header');
  const urls = JSON.parse(document.getElementById('sfb-pages').textContent);
  const TOTAL = urls.length;
  const RATIO = Number(root.dataset.ratio || 0.7727);   // page width ÷ height
  const FLIP_MS = 800;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const title = root.dataset.title || 'Magazine';

  let book = null;        // the StPageFlip instance
  let bookEl = null;
  let pages = [];
  let started = false;


  /* ---- Library: jsDelivr first, local copy if that fails ---- */
  function loadLibrary() {
    if (window.St?.PageFlip) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = root.dataset.fallback;
      s.onload = () => (window.St?.PageFlip ? resolve() : reject(new Error('page-flip missing')));
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }


  /* ---- Lazy page images ---- */
  function loadAround(index) {
    for (let i = Math.max(0, index - 2); i <= Math.min(TOTAL - 1, index + 5); i += 1) {
      const img = pages[i]?.querySelector('img');
      if (img && !img.getAttribute('src')) img.src = urls[i];
    }
  }


  /* ---- Size: fit the screen, two pages wide on desktop ---- */
  const isFull = () => root.classList.contains('is-full');

  function fitStage() {
    const controls = root.querySelector('.sfb-controls').offsetHeight || 56;
    const top = isFull() ? 16 : header.offsetHeight + 24;
    const availH = Math.max(260, window.innerHeight - top - controls - 28);
    // On wide screens the book may grow past the text column, centred on it,
    // as far as the section rail on the left (and the same on the right).
    const page = document.documentElement.clientWidth;
    let availW = root.clientWidth;
    if (isFull()) availW = window.innerWidth - 32;
    else if (page >= 1024) {
      const rail = document.querySelector('.csx-toc');
      const railRight = rail ? rail.getBoundingClientRect().right : 0;
      availW = Math.max(root.clientWidth, page - 2 * (railRight + 24));
    }
    const spread = window.innerWidth >= 700 && availW >= 660;
    const width = Math.floor(Math.min(availW, availH * RATIO * (spread ? 2 : 1)));
    stage.style.width = `${width}px`;
    stage.style.marginLeft = isFull() ? '' : `${Math.round((root.clientWidth - width) / 2)}px`;
    // The controls line up with the book, so the expand icon sits at its edge.
    const controlRow = root.querySelector('.sfb-controls');
    controlRow.style.width = `${width}px`;
    controlRow.style.marginLeft = stage.style.marginLeft;
    root.dataset.layout = spread ? 'spread' : 'single';
    return spread;
  }


  /* ---- Page counter and buttons ---- */
  function label(index) {
    if (index <= 0 || index >= TOTAL - 1) return `Page ${Math.max(1, index + 1)} of ${TOTAL}`;   // covers show alone
    if (book.getOrientation() === 'landscape') return `Pages ${index + 1}–${Math.min(index + 2, TOTAL)} of ${TOTAL}`;
    return `Page ${index + 1} of ${TOTAL}`;
  }

  function refreshUi() {
    const i = book.getCurrentPageIndex();
    count.textContent = label(i);
    prevBtn.disabled = i <= 0;
    nextBtn.disabled = i >= TOTAL - 1;
    loadAround(i);
  }

  const next = () => (reduced.matches ? book.turnToNextPage() : book.flipNext());
  const prev = () => (reduced.matches ? book.turnToPrevPage() : book.flipPrev());


  /* ---- Build ---- */
  function build() {
    const spread = fitStage();
    const start = book ? book.getCurrentPageIndex() : 0;
    if (book) { book.destroy(); }

    // StPageFlip takes over the element it's given, so make a fresh one.
    stage.innerHTML = '';
    bookEl = document.createElement('div');
    bookEl.className = 'sfb-book';
    stage.appendChild(bookEl);
    pages = urls.map((_, i) => {
      const page = document.createElement('div');
      page.className = 'sfb-page';
      if (i === 0 || i === TOTAL - 1) page.dataset.density = 'hard';
      const img = document.createElement('img');
      img.alt = i === 0 ? `${title}, front cover` : i === TOTAL - 1 ? `${title}, back cover` : `${title}, page ${i + 1}`;
      img.decoding = 'async';
      img.draggable = false;
      page.appendChild(img);
      bookEl.appendChild(page);
      return page;
    });

    book = new window.St.PageFlip(bookEl, {
      width: 1000,
      height: Math.round(1000 / RATIO),
      size: 'stretch',
      minWidth: 330,            // narrower than two of these → one page at a time
      maxWidth: 1400,
      minHeight: 200,
      maxHeight: 2000,
      showCover: true,
      usePortrait: true,
      autoSize: true,
      drawShadow: true,
      maxShadowOpacity: 0.45,
      flippingTime: reduced.matches ? 1 : FLIP_MS,
      showPageCorners: !reduced.matches,
      useMouseEvents: !reduced.matches,
      mobileScrollSupport: true, // vertical swipes still scroll the page
      swipeDistance: 30,
      startPage: start,
    });
    // The library pins a minimum width once at start-up; the stage already
    // sizes the book, and this would overflow very small phones.
    bookEl.style.minWidth = '0';
    book.loadFromHTML(pages);
    if (!spread && book.getOrientation() === 'landscape') book.update();

    root.flipbook = book;   // handy for debugging in the browser console
    book.on('flip', refreshUi);
    book.on('changeOrientation', refreshUi);
    book.on('init', refreshUi);
    refreshUi();
  }

  // Reduced motion: no drag-peel; a click on either half or a sideways swipe
  // changes the page instantly.
  stage.addEventListener('click', (event) => {
    if (!reduced.matches || !book) return;
    const r = stage.getBoundingClientRect();
    (event.clientX - r.left < r.width / 2 ? prev : next)();
  });
  let touchStart = null;
  stage.addEventListener('touchstart', (e) => {
    if (reduced.matches) touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (!reduced.matches || !touchStart || !book) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
    touchStart = null;
  }, { passive: true });

  prevBtn.addEventListener('click', () => book && prev());
  nextBtn.addEventListener('click', () => book && next());

  // Arrow keys while the book is mostly on screen (or full screen).
  let visible = false;
  new IntersectionObserver(([entry]) => { visible = entry.intersectionRatio >= 0.5; },
    { threshold: [0, 0.5, 1] }).observe(stage);
  document.addEventListener('keydown', (event) => {
    if (!book || !(visible || isFull())) return;
    if (event.target.closest?.('input, textarea, select, [contenteditable]')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); prev(); }
    if (event.key === 'Escape' && root.classList.contains('is-pseudo-full')) toggleFull();
  });


  /* ---- Full screen (falls back to a fixed overlay where the browser
         can't make an element full screen, e.g. iPhone Safari) ---- */
  function setFullUi(on) {
    root.classList.toggle('is-full', on);
    const name = on ? 'Exit full screen' : 'View full screen';
    fullBtn.setAttribute('aria-label', name);
    fullBtn.title = name;
    document.documentElement.classList.toggle('sfb-lock', on && root.classList.contains('is-pseudo-full'));
    if (book) { fitStage(); book.update(); refreshUi(); }
  }

  function toggleFull() {
    const native = document.fullscreenElement === root;
    if (native) { document.exitFullscreen(); return; }
    if (root.classList.contains('is-pseudo-full')) {
      root.classList.remove('is-pseudo-full');
      setFullUi(false);
      return;
    }
    if (root.requestFullscreen) {
      root.requestFullscreen().catch(() => { root.classList.add('is-pseudo-full'); setFullUi(true); });
    } else {
      root.classList.add('is-pseudo-full');
      setFullUi(true);
    }
  }
  fullBtn.addEventListener('click', toggleFull);
  document.addEventListener('fullscreenchange', () => setFullUi(document.fullscreenElement === root));


  /* ---- Resize: refit, and rebuild only when switching one/two pages ---- */
  let resizeTimer = 0;
  function onResize() {
    if (!book) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasSpread = root.dataset.layout === 'spread';
      const spread = fitStage();
      if (spread !== wasSpread) build();
      else { book.update(); refreshUi(); }
    }, 100);
  }
  window.addEventListener('resize', onResize);
  reduced.addEventListener('change', () => { if (book) build(); });


  /* ---- Start when the book gets close to the screen ---- */
  const starter = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return;
    started = true;
    starter.disconnect();
    loadLibrary()
      .then(() => { root.classList.add('is-ready'); build(); })
      .catch(() => root.classList.add('is-failed'));
  }, { rootMargin: '600px 0px' });
  starter.observe(root);
})();
