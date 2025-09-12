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
    // NEW FEATURE
    // allows for creation of deleteable objects, false stays on click, true removes on click
    this.deleteOnClick = false;
  }
  contains(mx, my) { return false; }
  render() {}
  // because the deletion on click is handled in the abstract class be sure to call
  // the parent (super) onClick function in child classes 
  // when developing additional clickable objects
  onClick() {
    if (this.deleteOnClick) {
      this.deleteSelf();
    }
  }
  deleteSelf(){
    const indexOfObject = interactors.indexOf(this);
    if (indexOfObject !== -1) {
      interactors.splice(indexOfObject, 1);
    }
  }
}

// -----------------------------------------------------------------------------
// rectangle shape implementation of clickable object class
// -----------------------------------------------------------------------------
class ClickRect extends ClickableObject {
  constructor(x, y, w, h, fillCol = [220, 50, 50], radius = 0, deleteOnClick = false) {
    // super keyword calls parent so this is just calling the parent constructor
    super(x, y);
    this.w = w;
    this.h = h;
    this.fillCol = fillCol;
    this.radius = radius;
    // NEW FEATURE
    this.deleteOnClick = deleteOnClick;
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
  constructor(x, y, r, fillCol = [90, 210, 130], deleteOnClick = false) {
    // super keyword calls parent so this is just calling the parent constructor
    super(x, y);
    this.r = r;
    this.fillCol = fillCol;
    // NEW FEATURE
    this.deleteOnClick = deleteOnClick;
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

class goodbyeCircle extends ClickCircle {
  onClick() {
    // calls the abstract parent onClick function in base class
    super.onClick()
    console.log("Remember me");
  }
}

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

function keyPressed() {
  if (key === 'a') {}
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fx = width / 2;
  fy = height / 2;
  buildInteractors();
}

function buildInteractors() {
  interactors = [];
  interactors.push(new goodbyeCircle(width/2, height/2, 80, [255,255,255], true));
}

function draw() {
  background(18, 22, 30);
  
  for (const it of interactors) {
    if (it.visible) it.render();
  }
}
