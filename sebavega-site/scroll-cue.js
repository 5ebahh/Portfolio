/* =====================================================================
   SCROLL-CUE.JS — homepage only
   The pixel arrow + "Scroll" at the bottom of the hero:
   1. Clicking it scrolls down to "A little about me"
   2. The arrow gently bobs, and fades away as you scroll (needs GSAP)
   ===================================================================== */

(() => {
  const hero = document.querySelector('.pp-home');
  const cue = hero?.querySelector('.pp-restored-cue');
  if (!cue) return;


  /* ---------------------------------------------------------------------
     Keep the hero exactly one screen tall below the navbar.
     The navbar's height is stored in a CSS variable (--hero-header)
     that hero.css uses in its height calculation.
     --------------------------------------------------------------------- */

  const header = document.querySelector('.site-header');
  const measureHeader = () => hero.style.setProperty('--hero-header', `${header.offsetHeight}px`);

  new ResizeObserver(measureHeader).observe(header);
  measureHeader();


  /* ---------------------------------------------------------------------
     1. CLICK: scroll to the section the link points at (#about)
     --------------------------------------------------------------------- */

  cue.addEventListener('click', (event) => {
    event.preventDefault();

    const hash = cue.getAttribute('href');
    const target = document.querySelector(hash);
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;

    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    history.pushState(null, '', hash);

    // Move keyboard focus there too, so the next Tab continues from that section.
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });


  /* ---------------------------------------------------------------------
     2. MOTION (only if GSAP and ScrollTrigger loaded)
     --------------------------------------------------------------------- */

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.matchMedia().add(
    { all: '(min-width: 0px)', reduced: '(prefers-reduced-motion: reduce)' },
    (context) => {
      const reduced = context.conditions.reduced;

      // The arrow bobs up and down forever (skipped with reduced motion).
      const float = reduced
        ? null
        : gsap.fromTo(
            cue.querySelector('img'),
            { y: -4.5 },
            { y: 4.5, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' }
          );

      // The cue fades out (and slides down a little) as the visitor starts scrolling.
      gsap.to(cue, {
        autoAlpha: 0,
        y: reduced ? 0 : 12,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          // Start fading when the cue is 120px above the bottom of the screen...
          start: () => Math.max(0, hero.offsetTop + cue.offsetTop - innerHeight + 120),
          // ...and be fully gone after scrolling 18% of the hero's height.
          end: () => '+=' + hero.offsetHeight * 0.18,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Once invisible, stop the bobbing and make it unclickable.
            const hidden = self.progress >= 1;
            float?.paused(hidden);
            cue.style.pointerEvents = hidden ? 'none' : '';
          },
        },
      });

      return () => {
        cue.style.removeProperty('pointer-events');
      };
    }
  );

  // Fonts can change the page height, so recalculate scroll positions once they load.
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
