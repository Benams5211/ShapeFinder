// Boss After-Images Effect
// move mouse around. press SPACE for a flash, R to clear trail, T to toggle trail.

let bossX = 200;
let bossY = 200;
let bossSize = 80;      
let trail = [];         
let maxTrail = 45;       
let trailOn = true;
let hueVal = 0;

function setup() {
  createCanvas(800, 500);
  colorMode(HSB, 360, 100, 100, 100); 
  noStroke();
}

function draw() {
  background(220, 10, 15);             

  
  bossX += (mouseX - bossX) * 0.10;
  bossY += (mouseY - bossY) * 0.10;

  // save current position to the trail (at the front)
  if (trailOn) {
    trail.unshift({
      x: bossX,
      y: bossY,
      s: bossSize,
      h: hueVal
    });
    // keep trail length limited
    if (trail.length > maxTrail) trail.pop();
  }

  // draw trail first (oldest last so it sits under the boss)
  for (let i = trail.length - 1; i >= 0; i--) {
    let t = trail[i];
    // alpha fades out from older to newer
    let a = map(i, 0, trail.length - 1, 15, 65);
    fill(t.h, 80, 90, a);
    // slightly shrink older ones so it looks layered
    let shrink = map(i, 0, trail.length - 1, 0, 30);
    ellipse(t.x, t.y, t.s - shrink, t.s - shrink);
  }

  //  main "boss" circle
  hueVal = (hueVal + 2) % 360;          // slow color shift
  fill(hueVal, 90, 100, 100);
  ellipse(bossX, bossY, bossSize, bossSize);

  // a simple glow ring
  noFill();
  stroke(hueVal, 90, 100, 60);
  strokeWeight(6);
  ellipse(bossX, bossY, bossSize + 14, bossSize + 14);
  noStroke();

  fill(0, 0, 100, 70);
  textSize(14);
  text("Move mouse | SPACE = flash | R = clear | T = toggle trail", 14, height - 14);
}

function keyPressed() {
  if (key === 'R' || key === 'r') {
    trail = [];                   // wipe trail
  } else if (key === 'T' || key === 't') {
    trailOn = !trailOn;           // on/off
  } else if (key === ' ') {
    // quick flash effect
    for (let i = 0; i < 5; i++) {
      trail.unshift({
        x: bossX,
        y: bossY,
        s: bossSize + i * 2,
        h: 0 // red pop
      });
      if (trail.length > maxTrail) trail.pop();
    }
  }
}
