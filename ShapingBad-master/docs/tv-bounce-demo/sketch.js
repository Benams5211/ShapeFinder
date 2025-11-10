// Old TV Bouncing Event- JS-only for sketch.js


let tvEventActive = true;   // auto-start so you see it
let tv = null;
let tvEventEndsAt = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  initTV();
  background(15);
  startTVEvent(0); // run indefinitely in preview
}

function draw() {
  background(15);
  if (tvEventActive) {
    updateTV();
    drawTV();
    if (tv.duration > 0 && millis() >= tvEventEndsAt) stopTVEvent();
  }
}

function keyPressed() {
  if (key === 't' || key === 'T') {
    if (tvEventActive) stopTVEvent(); else startTVEvent(0);
  }
  if (key === 'm' || key === 'M') {
    const modes = ['logo','dvd','snow'];
    const i = modes.indexOf(tv.mode);
    tv.mode = modes[(i+1)%modes.length];
  }
}

function mousePressed() {
  if (tvEventActive) stopTVEvent(); else startTVEvent(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (!tv) return;
  tv.x = constrain(tv.x, 0, max(0, width - tv.w));
  tv.y = constrain(tv.y, 0, max(0, height - tv.h));
}

// Event API 
function startTVEvent(durationMs = 10000) {
  if (!tv) initTV();
  tvEventActive = true;
  tvEventEndsAt = durationMs > 0 ? millis() + durationMs : 0;
  tv.duration = durationMs;

  // randomize start
  tv.x = random(40, width - tv.w - 40);
  tv.y = random(40, height - tv.h - 40);
  const angle = random(TWO_PI);
  tv.dx = cos(angle) * tv.speed;
  tv.dy = sin(angle) * tv.speed;

  resetInnerSprite(); // for screen things
}

function stopTVEvent() { tvEventActive = false; }


function initTV() {
  tv = {
    x: 120, y: 120, w: 140, h: 85,
    speed: 4.0, dx: 3.2, dy: 2.4,
    body: color(35,210,255), glowAlpha: 60,
    cornerHits: 0, duration: 0,
    // screen modes: 'logo' (static icon), 'dvd' (mini bounce), 'snow' (static)
    mode: 'logo',
    inner: { x:0, y:0, w:36, h:22, dx:2.2, dy:1.8, hue:180 }
  };
  resetInnerSprite();
}

function resetInnerSprite() {
  const sr = screenRect();
  tv.inner.x = random(sr.x, sr.x + sr.w - tv.inner.w);
  tv.inner.y = random(sr.y, sr.y + sr.h - tv.inner.h);
  const ang = random(TWO_PI);
  tv.inner.dx = cos(ang) * 2.2;
  tv.inner.dy = sin(ang) * 1.8;
  tv.inner.hue = random(0,360);
}


function updateTV() {
  // move outer TV
  tv.x += tv.dx; tv.y += tv.dy;
  let hitX = false, hitY = false;

  if (tv.x <= 0) { tv.x = 0; tv.dx *= -1; hitX = true; }
  else if (tv.x + tv.w >= width) { tv.x = width - tv.w; tv.dx *= -1; hitX = true; }

  if (tv.y <= 0) { tv.y = 0; tv.dy *= -1; hitY = true; }
  else if (tv.y + tv.h >= height) { tv.y = height - tv.h; tv.dy *= -1; hitY = true; }

  if (hitX && hitY) {
    tv.cornerHits++;
    tv.speed = min(tv.speed + 0.35, 12);
    const mag = tv.speed / Math.hypot(tv.dx, tv.dy);
    tv.dx *= mag; tv.dy *= mag;
    tv.body = color(random(80,255), random(80,255), random(80,255));
    tv.glowAlpha = 120;
  } else {
    tv.glowAlpha = max(20, tv.glowAlpha - 2);
  }

  // move inner sprite if mode is 'dvd'
  if (tv.mode === 'dvd') {
    const sr = screenRect();
    tv.inner.x += tv.inner.dx;
    tv.inner.y += tv.inner.dy;
    let bounce = false;
    if (tv.inner.x <= sr.x) { tv.inner.x = sr.x; tv.inner.dx *= -1; bounce = true; }
    else if (tv.inner.x + tv.inner.w >= sr.x + sr.w) { tv.inner.x = sr.x + sr.w - tv.inner.w; tv.inner.dx *= -1; bounce = true; }
    if (tv.inner.y <= sr.y) { tv.inner.y = sr.y; tv.inner.dy *= -1; bounce = true; }
    else if (tv.inner.y + tv.inner.h >= sr.y + sr.h) { tv.inner.y = sr.y + sr.h - tv.inner.h; tv.inner.dy *= -1; bounce = true; }
    if (bounce) tv.inner.hue = (tv.inner.hue + 47) % 360;
  }
}

function screenRect() { return { x: tv.x + 10, y: tv.y + 10, w: tv.w - 20, h: tv.h - 20 }; }

// draw
function drawTV() {
  push();
  // glow
  fill(red(tv.body), green(tv.body), blue(tv.body), tv.glowAlpha);
  rect(tv.x - 10, tv.y - 8, tv.w + 20, tv.h + 16, 18);

  // body
  fill(tv.body); rect(tv.x, tv.y, tv.w, tv.h, 14);

  // screen background + scanlines
  const sr = screenRect();
  fill(20); rect(sr.x, sr.y, sr.w, sr.h, 8);
  stroke(255, 60);
  for (let i = 0; i < 8; i++) {
    const yy = sr.y + 4 + i * (sr.h / 8);
    line(sr.x + 6, yy, sr.x + sr.w - 6, yy);
  }
  noStroke();

  // antennas
  stroke(230); strokeWeight(2);
  line(tv.x + tv.w*0.25, tv.y, tv.x + tv.w*0.15, tv.y - 18);
  line(tv.x + tv.w*0.75, tv.y, tv.x + tv.w*0.85, tv.y - 18);
  noStroke();

  // SCREEN 
  if (tv.mode === 'logo') {
    // ring + play triangle
    push();
    translate(sr.x + sr.w/2, sr.y + sr.h/2);
    stroke(180, 240); strokeWeight(3); noFill();
    ellipse(0, 0, min(sr.w, sr.h)*0.55, min(sr.w, sr.h)*0.55);
    noStroke(); fill(200,230,255);
    const r = min(sr.w, sr.h)*0.18;
    triangle(-r*0.5, -r, -r*0.5, r, r, 0);
    pop();
  } else if (tv.mode === 'dvd') {
    // mini bouncing rounded-rect logo
    colorMode(HSL, 360, 100, 100, 1);
    fill(tv.inner.hue, 80, 60);
    rect(tv.inner.x, tv.inner.y, tv.inner.w, tv.inner.h, 6);
    colorMode(RGB, 255, 255, 255, 255);
  } else if (tv.mode === 'snow') {
    // TV static
    const dots = 120;
    for (let i=0;i<dots;i++){
      const x = random(sr.x, sr.x + sr.w);
      const y = random(sr.y, sr.y + sr.h);
      const g = random(120, 255);
      fill(g); rect(x, y, 1, 1);
    }
  }
  
  pop();
}

