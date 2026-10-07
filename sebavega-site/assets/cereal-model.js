/* Native model-viewer camera controls preserve vertical touch scrolling.
   Rotation is separate from the page's GSAP reveals and works without GSAP.
   While the scroll sequence (ctp-box.js) is turning the
   box, model.dataset.sequence is set and the idle turn stays off. The
   sequence calls model.idle.later() when it hands the box back. */
(() => {
  const model = document.querySelector('#cereal-model');
  if (!model) return;
  const stage = model.closest('.cs-cereal-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointers = new Set();
  let timer;
  const stop = () => { clearTimeout(timer); model.removeAttribute('auto-rotate'); };
  const resume = () => {
    stop();
    if (model.dataset.sequence) return;
    if (!reduced.matches && !pointers.size && !document.hidden) model.setAttribute('auto-rotate', '');
  };
  const later = () => { stop(); if (!pointers.size) timer = setTimeout(resume, 3000); };
  model.idle = { stop, resume, later };
  model.addEventListener('load', () => { stage.classList.add('is-loaded'); resume(); });
  model.addEventListener('error', () => { stage.classList.remove('is-loaded'); stop(); });
  model.addEventListener('pointerdown', event => { pointers.add(event.pointerId); stop(); }, true);
  const release = event => { if (pointers.delete(event.pointerId)) later(); };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  model.addEventListener('lostpointercapture', release);
  model.addEventListener('pointermove', () => { if (pointers.size) stop(); }, true);
  model.addEventListener('keydown', event => {
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) later();
  });
  model.addEventListener('camera-change', event => {
    if (event.detail.source === 'user-interaction') later();
  });
  reduced.addEventListener('change', resume);
  document.addEventListener('visibilitychange', () => { pointers.clear(); document.hidden ? stop() : later(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', () => { pointers.clear(); if (stage.classList.contains('is-loaded')) resume(); });
})();
