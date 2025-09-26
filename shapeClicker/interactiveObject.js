// global list of clickable objects 
let wantedObj = null;
let interactors = [];

// abstract clickable class definition
// -----------------------------------------------------------------------------
class InteractiveObject {
  /**
   * opts:
   *  - deleteOnClick: boolean
   *  - movement: {
   *      enabled: boolean,
   *      lerpStrength: number in [0,1]
   *      velocityLimit: number pixel per frame
   *      switchRate: num of frames
   *    }
   *  - modifiers: [Modifier,...]
   */
  constructor(x, y, opts = {}) {
    this.x = x; 
    this.y = y;
    this.visible = true;
    this.enabled = true;
    this.randomColor = !!opts.randomColor;
    // click behavior
    this.deleteOnClick = !!opts.deleteOnClick;
    const s = opts.stroke ?? {};
    this.stroke = {
      enabled: !!s.enabled,
      weight: s.weight ?? 2,
      // choose either random color or provided color (default black)
      color: s.randomColor ? randomColor() : (s.color ?? [0, 0, 0]),
      randomColor: !!s.randomColor,
    };

    // Track current state of object, like 'frozen.' More can be easily implemented in the future
    this.state = {};
    // A list of modifier objects used in updatePos()
    this.modifierList = Array.isArray(opts.modifiers) ? opts.modifiers.slice() : [];

    // movementConfig format for Shape class:
    // {
    // lerpStrength   : (0,1) -> How 'snappy' the smoothed movement on velocity switch feels.
    // velocityLimit  : The limit in which the shape is allowed to move (Pixels per Frame)
    // switchRate     : How often the shape switches velocity (Frames)
    // }
    // movement config (optional)
    const m = opts.movement ?? {};
    this.movement = {
      enabled: !!m.enabled,
      lerpStrength: m.lerpStrength ?? 0.1,
      velocityLimit: m.velocityLimit ?? 4,
      switchRate: m.switchRate ?? 10,
    };

    // A starting velocity (initialized only if movement is enabled)
    if (this.movement.enabled) {
      // A starting velocity
      this.vx = 0;
      this.vy = 0;

      this.targetVx = random(-this.movement.velocityLimit, this.movement.velocityLimit);
      this.targetVy = random(-this.movement.velocityLimit, this.movement.velocityLimit);
    }
  }

  // to be implemented by subclasses
  contains(mx, my) { return false; }
  render() {}

  // subclasses should implement a radius used for bounds clamping
  getBoundsRadius() { return 0; }

  // called every frame for update
  update() {
    // hard-freeze when the global intensity is full
    // (use a small tolerance so 0.999999 counts as 1)
    if (typeof window.intensity !== 'undefined' && window.intensity >= 0.999) {
      // optional: zero velocity so they don't "slip" between frames
      this.vx = 0;
      this.vy = 0;
      return; // skip movement entirely
    }

  if (this.movement.enabled) this.updatePos();
  }
  
  updatePos() {
    if (intensity === 1) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    // require the whole shape to be "under" the cursor-ish area
    const freezeRadius = this.getBoundsRadius() + 60; // tweak padding as you like
    if (dx*dx + dy*dy <= freezeRadius * freezeRadius) {
      this.vx = 0;  // keep from "slipping"
      this.vy = 0;
      return;       // skip movement entirely
    }
  }

    let m = this.movement;
    // ---- Movement modifiers
    // Apply modifiers first (may set frozen, jitter, follow, teleport, etc.)
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
    const r = this.getBoundsRadius();
    if (this.x < r)           { this.x = r;                 this.vx *= -1; }   // clamp inside + bounce
    if (this.x > width  - r)  { this.x = width  - r;        this.vx *= -1; }
    if (this.y < r)           { this.y = r;                 this.vy *= -1; }
    if (this.y > height - r)  { this.y = height - r;        this.vy *= -1; }
  }

  // because the deletion on click is handled in the base class be sure to call
  // the parent (super) onClick function in child classes when developing additional objects
  onClick() {
    if (this.deleteOnClick) this.deleteSelf();
  }

  deleteSelf() {
    const i = interactors.indexOf(this);
    if (i !== -1) interactors.splice(i, 1);
  }
}

