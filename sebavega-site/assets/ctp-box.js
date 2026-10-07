/* =====================================================================
   CTP-BOX.JS — "The box in 3D" on Cinnamon Toast Punk
   Two ways to show the box (see ctp-box.css):
   • scrub  (motion OK, GSAP loaded, screen at least 480px tall)
            The box slides up and pins. One scroll timeline then drives
            both the box and the captions. At each stop the box turns to
            its side first; once it has settled, that side's caption fades
            in. Scrolling on fades the caption out before the next turn,
            so a caption is never on screen beside a different side.
            Scrolling back plays it all in reverse. After the last side the
            pin lets go.
            Wide screens: Front, Nutrition side, Back, Stencil side.
            Phones (under 700px): three stops, the sides marked data-phone.
   • list   (prefers-reduced-motion, GSAP or the 3D viewer missing)
            The sides with their captions as a stacked list. The box can
            still be dragged; it doesn't turn on its own.
   The box can be dragged at any time. Dragging during the sequence hides
   the caption (the box is no longer on that side); scrolling again, or
   3 seconds without touching it, eases it back to the caption's side.
   Outside the sequence, cereal-model.js keeps the slow idle turn.
   Zoom stays off.
   ===================================================================== */

(() => {
  const turn = document.querySelector('[data-turn]');
  const model = turn?.querySelector('#cereal-model');
  if (!turn || !model) return;

  const header = document.querySelector('.site-header');
  const stage = turn.querySelector('.ctp-stage');
  const captions = turn.querySelector('.ctp-captions');
  const faces = [...turn.querySelectorAll('.ctp-face')];
  const dotsWrap = turn.querySelector('.ctp-dots');
  const dots = [...dotsWrap.querySelectorAll('.ctp-dot')];
  const hint = turn.querySelector('[data-hint]');

  const VIEW = -6;    // a few degrees off square: reads as a box, panel still flat-on
  const PHI = 82;     // just above eye level

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tall = matchMedia('(min-height: 480px)');
  const wide = matchMedia('(min-width: 700px)');
  // Tall screens (phones, portrait tablets) stack the caption under the box.
  const stacked = matchMedia('(max-width: 699.98px), (orientation: portrait) and (max-width: 1100px)');
  const hasGsap = () => Boolean(window.gsap && window.ScrollTrigger);

  // The camera can only be driven once the 3D viewer is defined. (Setting
  // its properties any earlier would be silently lost.) If it never loads,
  // the page uses the plain list.
  const viewerReady = Promise.race([
    customElements.whenDefined('model-viewer').then(() => true),
    // Opened straight from a folder (file://), the browser blocks the viewer,
    // so don't wait long before falling back.
    new Promise((resolve) => setTimeout(() => resolve(Boolean(customElements.get('model-viewer'))),
      location.protocol === 'file:' ? 1500 : 6000)),
  ]);


  /* -------------------------------------------------------------------
     Scene size: the open scene runs the full width of the page, and the
     camera distance is worked out so the box fills most of its height.
     ------------------------------------------------------------------- */

  const BOX_H = 0.34;    // box height (0.30m) plus a little room for the top edge
  const BOX_W = 0.215;   // the front at its stop angle, with a little room
  const FOV = 28;
  const FILL = 0.85;     // share of the scene height the box should take

  function fitScene() {
    const page = document.documentElement.clientWidth;
    const left = turn.getBoundingClientRect().left;
    turn.style.setProperty('--page-w', `${page}px`);
    turn.style.setProperty('--bleed-left', `${left}px`);

    const w = model.clientWidth;
    const h = model.clientHeight;
    if (!w || !h) return;
    const tan = Math.tan((FOV / 2) * Math.PI / 180);
    const byHeight = BOX_H / (FILL * 2 * tan);
    const byWidth = BOX_W / (0.94 * 2 * tan * (w / h));
    const radius = Math.max(byHeight, byWidth).toFixed(3);
    model.setAttribute('min-camera-orbit', `auto auto ${radius}m`);
    model.setAttribute('max-camera-orbit', `auto auto ${radius}m`);
  }

  new ResizeObserver(fitScene).observe(model);
  window.addEventListener('resize', fitScene);
  fitScene();


  /* -------------------------------------------------------------------
     Camera helpers
     ------------------------------------------------------------------- */

  const toDeg = (rad) => rad * 180 / Math.PI;

  // Where the box faces right now, counting the idle spin too.
  function currentView() {
    const orbit = model.getCameraOrbit();
    return { theta: toDeg(orbit.theta - (model.turntableRotation || 0)), phi: toDeg(orbit.phi) };
  }

  function setView(theta, phi) {
    model.cameraOrbit = `${theta}deg ${phi}deg auto`;
    model.jumpCameraToGoal();
  }

  // Take over from the idle turn without a visible jump: fold the idle
  // spin into the camera angle, then zero the spin.
  function takeBox() {
    model.dataset.sequence = 'scrub';
    model.idle?.stop();
    const view = currentView();
    model.resetTurntableRotation(0);
    setView(view.theta, view.phi);
    return view;
  }

  // Hand the box back to cereal-model.js (idle turn after 3 seconds).
  function releaseBox() {
    if (!model.dataset.sequence) return;
    delete model.dataset.sequence;
    model.idle?.later();
  }

  // Small tween used to ease the box onto the current side.
  let tweenFrame = 0;
  function tween(ms, step, done) {
    cancelAnimationFrame(tweenFrame);
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      step(t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
      if (t < 1) tweenFrame = requestAnimationFrame(tick);
      else done?.();
    };
    tweenFrame = requestAnimationFrame(tick);
  }


  /* -------------------------------------------------------------------
     SCRUB
     The section is tall and the scene inside it is sticky (that's the
     pin, see ctp-box.css). One timeline holds the box angle and every
     caption's fade, and the scroll position plays it.
     ------------------------------------------------------------------- */

  function setupScrub(phone) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const stops = faces
      .map((face, index) => ({
        face,
        index,
        theta: Number(face.dataset.theta) + VIEW,
        phi: Number(face.dataset.phi || PHI),
      }))
      .filter((stop) => !phone || stop.face.hasAttribute('data-phone'));
    faces.forEach((face) => face.classList.toggle('is-skipped', !stops.some((s) => s.face === face)));
    dots.forEach((dot, n) => { dot.hidden = !stops.some((s) => s.index === n); });

    // ---- The timeline ----
    // [caption 1 shown] hold, fade out, turn, fade in [caption 2] hold …
    const TURN = 1;
    const FADE = 0.3;
    const HOLD = 0.9;
    const state = { theta: stops[0].theta, phi: stops[0].phi };
    const copy = stops.map((s) => s.face.querySelector('.ctp-face-copy'));

    gsap.set(copy, { autoAlpha: 0, y: 12 });
    gsap.set(copy[0], { autoAlpha: 1, y: 0 });

    const tl = gsap.timeline({ paused: true });
    stops.forEach((stop, i) => {
      if (i > 0) {
        tl.to(copy[i - 1], { autoAlpha: 0, y: -12, duration: FADE, ease: 'power1.in' });
        tl.to(state, { theta: stop.theta, phi: stop.phi, duration: TURN, ease: 'power2.inOut' });
        tl.to(copy[i], { autoAlpha: 1, y: 0, duration: FADE, ease: 'power1.out' });
      }
      tl.addLabel(`stop${i}`);
      tl.to({}, { duration: i === stops.length - 1 ? HOLD / 2 : HOLD });
    });

    // Which side is settled right now (for the squares and screen readers).
    function settledStop() {
      return stops.find((s) => Math.abs(s.theta - state.theta) < 1 && Math.abs(s.phi - state.phi) < 1);
    }

    // ---- Driving the camera ----
    let owned = false;      // the sequence is in charge of the box
    let offFace = false;    // the box was dragged away from the caption's side
    let easing = false;
    let offset = 0;         // whole turns, so the box takes the short way round
    let backTimer = 0;

    // Captions only show once the 3D box itself is on screen (not the flat
    // stand-in image shown while it loads).
    const loaded = () => model.closest('.cs-cereal-stage')?.classList.contains('is-loaded');
    const showCaptions = (on) => turn.classList.toggle('is-off-face', !on || !loaded());
    let releaseTimer = 0;
    if (!loaded()) turn.classList.add('is-off-face');

    // Is the box actually showing the side whose caption is up?
    const norm = (a) => ((a % 360) + 540) % 360 - 180;
    function onCaptionSide() {
      const settled = settledStop();
      if (!settled) return false;
      const view = currentView();
      return Math.abs(norm(view.theta - settled.theta)) < 4 && Math.abs(view.phi - settled.phi) < 4;
    }

    function draw() {
      const settled = settledStop();
      faces.forEach((face) => face.classList.toggle('is-active', face === settled?.face));
      dots.forEach((dot, n) => {
        if (settled && n === settled.index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (!owned) {
        if (!onCaptionSide()) showCaptions(false);   // e.g. a resize moved the page past the pin
        return;
      }
      if (easing) return;
      if (offFace) { easeBack(); return; }
      setView(state.theta + offset, state.phi);
    }

    // Ease from wherever the box is now onto the timeline's angle, with the
    // caption hidden until it lands.
    function easeBack(ms = 650) {
      clearTimeout(backTimer);
      const from = currentView();
      model.resetTurntableRotation(0);
      offset = 360 * Math.round((from.theta - state.theta) / 360);
      easing = true;
      showCaptions(false);
      tween(ms, (t) => {
        setView(from.theta + (state.theta + offset - from.theta) * t,
                from.phi + (state.phi - from.phi) * t);
      }, () => {
        easing = false;
        offFace = false;
        setView(state.theta + offset, state.phi);
        showCaptions(true);
      });
    }

    function enter() {
      if (owned) return;
      clearTimeout(releaseTimer);
      takeBox();
      owned = true;
      easeBack(700);
    }

    // The pin let go (or the section left the screen). The box stays on the
    // last side with its caption until the idle turn starts 3 seconds later;
    // the caption goes away just before that, and right away if dragged.
    function leave() {
      if (!owned) return;
      owned = false;
      easing = false;
      offFace = false;
      clearTimeout(backTimer);
      cancelAnimationFrame(tweenFrame);
      releaseBox();
      clearTimeout(releaseTimer);
      if (!onCaptionSide()) showCaptions(false);
      else releaseTimer = setTimeout(() => showCaptions(false), 2900);
    }

    // The 3D box finished loading mid-sequence: put it on the right side,
    // then show the caption.
    function onLoad() {
      queueCheck();
      if (owned) easeBack(450);
      else showCaptions(false);
    }
    model.addEventListener('load', onLoad);

    // Dragging (mouse, touch or arrow keys).
    function onCameraChange(event) {
      if (event.detail?.source !== 'user-interaction') return;
      if (!owned) { clearTimeout(releaseTimer); showCaptions(false); return; }
      cancelAnimationFrame(tweenFrame);
      easing = false;
      offFace = true;
      showCaptions(false);
      clearTimeout(backTimer);
      backTimer = setTimeout(() => { if (owned && offFace) easeBack(); }, 3000);
    }
    model.addEventListener('camera-change', onCameraChange);

    tl.eventCallback('onUpdate', draw);

    const pinTop = () => `top ${header.offsetHeight}px`;

    // 1. Slide up into view while the section scrolls in.
    const slide = gsap.timeline({
      scrollTrigger: { trigger: turn, start: 'top bottom', end: pinTop, scrub: 0.5, invalidateOnRefresh: true },
    });
    slide.fromTo(stage, { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: 'power2.out', duration: 1 }, 0)
      .fromTo(captions, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'power2.out', duration: 0.6 }, 0.4);

    // 2. Pinned: the scroll position plays the timeline.
    const scrub = ScrollTrigger.create({
      trigger: turn,
      start: pinTop,
      end: 'bottom bottom',
      animation: tl,
      scrub: 0.4,
      invalidateOnRefresh: true,
    });

    // 3. The sequence owns the box from the slide-up until the pin lets go.
    const control = ScrollTrigger.create({
      trigger: turn,
      start: 'top bottom',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onToggle: (self) => (self.isActive ? enter() : leave()),
    });

    // Squares jump to a stop.
    const onDot = dots.map((dot, n) => {
      const handler = () => {
        const k = stops.findIndex((s) => s.index === n);
        if (k >= 0) window.scrollTo({ top: Math.ceil(scrub.labelToScroll(`stop${k}`)), behavior: 'smooth' });
      };
      dot.addEventListener('click', handler);
      return handler;
    });

    // Snap the timeline straight to the scroll position (no catch-up
    // animation through other sides), e.g. after a reload mid-page.
    // Worked out from the scroll position directly, so it can't be stale.
    const inRange = () => window.scrollY >= control.start && window.scrollY <= control.end;

    const expectedStart = () => turn.getBoundingClientRect().top + window.scrollY - window.innerHeight;

    // Re-measure. ScrollTrigger keeps a cached scroll position that only
    // updates on scroll events; when the browser restores the position on
    // reload before ScrollTrigger is listening, that cache stays at 0 and
    // every measurement is off. A synthetic scroll event refreshes it.
    function remeasure() {
      window.dispatchEvent(new Event('scroll'));
      ScrollTrigger.refresh();
      if (Math.abs(control.start - expectedStart()) > 2) {
        ScrollTrigger.clearScrollMemory?.();
        window.dispatchEvent(new Event('scroll'));
        ScrollTrigger.update();
        ScrollTrigger.refresh();
      }
    }

    function syncNow() {
      remeasure();
      const lag = scrub.getTween?.();
      if (lag) lag.progress(1);
      tl.progress(scrub.progress);
      slide.scrollTrigger?.getTween?.()?.progress(1);
      // If the page opened (or was restored) partway down, take the box over
      // now rather than waiting for the next scroll.
      if (inRange()) enter();
      else if (owned) leave();
      draw();
    }

    // Anything above the section changing height (late web fonts, images,
    // opened details) moves where the pin starts, so re-measure.
    let resizeTimer = 0;
    const content = document.querySelector('.csx-content');
    const watcher = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
    });
    watcher.observe(content);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    syncNow();

    // Self-check: if the stored start of the section doesn't match where it
    // really is (the browser restoring the scroll position on reload while
    // ScrollTrigger measures, fonts or images arriving late…), re-measure
    // and snap the box and caption to the right stop.
    let checkFrame = 0;
    function selfCheck() {
      checkFrame = 0;
      if (Math.abs(control.start - expectedStart()) > 2) { syncNow(); return; }
      ScrollTrigger.update();
      if (inRange() !== owned) (inRange() ? enter() : leave());
    }
    const queueCheck = () => { if (!checkFrame) checkFrame = requestAnimationFrame(selfCheck); };
    window.addEventListener('scroll', queueCheck, { passive: true });
    const checkTimers = [150, 600, 1500, 3000].map((ms) => setTimeout(queueCheck, ms));
    const onRestore = () => { syncNow(); queueCheck(); };
    window.addEventListener('pageshow', onRestore);
    window.addEventListener('load', onRestore);

    return () => {
      window.removeEventListener('scroll', queueCheck);
      cancelAnimationFrame(checkFrame);
      checkTimers.forEach(clearTimeout);
      window.removeEventListener('pageshow', onRestore);
      window.removeEventListener('load', onRestore);
      watcher.disconnect();
      clearTimeout(resizeTimer);
      model.removeEventListener('camera-change', onCameraChange);
      model.removeEventListener('load', onLoad);
      clearTimeout(releaseTimer);
      dots.forEach((dot, i) => dot.removeEventListener('click', onDot[i]));
      control.kill();
      scrub.kill();
      tl.kill();
      slide.scrollTrigger?.kill();
      slide.kill();
      gsap.set([stage, captions, ...copy], { clearProps: 'all' });
      faces.forEach((face) => face.classList.remove('is-skipped', 'is-active'));
      turn.classList.remove('is-off-face');
      dots.forEach((dot) => { dot.hidden = false; });
      leave();
      clearTimeout(releaseTimer);
      turn.classList.remove('is-off-face');
    };
  }


  /* -------------------------------------------------------------------
     Mode switching (on load, resize, or a motion-setting change)
     ------------------------------------------------------------------- */

  let mode = null;
  let cleanup = null;
  let viewerOk = null;   // unknown until the viewer is defined

  function pickMode() {
    if (reduced.matches || !hasGsap() || !tall.matches || viewerOk === false) return 'list';
    return wide.matches ? 'scrub' : 'scrub-phone';
  }

  function applyMode() {
    const next = pickMode();
    if (next === mode) return;
    cleanup?.();
    cleanup = null;
    mode = next;
    turn.dataset.mode = mode === 'list' ? 'list' : 'scrub';
    turn.dataset.size = mode === 'scrub-phone' ? 'phone' : 'wide';
    turn.dataset.layout = stacked.matches ? 'stacked' : 'side';
    dotsWrap.hidden = mode === 'list';
    if (hint) hint.textContent = mode === 'list' ? 'Drag to turn the box.' : 'Scroll to turn the box, or drag it.';
    fitScene();
    if (mode !== 'list' && viewerOk) cleanup = setupScrub(mode === 'scrub-phone');
    else window.ScrollTrigger?.refresh();
  }

  // Lay the section out right away; start the sequence once the viewer is ready.
  applyMode();
  viewerReady.then((ok) => {
    viewerOk = ok;
    mode = null;
    applyMode();
    // Say why, instead of quietly showing a flat picture.
    if (!ok) {
      const note = document.createElement('p');
      note.className = 'ctp-hint is-warning';
      note.setAttribute('role', 'status');
      turn.before(note);
      note.textContent = location.protocol === 'file:'
        ? 'The 3D box can’t load when this page is opened straight from a folder on your computer. View the page on the website instead.'
        : 'The 3D box couldn’t load in this browser, so here are its sides as pictures.';
    }
  });
  [reduced, tall, wide].forEach((query) => query.addEventListener('change', () => {
    if (viewerOk !== null) applyMode();
  }));
  stacked.addEventListener('change', () => {
    turn.dataset.layout = stacked.matches ? 'stacked' : 'side';
    fitScene();
    window.ScrollTrigger?.refresh();
  });
})();
