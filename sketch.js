score = 0;

/////////////////////////////////////////////////////
//Classes for shape spawning
/////////////////////////////////////////////////////

// List of Shape objects
let shapes = []

// FollowShape   : Biases a shape's movement toward another shape
// otherShape    : The other Shape object that a given Shape will follow
// followStrength: (0,1) ->How closely the folloewr Shape follows the FollowShape
class FollowShape {
  constructor({otherShape, followStrength = 0.01}) {
    this.otherShape     = otherShape
    this.followStrength = followStrength
  }
  apply(shape) {
    if (!this.otherShape) return;
    let dx = this.otherShape.x - shape.x;
    let dy = this.otherShape.y - shape.y;

    // Bias current velocity toward the other Shape
    // Pulls the velocity slightly closer to the other Shape's velocity while retaining
    // its original random velocity.
    shape.vx = lerp(shape.vx, dx * 0.02, this.followStrength);
    shape.vy = lerp(shape.vy, dy * 0.02, this.followStrength);
  }
}

// ---- Movement modifiers
// Freeze  : Freezes a shape for length per a defined interval
// chance  : The chance in which a Shape will pause movement (per frame)
// length  : Length, in frames, of freeze duration.
class FreezeModifier {
  constructor({chance = 0.001, length = 60}) {
    this.chance    = chance;
    this.length    = length;
    this.remaining = 0;
  }
  apply(shape) {
    if (this.remaining > 0) {
      this.remaining--;
      shape.state.frozen = true;
      return;
    }
    shape.state.frozen = false;
    if (random() < this.chance) {
      this.remaining = this.length;
      shape.state.frozen = true;
    }
  }
}

// JitterModifier : Applies a jitter to a shape
// rate           : Pixels per frame in which the shape jitters back&forth
class JitterModifier {
  constructor({ rate = 0.3 } = {}) {
    this.rate = rate;
  }
  apply(shape) {
    shape.x += random(-this.rate, this.rate);
    shape.y += random(-this.rate, this.rate);
  }
}

// TeleportModifier 
// chance           : Chance, per frame, of shape teleporting to a random position.
class TeleportModifier {
  constructor({ chance = 0.001 } = {}) {
    this.chance = chance;
  }
  apply(shape) {
    if (random() < this.chance) {
      shape.x = random(width);
      shape.y = random(height);
    }
  }
}

// ---- Shape class
// We should be able to easily integrate this Shape class with our clickable class.
class Shape {
  constructor(x, y, size, type, movementConfig, num) {
    this.x     = x;
    this.y     = y;
    this.size  = size;
    this.type  = type;
    
    // movementConfig contains lerpStrength, velocityLimit, switchRate
    this.movement =  { ...movementConfig }
    // A list of modifier objects used in updatePos()
    this.modifierList = [];
    
    // A starting velocity
    this.vx    = random(-2, 2);
    this.vy    = random(-2, 2);

    this.targetVx = random(-this.movement.velocityLimit, this.movement.velocityLimit);
    this.targetVy = random(-this.movement.velocityLimit, this.movement.velocityLimit);
    
    // Track current state of shape, like 'frozen.' More can be easily implemented in the future
    this.state = {};
    // The index of Shape in the shapes list. Using this for testing
    this.num = num;
  }
  
  
  updatePos() {
    let m = this.movement;
    
    for (let modifier of this.modifierList) 
      modifier.apply(this);
    
    // Ignore movement on this frame if Shape's state is 'frozen'
    if (this.state.frozen) return;
    
    // Pick a new target velocity every switchRate frames
    if (frameCount % m.switchRate === 0) {
      // Keep new target velocity within range of provided velocityLimit
      this.targetVx = random(-m.velocityLimit, m.velocityLimit);
      this.targetVy = random(-m.velocityLimit, m.velocityLimit);
    }
    
    // Smoothly lerp velocity towards target velocity. A higher lerpStrength introduces
    // increased 'snapping' towards the Shape's new velocity
    this.vx = lerp(this.vx, this.targetVx, m.lerpStrength);
    this.vy = lerp(this.vy, this.targetVy, m.lerpStrength);
  
    // Finally, update the actual position of the Shape
    this.x += this.vx
    this.y += this.vy 

    // There is definitely a better method of keeping the shape within bounds,
    // But this is a fix for some modifiers allowing shapes to clip out of bounds.
    if (this.x < this.size / 2) {
      this.x = this.size / 2;   // clamp inside
      this.vx *= -1;            // bounce
    }
    if (this.x > width - this.size / 2) {
      this.x = width - this.size / 2;
      this.vx *= -1;
    }
    let topLimit = UILayer.height + this.size / 2;
    if (this.y < topLimit) {
      this.y = topLimit;
      this.vy *= -1;
    }
    if (this.y > height - this.size / 2) {
      this.y = height - this.size / 2;
      this.vy *= -1;
    }
  }
  render() {
    push(); // save drawing state

  fill(255, 100, 100);
  if (this.num === 0) {
    fill(100,255,255);
  }
  if (this.modifierList.some(m => m instanceof FollowShape)) {
    fill(0,255,0);
  }
  if (this.state.frozen) {
    fill(255,255,255);
  }

  noStroke();

  if (this.type === "circle") {
    ellipse(this.x, this.y, this.size);
  } else if (this.type === "square") {
    rectMode(CENTER);
    rect(this.x, this.y, this.size, this.size);
  } else if (this.type === "triangle") {
    const h = this.size;
    triangle(
      this.x - this.size/2, this.y + h/2, 
      this.x + this.size/2, this.y + h/2, 
      this.x, this.y - h/2
    );
  }

  // draw number text on each Shape
  if (this.num !== undefined) {
    fill(0); 
    textAlign(CENTER, CENTER);
    textSize(this.size * 0.5); 
    text(this.num, this.x, this.y);
  }

  pop(); // restore drawing state
}
}

