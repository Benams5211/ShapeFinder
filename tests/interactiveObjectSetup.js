
const ShapeEffects = {
  FADEOUT: 'fade-out',
  SHIVER: 'shiver',
  BLAST: 'blast',
  DEFAULT: 'default'
};

// abstract clickable class definition
// -----------------------------------------
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
   *  - events: [EventName (string),...]
   **/
  constructor(x, y, opts = {}) {
    this.x = x; 
    this.y = y;
    this.visible = true;
    this.enabled = true;
    this.randomColor = !!opts.randomColor;
    this.outline = !!opts.outline;
    this.isWanted = !!opts.wanted;

    // Shape effects related variables.
    this.alpha = 255; // Full opacity by default
    this.shiverTime = 0; // frames to shiver before deleting
    this.shiverIntensity = 2; // small, subtle movement
    this.blastScale = 1; // The Scale of enlargement of blast effect.
    this.blastEnlargingTimes = this.getRandomInt(25, 35); // blastScale need to be multiplied by this for the shapes except the Circle.
    this.blastTime = 0; // frames to blast before deleting
    this.isEffectStarting = false; // Flag of starting an effect.
    
    // click behavior
    this.deleteOnClick = !!opts.deleteOnClick;
    const s = opts.stroke ?? {};
    this.stroke = {
      enabled: !!s.enabled,
      weight: s.weight ?? 2,
      // choose either random color or provided color (default black)
      color: s.randomColor ? randomColor(winColorChar) : (s.color ?? [0, 0, 0]),
      randomColor: !!s.randomColor,
    };

    this.events = Array.isArray(opts.events) ? opts.events : [];

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

    // randomly pick an effect
    this.effect = random([
      ShapeEffects.FADEOUT, 
      ShapeEffects.SHIVER, 
      ShapeEffects.BLAST, 
      ShapeEffects.DEFAULT
    ]);
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

    if (this.isEffectStarting) {
      switch (this.effect) {
        case ShapeEffects.FADEOUT:
          this.startFadeOut();
          break;
        case ShapeEffects.SHIVER:
          this.startShiver();
          break;
        case ShapeEffects.BLAST:
          this.startBlast()
          break;
        default:
          this.deleteSelf();
      }
    }

  if (this.movement.enabled) this.updatePos();
  }
  
  updatePos() {
    const isBoss =  (this instanceof BossCircle);
    const isBonus = (this instanceof BonusCircle);
    if (intensity == 1 && gameState == 'game' && !isBoss && flashlightFreeze) {
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
    

      if(!isBoss&&!isBonus){
      if(slowMo){m.velocityLimit=1.5;}
      else {m.velocityLimit=4;}
      }
      
      
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
    const UIHeight = windowHeight * 0.1;

    if (this.x < r)           { this.x = r;                 this.vx *= -1; }   // clamp inside + bounce
    if (this.x > width  - r)  { this.x = width  - r;        this.vx *= -1; }
    if (gameState != "menu"){
      if (this.y < UIHeight + r) {this.y = UIHeight + r;       this.vy *= -1;}
    } else {
      if (this.y < r) {this.y = r;                            this.vy *= -1;}
    }
    if (this.y > height - r)  { this.y = height - r;           this.vy *= -1;}
  }

  

  // because the deletion on click is handled in the base class be sure to call
  // the parent (super) onClick function in child classes when developing additional objects
  onClick() {
    if (this.deleteOnClick) {
      this.isEffectStarting = true;
      switch (this.effect) {
        case ShapeEffects.FADEOUT:
          break;
        case ShapeEffects.SHIVER:
          this.shiverTime = 30;
          break;
        case ShapeEffects.BLAST:
          this.blastTime = 30;
          break;
        default:
          this.deleteSelf();
      }
    }

    // On click, fire the attached event connections
    for (let e of this.events)
      gameEvents.Fire(e, this);
    if (gameState === "builder") return;

    try {
      const isWin = (this instanceof WinRect) || (this instanceof WinCircle) || (this instanceof WinTri);
      const isBoss =  (this instanceof BossCircle);
      const isBonus = (this instanceof Pentagon) || (this instanceof Hexagon) || (this instanceof Octogon);
      if(isBoss) {
        playBossKill();
        bossKills.push(new BossKillIndicator(mouseX, mouseY));
      }
      else if(isBonus){
        if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.play('sfxCorrect', { vol: 1.0 }); // Play "sfxCorrect" from the Audio Manager:
        } else if (typeof sfxCorrect !== 'undefined' && sfxCorrect && typeof sfxCorrect.play === 'function') {
          sfxCorrect.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
        }
        bonusStars.push(new BonusIndicator(mouseX, mouseY));}
      else if (!isWin) { // If "isWin" was not one of the "Win" shapes:
        if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.play('sfxIncorrect', { vol: 1.0 }); // Play "sfxIncorrect" from the Audio Manager:
        } else if (typeof sfxIncorrect !== 'undefined' && sfxIncorrect && typeof sfxIncorrect.play === 'function') {
          sfxIncorrect.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
        }
        circleBursts.push(new CircleBurstScoreIndicator(mouseX, mouseY));
      }
      else { //win
        if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.play('sfxCorrect', { vol: 1.0 }); // Play "sfxCorrect" from the Audio Manager:
        } else if (typeof sfxCorrect !== 'undefined' && sfxCorrect && typeof sfxCorrect.play === 'function') {
          sfxCorrect.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
        }
        stars.push(new StarScoreIndicator(mouseX, mouseY));
      // Celebrate the correct shape (color + geometry)
if (window.FoundEffect && typeof window.FoundEffect.triggerFoundEffect === 'function') {
  const col = Array.isArray(this.fillCol) ? this.fillCol : [255, 215, 0];

  // Guess shape type from the class name of the clicked object
  const ctorName = (this.constructor && this.constructor.name) || '';
  let shapeType = 'circle';
  if (ctorName.includes('Rect')) {
    shapeType = 'rect';
  } else if (ctorName.includes('Tri')) {
    shapeType = 'tri';
  }

  // Size hint so the overlay matches the shape size
  const sizeHint = (typeof this.getBoundsRadius === 'function')
    ? this.getBoundsRadius()
    : 30;

  window.FoundEffect.triggerFoundEffect(this.x, this.y, col, shapeType, sizeHint);
}


        
      }
      gameEvents.Fire("Clicked", isWin);
    } catch (e) {
      console.warn('Could not play "incorrect.mp3"!', e);
    }
  }

  deleteSelf() {
    const i = interactors.indexOf(this);
    if (i !== -1) interactors.splice(i, 1);
  }

  startFadeOut() {
    this.alpha -= 10; // controls fade speed; smaller = slower fade
    if (this.alpha <= 0) {
      this.deleteSelf();
      return;
    }
  }

  startShiver() {
    const progress = 1 - this.shiverTime / 40;

    // gradually increase speed and intensity a bit
    const intensity = lerp(this.shiverIntensity, this.shiverIntensity * 20, progress);

    this.x = this.x + sin(frameCount * 15) * random(-intensity, intensity);
    this.y = this.y + cos(frameCount * 20) * random(-intensity, intensity);

    this.alpha = map(sin(frameCount * 1.5), -1, 1, 180, 255);

    this.shiverTime--;

    if (this.shiverTime <= 0) {
      this.deleteSelf();
      return;
    }
  }

  startBlast() {
    const progress = 1 - this.blastTime / 30;

    // Scale up like an expanding explosion
    this.blastScale = 1 + progress * 2.5; // grows 2.5x size
    this.alpha = this.alpha * (1 - progress); // fades out

    this.blastTime--;

    if (this.blastTime <= 0) {
      this.deleteSelf();
      return;
    }
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    this.randomColor = opts.randomColor ?? false;
    this.outline = opts.outline ?? false;
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
    const offsetScale = this.isEffectStarting && this.effect == ShapeEffects.BLAST ? this.blastScale * 25 : 0;
    push();
    rectMode(CENTER);
    if (this.stroke?.enabled) {
      stroke(...this.stroke.color);
      strokeWeight(this.stroke.weight);
    } else {
      noStroke();
    }

    fill(this.fillCol[0], this.fillCol[1], this.fillCol[2], this.alpha);
    rect(this.x - offsetScale, this.y + offsetScale, this.w + offsetScale, this.h + offsetScale, this.radius);

    if(this.outline){
      stroke('black');
      strokeWeight(2);
      rect(this.x - offsetScale, this.y + offsetScale, this.w + offsetScale, this.h + offsetScale, this.radius);
    }
    pop();
  }
  // Used for saving & loading shape configurations in the builder
  serialize() {
    return {
      type: 'rect',
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      radius: this.radius,
      fillCol: this.fillCol,
      angle: this.angle,
      opts: {
        randomColor: this.randomColor,
        deleteOnClick: this.deleteOnClick,
        stroke: { ...this.stroke },
        movement: this.movement ? { ...this.movement } : { enabled: false },
        modifiers: Array.isArray(this.modifierList)
          ? this.modifierList.map(m => (m?.serialize ? m.serialize() : m))
          : [],
        events: Array.isArray(this.events) ? [...this.events] : ["dragStart", "select"],
        angle: this.angle
      }
    };
  }
  clone() {
    const copy = new ClickRect(this.x, this.y, this.w, this.h, [...this.fillCol], this.radius, {
      randomColor: this.randomColor,
      deleteOnClick: this.deleteOnClick,
      events: Array.isArray(this.events) ? [...this.events] : [],
      movement: { ...this.movement },
      stroke: { ...this.stroke },
      modifiers: this.modifierList.map(m => (m && typeof m.clone === 'function') ? m.clone() : { ...m }),
      angle: this.angle
    });
    copy.vx = this.vx; copy.vy = this.vy;
    copy.targetVx = this.targetVx; copy.targetVy = this.targetVy;
    copy.visible = this.visible;
    copy.enabled = this.enabled;
    copy.state = { ...this.state };

    return copy;
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
    this.randomColor = opts.randomColor ?? false;
    this.outline = opts.outline ?? false;
    if (this.randomColor) {
      this.fillCol = randomColor();
    } else {
      this.fillCol = fillCol ?? [90, 210, 130];
    }
    this.angle = (opts && typeof opts.angle === 'number') ? opts.angle : 0;
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

    translate(this.x, this.y);
    rotate(this.angle);

    if (this.stroke?.enabled) {
      stroke(...this.stroke.color);
      strokeWeight(this.stroke.weight);
    } else {
      noStroke();
    }
    fill(this.fillCol[0], this.fillCol[1], this.fillCol[2], this.alpha);
    scale(this.blastScale); // apply scaling if blasting
    circle(0, 0, this.r*2);
    if(this.outline){
      stroke('black');
      strokeWeight(2);
      scale(this.blastScale); // apply scaling if blasting
      circle(0, 0, this.r*2);
    }

    pop();
  }
  serialize() {
    return {
      type: 'circle',
      x: this.x,
      y: this.y,
      r: this.r,
      fillCol: this.fillCol,
      angle: this.angle,
      opts: {
        randomColor: this.randomColor,
        deleteOnClick: this.deleteOnClick,
        stroke: { ...this.stroke },
        movement: this.movement ? { ...this.movement } : { enabled: false },
        modifiers: Array.isArray(this.modifierList)
          ? this.modifierList.map(m => (m?.serialize ? m.serialize() : m))
          : [],
        events: Array.isArray(this.events) ? [...this.events] : ["dragStart", "select"],
        angle: this.angle
      }
    };
  }

  clone() {
    const copy = new ClickCircle(this.x, this.y, this.r, [...this.fillCol], {
      randomColor: this.randomColor,
      deleteOnClick: this.deleteOnClick,
      events: Array.isArray(this.events) ? [...this.events] : [],
      movement: { ...this.movement },
      stroke: { ...this.stroke },
      modifiers: this.modifierList.map(m => (m && typeof m.clone === 'function') ? m.clone() : { ...m }),
      angle: this.angle,
    });

    copy.vx = this.vx; copy.vy = this.vy;
    copy.targetVx = this.targetVx; copy.targetVy = this.targetVy;
    copy.visible = this.visible;
    copy.enabled = this.enabled;
    copy.state = { ...this.state };

    return copy;
  }
}

