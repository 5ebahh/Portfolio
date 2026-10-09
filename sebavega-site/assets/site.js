/* =====================================================================
   SITE.JS — shared by every page
   1. Marks the page as "JavaScript is running"
   2. Opens and closes the mobile navigation menu
   3. Shows the pixel pencil loader while a page is loading
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. JAVASCRIPT FLAG
   CSS can use "body.js" to style things only when JavaScript works.
   --------------------------------------------------------------------- */

document.body.classList.add('js');


/* ---------------------------------------------------------------------
   2. MOBILE MENU (the ☰ button on small screens)
   --------------------------------------------------------------------- */

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

function closeMenu() {
  menu.setAttribute('aria-label', 'Open navigation menu');
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}

// Clicking the ☰ button opens the menu, or closes it if it's already open.
menu.addEventListener('click', () => {
  const isOpen = menu.getAttribute('aria-expanded') === 'true';

  menu.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('is-open', !isOpen);
  menu.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
});

// Pressing Escape closes the menu and puts keyboard focus back on the button.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});

// Clicking anywhere outside the menu closes it.
document.addEventListener('click', (event) => {
  const clickedInside = menu.contains(event.target) || nav.contains(event.target);
  if (!clickedInside) closeMenu();
});

// If the window grows wide enough to show the full navbar, close the mobile menu.
matchMedia('(min-width: 760px)').addEventListener('change', closeMenu);


/* ---------------------------------------------------------------------
   3. PAGE LOADER (a pixel pencil drawing a circle)
   It only appears if loading takes longer than 350ms, so fast pages
   never flash it.
   --------------------------------------------------------------------- */

const loader = document.querySelector('.page-loader');
const canvas = loader.querySelector('canvas');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const SHOW_DELAY = 350;      // ms to wait before showing the loader
const GIVE_UP_AFTER = 8000;  // ms after which the loader hides no matter what

let animationFrame = 0;
let startTime = 0;
let showTimer = 0;

// Draws one frame of the pencil animation. "now" is the current time in ms.
function paint(now) {
  // How far through the 3-second loop we are (0 to 1), moving in 85ms steps
  // so it feels like pixel animation. With reduced motion it stays still.
  const phase = reducedMotion.matches ? 0.3 : (Math.floor((now - startTime) / 85) * 85 / 3000) % 1;
  const turn = phase * Math.PI * 4;                          // how far the drawing has rotated
  const span = 0.8 + (1 - Math.cos(phase * Math.PI * 2)) * 1.75; // how long the drawn line is

  ctx.clearRect(0, 0, 96, 96);
  ctx.save();
  ctx.translate(48, 48);   // work from the centre of the 96 × 96 canvas
  ctx.rotate(turn);

  // Helper: draw part of a circle (an arc).
  const arc = (radius, width, color, from, to) => {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.arc(0, 0, radius, from, to);
    ctx.stroke();
  };

  // The thin black line the pencil has drawn.
  const tip = -span - Math.atan2(12, 27);
  arc(Math.hypot(27, 12), 1, '#000', tip - 1.1, tip);

  // The pencil body, bent around the circle (three yellow stripes).
  arc(27, 12, '#bd8a41', -span, 0);
  arc(30, 4, '#f3cf72', -span, 0);
  arc(26, 4, '#ddb052', -span, 0);

  // The eraser end: pink rubber with a grey metal band.
  ctx.save();
  ctx.translate(27, 0);
  ctx.fillStyle = '#c88c83';
  ctx.fillRect(-6, 0, 12, 11);
  ctx.fillStyle = '#a6adab';
  ctx.fillRect(-6, 0, 12, 5);
  ctx.restore();

  // The sharpened tip: a wood triangle with a dark lead point.
  ctx.rotate(-span);
  ctx.translate(27, 0);
  ctx.fillStyle = '#d0b48b';
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(6, 0);
  ctx.lineTo(0, -12);
  ctx.fill();
  ctx.fillStyle = '#39434a';
  ctx.fillRect(-1, -12, 2, 4);

  ctx.restore();

  // Keep animating while the loader is visible.
  if (!loader.hidden && !reducedMotion.matches) {
    animationFrame = requestAnimationFrame(paint);
  }
}

// Hide the loader and stop its animation.
function finish() {
  clearTimeout(showTimer);
  cancelAnimationFrame(animationFrame);
  loader.hidden = true;
  document.body.removeAttribute('aria-busy');
}

// Start the countdown to show the loader (cancelled by finish() if loading is quick).
function pending() {
  clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    loader.hidden = false;
    document.body.setAttribute('aria-busy', 'true');
    startTime = performance.now();
    paint(startTime);
  }, SHOW_DELAY);
}

// When this page first opens: wait for fonts and the images shown straight away
// (lazy-loaded images are skipped), then hide the loader.
pending();
const giveUpTimer = setTimeout(finish, GIVE_UP_AFTER);

const eagerImages = [...document.images].filter((img) => img.loading !== 'lazy');

Promise.allSettled([
  document.fonts.ready,
  ...eagerImages.map((img) => img.decode()),
]).finally(() => {
  clearTimeout(giveUpTimer);
  finish();
});

// When someone clicks a link to another page on this site, start the loader.
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');

  // Ignore anything that isn't a plain left-click on a normal link
  // (new tabs, modifier keys, downloads, or links other code already handled).
  if (
    !link ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
    link.target ||
    link.hasAttribute('download')
  ) {
    return;
  }

  const url = new URL(link.href);
  const isOtherPageOnThisSite = url.origin === location.origin && url.pathname !== location.pathname;

  if (isOtherPageOnThisSite) {
    pending();
    setTimeout(finish, GIVE_UP_AFTER);
  }
});

// Coming back with the browser's Back button: make sure the loader is hidden.
addEventListener('pageshow', finish);
