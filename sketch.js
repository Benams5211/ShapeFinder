

// Added onUpdate to the EventManager, called per-frame during duration of event
// Adds extra freedom in functionality
class EventManager {
  constructor() {
    this.active = {};
  }

  start(name, durationMs, { onStart = null, onUpdate = null, onEnd = null } = {}) {
    // gets current time
    const now = millis();
    // checks if event already exists
    const existed = !!this.active[name];
    // creates the event and establishes what to do when it ends
    this.active[name] = { endAt: now + durationMs, onUpdate, onEnd };
    // resets it if it already existed
    if (!existed && typeof onStart === "function") onStart();
  }
  
  // continuously called in draw()
  // checks to see if an events timer has run out
  // if it has it will call the events onEnd function if it has been declared
  // basically just a complicated cleaner function
  update() {
    const now = millis();
    // this.active is just a dictionary of all the events currently inside of the EventManager
    // for loop iterates through all events
    for (const name in this.active) {
      // if it finds an event it sets tempEvent equal too it to compair it
      const tempEvent = this.active[name];
      const timeLeft  = Math.max(0, tempEvent.endAt - now);
      
      if (timeLeft > 0 && typeof tempEvent.onUpdate === "function") {
        tempEvent.onUpdate(timeLeft);
      }
      
      // checks if the selected event's expiration time has come
      if (now >= tempEvent.endAt) {
        // call the events onEnd function
        const cb = tempEvent.onEnd;
        delete this.active[name];
        // this is so we dont explode
        if (typeof cb === "function") cb();
      }
    }
  }

  isActive(name) {
    return !!this.active[name];
  }

  timeLeft(name) {
    // assigns tempEvent to event
    const tempEvent = this.active[name];
     // if event doesnt exist exit
    if (!tempEvent) return 0;
    // return ms till event ends via taking the time that the event ends minus the current time
    return Math.max(0, tempEvent.endAt - millis());
  }
  
  cancel(name, runOnEnd = false) {
    // assigns tempEvent to event
    const tempEvent = this.active[name];
    // if event doesnt exist exit
    if (!tempEvent) return;
    // if event does exist delete event
    delete this.active[name];
    // this is so we dont explode
    if (runOnEnd && typeof tempEvent.onEnd === "function") tempEvent.onEnd();
  }
}

// global dictionary of events
const events = new EventManager();



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
    shape.vx = lerp(shape.vx, dx * 0.03, this.followStrength);
    shape.vy = lerp(shape.vy, dy * 0.03, this.followStrength);
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
  constructor(x, y, size, type, movementConfig, color) {
    this.x     = x;
    this.y     = y;
    this.size  = size;
    this.type  = type;
    this.visible = true;
    
    // movementConfig contains lerpStrength, velocityLimit, switchRate
    this.movement =  { ...movementConfig }
    // A list of modifier objects used in updatePos()
    this.modifierList = [];
    
    // A starting velocity
    this.vx    = random(-this.movement.velocityLimit, this.movement.velocityLimit);
    this.vy    = random(-this.movement.velocityLimit, this.movement.velocityLimit);

    this.targetVx = random(-this.movement.velocityLimit, this.movement.velocityLimit);
    this.targetVy = random(-this.movement.velocityLimit, this.movement.velocityLimit);
    
    // Track current state of shape, like 'frozen.' More can be easily implemented in the future
    this.state = {};
    this.color = color;
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
    if (!this.visible) return;
    fill(this.color);
    // Fill shape 0 with blue
    if (this.num === 0) {
      fill(100,255,255);
    }
    
    if (this.state.infected)
      fill(color(120, 0, 120)); 
    
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
      switchRate        : 50,
    }
    let s = new Shape(windowWidth/2, windowHeight/2, 
                          random(35,45), random(choices), movementConfig,color(255,100,100));
    
    // Shapes 1-7 will follow shape 0
    if (shapes.length > 0 && shapes.length < 8 ) {
      toFollow = shapes[0];
      console.log(i + " is following " + toFollow.num)
      s.modifierList.push(new FollowShape({otherShape: toFollow, followStrength: 0.35}));
    }
    
    s.modifierList.push(new FreezeModifier({chance: 0.001, length: 60}));
    s.modifierList.push(new JitterModifier( {rate: 0.3} ))
    s.modifierList.push(new TeleportModifier( {chance: 0.01} ))
    
    shapes.push(s);
    
  }
}


