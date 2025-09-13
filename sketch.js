// List of Shape objects
let shapes = []

// movementConfig format for Shape class:
// {
// lerpStrength   : (0,1) -> How 'snappy' the smoothed movement on velocity switch feels.
// velocityLimit  : The limit in which the shape is allowed to move (Pixels per Frame)
// switchRate     : How often the shape switches velocity (Frames)
// }

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

// ----

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
    if (this.y < this.size / 2) {
      this.y = this.size / 2;
      this.vy *= -1;
    }
    if (this.y > height - this.size / 2) {
      this.y = height - this.size / 2;
      this.vy *= -1;
    }
  }
  render() {
    fill(255, 100, 100);
    // Fill shape 0 with blue
    if (this.num === 0) {
      fill(100,255,255);
    }

    // Cycle through modifierList, if contains a FollowShape,
    // Indicate by filling the shape green.
    if (this.modifierList.some(m => m instanceof FollowShape)) {
      fill(0,255,0);
    }
    
    // Indicates a shape that is currently frozen
    if (this.state.frozen) {
      fill(255,255,255);
    }
    
    noStroke();
    if (this.type === "circle") {
      ellipse(this.x, this.y, this.size);
    } else if (this.type == "square") {
      rectMode(CENTER);
      rect(this.x, this.y, this.size, this.size);
    } else if (this.type == "triangle") {
      const h = this.size;
      triangle(
        this.x - this.size/2, this.y + h/2, 
        this.x + this.size/2, this.y + h/2, 
        this.x, this.y - h/2);
    }
    // Add number text on each Shape for testing.
    if (this.num !== undefined) {
      fill(0); 
      textAlign(CENTER, CENTER);
      textSize(this.size * 0.5); 
      text(this.num, this.x, this.y);
    }
  }
}

function spawnShapes(count) {
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

function setup() {
  createCanvas(windowWidth, windowHeight);
  spawnShapes(100)
}

function draw() {
  background(50);
  for (let s of shapes) {
    s.updatePos();
    s.render();
  }
}
