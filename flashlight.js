let fx, fy;
let darkness;
let coverW, coverH;

let intensity = 0.55;

const innerMin = 0,  innerMax = 120;
const outerMin = 200, outerMax = 480;

const minGap = 15;
const bands = 10;
const darknessAlpha = 245;

let blackout = false;

// 
// Lamp Settings:
// 

// Lamp Movement & Positions:
const lampCount = 3; // Number of Lamps
let lampObjs = []; // { x, y, vx, vy }
let lampRadius = 250; // Radius of each lamp's light glow
let lampSpeed = 150; // Pixels per second for movement
// Default lamp Radius & Speed (for resetting when the game is over):
const lampRadiusDefault = lampRadius;
const lampSpeedDefault = lampSpeed;
// Clamps for how much the Radius & Speed can be changed:
const lampRadiusMin = 200;
const lampSpeedMax = 500;
let lampBuffer = null; // Persistent graphics buffer to draw the darkness & lamp light circles.

// Initialize lamp objects with positions and random velocities.
function initLamps() {
  lampObjs = [];

  const defaultPositions = [
    { x: width * 0.15, y: height * 0.5 },
    { x: width * 0.5,  y: height * 0.75 },
    { x: width * 0.85, y: height * 0.35 }
  ];

  // Create each new lamp entry with initialized positions & speeds:
  for (let i = 0; i < lampCount; i++) {
    const p = defaultPositions[i] || { x: random(width * 0.2, width * 0.8), y: random(height * 0.25, height * 0.75) };
    const angle = random(TWO_PI);
    const speed = lampSpeed * (0.8 + random() * 0.4); // Creates slight variations in lamp movement speeds.
    lampObjs.push({ x: p.x, y: p.y, vx: cos(angle) * speed, vy: sin(angle) * speed });
  }
}

// Update lamp positions (dt converted to milliseconds using p5's 'deltaTime'):
function updateLamps(dt) {
  if (!lampObjs || lampObjs.length === 0) return;
  const s = dt / 1000; // Convert miliseconds to seconds:

  // Define movement bounds for how far the lamps can move on the screen:
  const margin = Math.max(40, lampRadius * 0.2);
  const topMargin = 60; // Avoid overlapping top UI elements.
  const minX = margin;
  const maxX = width - margin;
  const minY = topMargin + margin;
  const maxY = height - margin;

  for (const l of lampObjs) {
    l.x += l.vx * s;
    l.y += l.vy * s;

    // Creates a "bounce" off of edges so lights continue moving after reaching a border:
    if (l.x < minX) { // Calculations for lamp "x":
      l.x = minX;
      l.vx = Math.abs(l.vx) * (0.85 + random() * 0.3);
    } else if (l.x > maxX) {
      l.x = maxX;
      l.vx = -Math.abs(l.vx) * (0.85 + random() * 0.3);
    }

    if (l.y < minY) { // Calculations for lamp "y":
      l.y = minY;
      l.vy = Math.abs(l.vy) * (0.85 + random() * 0.3);
    } else if (l.y > maxY) {
      l.y = maxY;
      l.vy = -Math.abs(l.vy) * (0.85 + random() * 0.3);
    }

    // Adds a small Jitter to make the motion look less perfect:
    if (random() < 0.01) {
      const jitter = random(-20, 20);
      l.vx += jitter * 0.02;
      l.vy += jitter * 0.02;
      
      const sp = Math.sqrt(l.vx * l.vx + l.vy * l.vy);
      const minS = lampSpeed * 0.6;
      const maxS = lampSpeed * 1.4;
      if (sp > maxS) {
        l.vx *= maxS / sp;
        l.vy *= maxS / sp;
      } else if (sp < minS) {
        l.vx *= minS / Math.max(0.0001, sp);
        l.vy *= minS / Math.max(0.0001, sp);
      }
    }
  }
}

// Helper function to get lamp positions for Rendering & Hit Tests:
function getLampPositions() {
  if (lampObjs && lampObjs.length > 0) return lampObjs.map(l => ({ x: l.x, y: l.y }));
  return [ // Fallback to default positions in case 'initLamps()' was not called before attempting to get lamp positions:
    { x: width * 0.15, y: height * 0.5 },
    { x: width * 0.5,  y: height * 0.75 },
    { x: width * 0.85, y: height * 0.35 }
  ];
}