// NEW: Special event functions

function spawnBlackHoleEvent(ms=3000) {
  let movementConfig = {
      lerpStrength      : 0,
      velocityLimit     : 0,
      switchRate        : 0,
    }
  // Deep copy the movement, modifiers, & state of each shape to
  // Rebuild the shapes list after the event ends
  let originalStates = shapes.map(s => ({
    movement: { ...s.movement },
    modifierList: [...s.modifierList],
    state: { ...s.state }
  }));
  // Create a BlackHole shape with size 0, and an infinite freeze modifier for it to stay in place
  let BlackHole = new Shape(random(width), random(height), 
                          0, "circle", movementConfig,color(0,10,0));
  BlackHole.modifierList.push(new FreezeModifier({chance: 1, duration: 1}))
  
  
  let jitter = new JitterModifier( {rate: 0.1} )
  let isPulling = false
  
  events.start('BLACKHOLE', ms, {
    onStart: () => {      
      // Render the black hole
      shapes.push(BlackHole);
    },
    onUpdate: (timeLeft) => {
      // Calculate progress 0 -> 1 to use in the different stages of the blackhole event
      const progress = 1 - (timeLeft / ms); // 0 → 1
      const bh = BlackHole;
      
      // During the first 10% of the event, grow size 0->350
      if (progress < 0.1) {
        bh.size = lerp(0, 350, progress / 0.1);
      } 
      // During the next 40% of the event, force all shapes to follow the BlackHole
      // and build up the jitter rate
      else if (progress < 0.5) {
        // Only do this once (since this is being called per-frame) 
        if (!isPulling) {
          for (let s in shapes) {
            if (shapes[s] == BlackHole) continue;
            shapes[s].modifierList.length = 0
            shapes[s].state = {}
            shapes[s].movement.velocityLimit = 20
            shapes[s].modifierList.push(new FollowShape({otherShape: BlackHole, followStrength: 1}));
            shapes[s].modifierList.push(new JitterModifier( {rate: 3} ))
          }
          isPulling = true
          bh.modifierList.push(jitter)
        }
        jitter.rate = lerp(jitter.rate, 1, (progress - 0.1) / (0.4))
      }
      // During the next 30% of the event, keep the black hole's size constant
      else if (progress < 0.8) {
        bh.size = 350;
      } 
      // Finally, last 20% of the event:
      // Hide all shapes except black hole
      // Shrink the black hole's size back down to 0
      else {
        if (isPulling) {
          bh.modifierList.length = 0
          isPulling = false
        }

        bh.size = lerp(350, 0, (progress - 0.8) / 0.2);

        // Hide other shapes during shrink phase
        shapes.forEach(s => {
          if (s !== bh) s.visible = false;
        });
      }
    },
    
    onEnd: () => {
      shapes.pop(); // Remove black hole from shapes list
      
      // Re build the shapes list with their original movement settings
      shapes.forEach((s, i) => {
        let saved = originalStates[i];
        if (!saved) return;
        s.movement = { ...saved.movement };
        s.modifierList = [...saved.modifierList];
        s.state = { ...saved.state };
        s.visible = true;
      });
      // Explosion animation on blackhole event finish
      spawnSplashEvent(BlackHole.x, BlackHole.y, ms=1000, itemCount = 300);
    }
  });
  
}

