/* =====================================================================
   PAPER-MOTION.JS — Work page and the six project pages
   Optional motion, added with GSAP. If GSAP doesn't load, everything is
   still visible and every link still works.
   1. Sections slide up slightly as they scroll into view
   2. Work page cards lift on hover (project-page notes lift with CSS instead)
   ===================================================================== */

(() => {
  const gsap = window.gsap;

  // Which page are we on? Each entry lists that page's selectors.
  const PAGES = [
    { page: '.work-page', reveal: '.work-reveal', cards: 'a.work-paper' },
    { page: '.cs-page', reveal: '.cs-reveal', cards: null },
  ];

  const config = PAGES.find(({ page }) => document.querySelector(page));
  if (!config || !gsap) return;

  const page = document.querySelector(config.page);
  const trigger = window.ScrollTrigger;
  if (trigger) gsap.registerPlugin(trigger);

  let media;

  function initializeMotion() {
    media = gsap.matchMedia();


    /* -------------------------------------------------------------------
       1. SCROLL REVEAL (skipped with reduced motion)
       Each section starts 20px lower and slides into place the first
       time it reaches the bottom of the screen.
       ------------------------------------------------------------------- */

    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (!trigger) return;

      page.querySelectorAll(config.reveal).forEach((item) => {
        gsap.from(item, {
          y: 20,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: { trigger: item, start: 'top 94%', once: true },
          clearProps: 'transform',
        });
      });
    });


    /* -------------------------------------------------------------------
       2. CARD HOVER LIFT (Work page only; mouse devices; motion allowed)
       ------------------------------------------------------------------- */

    if (!config.cards) return;

    media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', (context) => {
      const listeners = [];

      page.querySelectorAll(config.cards).forEach((card) => {
        // Lift the card while it's hovered or keyboard-focused.
        const move = context.add(null, () => {
          const active = card.matches(':hover, :focus-visible');

          gsap.to(card, {
            y: active ? -5 : 0,
            boxShadow: active ? '6px 10px 0 rgba(188,179,152,0.30)' : '4px 5px 0 rgba(188,179,152,0.19)',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });

        ['pointerenter', 'pointerleave', 'focus', 'blur'].forEach((eventName) => {
          card.addEventListener(eventName, move);
          listeners.push(() => card.removeEventListener(eventName, move));
        });
      });

      return () => listeners.forEach((remove) => remove());
    });
  }

  initializeMotion();

  // Fonts and images change the page height, so recalculate scroll positions once they load.
  document.fonts.ready.then(() => trigger?.refresh());
  page.querySelectorAll('img').forEach((image) => {
    if (!image.complete) image.addEventListener('load', () => trigger?.refresh(), { once: true });
  });

  // Tidy up when leaving the page; restart if the Back button restores it from memory.
  window.addEventListener('pagehide', () => media.revert());
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) initializeMotion();
  });
})();
