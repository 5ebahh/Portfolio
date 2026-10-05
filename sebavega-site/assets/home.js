/* =====================================================================
   HOME.JS — homepage hero only
   1. Draws the pixel-art pictures (folder, camera, sticky note, stationery)
   2. Places the stationery around the hero so it never covers content
   3. Lets visitors drag the stationery around (needs GSAP Draggable)
   4. Makes the three big icons open their pages (Work, Gallery, Contact)
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

  function draw(canvas, type) {
    const g = canvas.getContext('2d');
    g.clearRect(0, 0, canvas.width, canvas.height);

    const rect = (x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    };
    const stair = (x, y, w, h, color) => {
      rect(x + 3, y, w - 6, h, color);
      rect(x, y + 3, w, h - 6, color);
    };

    if (type === 'folders') {
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

      // Paper sticking out, with blue ruled lines and a little photo
      rect(17, 25, 77, 53, '#b9b9a8');
      rect(17, 22, 74, 53, '#fffbee');
      rect(22, 27, 60, 1, '#a6bfd0');
      rect(22, 32, 48, 1, '#a6bfd0');
      rect(22, 37, 61, 1, '#a6bfd0');
      rect(77, 23, 12, 7, '#b9cdd5');

      // Front folder
      stair(5, 39, 100, 48, '#9c794e');
      rect(8, 40, 94, 43, '#e7c786');
      rect(8, 40, 94, 3, '#f5dca4');
      rect(8, 81, 94, 3, '#c5a26a');
      rect(101, 43, 3, 38, '#b89762');

      // Label on the front folder (the "MY WORK" text is HTML on top of this)
      rect(18, 48, 69, 30, '#efe3bd');
      rect(20, 50, 65, 26, '#faf3d6');

      // Speckles of paper texture
      for (let i = 0; i < 22; i++) {
        rect(10 + (i * 19) % 88, 44 + (i * 11) % 33, 1, 1, '#d4b67b');
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

      // Orange light and small details
      rect(73, 25, 7, 4, '#c39163');
      rect(75, 26, 3, 2, '#efc693');
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
    }

    if (type === 'note') {
      // Yellow sticky note with a folded corner and a pin
      rect(5, 7, 48, 55, '#c9b75d');
      rect(5, 7, 48, 48, '#f3de87');
      rect(5, 7, 48, 8, '#e6cb72');
      rect(8, 15, 42, 2, '#f9e9a7');
      rect(5, 56, 43, 5, '#ddc56b');
      rect(48, 52, 5, 5, '#c1a750');
      rect(43, 57, 5, 4, '#b59b4b');
      rect(24, 3, 9, 8, '#b27050');   // pin
      rect(26, 2, 5, 3, '#d09c78');
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

  // How many px² two boxes overlap (0 if they don't touch).
  function overlapArea(x, y, w, h, box) {
    const overlapWidth = Math.max(0, Math.min(x + w, box.right) - Math.max(x, box.left));
    const overlapHeight = Math.max(0, Math.min(y + h, box.bottom) - Math.max(y, box.top));
    return overlapWidth * overlapHeight;
  }

  function positionStationery() {
    const origin = home.getBoundingClientRect();

    // Boxes (relative to the hero) that items should avoid.
    const occupied = [...home.querySelectorAll(PROTECTED)]
      .filter((el) => el.getBoundingClientRect().height)
      .map((el) => {
        const box = el.getBoundingClientRect();
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
      const [targetX, targetY] = TARGETS[i];

      // Try every spot on a grid and keep the best one: closest to the target,
      // with any overlap counting very heavily against it. On narrow screens
      // there may be no completely free spot, but every item still gets placed.
      let best = null;

      for (let y = 20; y < origin.height - h - 12; y += GRID_STEP) {
        for (let x = 12; x < origin.width - w - 12; x += GRID_STEP) {
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
})();