class ClickTri extends InteractiveObject {
  constructor(x, y, size, fillCol = [255, 210, 90], opts = {}) {
    super(x, y, opts);
    this.size = size;
    this.randomColor = opts.randomColor ?? false;
    this.outline = opts.outline ?? false;

    // fill color (same pattern as rect/circle)
    this.fillCol = this.randomColor ? randomColor() : (fillCol ?? [255, 210, 90]);

    // circumradius of an equilateral triangle (center -> vertex)
    this.radius = this.size / Math.sqrt(3);
    this.angle = (opts && typeof opts.angle === 'number') ? opts.angle : 0;
  }

  getBoundsRadius() { return this.radius; }

  vertices() {
    const R = this.size / Math.sqrt(3);
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
    const offsetScale = this.isEffectStarting && this.effect == ShapeEffects.BLAST ? this.blastScale * 25 : 0;
    push();

    // uniform stroke handling
    if (this.stroke?.enabled) {
      stroke(...this.stroke.color);
      strokeWeight(this.stroke.weight);
    } else {
      noStroke();
    }

    fill(this.fillCol[0], this.fillCol[1], this.fillCol[2], this.alpha);
    triangle(A[0] - offsetScale, A[1] - offsetScale, B[0] + offsetScale, B[1] + offsetScale, C[0] + offsetScale, C[1] - offsetScale);

    if(this.outline){
      stroke('black');
      strokeWeight(2);
      triangle(A[0] - offsetScale, A[1] - offsetScale, B[0], B[1] + offsetScale, C[0] + offsetScale, C[1] - offsetScale);
    }
    pop();
  }