// -----------------------------------------------------------------------------
// rectangle shape implementation of clickable object class
// -----------------------------------------------------------------------------
class ClickRect extends InteractiveObject {
  constructor(x, y, w, h, fillCol = [220, 50, 50], radius = 0, opts = {}) {
    // super keyword calls parent so this is just calling the parent constructor
    super(x, y, opts);
    this.w = w; 
    this.h = h;
    this.radius = radius;
    if (this.randomColor) {
      this.fillCol = randomColor();
    } else {
      this.fillCol = fillCol ?? [220, 50, 50];
    }
  }
  contains(mx, my) {
    // basic collision detection; is mouse position within square during click
    return mx >= this.x - this.w/2 && mx <= this.x + this.w/2 &&
           my >= this.y - this.h/2 && my <= this.y + this.h/2;
  }
  getBoundsRadius() { return Math.max(this.w, this.h) / 2; }
  render() {
    if (!this.visible) return;
    push();
    rectMode(CENTER);
    if (this.stroke?.enabled) {
      stroke(...this.stroke.color);
      strokeWeight(this.stroke.weight);
    } else {
      noStroke();
    }

    fill(...this.fillCol);
    rect(this.x, this.y, this.w, this.h, this.radius);
    pop();
  }
}

// -----------------------------------------------------------------------------
// circle shape implementation of clickable object class
// -----------------------------------------------------------------------------
class ClickCircle extends InteractiveObject {
  constructor(x, y, r, fillCol = [90,210,130], opts = {}) {
    // super keyword calls parent so this is just calling the parent constructor
    super(x, y, opts);
    this.r = r;
    if (this.randomColor) {
      this.fillCol = randomColor();
    } else {
      this.fillCol = fillCol ?? [90, 210, 130];
    }
  }
  contains(mx, my) {
    const dx = mx - this.x, dy = my - this.y;
    // distance formula stay in school
    return dx*dx + dy*dy <= this.r*this.r;
  }
  getBoundsRadius() { return this.r; }
  render() {
    if (!this.visible) return;
    push();
    if (this.stroke?.enabled) {
      stroke(...this.stroke.color);
      strokeWeight(this.stroke.weight);
    } else {
      noStroke();
    }
    fill(...this.fillCol);
    circle(this.x, this.y, this.r*2);
    pop();
  }
}

class ClickTri extends InteractiveObject {
  constructor(x, y, size, fillCol = [255, 210, 90], opts = {}) {
    super(x, y, opts);
    this.size = size;

    // fill color (same pattern as rect/circle)
    this.fillCol = this.randomColor ? randomColor() : (fillCol ?? [255, 210, 90]);

    // circumradius of an equilateral triangle (center -> vertex)
    this.radius = this.size / Math.sqrt(3);
    this.angle = (opts && typeof opts.angle === 'number') ? opts.angle : 0;
  }

  getBoundsRadius() { return this.radius; }

  vertices() {
    const R = this.radius;
    const a = this.angle; // radians

    const base = [Math.PI/2, Math.PI/2 + 2*Math.PI/3, Math.PI/2 + 4*Math.PI/3];
    return base.map(th => {
      const t = th + a;
      return [this.x + R * Math.cos(t), this.y - R * Math.sin(t)];
    });
  }

  contains(mx, my) {
    const [A, B, C] = this.vertices();
    return pointInTriangle(mx, my, A[0], A[1], B[0], B[1], C[0], C[1]);
  }

  render() {
    if (!this.visible) return;
    const [A, B, C] = this.vertices();
    push();

    // uniform stroke handling
    if (this.stroke?.enabled) {
      stroke(...this.stroke.color);
      strokeWeight(this.stroke.weight);
    } else {
      noStroke();
    }

    fill(...this.fillCol);
    triangle(A[0], A[1], B[0], B[1], C[0], C[1]);
    pop();
  }
}

// -----------------------------------------------------------------------------
// specialized subclasses: same visuals as parent, custom click payloads
// -----------------------------------------------------------------------------
class ScoreDownCircle extends ClickCircle {
  onClick() {
    super.onClick()
    score--;
    Timer -= 5;
  }
}

class ScoreDownRect extends ClickRect {
  onClick() {
    super.onClick()
    score--;
    Timer -= 5;
  }
}

class ScoreDownTri extends ClickTri {
  onClick() {
    super.onClick();
    score--;
    Timer -= 5;
  }
}

class WinRect extends ClickRect {
  onClick() {
    super.onClick();
    score += 5;
    waveSize += 5;
    nextRound();
  }
}

class WinCircle extends ClickCircle {
  onClick() {
    super.onClick();
    score += 5;
    waveSize += 5;
    nextRound();
  }
}

class WinTri extends ClickTri {
  onClick() {
    super.onClick();
    score += 5;
    waveSize += 5;
    nextRound();
  }
}

