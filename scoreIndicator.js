// abstract class definition of score indicator
// -----------------------------------------------------------------------------
class ScoreIndicator {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.t0 = millis();
    this.lifetime = 700; // ms
  }

  update() {
    let age = millis() - this.t0;
    this.t = constrain(age / this.lifetime, 0, 1);

    // growth + fade
    this.radius = 6 + (1 - pow(1 - this.t, 3)) * 40;
    this.alpha = 255 * (1 - pow(this.t, 1.6));
  }  
  
  isDead() {
    return millis() - this.t0 > this.lifetime;
  }
}

// -----------------------------------------------------------------------------
// indicating +1 score shape implementation
// -----------------------------------------------------------------------------
class StarScoreIndicator extends ScoreIndicator {
  show() { 
    push();
    translate(this.x, this.y);
    
    // glowing star
    noStroke();
    fill(255, 200, 0, this.alpha);
    this.drawStar(0, 0, 5, this.radius, this.inner);
    
    // outline
    stroke(255, this.alpha * 0.8);
    strokeWeight(2);
    noFill();
    this.drawStar(0, 0, 5, this.radius, this.inner);

    pop();

    // "+1" in the middle
    push();
    translate(this.x, this.y);
    textAlign(CENTER, CENTER);
    fill(255, this.alpha);
    stroke(0, this.alpha * 0.6);
    strokeWeight(2);
    textSize(this.radius * 0.8);
    text("+1", 0, 0);
    pop();
  }

  drawStar(x, y, points, outerR, innerR) {
    beginShape();
    for (let i = 0; i < points * 2; i++) {
      let angle = i * PI / points - HALF_PI;
      let r = (i % 2 === 0) ? outerR : innerR;
      let sx = x + cos(angle) * r;
      let sy = y + sin(angle) * r;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }
}

// -----------------------------------------------------------------------------
// indicating -1 score shape implementation
// -----------------------------------------------------------------------------
class CircleBurstScoreIndicator extends ScoreIndicator {
  show() {
    push();
    translate(this.x, this.y);

    // circle burst
    noStroke();
    fill(255, 50, 50, this.alpha);   // red fill
    ellipse(0, 0, this.radius * 2);

    stroke(255, this.alpha * 0.8);
    strokeWeight(2);
    noFill();
    ellipse(0, 0, this.radius * 2);

    pop();

    // "-1" in the middle
    push();
    translate(this.x, this.y);
    textAlign(CENTER, CENTER);
    fill(255, this.alpha);
    stroke(0, this.alpha * 0.6);
    strokeWeight(2);
    textSize(this.radius * 0.8);
    text("-1", 0, 0);
    pop();
  }
}