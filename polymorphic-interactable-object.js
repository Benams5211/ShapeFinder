// global list of clickable objects 
let interactors = [];

// abstract clickable class definition
// -----------------------------------------------------------------------------

class ClickableObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visible = true;
    this.enabled = true;
  }
  contains(mx, my) { return false; }
  render() {}
  onClick() {}
}
// -----------------------------------------------------------------------------
// rectangle shape implementation of clickable object class
// -----------------------------------------------------------------------------
class ClickRect extends ClickableObject {
  constructor(x, y, w, h, fillCol = [220,50,50], radius = 0) {
    // super keyword just calls parent so this is just calling the parent constuctor
    super(x, y);
    this.w = w;
    this.h = h;
    this.fillCol = fillCol;
    this.radius = radius;
  }
  contains(mx, my) {
    // basic collision detection; is mouse position within square during click
    return mx >= this.x - this.w / 2 && mx <= this.x + this.w / 2 &&
           my >= this.y - this.h / 2 && my <= this.y + this.h / 2;
  }
  render() {
    push();
    rectMode(CENTER);
    noStroke();
    fill(...this.fillCol);
    rect(this.x, this.y, this.w, this.h, this.radius);
    pop();
  }
}
// -----------------------------------------------------------------------------
// circle shape implementation of clickable object class
// -----------------------------------------------------------------------------
class ClickCircle extends ClickableObject {
  constructor(x, y, r, fillCol = [90,210,130]) {
    // super keyword just calls parent so this is just calling the parent constuctor
    super(x, y);
    this.r = r;
    this.fillCol = fillCol;
  }
  contains(mx, my) {
    const dx = mx - this.x, dy = my - this.y;
    // distance formula stay in school
    return dx * dx + dy * dy <= this.r * this.r;
  }
  render() {
    push();
    noStroke();
    fill(...this.fillCol);
    circle(this.x, this.y, this.r * 2);
    pop();
  }
}
// -----------------------------------------------------------------------------
// specialized subclasses: same visuals as parent, custom click payloads
// -----------------------------------------------------------------------------
class FriendlyRect extends ClickRect {
  onClick() {
    console.log("Hello I love you :)");
  }
}

class EvilCircle extends ClickCircle {
  onClick() {
    console.log("Go away I hate you :(");
  }
}
// -----------------------------------------------------------------------------
function mousePressed() {
  // top-most first
  for (let i = interactors.length - 1; i >= 0; i--) {
    const it = interactors[i];
    if (it.enabled && it.contains(mouseX, mouseY)) {
      it.onClick(); // polymorphism moment
      // return here makes it only activate one per click
      return false;
    }
  }
}

// makes some clickable objects
function buildInteractors() {
  interactors = [];
  interactors.push(new FriendlyRect(width * 0.62, height * 0.5, 200, 200, [90,210,130]));
  interactors.push(new EvilCircle(width * 0.25, height * 0.35, 70, [220,50,50]));
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  buildInteractors()
  background(18, 22, 30);
  for (const it of interactors) it.render();
}