function spawnShapes(count) {
  if(shapes.length>=100) return;
  let choices = ["circle", "square", "triangle"]
  
  for (i = 0; i < count; i++) {
    
    let movementConfig = {
      lerpStrength      : 0.1,
      velocityLimit     : 4,
      switchRate        : 60,
    }
    let s = new Shape(windowWidth/2, windowHeight/2, 
                          40, random(choices), movementConfig,i);
    
    // Shapes 1-7 will follow shape 0
    if (shapes.length > 0 && shapes.length < 8 ) {
      toFollow = shapes[0];
      console.log(i + " is following " + toFollow.num)
      s.modifierList.push(new FollowShape({otherShape: toFollow, followStrength: 0.3}));
    }
    
    s.modifierList.push(new FreezeModifier({chance: 0.001, length: 60}));
    s.modifierList.push(new JitterModifier( {rate: 0.1} ))
    s.modifierList.push(new TeleportModifier( {chance: 0.005} ))
    
    shapes.push(s);
    
  }
}

function clearShapes(){
  shapes = [];
}

//////////////////////////////////////////////////
//Classes and stuff for menu
//////////////////////////////////////////////////

// tracks which part of the program we are in, right now its just  "menu", "game", or "modes"
let gameState = "menu"; 
// the two button definitions, x, y, width, height, and label
let startButton, modesButton;

// image variables
let menuBgImg;   // optional menu background
let logoImg;     // optional title/logo image
let buttonImg;   // optional button image

function preload() {
  // optionally load images here
  // menuBgImg = loadImage("menuBackground.png");
  // logoImg = loadImage("gameLogo.png");
  // buttonImg = loadImage("buttonImage.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  startButton = { x: width/2 - 100, y: height/2, w: 200, h: 60, label: "START" };
  modesButton = { x: width/2 - 100, y: height/2 + 100, w: 200, h: 60, label: "MODES" };
  UILayer = createGraphics(windowWidth, windowHeight * 0.1);
  UILayer.background(255,255,255);
  fx = width / 2;
  fy = height / 2;
  rebuildLayer();
}

function playMode() {
  background(50);
  spawnShapes(100);
  for (let s of shapes) {
    s.updatePos();
    s.render();
  }
}

