/*  Shape Finder – intro-lean version (p5.js)
    - Random shapes/colors (RGB)
    - Poster shows the target
    - Click matching shape to win
    - Shapes are spread out (low overlap) and biased left
    - Press R to reset
*/

let crowd = [];
let targetIdx = -1;
let timer = 15;
let lastTick;
let gameOver = false;

// Poster geometry
let poster;
let posterG; // off-screen poster buffer

let posterBackground;

function preload() {
  posterBackground = loadImage('assets/poster-background.png');
}

function setup() {
  createCanvas(750, 900);
  noStroke();
  poster = { x: width/2 - 175, y: 0, w: 350, h: 350 };
  posterG = createGraphics(poster.w, poster.h);
  resetRound();
}

function resetRound() {
  background(30);
  crowd = [];
  gameOver = false;
  timer = 15;
  lastTick = millis();

  const N = 36;
  crowd = spawnSpreadCrowd(N);
  targetIdx = floor(random(crowd.length));

  drawScene();
}

function draw() {
  if (gameOver) return;

  const now = millis();
  if (now - lastTick >= 1000) {
    timer--;
    lastTick = now;
    drawScene();
  }
  if (timer <= 0) {
    gameOver = true;
    showResult(false);
  }
}

function drawScene() {
  background(30);

  // ===== Poster (composited & clipped inside buffer) =====
  drawPosterBuffer();
  image(posterG, poster.x, poster.y);

  // ===== Timer =====
  fill(240);
  textStyle(NORMAL);
  textSize(18);
  text(`Time: ${timer}s`, width - 120, 40);

  // ===== Crowd =====
  for (const s of crowd) {
    drawShape(s.type, s.col, s.x, s.y, s.size);
  }
}

/* ---------- Poster buffer composition ---------- */
function drawPosterBuffer() {
  const pg = posterG;
  pg.clear();

  pg.noStroke();
  
  const centerX = poster.w / 2;
  const centerY = poster.h / 2;

  pg.imageMode(CENTER);
  pg.image(posterBackground, centerX, centerY, poster.w, poster.h);
  
  // gray box behind image
  pg.fill(60);
  pg.rectMode(CENTER);
  pg.rect(centerX, centerY - 30, 120, 120);

  // Target preview inside poster (buffer coords)
  const t = crowd[targetIdx];
  const cx = centerX;
  const cy = centerY - 30;
  drawShapePG(pg, t.type, t.col, cx, cy, 44);
}

/* ---------- Input & feedback ---------- */
function mousePressed() {
  if (gameOver) return;
  for (let i = crowd.length - 1; i >= 0; i--) {
    if (containsPoint(crowd[i], mouseX, mouseY)) {
      const win = i === targetIdx;
      gameOver = true;
      showResult(win);
      return;
    }
  }
}

function showResult(win) {
  fill(win ? color(60, 180, 90) : color(200, 60, 60));
  rect(width / 2 - 140, height / 2 - 40, 280, 80, 12);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text(win ? 'You found it!' : 'Time up / Wrong pick!', width / 2, height / 2);
  textAlign(LEFT, BASELINE);
}

/* ------------------- helpers ------------------- */

// Rounded-rectangle path for clipping
function roundedRectPath(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

// Simple random RGB color
function randomColor() {
  return color(random(255), random(255), random(255));
}

function drawShape(type, col, x, y, d) {
  fill(col);
  if (type === 'circle') {
    circle(x, y, d);
  } else if (type === 'square') {
    rectMode(CENTER);
    rect(x, y, d, d, 6);
  } else {
    const h = d * 0.9;
    triangle(x - d/2, y + h/2, x + d/2, y + h/2, x, y - h/2);
  }
}

// Same as drawShape but for the poster buffer (RGB channels)
function drawShapePG(pg, type, col, x, y, d) {
  pg.fill(red(col), green(col), blue(col));
  if (type === 'circle') {
    pg.circle(x, y, d);
  } else if (type === 'square') {
    pg.rectMode(CENTER);
    pg.rect(x, y, d, d, 6);
  } else {
    const h = d * 0.9;
    pg.triangle(x - d/2, y + h/2, x + d/2, y + h/2, x, y - h/2);
  }
}

// Spread-out, left-biased spawn (rejection sampling)
function spawnSpreadCrowd(N) {
  const shapes = [];
  const types = ['circle', 'square', 'triangle'];

  const left = -5, right = width + 5, top = poster.h, bottom = height - 40;

  let attempts = 0, maxAttempts = N * 80;
  while (shapes.length < N && attempts < maxAttempts) {
    attempts++;
    const type = random(types);
    const size = random(28, 54);
    const x = random(left, right);
    const y = random(top, bottom);
    const col = randomColor();
    const candidate = { type, x, y, size, col };

    const pad = 18;
    let ok = true;
    for (const s of shapes) {
      if (dist(x, y, s.x, s.y) < (s.size * 0.5) + (size * 0.5) + pad) {
        ok = false; break;
      }
    }
    if (ok) shapes.push(candidate);
  }

  // fallback if we didn't place enough
  while (shapes.length < N) {
    shapes.push({
      type: random(types),
      x: random(left, right),
      y: random(top, bottom),
      size: random(28, 54),
      col: randomColor()
    });
  }
  return shapes;
}

// Hit tests (accurate triangle test)
function containsPoint(s, px, py) {
  const d = s.size;
  if (s.type === 'circle') return dist(px, py, s.x, s.y) <= d / 2;
  if (s.type === 'square') return abs(px - s.x) <= d / 2 && abs(py - s.y) <= d / 2;

  const h = d * 0.9;
  const A = createVector(s.x - d/2, s.y + h/2);
  const B = createVector(s.x + d/2, s.y + h/2);
  const C = createVector(s.x,       s.y - h/2);
  return pointInTri(px, py, A, B, C);
}

function pointInTri(px, py, A, B, C) {
  const v0 = p5.Vector.sub(C, A);
  const v1 = p5.Vector.sub(B, A);
  const v2 = createVector(px - A.x, py - A.y);
  const dot00 = v0.dot(v0), dot01 = v0.dot(v1), dot02 = v0.dot(v2);
  const dot11 = v1.dot(v1), dot12 = v1.dot(v2);
  const inv = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * inv;
  const v = (dot00 * dot12 - dot01 * dot02) * inv;
  return u >= 0 && v >= 0 && u + v <= 1;
}

function keyPressed() {
  if (key === 'r' || key === 'R') resetRound();
}
