/* =====================================================================
   CONTACT-DESK.JS — Contact page only
   1. Draws the pixel-art retro computer: a wide monitor sitting on a
      flat desktop case
   2. Keeps the little clock in the screen's menu bar up to date

   The computer is drawn on a small 164 × 150 pixel canvas and CSS scales it
   up with crisp pixels. The computer's screen is NOT drawn here: it's real
   HTML (in contact.html) laid exactly over the screen area, so the buttons
   are proper links. If you move the screen below, also update the
   position of .desk-screen in contact.css.

   Screen area in canvas pixels: x 17 → 147, y 9 → 85 (out of 164 × 150)
   ===================================================================== */

(() => {
  const canvas = document.querySelector('.desk-scene');
  if (canvas) drawScene(canvas.getContext('2d'));


  /* -------------------------------------------------------------------
     1. THE COMPUTER
     rect(x, y, width, height, color)  a plain rectangle
     stair(x, y, width, height, color) a rectangle with notched corners
     ------------------------------------------------------------------- */

  function drawScene(g) {
    const rect = (x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    };
    const stair = (x, y, w, h, color) => {
      rect(x + 2, y, w - 4, h, color);
      rect(x, y + 2, w, h - 4, color);
    };

    // Colours shared by the monitor and the computer case
    const OUTLINE = '#a8987a';
    const BEIGE = '#e9dcc0';
    const HIGHLIGHT = '#f6eedb';
    const SHADOW = '#cdbd99';
    const DARK = '#6e6550';
    const SLOT = '#8a7b5f';


    // ---- Computer case (the flat box at the bottom) ----------------------
    stair(0, 114, 164, 36, OUTLINE);
    stair(1, 115, 162, 34, BEIGE);
    rect(3, 115, 158, 2, HIGHLIGHT);                     // top highlight
    rect(3, 145, 158, 3, SHADOW);                        // bottom shadow

    // Two floppy-disk drives on the left
    [122, 133].forEach((y) => {
      rect(10, y, 46, 9, SHADOW);
      rect(11, y + 1, 44, 7, '#e1d3b4');
      rect(15, y + 4, 34, 2, DARK);                      // disk slot
      rect(50, y + 3, 3, 2, SLOT);                       // eject button
    });

    // Air vents in the middle
    for (let x = 68; x < 118; x += 4) rect(x, 124, 2, 16, SHADOW);

    // Power button and lights on the right
    stair(128, 125, 16, 14, OUTLINE);
    stair(129, 126, 14, 12, '#e1d3b4');
    rect(133, 130, 6, 4, SHADOW);
    rect(149, 127, 4, 2, '#8fae7a');                     // green power light
    rect(149, 132, 4, 2, '#d99a6c');                     // orange drive light


    // ---- Monitor (sits on top of the case) -------------------------------
    // Stand: a neck under the monitor and a wider base plate on the case.
    // To change its height, move the case up/down and update the canvas
    // height (contact.html) and the sizes in contact.css to match.
    rect(66, 99, 32, 9, OUTLINE);                        // neck outline
    rect(67, 99, 30, 9, SHADOW);                         // neck
    rect(67, 99, 4, 9, BEIGE);                           // neck highlight
    rect(50, 107, 64, 7, OUTLINE);                       // base plate outline
    rect(51, 108, 62, 5, BEIGE);                         // base plate
    rect(51, 108, 62, 1, HIGHLIGHT);
    rect(51, 112, 62, 1, SHADOW);

    stair(7, 0, 150, 100, OUTLINE);                      // outline
    stair(8, 1, 148, 98, BEIGE);                         // body
    rect(10, 2, 144, 2, HIGHLIGHT);                      // top highlight
    rect(9, 4, 2, 92, HIGHLIGHT);                        // left highlight
    rect(153, 4, 2, 92, SHADOW);                         // right shadow
    rect(10, 95, 144, 3, SHADOW);                        // bottom shadow

    // Screen recess (the HTML screen sits on top of the inner part)
    // (The bezel is the beige frame between the body's edge and the screen.)
    stair(13, 5, 138, 84, SHADOW);
    stair(15, 7, 134, 80, DARK);
    rect(17, 9, 130, 76, '#cfe6f0');

    // Chin: a little badge on the left and lights on the right
    rect(24, 91, 26, 2, SLOT);
    rect(128, 91, 3, 2, SLOT);
    rect(133, 91, 3, 2, SLOT);
    rect(138, 91, 3, 2, '#8fae7a');
  }


  /* -------------------------------------------------------------------
     PLANT on the left of the desk (its own small 40 × 52 canvas)
     ------------------------------------------------------------------- */

  const plantCanvas = document.querySelector('.desk-plant');
  if (plantCanvas) drawPlant(plantCanvas.getContext('2d'));

  function drawPlant(g) {
    const rect = (x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    };

    // A pixel leaf: a filled oval with a darker line down the middle.
    function leaf(cx, cy, rx, ry, color, vein) {
      for (let y = -ry; y <= ry; y++) {
        for (let x = -rx; x <= rx; x++) {
          if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) rect(cx + x, cy + y, 1, 1, color);
        }
      }
      for (let y = -ry + 1; y < ry; y++) rect(cx, cy + y, 1, 1, vein);
    }

    // Stems
    rect(19, 12, 2, 24, '#557a4c');
    rect(12, 18, 7, 1, '#557a4c');
    rect(21, 18, 7, 1, '#557a4c');

    // Leaves, back to front: [x, y, width radius, height radius, colour]
    const LEAVES = [
      [20, 6, 4, 6, '#557a4c'],
      [12, 11, 4, 5, '#6f9a5f'],
      [28, 11, 4, 5, '#6f9a5f'],
      [7, 19, 5, 4, '#557a4c'],
      [33, 19, 5, 4, '#557a4c'],
      [15, 19, 4, 4, '#8fae7a'],
      [25, 19, 4, 4, '#8fae7a'],
      [20, 23, 4, 5, '#6f9a5f'],
      [11, 27, 5, 3, '#6f9a5f'],
      [29, 27, 5, 3, '#6f9a5f'],
    ];
    LEAVES.forEach(([x, y, rx, ry, color]) => leaf(x, y, rx, ry, color, '#3f5e38'));

    // Terracotta pot
    rect(8, 34, 24, 5, '#b27050');      // rim
    rect(8, 34, 24, 1, '#c98a66');
    rect(10, 39, 20, 13, '#9a5f44');    // body
    rect(10, 39, 4, 13, '#b27050');     // light side
    rect(26, 39, 4, 13, '#844e38');     // shadow side
    rect(8, 38, 24, 1, '#7a4532');
  }


  /* -------------------------------------------------------------------
     2. MENU BAR CLOCK (shows the visitor's local time)
     ------------------------------------------------------------------- */

  const clock = document.querySelector('.os-clock');

  function updateClock() {
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  updateClock();
  setInterval(updateClock, 30 * 1000);
})();