function spawnZombieEvent(ms=10000, zombieCount = 50) {
  let zombies = [];
  
  function pickNewTargetFor(zombie) {
    // Filter out:
    // Already infected shapes
    // The 'desired' shape to click (which is index 0 in shapes list)
    let candidates = shapes.filter(s => 
      s !== shapes[0] && 
      !zombies.includes(s)
    ); 
    // Pick the actual target from the list of candidates
    if (candidates.length > 0) {
      let newTarget = random(candidates);
      // Find the zombie's FollowShape modifier, and change to a new target
      let follow = zombie.modifierList.find(m => m instanceof FollowShape);
      if (follow) {
        follow.otherShape = newTarget;
      }
      zombie.targetShape = newTarget; // Store the target
    } else {
      zombie.targetShape = null;
    }
  }
  
  events.start('ZOMBIE', ms, {
    onStart: () => {      
      for (i = 0; i < zombieCount; i++) {
        let movementConfig = {
          lerpStrength      : 0.01,
          velocityLimit     : 0,
          switchRate        : random(60),
        }
        let z = new Shape(random(width), random(height), 
                            random(10,15), "square", movementConfig,color(0, 210, 0));
        z.modifierList.push(new FollowShape({ otherShape: null, followStrength: random(0.005,0.01) }));
        zombies.push(z);
        pickNewTargetFor(z); // Give each zombie its own target
      }
      shapes.push(...zombies); // Merge shapes list with zombies list so they get rendered
      
    },
    onUpdate: (timeLeft) => {
      // Cancel event prematurely if every shape has been infected (except desired shape)
      if (zombies.length == shapes.length-1)
        events.cancel('ZOMBIE', true)
      
      for (let z of zombies) {
        const tgt = z.targetShape;
        if (!tgt) continue;

        // Check if zombie is within the target's bounds
        let d = dist(z.x, z.y, tgt.x, tgt.y);
        // IS WITHIN BOUNDS:
        if (d < z.size / 2 + tgt.size / 2) {
          tgt.state.infected = true;   //Set infected state to handle in the Shape class itself
          
          // If the target isn't a zombie, push it to the zombies list and pick a target for it
          if (!zombies.includes(tgt)) {
            tgt.modifierList.push(new FollowShape({ otherShape: null, followStrength: random(0.01, 0.1) }));
            zombies.push(tgt);
            pickNewTargetFor(tgt);
          }
          
          // Retarget the zombie that infected the tgt
          pickNewTargetFor(z);

          // Retarget any other zombies that were also chasing this shape
          for (let other of zombies) {
            if (other !== z && other.targetShape === tgt) {
              pickNewTargetFor(other);
            }
          }
        }
      }
    },
    
    onEnd: () => {
      // Remove all zombies from screen by removing them from the shapes list
      shapes = shapes.filter(s => !zombies.includes(s));
    }
  });
}

// Splashes shapes from a starting position atX, atY
// in an explosion-type fashion
function spawnSplashEvent(atX = 0, atY = 0, ms=500, itemCount = 100, col = color(0,0,0)) {
  // Save the splash Shapes to delete on event end
  let splashShapes = [];
  
  events.start('SPLASH', ms, {
    onStart: () => {            
      for (i = 0; i < itemCount; i++) {
        let movementConfig = {
          lerpStrength      : 0.1,
          velocityLimit     : 30,
          switchRate        : 1000,
        }
        let s = new Shape(atX, atY, 
                          random(5,10), "square", movementConfig, col);
        
        s.modifierList.push(new JitterModifier( {rate: 0.4} ))

        shapes.push(s);
        splashShapes.push(s); 
      }     
    },
    onEnd: () => {
      // Re-build shapes list filtering out the splash shapes
      shapes = shapes.filter(s => !splashShapes.includes(s));
    }
  });
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
  
  if (frameCount == 120) {
    spawnBlackHoleEvent(ms = 3000)
  }
  if (frameCount == 500) {
    spawnZombieEvent(ms = 8000, zombieCount = 300)
  }
  
  events.update()
}