class BoatCircle extends ClickCircle {
  onClick() {
    super.onClick();
    triggerWarningBoatLines(2000, 30000);
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

// helpers
function randomColor() {
  return [ floor(random(256)), floor(random(256)), floor(random(256)) ];
}

function clearInteractors() {
  interactors.length = 0;
}

function spawnInteractors(count) {
  // NEW: tiny helper to make a static (no-move) clone for the wanted list
  // rare nested function utility
  function makeStaticWantedFrom(o) {
    const baseOpts = {
      movement: { enabled: false },  // <- no movement
      modifiers: [],                 // <- no jitter/teleport/follow
      deleteOnClick: false,
      randomColor: false,
      stroke: o.stroke ? { ...o.stroke } : undefined,
    };
    if (o instanceof ClickCircle) {
      return new ClickCircle(width/2-o.r/2, 60-o.r/2, o.r, o.fillCol, baseOpts);
    } else if (o instanceof ClickRect) {
      return new ClickRect(width/2-o.w/2, 60-o.h/2, o.w, o.h, o.fillCol, o.radius || 0, baseOpts);
    } else if (o instanceof ClickTri) {
      return new ClickTri(width/2-o.size/2, 60-o.size/2, o.size, o.fillCol, { ...baseOpts, angle: o.angle || 0 });
    }
    return null;
  }

  for (let i = 0; i < count; i++) {
    const movement = {
      enabled: true,
      lerpStrength: 0.1,
      velocityLimit: 4,
      switchRate: 60,
    };

    const mods = [
      new FreezeModifier({ chance: 0.001, length: 60 }),
      new JitterModifier({ rate: 0.1 }),
      new TeleportModifier({ chance: 0.005 }),
    ];

    if (interactors.length > 0 && interactors.length < 8) {
      const toFollow = interactors[0];
      mods.push(new FollowShape({ otherShape: toFollow, followStrength: 0.3 }));
    }

    const choice = random(['circle','rect','tri']);
    const opts = {
      movement, modifiers: mods,
      deleteOnClick: true,
      randomColor: true,
      stroke: { enabled: true, weight: 2, color: [0,0,0] },
    };

    let obj;
    
    if (choice === 'circle') {
      const r = random(12, 56);
      const x = random(r, width  - r);
      const y = random(r, height - r);
      if (i != count-1) {
        obj = new ScoreDownCircle(x, y, r, null, opts);
      } else {
        obj = new WinCircle(x, y, r, null, opts);
        // CHANGED: push a static clone to wantedObj (not the live obj)
        const preview = makeStaticWantedFrom(obj);
        if (preview) wantedObj = preview;
      }

    } else if (choice === 'rect') {
      const w = random(24, 110);
      const h = random(24, 110);
      const rad = random(0, min(12, min(w, h) / 3));
      const x = random(w / 2, width  - w / 2);
      const y = random(h / 2, height - h / 2);
      if (i != count-1) {
        obj = new ScoreDownRect(x, y, w, h, null, rad, opts);
      } else {
        obj = new WinRect(x, y, w, h, null, rad, opts);
        // CHANGED: static clone for wanted panel
        const preview = makeStaticWantedFrom(obj);
        if (preview) wantedObj = preview;
      }

    } else {
      const s  = random(28, 90);
      const R  = s / Math.sqrt(3);
      const x  = random(R, width  - R);
      const y  = random(R, height - R);
      if (i != count-1) {
        obj = new ScoreDownTri(x, y, s, null, { ...opts, angle: random(TWO_PI) });
      } else {
        obj = new WinTri(x, y, s, null, { ...opts, angle: random(TWO_PI) });
        // CHANGED: static clone for wanted panel
        const preview = makeStaticWantedFrom(obj);
        if (preview) wantedObj = preview;
      }
    }
    interactors.push(obj);
  }
}

// http://www.lighthouse3d.com/tutorials/maths/ray-triangle-intersection/
// this has brought me places I never wanted to be
function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax, v0y = cy - ay;
  const v1x = bx - ax, v1y = by - ay;
  const v2x = px - ax, v2y = py - ay;

  const dot00 = v0x*v0x + v0y*v0y;
  const dot01 = v0x*v1x + v0y*v1y;
  const dot02 = v0x*v2x + v0y*v2y;
  const dot11 = v1x*v1x + v1y*v1y;
  const dot12 = v1x*v2x + v1y*v2y;

  const denom = dot00 * dot11 - dot01 * dot01;
  if (denom === 0) return false;
  const inv = 1 / denom;
  const u = (dot11 * dot02 - dot01 * dot12) * inv;
  const v = (dot00 * dot12 - dot01 * dot02) * inv;
  return u >= 0 && v >= 0 && (u + v) <= 1;
}

function isUnderFlashlight(x, y, pad = 0) {
  if (typeof fx === 'undefined' || typeof fy === 'undefined' ||
      typeof coverW === 'undefined' || typeof coverH === 'undefined') {
    return false;
  }
  // clamp so we never go negative
  const rx = Math.max(1, (coverW / 2) - pad);
  const ry = Math.max(1, (coverH / 2) - pad);

  const dx = x - fx;
  const dy = y - fy;
  return (dx*dx)/(rx*rx) + (dy*dy)/(ry*ry) <= 1;
}

function clearInteractors() {
  interactors.length = 0;
  wantedObj == null;

}