  serialize() {
    return {
      type: 'triangle',
      x: this.x,
      y: this.y,
      size: this.size,
      fillCol: this.fillCol,
      angle: this.angle,

      opts: {
        randomColor: this.randomColor,
        deleteOnClick: this.deleteOnClick,
        movement: this.movement ? {
          enabled: this.movement.enabled,
          lerpStrength: this.movement.lerpStrength,
          velocityLimit: this.movement.velocityLimit,
          switchRate: this.movement.switchRate
        } : undefined,
        modifiers: Array.isArray(this.modifierList)
          ? this.modifierList.map(m => (m?.serialize ? m.serialize() : m))
          : [],
        events: Array.isArray(this.events) ? [...this.events] : ["dragStart", "select"],
        angle: this.angle
      }
    };
  }
  clone() {
    const copy = new ClickTri(this.x, this.y, this.size, [...this.fillCol], {
      randomColor: this.randomColor,
      deleteOnClick: this.deleteOnClick,
      events: Array.isArray(this.events) ? [...this.events] : [],
      movement: { ...this.movement },
      stroke: { ...this.stroke },
      modifiers: this.modifierList.map(m => (m && typeof m.clone === 'function') ? m.clone() : { ...m }),
      angle: this.angle,
    });
    copy.vx = this.vx; copy.vy = this.vy;
    copy.targetVx = this.targetVx; copy.targetVy = this.targetVy;
    copy.visible = this.visible;
    copy.enabled = this.enabled;
    copy.state = { ...this.state };

    return copy;
  }
}

export {
  ClickCircle,
  ClickRect,
  ClickTri,
  InteractiveObject,
  // include other classes as needed
};
