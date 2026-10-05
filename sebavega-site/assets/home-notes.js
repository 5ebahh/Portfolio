/* =====================================================================
   HOME-NOTES.JS — homepage only
   When you hover over (or tab to) one of the "Three of my favorites"
   cards, the paper lifts up 8px and casts a shadow.
   Needs GSAP; without it the cards simply don't lift.
   ===================================================================== */

(() => {
  if (!document.body.classList.contains('home-notes-draft') || !window.gsap) return;

  let media;

  function start() {
    media = gsap.matchMedia();

    // Only on devices with a mouse, and only if the visitor allows motion.
    media.add('(hover: hover) and (prefers-reduced-motion: no-preference)', (context) => {
      const cleanup = [];

      document.querySelectorAll('.paper-favorites-grid .paper-project').forEach((note) => {
        // Lift the card if it's hovered or focused, otherwise settle it back down.
        const move = context.add(null, () => {
          const active = note.matches(':hover, :focus-within');

          gsap.to(note, {
            y: active ? -8 : 0,
            filter: active ? 'drop-shadow(6px 9px 0 #8f877466)' : 'drop-shadow(0px 0px 0px transparent)',
            duration: 0.18,
            ease: 'steps(3)',   // moves in 3 small jumps, like pixel animation
            overwrite: 'auto',
          });
        });

        ['pointerenter', 'pointerleave', 'focusin', 'focusout'].forEach((eventName) => {
          note.addEventListener(eventName, move);
          cleanup.push(() => note.removeEventListener(eventName, move));
        });
      });

      return () => cleanup.forEach((remove) => remove());
    });
  }

  start();

  // Tidy up when leaving the page, and restart if the browser's Back button
  // restores the page from memory.
  window.addEventListener('pagehide', () => media.revert());
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) start();
  });
})();
