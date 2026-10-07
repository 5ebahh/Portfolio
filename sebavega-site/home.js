/* =====================================================================
   HOME.JS — homepage hero only
   1. Draws the pixel-art pictures (folder, camera, sticky note, stationery)
   2. Places the stationery around the hero so it never covers content
   3. Lets visitors drag the stationery around (needs GSAP Draggable)
   4. Makes the three big icons open their pages (Work, Gallery, Contact)
   5. Hover animations for the three big icons (folder, camera, note)
   ===================================================================== */

(() => {
  const root = document.getElementById('pixel-paper');


  /* -------------------------------------------------------------------
     1. PIXEL ART
     Each <canvas data-art="..."> is drawn here at its small native size;
     CSS scales it up with crisp pixels. Coordinates are in canvas pixels.

     Two helpers do all the drawing:
       rect(x, y, width, height, color)   a plain rectangle
       stair(x, y, width, height, color)  a rectangle with notched corners
                                          (the chunky pixel-art look)
     To recolour something, change its hex colour below.
     ------------------------------------------------------------------- */

  // The three big icons' canvases are trimmed to just their drawing (so all
  // three can be sized to the same height in hero.css). Their drawings below
  // still use the original coordinates; TRIM shifts them into the canvas.
  // [left, top] = the original coordinates of each trimmed canvas's corner.
  const TRIM = {
    folders: [5, 9],    // canvas 100 x 78
    camera: [13, 13],   // canvas 74 x 54
    note: [6, 4],       // canvas 48 x 58
  };

  function draw(canvas, type) {
    const g = canvas.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    const [trimX, trimY] = TRIM[type] || [0, 0];
    g.translate(-trimX, -trimY);

    // Hover animation frame for the three big icons: 0 = resting,
    // 3 = fully animated (part 5 steps through 0 → 3 and back).
    const frame = Number(canvas.dataset.frame) || 0;

    const rect = (x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    };
    const stair = (x, y, w, h, color) => {
      rect(x + 3, y, w - 6, h, color);
      rect(x, y + 3, w, h - 6, color);
    };

    if (type === 'folders') {
      // On hover the front folder tips forward (its top edge drops) and the
      // papers inside rise up to peek out. Each list is indexed by frame.
      const drop = [0, 2, 3, 4][frame];        // front folder's top edge, px
      const rise = [0, 2, 4, 6][frame];        // ruled paper, px
      const photoRise = [0, 4, 8, 11][frame];  // photo print behind it, px

      // Back folder
      stair(12, 17, 92, 64, '#9d7954');
      rect(60, 9, 31, 12, '#9d7954');
      rect(63, 10, 25, 7, '#d8bc82');
      rect(15, 18, 86, 58, '#d8bc82');
      rect(16, 22, 83, 2, '#eed6a3');

      // Middle folder
      stair(6, 26, 97, 58, '#a17c50');
      rect(11, 17, 33, 12, '#a17c50');
      rect(14, 18, 27, 8, '#e7cd94');
      rect(9, 28, 91, 52, '#e7cd94');
      rect(12, 29, 86, 3, '#f7e5b4');

      // Photo print tucked behind the paper (only shows when it rises)
      const py = 22 - photoRise;
      rect(57, py, 30, 26, '#b9b9a8');
      rect(58, py + 1, 28, 24, '#fffdf4');
      rect(60, py + 3, 24, 16, '#9cc3d6');     // sky
      rect(60, py + 13, 24, 6, '#8fae7a');     // hill
      rect(66, py + 11, 8, 2, '#8fae7a');
      rect(77, py + 5, 3, 3, '#f3d58a');       // sun

      // Paper sticking out, with blue ruled lines and a little photo
      const ry = 22 - rise;
      rect(17, ry + 3, 77, 53, '#b9b9a8');
      rect(17, ry, 74, 53, '#fffbee');
      rect(22, ry + 5, 60, 1, '#a6bfd0');
      rect(22, ry + 10, 48, 1, '#a6bfd0');
      rect(22, ry + 15, 61, 1, '#a6bfd0');
      rect(77, ry + 1, 12, 7, '#b9cdd5');

      // Front folder (its top edge drops by "drop" when it tips open)
      stair(5, 39 + drop, 100, 48 - drop, '#9c794e');
      rect(8, 40 + drop, 94, 43 - drop, '#e7c786');
      rect(8, 40 + drop, 94, 3, '#f5dca4');
      rect(8, 81, 94, 3, '#c5a26a');
      rect(101, 43 + drop, 3, 38 - drop, '#b89762');

      // Label on the front folder (the "MY WORK" text is HTML on top of this;
      // part 5 moves the text down with the label)
      rect(18, 48 + drop, 69, 30 - drop, '#efe3bd');
      rect(20, 50 + drop, 65, 26 - drop, '#faf3d6');

      // Speckles of paper texture
      for (let i = 0; i < 22; i++) {
        const y = 44 + (i * 11) % 33;
        if (y > 42 + drop) rect(10 + (i * 19) % 88, y, 1, 1, '#d4b67b');
      }
    }

    if (type === 'camera') {
      // Body
      stair(13, 27, 74, 40, '#343c40');
      rect(16, 30, 68, 33, '#535b59');
      rect(16, 33, 12, 27, '#3e4646');   // grip
      rect(18, 36, 2, 21, '#6a726a');
      rect(23, 37, 2, 20, '#29373a');

      // Top plate, viewfinder and shutter button
      stair(13, 20, 74, 16, '#68736f');
      rect(16, 21, 68, 11, '#c6cbba');
      rect(18, 21, 64, 3, '#e1e2d3');
      rect(58, 17, 16, 5, '#313b3e');
      rect(61, 16, 11, 3, '#576665');
      rect(26, 15, 26, 8, '#798983');
      rect(29, 13, 20, 5, '#a5b4ac');
      rect(33, 16, 13, 7, '#344750');
      rect(36, 17, 7, 3, '#658c99');

      // Orange light and small details (the light brightens on hover)
      rect(73, 25, 7, 4, frame ? '#f0b46c' : '#c39163');
      rect(75, 26, 3, 2, frame ? '#fff3c4' : '#efc693');
      rect(63, 28, 5, 2, '#34414a');

      // Lens: rings from the outside in, then the glass and its reflections
      stair(29, 29, 39, 36, '#27363b');
      stair(33, 32, 32, 30, '#939f96');
      stair(37, 35, 24, 24, '#344b52');
      stair(40, 38, 18, 18, '#1b303b');
      stair(43, 41, 12, 12, '#356579');
      rect(43, 41, 5, 6, '#80a6a9');
      rect(48, 47, 5, 5, '#183b4a');
      rect(44, 43, 3, 2, '#c2d8c8');

      // Grip dots along the bottom and side
      for (let i = 0; i < 8; i++) {
        rect(30 + i * 4, 64, 2, 2, '#687971');
        rect(82, 34 + i * 3, 2, 1, '#899184');
      }

      // Hover: a shine sweeps across the lens glass, left to right...
      if (frame) {
        const x = [0, 44, 47, 50][frame];
        g.globalAlpha = 0.55;
        rect(x, 42, 2, 10, '#ffffff');
        rect(x + 2, 44, 1, 6, '#ffffff');
        g.globalAlpha = 1;
      }

      // ...and a pixel sparkle pops on the lens ring where the shine ends.
      // (It sits on the camera body so the hover shadow can't copy it onto
      // the paper.) size = arm length in px for each frame.
      const size = [0, 0, 2, 4][frame];
      if (size) {
        const cx = 59, cy = 37;
        rect(cx - size, cy, size * 2 + 1, 1, '#f3c95f');   // arms
        rect(cx, cy - size, 1, size * 2 + 1, '#f3c95f');
        rect(cx - 1, cy - 1, 3, 3, '#ffe7a3');             // glow
        rect(cx, cy, 1, 1, '#ffffff');                     // bright centre
        if (size > 2) rect(cx - 6, cy + 4, 1, 1, '#ffe7a3');   // tiny twinkle
      }
    }

    if (type === 'note') {
      // One yellow sticky note held on with a strip of tape. Its bottom-right
      // corner lies flat until hover, then folds up (see part 5 below).
      // No shadow is drawn here: like the folder and camera, it only gets a
      // shadow on hover (see .pp-object:hover in styles.css).
      // "CONTACT ME" is HTML on top (.pp-note-text in hero.css).

      rect(6, 8, 48, 54, '#f3de87');
      rect(6, 8, 48, 9, '#e8cf76');               // sticky strip at the top
      rect(6, 17, 48, 1, '#f9e9a7');              // highlight under the strip
      rect(52, 8, 2, 54, '#e2c86f');              // right edge
      rect(6, 60, 48, 2, '#e2c86f');              // bottom edge

      // Two faint ruled lines under the lettering
      rect(11, 49, 34, 1, '#e6cc74');
      rect(11, 55, 30, 1, '#e6cc74');

      // Folded corner (bottom right). F is how far it's folded, in pixels
      // (0 = flat, 9 = fully folded), set by the hover frame. The fold
      // runs diagonally across an F x F box at the corner: past the fold the
      // corner is gone (clear canvas), and the flap's paler underside folds
      // back over the note.
      const F = [0, 3, 6, 9][frame];
      const FX = 54 - F, FY = 62 - F;
      for (let dy = 0; dy < F; dy++) {
        for (let dx = 0; dx < F; dx++) {
          const d = dx + dy;
          if (d > F - 1) {
            g.clearRect(FX + dx, FY + dy, 1, 1);               // lifted away
            continue;
          }
          let color = '#fbf0c4';                                // flap underside
          if (d === F - 1) color = '#c9b75d';                   // fold line
          else if (dx === 0 || dy === 0) color = '#e2cd7f';     // flap edge
          rect(FX + dx, FY + dy, 1, 1, color);
        }
      }
      if (F > 1) rect(FX - 1, FY + 1, 1, F - 1, '#e2c86f');   // small shade left of the flap

      // Strip of tape across the top edge (see-through, with torn ends)
      g.globalAlpha = 0.75;
      rect(19, 4, 22, 9, '#efe9d6');
      g.globalAlpha = 1;
      for (let y = 4; y < 13; y += 2) {
        rect(18, y, 1, 1, '#e3dcc4');             // torn left end
        rect(41, y + 1, 1, 1, '#e3dcc4');         // torn right end
      }
      rect(20, 5, 20, 1, '#fbf8ee');              // shine on the tape
    }

    if (type === 'pencil') {
      rect(12, 7, 63, 10, '#bd8a41');   // body
      rect(12, 7, 63, 3, '#f3cf72');
      rect(12, 10, 63, 4, '#ddb052');
      rect(12, 14, 63, 3, '#b7873c');
      rect(75, 7, 5, 10, '#a6adab');    // metal band
      rect(76, 8, 2, 8, '#d8d5bf');
      rect(80, 7, 8, 10, '#c88c83');    // eraser
      rect(80, 7, 6, 3, '#e7b5a2');
      rect(8, 9, 4, 6, '#d0b48b');      // sharpened wood
      rect(4, 11, 4, 3, '#d0b48b');
      rect(2, 12, 3, 2, '#42494a');     // lead tip
    }

    if (type === 'ruler') {
      stair(2, 4, 88, 17, '#b5a06a');
      rect(4, 5, 83, 13, '#e7d3a0');
      rect(4, 5, 83, 2, '#f9e7bd');

      // Tick marks, alternating short and long
      for (let i = 0; i < 17; i++) {
        rect(7 + i * 5, 6, 1, i % 2 ? 4 : 7, '#8b815f');
      }
      for (let i = 0; i < 8; i++) {
        rect(9 + i * 10, 15, 2, 1, '#b1a079');
      }
    }

    if (type === 'paperclip') {
      rect(5, 2, 8, 2, '#8f9f9e');
      rect(3, 4, 2, 21, '#8f9f9e');
      rect(13, 4, 2, 19, '#8f9f9e');
      rect(5, 25, 6, 2, '#8f9f9e');
      rect(11, 9, 2, 16, '#8f9f9e');
      rect(7, 7, 4, 2, '#8f9f9e');
      rect(5, 9, 2, 12, '#b8c8c6');
      rect(7, 21, 3, 2, '#8f9f9e');
      rect(5, 3, 7, 1, '#d5dfd8');      // shine
      rect(4, 5, 1, 19, '#cbd8d4');
    }

    if (type === 'eraser') {
      stair(3, 5, 34, 15, '#b77f79');
      rect(5, 5, 18, 12, '#dfaaa1');    // pink half
      rect(5, 5, 18, 3, '#efc8ba');
      rect(23, 5, 12, 12, '#91aaa9');   // blue half
      rect(23, 5, 12, 3, '#c2d0c6');
      rect(7, 17, 26, 2, '#946f69');
    }

    if (type === 'sd-card') {
      rect(10, 3, 22, 30, '#303d45');   // card shape with the cut corner
      rect(6, 9, 26, 24, '#303d45');
      rect(8, 6, 24, 27, '#303d45');
      rect(9, 11, 20, 18, '#48606b');
      rect(10, 12, 18, 12, '#e7e5d6');  // label
      rect(10, 12, 18, 5, '#376399');
      rect(13, 20, 12, 1, '#7c8e91');
      rect(13, 22, 8, 1, '#7c8e91');
      for (let i = 0; i < 4; i++) {
        rect(13 + i * 4, 4, 2, 5, '#d9b765');   // gold contacts
      }
      rect(10, 30, 19, 1, '#64777b');
    }

    if (type === 'sticker') {
      stair(3, 3, 26, 26, '#faf5df');   // white sticker border
      stair(5, 5, 22, 22, '#d5ab54');
      rect(9, 8, 14, 15, '#edcf75');    // smiley face
      rect(7, 10, 18, 11, '#edcf75');
      rect(11, 11, 2, 4, '#796745');    // eyes
      rect(19, 11, 2, 4, '#796745');
      rect(11, 19, 2, 2, '#796745');    // smile
      rect(13, 21, 6, 2, '#796745');
      rect(19, 19, 2, 2, '#796745');
      rect(8, 7, 4, 2, '#f6dfa0');      // shine
    }
  }

  // Draw every picture once (canvases keep their native size, so no redraws are needed).
  root.querySelectorAll('canvas[data-art]').forEach((canvas) => draw(canvas, canvas.dataset.art));


  /* -------------------------------------------------------------------
     2. PLACING THE STATIONERY
     The six small items (pencil, ruler, paperclip, sticker, eraser, SD card)
     are placed as close as possible to a target spot while staying clear
     of the headline, the three big icons, their labels and the Scroll cue.
     The result is the same on every visit (nothing random).
     ------------------------------------------------------------------- */

  const home = root.querySelector('.pp-home');
  const movable = [...home.querySelectorAll(':scope > canvas[data-art]')];

  // Things the stationery must not cover.
  const PROTECTED = '.pp-intro, .pp-sprite, .pp-object-label, .pp-scene-note, .pp-restored-cue';
  const PROTECTED_PADDING = 18;   // extra px of breathing room around them
  const ITEM_PADDING = 8;         // breathing room between two stationery items
  const GRID_STEP = 18;           // how finely to search for a spot, in px

  // Target spot for each item, as fractions of the hero's width and height
  // (0,0 = top-left, 1,1 = bottom-right). Same order as the canvases in the HTML:
  // pencil, ruler, paperclip, sticker, eraser, SD card.
  const TARGETS = [
    [0.12, 0.40],
    [0.90, 0.66],
    [0.18, 0.13],
    [0.73, 0.91],
    [0.25, 0.83],
    [0.88, 0.23],
  ];

  // Full-screen sizes (WIDE_SCREEN and up) use their own targets: one item
  // at the top, middle and bottom of each side, mirrored left and right
  // (paperclip / SD card in the top corners, pencil / ruler in the middle,
  // eraser / sticker at the bottom), a little in from the edges.
  const WIDE_SCREEN = '(min-width: 1440px)';
  const TARGETS_WIDE = [
    [0.075, 0.47],   // pencil
    [0.925, 0.60],   // ruler
    [0.085, 0.14],   // paperclip
    [0.75, 0.90],    // sticker
    [0.25, 0.88],    // eraser
    [0.915, 0.14],   // SD card
  ];

  // Text blocks (the headline, the line under it, "A few things to explore")
  // stretch the full width of the hero even though the words sit in the
  // middle. On wide screens, only the space the words (and the icon
  // drawings) actually take up is kept clear, so the corners beside the
  // headline and the gaps beside the icons can be used.
  const TEXT_BLOCKS = '.pp-intro h1, .pp-intro .pp-overline, .pp-scene-note';
  const LEFT_EDGE_WIDE = 56;   // px: keeps items off the red margin line on wide screens

  function protectedBoxes(wide) {
    const selector = wide
      ? `${TEXT_BLOCKS}, .pp-art, .pp-object-label, .pp-restored-cue`   // .pp-art = the drawing itself, not its wider box
      : PROTECTED;

    return [...home.querySelectorAll(selector)]
      .filter((el) => el.getBoundingClientRect().height)
      .map((el) => {
        if (!wide || !el.matches(TEXT_BLOCKS)) return el.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(el);   // the box around just the words
        return range.getBoundingClientRect();
      });
  }

  // How many px² two boxes overlap (0 if they don't touch).
  function overlapArea(x, y, w, h, box) {
    const overlapWidth = Math.max(0, Math.min(x + w, box.right) - Math.max(x, box.left));
    const overlapHeight = Math.max(0, Math.min(y + h, box.bottom) - Math.max(y, box.top));
    return overlapWidth * overlapHeight;
  }

  function positionStationery() {
    const origin = home.getBoundingClientRect();
    const wide = matchMedia(WIDE_SCREEN).matches;
    const targets = wide ? TARGETS_WIDE : TARGETS;
    const minX = wide ? LEFT_EDGE_WIDE : 12;

    // Boxes (relative to the hero) that items should avoid.
    const occupied = protectedBoxes(wide)
      .map((box) => {
        return {
          left: box.left - origin.left - PROTECTED_PADDING,
          top: box.top - origin.top - PROTECTED_PADDING,
          right: box.right - origin.left + PROTECTED_PADDING,
          bottom: box.bottom - origin.top + PROTECTED_PADDING,
        };
      });

    movable.forEach((item, i) => {
      // Leave an item alone while someone is dragging it.
      if (item.classList.contains('is-dragging')) return;

      const box = item.getBoundingClientRect();
      const w = box.width;
      const h = box.height;
      const [targetX, targetY] = targets[i];

      // Try every spot on a grid and keep the best one: closest to the target,
      // with any overlap counting very heavily against it. On narrow screens
      // there may be no completely free spot, but every item still gets placed.
      let best = null;

      for (let y = 20; y < origin.height - h - 12; y += GRID_STEP) {
        for (let x = minX; x < origin.width - w - 12; x += GRID_STEP) {
          const overlap = occupied.reduce((sum, other) => sum + overlapArea(x, y, w, h, other), 0);
          const distance = Math.hypot((x + w / 2) / origin.width - targetX, (y + h / 2) / origin.height - targetY);
          const score = overlap * 1000 + distance;

          if (!best || score < best.score) best = { x, y, score };
        }
      }

      if (!best) return;

      // Move the item so its visible box lands on the chosen spot.
      item.style.left = `${item.offsetLeft + best.x - (box.left - origin.left)}px`;
      item.style.top = `${item.offsetTop + best.y - (box.top - origin.top)}px`;
      item.style.right = 'auto';
      item.style.bottom = 'auto';

      // Later items should avoid this one too.
      occupied.push({
        left: best.x - ITEM_PADDING,
        top: best.y - ITEM_PADDING,
        right: best.x + w + ITEM_PADDING,
        bottom: best.y + h + ITEM_PADDING,
      });
    });
  }


  /* -------------------------------------------------------------------
     3. DRAGGING (uses GSAP's Draggable plugin, loaded in index.html)
     ------------------------------------------------------------------- */

  let stationeryDrags = [];
  let placementFrame;

  // Re-place the stationery whenever the hero changes size (and refresh drag limits).
  function schedulePlacement() {
    cancelAnimationFrame(placementFrame);
    placementFrame = requestAnimationFrame(() => {
      positionStationery();
      stationeryDrags.forEach((drag) => drag.applyBounds(home));
    });
  }

  new ResizeObserver(schedulePlacement).observe(home);
  document.fonts.ready.then(schedulePlacement);

  if (window.gsap && window.Draggable) {
    gsap.registerPlugin(Draggable);

    const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

    stationeryDrags = Draggable.create(movable, {
      type: 'x,y',
      bounds: home,            // items can't be dragged outside the hero
      edgeResistance: 1,
      minimumMovement: 5,
      allowContextMenu: true,

      // Picked up: add a shadow and grow slightly (no growing with reduced motion).
      onPress() {
        this.target.classList.add('is-dragging');
        gsap.to(this.target, {
          filter: 'drop-shadow(6px 9px 0 #8f877466)',
          scale: reduce() ? 1 : 1.06,
          duration: 0.18,
          ease: 'steps(3)',
          overwrite: 'auto',
        });
      },

      // Put down: remove the shadow and return to normal size.
      onRelease() {
        const item = this.target;
        item.classList.remove('is-dragging');
        gsap.to(item, {
          filter: 'drop-shadow(0px 0px 0px transparent)',
          scale: 1,
          duration: 0.18,
          ease: 'steps(3)',
          overwrite: 'auto',
        });
      },
    });
  }


  /* -------------------------------------------------------------------
     4. THE THREE BIG ICONS
     Each icon opens a page. To change where one goes, edit PAGES.
     Addresses are written without ".html" (e.g. 'work' opens work.html).
     (data-page="..." on each icon in index.html picks its entry.)
     ------------------------------------------------------------------- */

  const PAGES = {
    work: 'work',             // My Work folder
    photos: 'gallery',        // camera
    contact: 'contact',       // Contact Me sticky note
  };

  root.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const url = PAGES[button.dataset.page];
      if (url) location.href = url;
    });
  });


  /* -------------------------------------------------------------------
     5. HOVER ANIMATIONS FOR THE THREE BIG ICONS
     Hovering (or tabbing to) an icon steps its drawing through frames
     1 → 3, timed with the icon's 3-step lift; leaving steps it back to 0.
       Folder: tips open and the papers rise to peek out
       Camera: lens shine, brighter light and a sparkle
       Sticky note: the bottom-right corner folds up
     The frames themselves are drawn in part 1.
     ------------------------------------------------------------------- */

  const LAST_FRAME = 3;
  const FRAME_MS = 60;

  root.querySelectorAll('.pp-object[data-page]').forEach((button) => {
    const canvas = button.querySelector('canvas[data-art]');
    if (!canvas) return;

    let frame = 0;
    let timer;

    const showFrame = (n) => {
      frame = n;
      canvas.dataset.frame = n;
      draw(canvas, canvas.dataset.art);

      // The folder's label drops as the front folder tips open, so the
      // "MY WORK" text (HTML) follows it. See .pp-folder-title in styles.css.
      if (canvas.dataset.art === 'folders') {
        button.style.setProperty('--folder-drop', [0, 2, 3, 4][n]);
      }
    };

    // Step toward the last frame (open = true) or back to resting.
    const animateTo = (open) => {
      clearInterval(timer);
      const target = open ? LAST_FRAME : 0;

      // With reduced motion, jump straight to the end.
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        showFrame(target);
        return;
      }

      timer = setInterval(() => {
        if (frame === target) return clearInterval(timer);
        showFrame(frame + (target > frame ? 1 : -1));
      }, FRAME_MS);
    };

    const update = () => animateTo(button.matches(':hover, :focus-visible'));
    ['pointerenter', 'pointerleave', 'focus', 'blur'].forEach((eventName) => {
      button.addEventListener(eventName, update);
    });
  });
})();
