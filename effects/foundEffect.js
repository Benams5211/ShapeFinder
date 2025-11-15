// effects/foundEffect.js
(() => {
  // --- internal state/classes ---
  let foundFX = {
    active: false,
    x: 0,
    y: 0,
    startTime: 0,
    duration: 2000,     // ms for the hero pulse (longer so growth is obvious)
    particles: [],
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

  // --- API internals ---
  function triggerFoundEffect(
    x,
    y,
    col = [255, 215, 0],
    shapeType = 'circle',
    sizeHint  = 30,
    drawShapeFn = null   // kept for backward-compat
  ) {
    foundFX.active = true;
    foundFX.x = x;
    foundFX.y = y;
    foundFX.startTime = millis();
    foundFX.color = col;

    // snapshot the shape so overlay matches the clicked object
    foundFX.shapeType = shapeType;
    foundFX.sizeHint  = sizeHint;
    foundFX.drawShapeFn = drawShapeFn;

    // confetti
    foundFX.particles.length = 0;
    for (let i = 0; i < 60; i++) {
      foundFX.particles.push(new Particle(x, y, col));
    }

    // flash + shake
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

    // confetti
    foundFX.particles = foundFX.particles.filter(p => {
      const alive = p.update();
      p.draw();
      return alive;
    });

    // hero pulse (the big main shape)
    const t = millis() - foundFX.startTime;
    const norm = constrain(t / foundFX.duration, 0, 1);
    const easeOut = 1 - pow(1 - norm, 3);

    // draw the chosen shape, growing really big
    push();
    translate(foundFX.x, foundFX.y);

    // grows from normal size → ~3x size
    const scaleAmt = lerp(1.0, 3.0, easeOut);
    const rotAmt   = lerp(0, 0.15, easeOut);
    rotate(rotAmt);
    scale(scaleAmt);

    const s = foundFX.sizeHint;

    // solid fill in the chosen color + a bright outline
    fill(foundFX.color[0], foundFX.color[1], foundFX.color[2], 240);
    stroke(255);
    strokeWeight(4);

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
    // colArray should be the exact color of the clicked win shape
    triggerFoundEffect(cx, cy, colArray || [80, 200, 255], 'circle', 30, drawShapeFn);
  }

  // expose minimal API
  window.FoundEffect = {
    triggerFoundEffect,
    applyCameraShakeIfActive,
    renderFoundEffectOverlay,
    onCorrectShapeChosen
  };
})();
