/* =====================================================================
   WORK-FISHBOWL.JS — Work page only
   A pixel-art fishbowl next to "Selected work."
   - The fish swims back and forth, blowing the odd bubble.
   - With a mouse, the fish follows the cursor over the bowl.
   - Clicking or tapping the bowl (or pressing Enter) makes it jump out,
     and the note beside the bowl shouts something excited.
   - 1 visit in 5, the goldfish is Mr. Blue the betta, with a name tag.

   Everything is drawn on a small 96 × 101 pixel canvas, and CSS scales
   it up with crisp pixels. All positions below are in those canvas pixels.

   The easiest things to change are in SETTINGS and COLORS just below.
   ===================================================================== */

(() => {
  const button = document.querySelector('.fishbowl');
  if (!button) return;

  const canvas = button.querySelector('canvas');
  const note = document.querySelector('.fishbowl-note');
  const g = canvas.getContext('2d');
  const W = canvas.width;    // 96
  const H = canvas.height;   // 101 (the bowl's flat base is the bottom row)
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');


  /* ---------------------------------------------------------------------
     SETTINGS — safe to tweak
     --------------------------------------------------------------------- */

  const BETTA_CHANCE = 0.2;    // 0.2 = 1 in 5 visits get Mr. Blue (0 = never, 1 = always)
  const SWIM_SPEED = 0.25;     // normal swimming speed (px per frame)
  const FOLLOW_SPEED = 0.55;   // speed when following the mouse
  const BUBBLE_CHANCE = 0.006; // chance of a bubble each frame
  const PEAK_Y = 4;            // highest point of a jump (0 = very top of the canvas)
  const GRAVITY = 0.09;        // bigger = faster, shorter jumps

  // What the note next to the bowl says each time the fish jumps.
  // One is picked at random (never the same one twice in a row).
  // Add, remove or edit as many as you like.
  const EXCLAMATIONS = [
    'Woohoo!',
    'Yippie!',
    'Wow!',
    'Did you see that?!',
    'Wheee!',
    'Splash!',
    'Look at me go!',
    'Again! Again!',
    'Boing!',
    'Yahoo!',
  ];


  /* ---------------------------------------------------------------------
     COLORS
     --------------------------------------------------------------------- */

  const COLORS = {
    glass: '#91adc5',
    lip: '#6f8fa8',          // the rim line across the top of the bowl
    shine: '#fffbee',        // highlight on the glass, ripples
    water: '#c9dbe3',
    surface: '#e8f1f2',      // top line of the water, bubbles
    gravel: ['#9d7954', '#d8bc82', '#e7cd94', '#b89762'],
    plant: '#557a4c',
    plantLight: '#8fae7a',
  };


  /* ---------------------------------------------------------------------
     BOWL SHAPE
     The bowl is a circle with the top sliced off (the opening) and a
     flat base. The empty space above it is sky for the fish to jump into.
     --------------------------------------------------------------------- */

  const BOWL_X = 48;       // centre of the bowl's circle
  const BOWL_Y = 72;
  const RADIUS = 32;
  const RIM_Y = 47;        // the opening at the top
  const WATER_Y = 54;      // the water's surface
  const GRAVEL_Y = 94;     // top of the gravel
  const FLOOR_Y = 100;     // the flat base

  // Is pixel (x, y) inside the bowl?
  function insideBowl(x, y) {
    const dx = x - BOWL_X + 0.5;
    const dy = y - BOWL_Y + 0.5;
    return dx * dx + dy * dy <= RADIUS * RADIUS && y >= RIM_Y && y <= FLOOR_Y;
  }


  /* ---------------------------------------------------------------------
     DRAW THE BOWL ONCE
     It's split into two layers so the fish can swim between them:
       back  = water, gravel, plants and the rim line (behind the fish)
       front = glass walls and the shine (in front of the fish)
     --------------------------------------------------------------------- */

  function makeLayer() {
    const layer = document.createElement('canvas');
    layer.width = W;
    layer.height = H;
    return layer;
  }

  const back = makeLayer();
  const front = makeLayer();

  function drawBowl() {
    const b = back.getContext('2d');
    const f = front.getContext('2d');
    const pixel = (ctx, x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    };

    // Glass, water and gravel, one pixel at a time.
    for (let y = RIM_Y; y <= FLOOR_Y; y++) {
      for (let x = 0; x < W; x++) {
        if (!insideBowl(x, y)) continue;

        // Within 2px of the edge = glass.
        const isGlass = !insideBowl(x - 2, y) || !insideBowl(x + 2, y) || !insideBowl(x, y + 2) || y === FLOOR_Y;

        if (isGlass) pixel(f, x, y, COLORS.glass);
        else if (y >= GRAVEL_Y) pixel(b, x, y, COLORS.gravel[(x * 7 + y * 3) % 4]);   // mixed gravel colours
        else if (y === WATER_Y) pixel(b, x, y, COLORS.surface);
        else if (y > WATER_Y) pixel(b, x, y, COLORS.water);
      }
    }

    // The rim line is the far edge of the opening, so it goes on the BACK layer:
    // a jumping fish passes in front of it rather than through it.
    for (let x = 0; x < W; x++) {
      if (insideBowl(x, RIM_Y) && insideBowl(x - 2, RIM_Y) && insideBowl(x + 2, RIM_Y)) {
        pixel(b, x, RIM_Y, COLORS.lip);
        pixel(b, x, RIM_Y + 1, COLORS.lip);
      }
    }

    // Three wavy plants: [x position, wave offset, height].
    const PLANTS = [[28, 0, 22], [32, 1, 16], [66, 2, 12]];

    PLANTS.forEach(([plantX, phase, height]) => {
      for (let y = GRAVEL_Y - 1; y > GRAVEL_Y - height; y--) {
        const x = plantX + Math.round(Math.sin((y + phase * 3) / 3) * 1.2);
        pixel(b, x, y, y % 3 ? COLORS.plant : COLORS.plantLight);
        if (y % 4 === 0) pixel(b, x + 1, y, COLORS.plantLight);   // little leaves
      }
    });

    // Curved shine on the left of the glass.
    for (let angle = 2.35; angle < 3.35; angle += 0.04) {
      const x = Math.round(BOWL_X + Math.cos(angle) * (RADIUS - 6));
      const y = Math.round(BOWL_Y + Math.sin(angle) * (RADIUS - 6));
      if (insideBowl(x, y)) pixel(f, x, y, COLORS.shine);
    }
  }

  drawBowl();


  /* ---------------------------------------------------------------------
     FISH SPRITES
     Each fish is drawn from rows of letters. Every letter is one pixel
     and "." is see-through. The tail is on the left and the head on the
     right; the code flips it when the fish swims left. Each fish has two
     frames that alternate to wag the tail.
     --------------------------------------------------------------------- */

  const SPRITES = {
    goldfish: {
      frames: [
        ['T...BBB..',
         'TT.BBBBB.',
         '.TBBBBBEB',
         '.TBBBBBBB',
         'TT.LLLLL.',
         'T...LL...'],
        ['.T..BBB..',
         '.TTBBBBB.',
         'TTBBBBBEB',
         'TTBBBBBBB',
         '.TTLLLLL.',
         '.T..LL...'],
      ],
      // B = body, L = belly, T = tail and fins, E = eye
      colors: { B: '#e08a3c', L: '#f2b25e', T: '#bd6542', E: '#39434a' },
    },

    betta: {   // Mr. Blue
      frames: [
        ['TT....DDD...',
         'TTT..DDDDD..',
         'TTTTBBBBBBB.',
         'TTTBBBBBBBEB',
         'TTTTBBBBBBBB',
         'TTT..AAAAA..',
         'TT...AAAA...',
         'T.....AA....'],
        ['.T....DDD...',
         'TTT..DDDDD..',
         '.TTTBBBBBBB.',
         'TTTTBBBBBBEB',
         '.TTTBBBBBBBB',
         'TTTT.AAAAA..',
         '.TT..AAAA...',
         'TT....AA....'],
      ],
      // B = body, T = tail, D = top fin, A = bottom fin, E = eye
      colors: { B: '#2f5a8f', T: '#5b8fd1', D: '#4f7fbf', A: '#6c9ad6', E: '#e8f1f2' },
    },
  };

  // Pick today's fish. Adding ?fish=betta (or ?fish=goldfish) to the URL forces one.
  const forcedFish = new URLSearchParams(location.search).get('fish');
  const kind = forcedFish in SPRITES ? forcedFish : (Math.random() < BETTA_CHANCE ? 'betta' : 'goldfish');
  const { frames: FISH_FRAMES, colors: FISH_COLORS } = SPRITES[kind];

  const FISH_W = FISH_FRAMES[0][0].length;   // sprite width in pixels
  const FISH_H = FISH_FRAMES[0].length;      // sprite height in pixels
  const FISH_MIDDLE = Math.floor((FISH_W - 1) / 2);

  // Mr. Blue gets his name tag and a matching label for screen readers.
  if (kind === 'betta') {
    const tag = document.querySelector('.fish-tag');
    if (tag) tag.hidden = false;
    button.setAttribute('aria-label', 'Fishbowl with Mr. Blue the betta: press to make him jump');
  }

  // Draw the fish with its top-left corner at (x, y).
  // tilt: -1 = nose up, 0 = level, 1 = nose down (used mid-jump).
  function drawFish(x, y, facingRight, frame, tilt = 0) {
    FISH_FRAMES[frame].forEach((row, j) => {
      [...row].forEach((letter, i) => {
        if (letter === '.') return;

        const shear = tilt * Math.round((i - FISH_MIDDLE) / 3);   // pixels nearer the head move more
        const px = Math.round(x) + (facingRight ? i : FISH_W - 1 - i);
        const py = Math.round(y) + j + shear;

        g.fillStyle = FISH_COLORS[letter];
        g.fillRect(px, py, 1, 1);
      });
    });
  }


  /* ---------------------------------------------------------------------
     JUMP PLANNING
     A jump is a simple arc (like a thrown ball). To make sure the fish
     never passes through the glass, it only crosses the rim where its
     whole body fits through the opening (between MOUTH_LEFT and
     MOUTH_RIGHT), on the way up and on the way down.
     --------------------------------------------------------------------- */

  const SWIM_Y = 72;                  // the depth the fish swims at
  const SWIM_LEFT = 22;               // how far left and right it swims
  const SWIM_RIGHT = 74 - FISH_W;
  const MOUTH_LEFT = 32;              // where the fish's left edge may cross the rim
  const MOUTH_RIGHT = 64 - FISH_W;

  // Upward speed needed to reach PEAK_Y.
  const LAUNCH_SPEED = -Math.sqrt(2 * GRAVITY * (SWIM_Y - PEAK_Y));

  // When (in frames) the fish passes the rim on the way up, and on the way down.
  const discriminant = Math.sqrt(LAUNCH_SPEED * LAUNCH_SPEED - 2 * GRAVITY * (SWIM_Y - RIM_Y));
  const RIM_TIME_UP = (-LAUNCH_SPEED - discriminant) / GRAVITY;
  const RIM_TIME_DOWN = (-LAUNCH_SPEED + discriminant) / GRAVITY;

  // Work out where to launch from and how fast to move sideways.
  // direction: 1 = jump to the right, -1 = jump to the left.
  function planJump(direction) {
    const crossUpAt = direction > 0 ? MOUTH_LEFT : MOUTH_RIGHT;
    const crossDownAt = direction > 0 ? MOUTH_RIGHT : MOUTH_LEFT;
    const sideSpeed = (crossDownAt - crossUpAt) / (RIM_TIME_DOWN - RIM_TIME_UP);

    return { launchX: crossUpAt - sideSpeed * RIM_TIME_UP, sideSpeed };
  }


  /* ---------------------------------------------------------------------
     WHAT'S HAPPENING RIGHT NOW
     The fish is always in one of three modes:
       'swim'   swimming normally
       'windup' darting to the launch spot before a jump
       'air'    mid-jump
     --------------------------------------------------------------------- */

  const fish = {
    x: 40,
    y: SWIM_Y,
    direction: 1,        // 1 = facing right, -1 = facing left
    mouseX: null,        // where the mouse is over the bowl (null = not hovering)
    speedX: 0,
    speedY: 0,
    mode: 'swim',
    plan: null,
  };

  let bubbles = [];      // { x, y }
  let drops = [];        // splash droplets { x, y, speedX, speedY, life }
  let ripple = null;     // { x, life } after a splash
  let lastExclamation = '';   // so the same word never shows twice in a row
  let time = 0;          // counts up every frame (used for wiggles and bobbing)

  function splash(x) {
    ripple = { x, life: 20 };
    for (let i = 0; i < 9; i++) {
      drops.push({
        x,
        y: WATER_Y,
        speedX: (Math.random() - 0.5) * 1.8,
        speedY: -1.4 - Math.random() * 1.4,
        life: 30,
      });
    }
  }


  /* ---------------------------------------------------------------------
     UPDATE — move everything forward by one step.
     dt is 1 for a normal frame (60 per second), or bigger if the browser
     skipped frames, so the speed stays the same on any device.
     --------------------------------------------------------------------- */

  function update(dt) {
    time += dt;

    if (fish.mode === 'windup') {
      // Dart quickly to the launch spot.
      const dx = fish.plan.launchX - fish.x;
      fish.direction = Math.sign(dx) || fish.direction;
      fish.x += Math.sign(dx) * Math.min(Math.abs(dx), 1.4 * dt);
      fish.y += (SWIM_Y - fish.y) * Math.min(1, 0.3 * dt);

      // Arrived: launch!
      if (Math.abs(dx) < 0.5) {
        fish.x = fish.plan.launchX;
        fish.y = SWIM_Y;
        fish.direction = Math.sign(fish.plan.sideSpeed);
        fish.speedX = fish.plan.sideSpeed;
        fish.speedY = LAUNCH_SPEED;
        fish.mode = 'air';
      }
    } else if (fish.mode === 'air') {
      const previousY = fish.y;

      fish.speedY += GRAVITY * dt;
      fish.y += fish.speedY * dt;
      fish.x += fish.speedX * dt;

      // Splash when leaving the water and when landing back in it.
      const leftWater = previousY >= WATER_Y && fish.y < WATER_Y;
      const hitWater = fish.speedY > 0 && previousY < WATER_Y && fish.y >= WATER_Y;
      if (leftWater || hitWater) splash(fish.x + FISH_W / 2);

      // Back at swimming depth: the jump is over.
      if (fish.speedY > 0 && fish.y >= SWIM_Y) {
        fish.y = SWIM_Y;
        fish.speedX = 0;
        fish.mode = 'swim';
      }
    } else {
      // Swim toward the mouse if hovering; otherwise toward the far side of the bowl.
      const goal = fish.mouseX ?? (fish.direction > 0 ? SWIM_RIGHT : SWIM_LEFT);
      const dx = goal - fish.x;
      const speed = fish.mouseX == null ? SWIM_SPEED : FOLLOW_SPEED;

      if (Math.abs(dx) > 0.6) {
        fish.direction = Math.sign(dx);
        fish.x += fish.direction * Math.min(Math.abs(dx), speed * dt);
      } else if (fish.mouseX == null) {
        fish.direction *= -1;   // reached the side: turn around
      }

      // Gentle up-and-down bobbing.
      fish.y = SWIM_Y + Math.sin(time / 22) * 2;

      // Now and then, blow a bubble from the fish's mouth.
      if (Math.random() < BUBBLE_CHANCE * dt) {
        bubbles.push({ x: fish.x + (fish.direction > 0 ? FISH_W : -1), y: fish.y + 1 });
      }
    }

    // Bubbles rise and pop at the surface.
    bubbles = bubbles.filter((bubble) => {
      bubble.y -= 0.25 * dt;
      return bubble.y > WATER_Y + 1;
    });

    // Splash droplets fly, fall and disappear.
    drops = drops.filter((drop) => {
      drop.speedY += GRAVITY * dt;
      drop.x += drop.speedX * dt;
      drop.y += drop.speedY * dt;
      drop.life -= dt;
      return drop.life > 0 && drop.y < WATER_Y + 2;
    });

    // Ripples fade.
    if (ripple) {
      ripple.life -= dt;
      if (ripple.life <= 0) ripple = null;
    }
  }


  /* ---------------------------------------------------------------------
     RENDER — draw the current frame
     --------------------------------------------------------------------- */

  function render() {
    g.clearRect(0, 0, W, H);
    g.drawImage(back, 0, 0);

    // Ripple: two small marks spreading out along the water's surface.
    if (ripple) {
      const spread = Math.round((20 - ripple.life) / 3);
      g.fillStyle = COLORS.shine;
      [-spread - 3, spread + 2].forEach((offset) => {
        const x = Math.round(ripple.x + offset);
        if (insideBowl(x - 2, WATER_Y - 1) && insideBowl(x + 3, WATER_Y - 1)) {
          g.fillRect(x, WATER_Y - 1, 2, 1);
        }
      });
    }

    g.fillStyle = COLORS.surface;
    bubbles.forEach((bubble) => g.fillRect(Math.round(bubble.x), Math.round(bubble.y), 1, 1));

    // Tilt the fish nose-up while rising and nose-down while falling.
    let tilt = 0;
    if (fish.mode === 'air' && fish.speedY < -1) tilt = -1;
    if (fish.mode === 'air' && fish.speedY > 1) tilt = 1;

    // Wag the tail (faster while winding up; held still in the air).
    const wagSpeed = fish.mode === 'windup' ? 5 : 14;
    const frame = fish.mode === 'air' ? 0 : Math.floor(time / wagSpeed) % 2;

    // Inside the bowl, the fish goes BEHIND the glass. Once it's fully
    // above the rim, it's drawn in FRONT of everything.
    const aboveRim = fish.y + FISH_H + 1 < RIM_Y;

    if (!aboveRim) drawFish(fish.x, fish.y, fish.direction > 0, frame, tilt);
    g.drawImage(front, 0, 0);
    if (aboveRim) drawFish(fish.x, fish.y, fish.direction > 0, frame, tilt);

    g.fillStyle = COLORS.glass;
    drops.forEach((drop) => g.fillRect(Math.round(drop.x), Math.round(drop.y), 1, 1));
  }


  /* ---------------------------------------------------------------------
     ANIMATION LOOP
     Only runs while the bowl is on screen and the tab is visible, and
     never runs with reduced motion turned on.
     --------------------------------------------------------------------- */

  let running = false;
  let frameId = 0;
  let lastTime = 0;

  function loop(now) {
    const dt = Math.min(3, (now - (lastTime || now)) / 16.67);
    lastTime = now;
    update(dt);
    render();
    frameId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reducedMotion.matches) return;
    running = true;
    lastTime = 0;
    frameId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frameId);
  }


  /* ---------------------------------------------------------------------
     INTERACTION
     --------------------------------------------------------------------- */

  // Show a random exclamation in the note (different from the last one).
  function exclaim() {
    if (!note) return;
    const choices = EXCLAMATIONS.filter((word) => word !== lastExclamation);
    lastExclamation = choices[Math.floor(Math.random() * choices.length)];
    note.textContent = lastExclamation;
  }

  function jump() {
    // Reduced motion: show the fish above the bowl for a moment, then put it back.
    if (reducedMotion.matches) {
      const { x, y } = fish;
      fish.x = BOWL_X - FISH_W / 2;
      fish.y = PEAK_Y + 4;
      exclaim();
      render();
      setTimeout(() => {
        fish.x = x;
        fish.y = y;
        render();
      }, 700);
      return;
    }

    // Ignore clicks while it's already jumping.
    if (fish.mode !== 'swim') return;

    // Jump toward the roomier side of the bowl.
    fish.mouseX = null;
    fish.plan = planJump(fish.x + FISH_W / 2 < BOWL_X ? 1 : -1);
    fish.mode = 'windup';
    exclaim();
  }

  button.addEventListener('click', jump);

  // Follow the mouse (not touch) while it's over the bowl.
  button.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    const box = canvas.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * W - FISH_W / 2;
    fish.mouseX = Math.min(SWIM_RIGHT, Math.max(SWIM_LEFT, x));
  });

  button.addEventListener('pointerleave', () => {
    fish.mouseX = null;
  });

  // Pause when the bowl scrolls off screen or the tab is hidden.
  let onScreen = true;

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen && !document.hidden) start();
    else stop();
  }).observe(button);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !onScreen) stop();
    else start();
  });

  reducedMotion.addEventListener('change', () => {
    stop();
    render();
    start();
  });

  render();
  start();
})();
