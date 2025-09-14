let interactors = [];

class InteractiveObject {
  /**
   * opts:
   *  - deleteOnClick: boolean
   *  - movement: {
   *      enabled: boolean,
   *      lerpStrength: number in [0,1],
   *      velocityLimit: number (px/frame),
   *      switchRate: integer (frames)
   *    }
   *  - modifiers: [Modifier,...]
   */
  constructor(x, y, opts = {}) {
    this.x = x; this.y = y;
    this.visible = true;
    this.enabled = true;

    // click behavior
    this.deleteOnClick = !!opts.deleteOnClick;

    // state and modifiers
    this.state = {};
    if (Array.isArray(opts.modifiers)) {
      // make a temp copy so we don't change the actual array
      this.modifierList = opts.modifiers.slice();
    } else {
      // start with an empty list if theres no modifiers
      this.modifierList = [];
    }

    // movement config
    const m = opts.movement ?? {};
    this.movement = {
      enabled: !!m.enabled,
      lerpStrength: m.lerpStrength ?? 0.1,
      velocityLimit: m.velocityLimit ?? 4,
      switchRate: m.switchRate ?? 10,
    };

    // velocity stuff
    if (this.movement.enabled) {
      this.vx = 0;
      this.vy = 0;
      this.targetVx = random(-this.movement.velocityLimit, this.movement.velocityLimit);
      this.targetVy = random(-this.movement.velocityLimit, this.movement.velocityLimit);
    }
  }

  // to be implemented by subclasses
  contains(mx, my) { return false; }
  render() {}

  // subclasses should implement a radius used for collision
  getBoundsRadius() { return 0; }

  // called every frame for updates
  update() {
    if (this.movement.enabled) this.updatePos();
  }

  // movement stuff
  updatePos() {
    const m = this.movement;

    // Apply modifiers first (may set frozen, etc.)
    for (const mod of this.modifierList) mod.apply(this);

    if (this.state.frozen) return;

    // Retarget velocity on schedule
    if (frameCount % m.switchRate === 0) {
      this.targetVx = random(-m.velocityLimit, m.velocityLimit);
      this.targetVy = random(-m.velocityLimit, m.velocityLimit);
    }

    // Lerp velocity toward target
    this.vx = lerp(this.vx, this.targetVx, m.lerpStrength);
    this.vy = lerp(this.vy, this.targetVy, m.lerpStrength);

    // Integrate position
    this.x += this.vx;
    this.y += this.vy;

    // Keep inside canvas with simple bounce against a "radius"
    const r = this.getBoundsRadius();
    if (this.x < r)           { this.x = r;                 this.vx *= -1; }
    if (this.x > width  - r)  { this.x = width  - r;        this.vx *= -1; }
    if (this.y < r)           { this.y = r;                 this.vy *= -1; }
    if (this.y > height - r)  { this.y = height - r;        this.vy *= -1; }
  }

  // because the deletion on click is handled in the abstract class be sure to call
  // the parent (super) onClick function in child classes 
  // when developing additional clickable objects
  onClick() {
    if (this.deleteOnClick) this.deleteSelf();
  }

  deleteSelf() {
    const i = interactors.indexOf(this);
    if (i !== -1) interactors.splice(i, 1);
  }
}

// -------------------- Shapes -------------------------------------------------

class ClickRect extends InteractiveObject {
  constructor(x, y, w, h, fillCol = [220, 50, 50], radius = 0, opts = {}) {
    super(x, y, opts);
    this.w = w; this.h = h;
    this.fillCol = fillCol;
    this.radius = radius;
  }
  contains(mx, my) {
    return mx >= this.x - this.w/2 && mx <= this.x + this.w/2 &&
           my >= this.y - this.h/2 && my <= this.y + this.h/2;
  }
  getBoundsRadius() { return Math.max(this.w, this.h) / 2; }
  render() {
    if (!this.visible) return;
    push();
    rectMode(CENTER);
    noStroke();
    fill(...this.fillCol);
    rect(this.x, this.y, this.w, this.h, this.radius);
    pop();
  }
}

class ClickCircle extends InteractiveObject {
  constructor(x, y, r, fillCol = [90,210,130], opts = {}) {
    super(x, y, opts);
    this.r = r;
    this.fillCol = fillCol;
  }
  contains(mx, my) {
    const dx = mx - this.x, dy = my - this.y;
    return dx*dx + dy*dy <= this.r*this.r;
  }
  getBoundsRadius() { return this.r; }
  render() {
    if (!this.visible) return;
    push();
    noStroke();
    fill(...this.fillCol);
    circle(this.x, this.y, this.r*2);
    pop();
  }
}

// example implemented clickCircle
class GoodbyeCircle extends ClickCircle {
  onClick() {
    super.onClick(); // important: keep delete-on-click behavior
    console.log("Remember me");
  }
}

class FreezeModifier {
  constructor({ chance = 0.001, length = 60 } = {}) {
    this.chance = chance;
    this.length = length;
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

class FollowShape {
  constructor({ otherShape, followStrength = 0.01 } = {}) {
    this.otherShape = otherShape;
    this.followStrength = followStrength;
  }
  apply(shape) {
    if (!this.otherShape) return;
    const dx = this.otherShape.x - shape.x;
    const dy = this.otherShape.y - shape.y;
    shape.vx = lerp(shape.vx ?? 0, dx * 0.02, this.followStrength);
    shape.vy = lerp(shape.vy ?? 0, dy * 0.02, this.followStrength);
  }
}

class JitterModifier {
  constructor({ rate = 0.3 } = {}) { this.rate = rate; }
  apply(shape) {
    shape.x += random(-this.rate, this.rate);
    shape.y += random(-this.rate, this.rate);
  }
}

class TeleportModifier {
  constructor({ chance = 0.001 } = {}) { this.chance = chance; }
  apply(shape) {
    if (random() < this.chance) {
      shape.x = random(width);
      shape.y = random(height);
    }
  }
}

function mousePressed() {
  // top-most first
  for (let i = interactors.length - 1; i >= 0; i--) {
    const it = interactors[i];
    if (it.enabled && it.contains(mouseX, mouseY)) {
      it.onClick();
      return false; // handle only one per click
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  buildInteractors();
}

function draw() {
  background(18,22,30);
  for (const it of interactors) {
    it.update();      // movement happens here if enabled
    it.render();
  }
}

function buildInteractors() {
  interactors = [];

  const movement = {
    enabled: true,
    lerpStrength: 0.12,
    velocityLimit: 4,
    switchRate: 12,
  };

  // a circle that moves + deletes on click + jitters
  interactors.push(new GoodbyeCircle(
    width/2, height/2, 80, [255,255,255],
    {
      deleteOnClick: true,
      movement,
      modifiers: [
        new JitterModifier({ rate: 0.25 }),
        new FreezeModifier({ chance: 0.002, length: 45 }),
      ],
    }
  ));

  // a rectangle that follows the circle
  const leader = interactors[0];
  interactors.push(new ClickRect(
    width*0.25, height*0.4, 160, 100, [220,50,50], 12,
    {
      movement,
      modifiers: [
        new FollowShape({ otherShape: leader, followStrength: 0.35 }),
        new TeleportModifier({ chance: 0.0015 }),
      ],
    }
  ));

  // a stationary rectangle just to show mix-and-match
  interactors.push(new ClickRect(
    width*0.75, height*0.6, 140, 140, [90,210,130], 20,
    {
      movement: { enabled: false },
      deleteOnClick: true,
    }
  ));
}
