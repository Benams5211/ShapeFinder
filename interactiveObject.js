
// global list of clickable objects 
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

    // click behavior
    this.deleteOnClick = !!opts.deleteOnClick;

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

  // called every frame for updates
  update() {
    if (this.movement.enabled) this.updatePos();
  }
  
  updatePos() {
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

    // Attempt to play "incorrect.mp3" if a non-"Win" shape was clicked:
    try {
      const isWin = (this instanceof WinRect) || (this instanceof WinCircle);
      if (!isWin) { // If "isWin" was not one of the "Win" shapes:
        if (typeof sfxIncorrect !== 'undefined' && sfxIncorrect && typeof sfxIncorrect.play === 'function') {
          sfxIncorrect.play();
        }
      }
    } catch (e) {
      console.warn('Could not play "incorrect.mp3"!', e);
    }
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
    this.fillCol = fillCol;
    this.radius = radius;
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
    noStroke();
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
    this.fillCol = fillCol;
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
    noStroke();
    fill(...this.fillCol);
    circle(this.x, this.y, this.r*2);
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
    Timer-=5;
  }
}

class ScoreDownRect extends ClickRect {
  onClick() {
    super.onClick()
    score--;
    Timer-=5;
  }
}

class WinRect extends ClickRect {
  onClick() {
    super.onClick();
    score++;
    //triggerWin();
    nextRound();
    Timer+=3;
    
    // Attempt to play "correct.mp3" when the correct shape is picked:
    try {
      if (typeof sfxCorrect !== 'undefined' && sfxCorrect && typeof sfxCorrect.play === 'function') { // If the .mp3 file was loaded correctly:
        sfxCorrect.play();
      }
    } catch (e) { // Else, throw warning:
      console.warn('Could not play "correct.mp3"!', e);
    }
  }
}

class WinCircle extends ClickCircle {
  onClick() {
    super.onClick();
    score++;
    nextRound();
    Timer+=3;
    //triggerWin();
    // Attempt to play "correct.mp3" when the correct shape is picked:
    try {
      if (typeof sfxCorrect !== 'undefined' && sfxCorrect && typeof sfxCorrect.play === 'function') { // If the .mp3 file was loaded correctly:
        sfxCorrect.play();
      }
    } catch (e) { // Else, throw warning:
      console.warn('Could not play "correct.mp3"!', e);
    }
  }
}

class GoodbyeCircle extends ClickCircle {
  onClick() {
    super.onClick(); // important: keep delete-on-click behavior
    console.log("Remember me");
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

function spawnWinShape(){
const movement = {
      enabled: true,
      lerpStrength: 0.1,
      velocityLimit: 4,
      switchRate: 60,
    };

    // build the same style of modifier chain as before
    const mods = [
      new FreezeModifier({ chance: 0.001, length: 60 }),
      new JitterModifier({ rate: 0.1 }),
      new TeleportModifier({ chance: 0.005 }),
    ];

    // pick a type; we have ClickCircle and ClickRect available
    const makeCircle = random([true, false]);

    let obj;
    if (makeCircle) {
      // roughly the same visual size as Shape size=40
      obj = new WinCircle(
        windowWidth / 2,
        windowHeight / 2,
        20,                       // radius ~ size/2
        [255, 255, 255],          // color similar to your special case
        { movement, modifiers: mods, deleteOnClick: true }
      );
    } else {
      obj = new WinRect(
        windowWidth / 2,
        windowHeight / 2,
        40,                        // w
        40,                        // h
        [255, 255, 255],           // color similar to your default
        8,                         // corner radius
        { movement, modifiers: mods, deleteOnClick: true }
      );
    }

    interactors.push(obj);

}

function spawnInteractors(count) {
  // put a hard cap similar to the old code
  if (interactors.length >= count) return;

  for (let i = 0; i < count; i++) {
    // movement config similar to old Shape movement settings
    const movement = {
      enabled: true,
      lerpStrength: 0.1,
      velocityLimit: 4,
      switchRate: 60,
    };

    // build the same style of modifier chain as before
    const mods = [
      new FreezeModifier({ chance: 0.001, length: 60 }),
      new JitterModifier({ rate: 0.1 }),
      new TeleportModifier({ chance: 0.005 }),
    ];

    // make first few follow the very first interactor
    if (interactors.length > 0 && interactors.length < 8) {
      const toFollow = interactors[0];
      mods.push(new FollowShape({ otherShape: toFollow, followStrength: 0.3 }));
    }

    // pick a type; we have ClickCircle and ClickRect available
    const makeCircle = random([true, false]);

    let obj;
    if (makeCircle) {
      // roughly the same visual size as Shape size=40
      obj = new ScoreDownCircle(
        windowWidth / 2,
        windowHeight / 2,
        20,                       // radius ~ size/2
        [100, 255, 255],          // color similar to your special case
        { movement, modifiers: mods, deleteOnClick: true }
      );
    } else {
      obj = new ScoreDownRect(
        windowWidth / 2,
        windowHeight / 2,
        40,                        // w
        40,                        // h
        [255, 100, 100],           // color similar to your default
        8,                         // corner radius
        { movement, modifiers: mods, deleteOnClick: true }
      );
    }

    interactors.push(obj);
  }
    spawnWinShape();

}


function clearInteractors() {
  interactors.length = 0;
}