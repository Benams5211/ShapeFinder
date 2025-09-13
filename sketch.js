// List of Shape objects
let shapes = []

// Default modifier list to merge with user-provided modifierList
// Used in filling missing settings/configs within the modifierList dict (default vals)
let modifierTemplate = {
  // lerpStrength   : (0,1) -> How 'snappy' the smoothed movement on velocity switch feels.
  // velocityLimit  : The limit in which the shape is allowed to move (Pixels per Frame)
  // switchRate     : How often the shape switches velocity (Frames)
  // followShape    : Pass another shape object to bias movement towards
  // followStrength : (0,1) -> How closely the follower Shape follows the followShape
  // jitterRate     : Jitter rate of Shape in Pixels per Frame.
  // freezeChance   : The chance in which a Shape will pause movement (per frame)
  // freezeLength   : Length, in frames, of freeze duration.
  // teleportChance : Chance, per frame, of shape teleporting to a random position.
  lerpStrength      : 0.03,
  velocityLimit     : 3,
  switchRate        : 60,
  followShape       : false,
  followStrength    : 0.3,
  jitterRate        : 0.1,
  freezeChance      : 0.001,
  freezeLength      : 60,
  teleportChance    : 0.001,
}

// Shape class
// We should be able to easily integrate this Shape class with our clickable class.
class Shape {
  constructor(x, y, size, type, layer, modifierList, num) {
    this.x     = x;
    this.y     = y;
    this.size  = size;
    this.type  = type;
    // NOT IMPLEMENTED: the layer in which the shape will render on compared to the other shapes on the same spot.
    this.layer = layer;
    
    // A starting velocity
    this.vx    = random(-2, 2);
    this.vy    = random(-2, 2);

    this.targetVx = random(-modifierList.velocityLimit, modifierList.velocityLimit);
    this.targetVy = random(-modifierList.velocityLimit, modifierList.velocityLimit);
    
    
    // Movement modifiers, useful for when implementing new levels/difficulties
    // If the passed modifierList is missing modifiers, we fill in those missing modifiers
    // using the modifierTemplate with its default values.
    this.modifierList =  { ...modifierTemplate, ...modifierList };
    
    // Track current state of shape, like 'frozen.' More can be easily implemented in the future
    this.state = {};
    // The index in which the Shape object resides within 'shapes' (Using this for testing)
    this.num = num;
    
  }
  
  
  updatePos() {
    let m = this.modifierList;
    
    // Apply frozen modifier if still enabled
    if (this.state.frozenFor > 0) {
      this.state.frozenFor--;
      this.state.frozen = true;
    } else {
      // Remove frozen modifier
      this.state.frozen = false;
      if (random() < m.freezeChance) {
        this.state.frozenFor = m.freezeLength;
        this.state.frozen = true;
      }
    }
    // Just simply return if state is frozen
    if (this.state.frozen) return;
    
    //------
    
    
    // Apply shape follow if followShape is provided
    if (m.followShape) {
      // Get distance x,y from the provided followShape
      let dx = m.followShape.x - this.x;
      let dy = m.followShape.y - this.y;

      // Bias current velocity toward the other Shape
      // Pulls the velocity slightly closer to the other Shape's velocity while retaining
      // its original random velocity.
      this.vx = lerp(this.vx, dx * 0.02, m.followStrength);
      this.vy = lerp(this.vy, dy * 0.02, m.followStrength);
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
    // Also add in jitterRate if provided.
    this.x += this.vx + random(-m.jitterRate, m.jitterRate);
    this.y += this.vy + random(-m.jitterRate, m.jitterRate);
    
    
    if (random() < m.teleportChance) {
      this.x = random(width);
      this.y = random(height);
    }

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
    // Indicates a shape that is following
    if (this.modifierList.followShape) {
      fill(0, 255, 0);
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
    
    let followShape = false
    // Force shape 1 to follow shape 0 (testing)
    if (shapes.length === 1) {
      followShape = shapes[0];
      console.log(i + " is following " + followShape.num)
    }
    
    let modifierList = {
      
      lerpStrength    : 0.03,
      velocityLimit   : 3,
      switchRate      : 60,
      followShape     : followShape,
      followStrength  : 0.1,
      jitterRate      : 0.1,
      freezeChance    : 0.001,
      freezeLength    : 60,
      teleportChance  : 0.001,
      
    }
    
    shapes.push(new Shape(windowWidth/2, windowHeight/2, 
                          40, random(choices), 1, 
                          modifierList, i
                         ));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  spawnShapes(20)
}

function draw() {
  background(50);
  for (let s of shapes) {
    s.updatePos();
    s.render();
  }
}
