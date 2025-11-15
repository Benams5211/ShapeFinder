// effects/foundEffect.js
(() => {
  // --- internal state/classes ---
  let foundFX = {
    active: false,
    x: 0,
    y: 0,
    startTime: 0,
    duration: 600,      // ms for the hero pulse
    particles: [],
    rings: [],
    flashAlpha: 0,
    shakeAmt: 0,
    color: [255, 215, 0],
     shapeType: 'circle',
     sizeHint: 30,
    drawShapeFn: null
  };

  class Particle {
    constructor(x, y, col) {
      this.x = x;
      this.y = y;
      const ang = random(TWO_PI);
      const spd = random(3, 8);
      this.vx = cos(ang) * spd;
      this.vy = sin(ang) * spd;
      this.g = 0.18;
      this.size = random(4, 10);
      this.life = random(500, 1000);   // ms
      this.birth = millis();
      this.spin = random(-0.2, 0.2);
      this.a = 255;
      const j = random(-30, 30);
      this.col = [
        constrain(col[0] + j, 0, 255),
        constrain(col[1] + j, 0, 255),
        constrain(col[2] + j, 0, 255)
      ];
      this.shape = random(['circle', 'tri', 'square']);
      this.rot = random(TWO_PI);
    }
    update() {
      this.vy += this.g;
      this.x += this.vx;
      this.y += this.vy;
      this.rot += this.spin;
      const age = millis() - this.birth;
      this.a = map(age, 0, this.life, 255, 0, true);
      return age < this.life && this.a > 2;
    }
    draw() {
      push();
      translate(this.x, this.y);
      rotate(this.rot);
      noStroke();
      fill(this.col[0], this.col[1], this.col[2], this.a);
      if (this.shape === 'circle') {
        ellipse(0, 0, this.size, this.size);
      } else if (this.shape === 'square') {
        rectMode(CENTER);
        rect(0, 0, this.size, this.size);
      } else {
        triangle(
          -this.size * 0.6,  this.size * 0.6,
           0,                -this.size * 0.6,
           this.size * 0.6,   this.size * 0.6
        );
      }
      pop();
    }
  }

  class Ring {
    constructor(x, y, col) {
      this.x = x;
      this.y = y;
      this.r = 8;
      this.thick = 12;
      this.col = col;
      this.birth = millis();
      this.life = 500; // ms
    }
    update() {
      const t = millis() - this.birth;
      this.r = map(t, 0, this.life, 8, 140, true);
      this.thick = map(t, 0, this.life, 12, 1, true);
      return t < this.life;
    }
    draw() {
      push();
      noFill();
      stroke(this.col[0], this.col[1], this.col[2], 220);
      strokeWeight(this.thick);
      circle(this.x, this.y, this.r * 2);
      pop();
    }
  }

  // API internals 
  function triggerFoundEffect(
  x,
  y,
  col = [255, 215, 0],
  shapeType = 'circle',
  sizeHint  = 30,
  drawShapeFn = null   // keep old arg last for backward-compat
) {

    foundFX.active = true;
    foundFX.x = x;
    foundFX.y = y;
    foundFX.startTime = millis();
    foundFX.color = col;
    // NEW: snapshot shape + size so overlay matches the clicked object
    foundFX.shapeType = shapeType;
    foundFX.sizeHint  = sizeHint;
    console.log('[FoundFX snapshot]', { x, y, col, shapeType, sizeHint });

    foundFX.drawShapeFn = drawShapeFn;
    console.log('[FoundFX snapshot]', { x, y, col, shapeType, sizeHint });

    foundFX.particles.length = 0;
    for (let i = 0; i < 60; i++) foundFX.particles.push(new Particle(x, y, col));

    foundFX.rings.length = 0;
    foundFX.rings.push(new Ring(x, y, col));

    foundFX.flashAlpha = 200;
    foundFX.shakeAmt = 10;
  }

  function applyCameraShakeIfActive() {
    if (foundFX.shakeAmt > 0) {
      translate(
        random(-foundFX.shakeAmt, foundFX.shakeAmt),
        random(-foundFX.shakeAmt, foundFX.shakeAmt)
      );
      foundFX.shakeAmt *= 0.88;
      if (foundFX.shakeAmt < 0.6) foundFX.shakeAmt = 0;
    }
  }

  function renderFoundEffectOverlay() {
    if (!foundFX.active) return;

    // white flash overlay
    if (foundFX.flashAlpha > 0) {
      push();
      noStroke();
      fill(255, foundFX.flashAlpha);
      rect(0, 0, width, height);
      foundFX.flashAlpha -= 22;
      pop();
    }

    // shockwave rings
    foundFX.rings = foundFX.rings.filter(r => {
      const alive = r.update();
      r.draw();
      return alive;
    });

    // confetti
    foundFX.particles = foundFX.particles.filter(p => {
      const alive = p.update();
      p.draw();
      return alive;
    });

       // hero pulse
    const t = millis() - foundFX.startTime;
    const norm = constrain(t / foundFX.duration, 0, 1);
    const easeOut = 1 - pow(1 - norm, 3);

    // Draw the hero shape based on the snapshot
    push();
    translate(foundFX.x, foundFX.y);

    // Make it grow bigger before the explosion
    const scaleAmt =
      lerp(1.0, 1.4, easeOut) *    
      lerp(1.25, 1.0, max(0, norm - 0.5) * 2);
    const rotAmt = lerp(0, 0.15, easeOut);
    rotate(rotAmt);
    scale(scaleAmt);

    drawingContext.shadowColor = color(
      foundFX.color[0], foundFX.color[1], foundFX.color[2], 200
    );
    drawingContext.shadowBlur = 40;
    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;

    const s = foundFX.sizeHint;

    noFill();
    stroke(...foundFX.color);
    strokeWeight(6);

    switch (foundFX.shapeType) {
      case 'rect':
        rectMode(CENTER);
        rect(0, 0, s * 2, s * 2, 6);
        break;

      case 'tri': {
        const R = s;
        const ax = 0,        ay = -R;
        const bx = -R * Math.cos(Math.PI / 6), by =  R * Math.sin(Math.PI / 6);
        const cx =  R * Math.cos(Math.PI / 6), cy =  R * Math.sin(Math.PI / 6);
        triangle(ax, ay, bx, by, cx, cy);
        break;
      }

      default: // circle
        circle(0, 0, s * 2);
        break;
    }

    pop();


    // finish when visuals are done
    if (
      t > foundFX.duration &&
      foundFX.particles.length === 0 &&
      foundFX.rings.length === 0 &&
      foundFX.flashAlpha <= 0.5
    ) {
      foundFX.active = false;
    }
  }

  function onCorrectShapeChosen(cx, cy, colArray, drawShapeFn) {
    if (window.AudioManager && typeof AudioManager.play === 'function') {
      AudioManager.play('sfxCorrect', { vol: 1.0 });
    } else if (window.sfxCorrect && typeof sfxCorrect.play === 'function') {
      sfxCorrect.play();
    }
    triggerFoundEffect(cx, cy, colArray || [80, 200, 255], drawShapeFn);
  }

  // expose minimal API
  window.FoundEffect = {
    triggerFoundEffect,
    applyCameraShakeIfActive,
    renderFoundEffectOverlay,
    onCorrectShapeChosen
  };
})();
