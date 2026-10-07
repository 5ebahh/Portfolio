/* =====================================================================
   CASE-STUDY.JS — the six project pages
   1. Keeps --header-h in sync with the real navbar
   2. Process steps: open on desktop, collapsed on phones and tablets
   3. Section rail (1024px+): shows only while you read the story and
      highlights the section you're in
   4. Final-design carousel (phones): drag, arrows, dots and keyboard
   0. (runs first) Embeds: placeholder box until a real URL is pasted in
   Without JavaScript the page still works: every step is open, and the
   screens can still be swiped.
   ===================================================================== */

(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const body = document.querySelector('.csx-body');
  const toc = document.querySelector('.csx-toc');
  const list = toc.querySelector('.csx-toc-list');
  const links = [...list.querySelectorAll('a')];
  const sections = links.map((link) => document.querySelector(link.hash));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const DESKTOP = matchMedia('(min-width: 1024px)');


  /* -------------------------------------------------------------------
     0. EMBEDS (Figma, Heyzine)
     An embed whose src isn't a real web address yet (for example
     "[Figma embed URL: United Airlines]") shows a labelled placeholder box
     and loads nothing; its "Open full screen" link is hidden too. Once a
     real link is pasted into the iframe, the full-screen link uses it.
     ------------------------------------------------------------------- */

  document.querySelectorAll('.csx-embed').forEach((embed) => {
    const frame = embed.querySelector('iframe');
    const address = frame?.getAttribute('src') || '';
    const fullscreen = embed.querySelector('.csx-fullscreen');
    if (/^https:\/\//.test(address)) {
      // The "Open full screen" link (phones) opens the same prototype.
      if (fullscreen && !fullscreen.getAttribute('href')) fullscreen.href = address;
      return;
    }

    frame.removeAttribute('src');
    frame.hidden = true;
    embed.classList.add('is-placeholder');
    const box = document.createElement('div');
    box.className = 'csx-embed-placeholder';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', `${frame.title} (placeholder)`);
    box.textContent = address || '[embed URL]';
    frame.after(box);
    embed.querySelector('.csx-fullscreen')?.setAttribute('hidden', '');
  });


  /* -------------------------------------------------------------------
     1. NAVBAR HEIGHT (used to place the rail and to land section jumps
        just below the navbar; see case-study.css)
     ------------------------------------------------------------------- */

  const measure = () => root.style.setProperty('--header-h', `${header.offsetHeight}px`);
  new ResizeObserver(measure).observe(header);


  /* -------------------------------------------------------------------
     2. PROCESS STEPS
     Open on desktop; collapsed on smaller screens so the page is shorter.
     Each step still shows its number and headline when collapsed.
     ------------------------------------------------------------------- */

  const steps = [...document.querySelectorAll('.csx-step')];
  const setSteps = () => steps.forEach((step) => { step.open = DESKTOP.matches; });

  setSteps();
  DESKTOP.addEventListener('change', () => {
    setSteps();
    update();
  });


  /* -------------------------------------------------------------------
     3. SECTION RAIL
     Shown once the story reaches the top of the screen and hidden again
     before the end of the page, so it never sits over the hero, the cover
     image or the next-project note. The current section is the last one
     whose top has scrolled past the line just under the navbar.
     ------------------------------------------------------------------- */

  let frame = 0;

  function update() {
    frame = 0;
    const line = header.offsetHeight + 60;
    let current = 0;

    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= line) current = i;
    });

    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = sections.length - 1;

    links.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      link.classList.toggle('is-passed', i < current);
    });

    list.style.setProperty('--progress', sections.length > 1 ? current / (sections.length - 1) : 0);

    // Visible only while the story is beside it.
    if (DESKTOP.matches) {
      const bodyBox = body.getBoundingClientRect();
      const railBox = toc.getBoundingClientRect();
      const started = sections[0].getBoundingClientRect().top <= header.offsetHeight + 160;
      const notEnded = bodyBox.bottom >= railBox.bottom + 24;
      toc.classList.toggle('is-shown', started && notEnded);
    }
  }

  const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  steps.forEach((step) => step.addEventListener('toggle', requestUpdate));

  // Keyboard users can always reach the rail: it appears when focused.
  toc.addEventListener('focusin', () => toc.classList.add('is-shown'));
  toc.addEventListener('focusout', requestUpdate);

  update();


  /* -------------------------------------------------------------------
     4. CAROUSEL (phones)
     The screens are a scroll-snap row, so touch swiping is native. This
     adds: mouse dragging, arrow buttons, dots, the left/right arrow keys,
     and keeps track of which screen is centred.
     On larger screens the three sit side by side and none of this runs.
     ------------------------------------------------------------------- */

  const PHONE = matchMedia('(max-width: 699.98px)');

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.csx-track');
    const slides = [...track.querySelectorAll('.csx-slide')];
    const dots = [...carousel.querySelectorAll('.csx-dot')];
    const prev = carousel.querySelector('[data-dir="-1"]');
    const next = carousel.querySelector('[data-dir="1"]');
    const status = carousel.querySelector('[data-status]');
    const noun = status.textContent.trim().split(' ')[0];   // "Screen" or "Image
    let active = 0;

    // The centred screen is the one closest to the middle of the track.
    function centredIndex() {
      const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
      let best = 0;
      let bestDistance = Infinity;
      slides.forEach((slide, i) => {
        const box = slide.getBoundingClientRect();
        const distance = Math.abs(box.left + box.width / 2 - middle);
        if (distance < bestDistance) { best = i; bestDistance = distance; }
      });
      return best;
    }

    function refresh() {
      const i = centredIndex();
      slides.forEach((slide, n) => slide.classList.toggle('is-active', n === i));
      dots.forEach((dot, n) => {
        if (n === i) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      prev.disabled = i === 0;
      next.disabled = i === slides.length - 1;
      if (i !== active) status.textContent = `${noun} ${i + 1} of ${slides.length}`;
      active = i;
    }

    function goTo(i) {
      const slide = slides[Math.max(0, Math.min(slides.length - 1, i))];
      const left = slide.offsetLeft + slide.offsetWidth / 2 - track.clientWidth / 2;
      track.scrollTo({ left, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    prev.addEventListener('click', () => goTo(active - 1));
    next.addEventListener('click', () => goTo(active + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    track.addEventListener('keydown', (event) => {
      if (!PHONE.matches) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1); }
    });

    // Mouse dragging (touch already swipes natively).
    let dragStartX = 0;
    let dragStartScroll = 0;
    let dragging = false;
    let moved = false;
    let startIndex = 0;

    track.addEventListener('pointerdown', (event) => {
      if (!PHONE.matches || event.pointerType !== 'mouse' || event.button !== 0) return;
      dragging = true;
      moved = false;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
      startIndex = active;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const dx = event.clientX - dragStartX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = dragStartScroll - dx;
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
      // Settle on the nearest screen; a short flick still moves one screen
      // over from where the drag started.
      const dx = event.clientX - dragStartX;
      let target = centredIndex();
      if (target === startIndex && Math.abs(dx) > 40) target = startIndex + (dx < 0 ? 1 : -1);
      goTo(target);
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    // A drag shouldn't also count as a click on something inside.
    track.addEventListener('click', (event) => {
      if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
    }, true);

    track.addEventListener('scroll', () => requestAnimationFrame(refresh), { passive: true });
    PHONE.addEventListener('change', () => { track.scrollLeft = 0; refresh(); });
    refresh();
  });
})();