// Draws the glow of the lamp to cut through the darkness layer (Uses a persistent memory buffer to stop memory overflow).
function drawLampsOverlay() {
  if (!lampBuffer || lampBuffer.width !== width || lampBuffer.height !== height) {
    lampBuffer = createGraphics(width, height); // Initializes lampBuffer to the size of the canvas.
  }

  // Update lamp positions using p5's built-in "deltaTime" to create constant movement.
  updateLamps(deltaTime);
  const positions = getLampPositions();

  // Clear and fill darkness on the lamp buffer:
  lampBuffer.clear();
  lampBuffer.noStroke();
  lampBuffer.fill(0, darknessAlpha);
  lampBuffer.rect(0, 0, lampBuffer.width, lampBuffer.height);

  // Erase soft circles for each lamp to cut through the darkness layer:
  for (const p of positions) {
    for (let i = 0; i < 8; i++) {
      const t = i / 7; // Creates a small value to cut off of the lamp's radius with each iteration for concentric circle look of the light glow:
      const r = lerp(lampRadius * 0.2, lampRadius, 1 - t); // Linear Interpolation = lerp(start, stop, amt) to find percentage value between 'start' & 'stop'
                                                           //  of amount 'amt' for smoothing of values in effects.
      const a = lerp(60, 240, 1 - t); // Lerps the alpha value with each iteration to update with each new concentric circle for falloff effect:
      lampBuffer.erase(); // Switches graphics buffer to Erase Mode = Shapes now erase from the buffer instead of add onto it.
      lampBuffer.fill(255, a);
      lampBuffer.ellipse(p.x, p.y, r * 2); // Draws ellipse that cuts out a hole in the darkness buffer:
      lampBuffer.noErase();
    }
  }

  // Draw 'lampBuffer' over the main canvas:
  image(lampBuffer, 0, 0);

  // Draw visible lamp markers on top to create visible lamp "assets":
  for (const p of positions) {
    push();
    fill(255);
    stroke(200);
    strokeWeight(2);
    ellipse(p.x, p.y, 14);
    pop();
  }
}

// Makes shapes clickable only when they are within the glow radius of a lamp:
function isUnderLamps(x, y, pad = 0) {
  const positions = getLampPositions(); // Call helper to get current positions of each lamp:
  for (const p of positions) {
    const dx = x - p.x;
    const dy = y - p.y;
    const r = Math.max(1, lampRadius - pad); // Assures that the radius to check will be at least 1 pixel for checks:
    if (dx*dx + dy*dy <= r*r) return true; // Square positions to determine if the shape is within the glow circle (Calculates Circle Membership):
  }
  return false; // Shape was not within the light circle, so return false to disallow clicking:
}

// 
// 
// 

function mouseWheel(e) {
  const old = intensity;
  // delta is scroll wheel position
  const delta = -e.deltaY * 0.0015;
  
  // doesnt lag if you mash scroll down
  if (old <= 0 && delta < 0) return false;
  
  // doesnt lag if you mash scroll up
  if (old >= 1 && delta > 0) return false;

  const next = constrain(old + delta, 0, 1);
  
  // only update darkness when the wheel is actively used or it lags
  intensity = next;
  buildDarknessLayer();
  return false;
}

function rebuildLayer() {
  // makes the darkness not end early on screen vertically
  coverW = floor(max(width, height) * 2);
  // makes the darkness not end early on screen horizontally
  coverH = coverW;
  // graphic buffer
  darkness = createGraphics(coverW, coverH);
  buildDarknessLayer();
  // Initialize moving lamps whenever the layer is rebuilt.
  initLamps();
}


// the darkness effect works as a large black rectangle that has circles
// erased from the center at differing alpha levels

function buildDarknessLayer() {
  
  // the darkness is a graphic buffer
  // https://p5js.org/reference/p5/p5.Graphics/
  
  const cx = coverW / 2;
  const cy = coverH / 2;
  
  // buffer setup so IT doesnt explode
  darkness.push();
  darkness.clear();
  
  darkness.noStroke();
  darkness.background(0, darknessAlpha);

  let inner = lerp(innerMin, innerMax, intensity);
  let outer = lerp(outerMax, outerMin, intensity);
  if (outer < inner + minGap) outer = inner + minGap;

  const innerCoreAlpha = lerp(60, 255, intensity);
  
  darkness.erase();

  // creates next circle for erasure color doesnt matter
  darkness.fill(255, innerCoreAlpha);
  
  darkness.circle(cx, cy, inner * 2);
  
  // ethically sourced from stackoverflow
  
  for (let i = 0; i < bands; i++) {
    
    const t0 = i / bands;
    const t1 = (i + 1) / bands;

    const e0 = easeOutQuad(t0);
    const e1 = easeOutQuad(t1);

    const r0 = lerp(inner, outer, e0);
    const r1 = lerp(inner, outer, e1);
    
    // makes the alpha fade
    // https://p5js.org/reference/p5/map/
    
    const a = map(i, 0, bands - 1, innerCoreAlpha * 0.6, 0);
    darkness.fill(255, a);
    darkness.circle(cx, cy, r1 * 2);
  }
  // contains the buffer so WE dont explode
  darkness.noErase();
  darkness.pop();
}

function easeOutQuad(x) {
  // idiom
  return 1 - (1 - x) * (1 - x);

}


function drawFlashlightOverlay () {
  const mx = isFinite(mouseX) ? mouseX : width / 2;
  const my = isFinite(mouseY) ? mouseY : height / 2;
  fx = lerp(fx, mx, 0.2); //what is lerp
  fy = lerp(fy, my, 0.2);

  const dx = fx - coverW / 2;
  const dy = fy - coverH / 2;
  
  if(blackout){
    //screen goes black
    push();
    fill(0);
    noStroke();
    rect(0, 0, width, height);
    pop();
  }
  else{
    image(darkness, dx, dy);
  }
}

// Reset lamp difficulty values for Radius & Speed back to default at the end of a game.
function resetLampDifficulty() {
  lampRadius = lampRadiusDefault;
  lampSpeed = lampSpeedDefault;
}

// Scale lamp difficulty (Shrink radius & Increase speed every next round).
function scaleLampDifficulty() {
  lampRadius = Math.max(lampRadiusMin, lampRadius - 10);
  lampSpeed = Math.min(lampSpeedMax, lampSpeed + 30);
}