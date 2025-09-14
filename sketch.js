let fx, fy;
let darkness;
let coverW, coverH;

let intensity = 0.55;

const innerMin = 0,  innerMax = 120;
const outerMin = 200, outerMax = 480;

const minGap = 15;
const bands = 10;
const darknessAlpha = 245;

function setup() {
  // Creates the base canvas
  createCanvas(windowWidth, windowHeight);
  fx = width / 2;
  fy = height / 2;
  UILayer = createGraphics(windowWidth,50);
  // This just removes the cursor so it looks like a flashlight but idk if it will screw with the ability to click the shapes later on in development
  //noCursor();
  rebuildLayer();
  
}

points = 0;

x = 150;
y = 200;
x2 = 250;
size = 50;

function mouseClicked(){
  if(dist(mouseX, mouseY, x, y) <= size){
    points += 1;
  }
  else if(dist(mouseX, mouseY, x2, y) <= size){
    points -= 1;
  }
}

function draw() {
  //image(backgroundLayer,0,0);
  //fill(255,0,0);
  //backgroundLayer.fill(255,100,100);
  //backgroundLayer.square(0,50,600);
  textSize(40);
  
  background(255);
  
  
  circle(x,y,size);
  circle(x2,y,size);
  

  text(points, 25, 40);
  
  // limits flashlight position at window border
  const mx = isFinite(mouseX) ? mouseX : width / 2;
  const my = isFinite(mouseY) ? mouseY : height / 2;

  fx = lerp(fx, mx, 0.2);
  fy = lerp(fy, my, 0.2);

  const dx = fx - coverW / 2;
  const dy = fy - coverH / 2;
  
  // draws darkness at offset
  image(darkness, dx, dy);
  UILayer.fill(255,255,255);
  UILayer.rect(0,0,windowWidth, windowHeight/10);
  image(UILayer, 0,0);
  text(points, 25, 40);
}


function rebuildLayer() {
  // makes the darkness not end early on screen vertically
  coverW = floor(max(width, height) * 3);
  // makes the darkness not end early on screen horizontally
  coverH = coverW;
  // graphic buffer
  darkness = createGraphics(coverW, coverH);
  buildDarknessLayer();
}

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
  
  darkness.circle(cx, cy, inner / 2);
  
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
    darkness.circle(cx, cy, r1 / 2);
  }
  // contains the buffer so WE dont explode
  darkness.noErase();
  darkness.pop();
}

function easeOutQuad(x) {
  // idiom
  return 1 - (1 - x) * (1 - x);
}

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