function drawMenu() {
  // if menu background image exists, draw it, else default background
  if (menuBgImg) {
    image(menuBgImg, 0, 0, width, height);
  } else {
    background(200);
  }
  
  // Title text or logo image
  if (logoImg) {
    imageMode(CENTER);
    image(logoImg, width/2, height/2 - 120);
  } else {
    fill(255); // white
    textAlign(CENTER, CENTER);
    textSize(48);
    text("GAME LOGO PlaceHolder", width/2, height/2 - 120);
  }

  // Draw buttons
  drawButton(startButton);
  drawButton(modesButton);
}

// helper function to draw a button
function drawButton(btn) {
  if (buttonImg) {
    // if images are active draw button image instead of rectangle
    imageMode(CENTER);
    image(buttonImg, btn.x + btn.w/2, btn.y + btn.h/2, btn.w, btn.h);
    fill(255); // draw text over button
  } else {
    fill(80, 140, 255); // blue button
    rect(btn.x, btn.y, btn.w, btn.h, 12); // rounded rectangle
    fill(255);
  }
  textSize(24);
  textAlign(CENTER, CENTER);
  text(btn.label, btn.x + btn.w/2, btn.y + btn.h/2);
}

// modes (placeholder)
function drawModes() {
  background(60); // dark gray
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("Modes Menu (Coming Soon)", width/2, height/2);

  // Back button to return to menu// just for ease of dev
  drawBackButton();
}

// back button in the corner// honestly just for me to switch back, can be removed
function drawBackButton() {
  fill(255, 80, 80); // red button
  rect(20, 20, 120, 40, 8);
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("BACK", 80, 40);
}

//mouse input
function mousePressed() {
  if (gameState === "menu") {
    // if on menu, check buttons
    if (mouseInside(startButton)) {
      clearShapes();
      gameState = "game"; // switch to game scene
    } else if (mouseInside(modesButton)) {
      gameState = "modes"; // switch to modes scene
    }
  } else if (gameState === "game" || gameState === "modes") {
    // if on game or modes screen, check "back" button
    if (mouseX > 20 && mouseX < 140 && mouseY > 20 && mouseY < 60) {
      gameState = "menu";
    }
  }
}

// helper, checks if mouse is inside a rectangle button
function mouseInside(btn) {
  return mouseX > btn.x && mouseX < btn.x + btn.w &&
         mouseY > btn.y && mouseY < btn.y + btn.h;
}

/////////////////////////////////////////
//Flashlight classes and setup
/////////////////////////////////////////
let fx, fy;
let darkness;
let coverW, coverH;

let intensity = 0.55;

const innerMin = 0,  innerMax = 120;
const outerMin = 200, outerMax = 480;

const minGap = 15;
const bands = 10;
const darknessAlpha = 245;

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
  coverW = floor(max(width, height) * 3);
  // makes the darkness not end early on screen horizontally
  coverH = coverW;
  // graphic buffer
  darkness = createGraphics(coverW, coverH);
  buildDarknessLayer();
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
  
  darkness.circle(cx, cy, inner);
  
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
    darkness.circle(cx, cy, r1);
  }
  // contains the buffer so WE dont explode
  darkness.noErase();
  darkness.pop();
}

function easeOutQuad(x) {
  // idiom
  return 1 - (1 - x) * (1 - x);
}

////////////////////////////////////////////
//Important draw functions
////////////////////////////////////////////

//draw loop
function draw() {
  background(30); // dark gray background for contrast

  // which screen is shown based on gameState
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "game") {
    drawGame(); // Put actual game code here
  } else if (gameState === "modes") {
    drawModes();
  }
}
// GAME (placeholder)
function drawGame() {
  background(255,255,255); //white
  fill(0);
  
  const mx = isFinite(mouseX) ? mouseX : width / 2;
  const my = isFinite(mouseY) ? mouseY : height / 2;

  fx = lerp(fx, mx, 0.2);
  fy = lerp(fy, my, 0.2);
  
  playMode();
  
  const dx = fx - coverW / 2;
  const dy = fy - coverH / 2;
  
  // draws darkness at offset
  image(darkness, dx, dy);
  image(UILayer, 0,0);
  
  UILayer.textSize(24);
  UILayer.textAlign(RIGHT, CENTER);
  UILayer.text("Score: " + score, UILayer.width - 20, UILayer.height /2); 
  
  // Back button to return to menu
  drawBackButton();
}
