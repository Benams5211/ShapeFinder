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


// -----------------------------------------------------------------------------
// event constants
// -----------------------------------------------------------------------------
const BOAT_EVENT = 'screen.BoatLine';
const WARNING_EVENT = 'screen.Warning';
const WARNING_BOAT_EVENT = 'screen.Warning_Boatline';
const WIN_EVENT = 'game.Win';
const BLACKHOLE_EVENT = 'screen.BlackHole';
const SPLASH_EVENT = 'screen.Splash';
const ZOMBIE_EVENT = 'screen.Zombie';

// event list in case we want to make something do a random event empty rn
const EVENT_LIST = [/* add add events that impact gameplay and are kinda standalone */];

function triggerBlackHoleEvent(ms = 3000) {
  const freezeForever = new FreezeModifier({ chance: 1, duration: 1 }); // freeze the hole

  // Save original states to restore later
  const originalStates = interactors.map(o => ({
    movement: { ...o.movement },
    modifierList: [...o.modifierList],
    state: { ...o.state },
    visible: o.visible,
  }));

  const bhOpts = {
    movement: { enabled: false },
    modifiers: [freezeForever],
    randomColor: false,
    deleteOnClick: false,
    stroke: { enabled: false },
  };
  const BlackHole = new ClickCircle(random(width), random(height), 0, [0,10,0], bhOpts);

  // jitter used during pull phase
  const jitter = new JitterModifier({ rate: 0.1 });
  let isPulling = false;

  events.start(BLACKHOLE_EVENT, ms, {
    onStart: () => {
      interactors.push(BlackHole);
    },
    onUpdate: (timeLeft) => {
      // Calculate progress 0 -> 1 to use in the different stages of the blackhole event
      const progress = 1 - (timeLeft / ms);
      const bh = BlackHole;
      // During the first 10% of the event, grow size 0->350
      if (progress < 0.1) {
        // grow r: 0 -> 175 over first 10%
        bh.r = lerp(0, 175, progress / 0.1);
      // During the next 40% of the event, force all shapes to follow the BlackHole
      // and build up the jitter rate
      } else if (progress < 0.5) {
         // Only do this once (since this is being called per-frame) 
        if (!isPulling) {
          for (const o of interactors) {
            if (o === bh) continue;
            o.modifierList.length = 0;
            o.state = {};
            o.movement.velocityLimit = 20;
            o.modifierList.push(new FollowShape({ otherShape: bh, followStrength: 1 }));
            o.modifierList.push(new JitterModifier({ rate: 3 }));
          }
          isPulling = true;
          bh.modifierList.push(jitter);
        }
        jitter.rate = lerp(jitter.rate, 1, (progress - 0.1) / 0.4);
      // During the next 30% of the event, keep the black hole's size constant
      } else if (progress < 0.8) {
        bh.r = 175;
      } else {
        // Finally, last 20% of the event:
        // Hide all shapes except black hole
        // Shrink the black hole's size back down to 0
        if (isPulling) {
          bh.modifierList.length = 0;
          isPulling = false;
        }
        bh.r = lerp(175, 0, (progress - 0.8) / 0.2);
        // Hide other objs during shrink phase
        for (const o of interactors) {
          if (o !== bh) o.visible = false;
        }
      }
    },
    onEnd: () => {
      // remove black hole
      const idx = interactors.indexOf(BlackHole);
      if (idx !== -1) interactors.splice(idx, 1);

      // restore originals
      interactors.forEach((o, i) => {
        const saved = originalStates[i];
        if (!saved) return;
        o.movement = { ...saved.movement };
        o.modifierList = [...saved.modifierList];
        o.state = { ...saved.state };
        o.visible = saved.visible;
      });

      // Explosion animation on blackhole event finish
      spawnSplashEvent(BlackHole.x, BlackHole.y, 1000, 300, color(0,0,0));
    }
  });
}

function triggerZombieEvent(ms=10000, zombieCount = 50) {
  let zombies = [];
  const ZOMBIE_COL = [0, 210, 0];

  function pickNewTargetFor(zombie) {
    // Filter out:
    // Already infected shapes
    // The 'desired' shape to click (which is index 0 in shapes list)
    let candidates = interactors.filter(s => 
      s !== interactors[0] && 
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
      for (let i = 0; i < zombieCount; i++) {
        let movementConfig = {
          enabled           : true,
          lerpStrength      : 0.01,
          velocityLimit     : 0,
          switchRate        : random(60),
        }
        // translated: Shape(..., "square", ...) -> ClickRect with same size semantics
        const s = random(10, 15);
        let z = new ClickRect(
          random(width), random(height),
          s, s,                    // square w,h
          ZOMBIE_COL,              // CHANGED: spawn zombies purple (was [0,210,0])
          2,                       // corner radius
          {                        // opts mapped to InteractiveObject
            movement: movementConfig,
            modifiers: [],
            randomColor: false,
            deleteOnClick: false,
            stroke: { enabled: false }
          }
        );

        z.modifierList.push(new FollowShape({ otherShape: null, followStrength: random(0.005,0.01) }));
        zombies.push(z);
        pickNewTargetFor(z); // Give each zombie its own target
      }
      interactors.push(...zombies); // Merge shapes list with zombies list so they get rendered
      
    },
    onUpdate: (timeLeft) => {
      // Cancel event prematurely if every shape has been infected (except desired shape)
      if (zombies.length == interactors.length-1)
        events.cancel('ZOMBIE', true)
      
      for (let z of zombies) {
        const tgt = z.targetShape;
        if (!tgt) continue;

        // Check if zombie is within the target's bounds
        let d = dist(z.x, z.y, tgt.x, tgt.y);
        // IS WITHIN BOUNDS:
        // translated: size/2 checks -> use InteractiveObject bounds radius
        const rz = (typeof z.getBoundsRadius === 'function') ? z.getBoundsRadius() : 10;
        const rt = (typeof tgt.getBoundsRadius === 'function') ? tgt.getBoundsRadius() : 10;
        if (d < rz + rt) {

          // NEW: mirror old render-side color swap by directly tinting infected
          if (Array.isArray(tgt.fillCol)) tgt.fillCol = [120, 0, 120];

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
      interactors = interactors.filter(s => !zombies.includes(s));
    }
  });
}


function spawnSplashEvent(atX = 0, atY = 0, ms = 500, itemCount = 100, col = color(0,0,0)) {
  let splashObjs = [];

  events.start('SPLASH', ms, {
    onStart: () => {
      for (let i = 0; i < itemCount; i++) {
        const movement = { enabled: true, lerpStrength: 0.1, velocityLimit: 30, switchRate: 1000 };
        const opts = {
          movement,
          modifiers: [new JitterModifier({ rate: 0.4 })],
          randomColor: false,
          deleteOnClick: false,
          stroke: { enabled: false },
        };

        const s = random(5, 10);
        const o = new ClickRect(atX, atY, s, s, [red(col), green(col), blue(col)], 2, opts);
        interactors.push(o);
        splashObjs.push(o);
      }
    },
    onEnd: () => {
      interactors = interactors.filter(o => !splashObjs.includes(o));
    }
  });
}

function triggerWarning(ms = 2000) {
  events.start(WARNING_EVENT, ms, {
    onStart: () => {
      console.log("WARNING_EVENT started");
    },
    onEnd: () => {
      console.log("WARNING_EVENT ended");
    }
  });
}

function triggerBoatLines(ms = 10000) {

  const laneHeights    = [height * 0.17, height * 0.50, height * 0.83];
  const laneDirections = [+1, -1, +1];

  const boatSpeedPxPerSec = 260;
  const boatWidth  = 250;
  const boatHeight = height / 6.5;
  const boatGap    = 60;
  const boatSpacing = boatWidth + boatGap;

  const eventDurationSec = ms / 1000;
  const crossDistancePx  = width + 2 * boatWidth;
  const crossingTimeSec  = crossDistancePx / boatSpeedPxPerSec;
  const safetyFactor     = 0.9;
  const availableTimeSec = Math.max(0, eventDurationSec * safetyFactor - crossingTimeSec);
  const boatsPerLane     = Math.max(1, Math.floor(availableTimeSec * boatSpeedPxPerSec / boatSpacing) + 1);


  let lanes = [];
  events.start(BOAT_EVENT, ms, {
    onStart: () => {
      console.log("Boat Event started");

      lanes = [];
      for (let i = 0; i < laneHeights.length; i++) {
        const y   = laneHeights[i];
        const dir = laneDirections[i];
        const boats = [];

        // start just off-screen on the entering side
        const entryX = dir > 0 ? -boatWidth : width + boatWidth;
        let cursorX  = entryX;

        for (let k = 0; k < boatsPerLane; k++) {
          boats.push({ x: cursorX, y, w: boatWidth, h: boatHeight, dir });
          cursorX -= dir * boatSpacing;
        }

        lanes.push({
          y,
          dir,
          boats,
          speedPxPerSec: boatSpeedPxPerSec,
          spacing: boatSpacing,
          boatW: boatWidth,
          boatH: boatHeight
        });
      }
    },

    onUpdate: () => {

      // visuals
      push();
      noStroke();
      fill(255, 255, 255, 230);
      rectMode(CENTER);

      const dt = deltaTime / 1000;
      for (const lane of lanes) {
        const vx = lane.speedPxPerSec * lane.dir;

        for (let i = 0; i < lane.boats.length; i++) {
          const b = lane.boats[i];
          b.x += vx * dt;
          rect(b.x, b.y, b.w, b.h, 6);
        }
        for (let i = lane.boats.length - 1; i >= 0; i--) {
          const b = lane.boats[i];
          const offRight = (b.dir > 0) && (b.x - b.w / 2 > width + 8);
          const offLeft  = (b.dir < 0) && (b.x + b.w / 2 < -8);
          if (offRight || offLeft) lane.boats.splice(i, 1);
        }
      }
      pop();
    },

    onEnd: () => {
      console.log("Boat Event ended");
      lanes = []; // release references
    }
  });
}

function updateAndRenderWarning() {
  // message could be changed with parameters but im lazy
  const msg = " WARNING INCOMING ";
  // px per second
  const speed = 400;
  // verticle offset
  const y = 40;

  textSize(32);
  textAlign(LEFT, CENTER);
  fill(255, 50, 50);

  // use millis to shift position
  const t = millis() * 0.001; // seconds
  const shift = (t * speed) % textWidth(msg);

  // tile text across the whole screen instead of making a really long message which wouldve been way easier why didnt I think of that before I wrote this
  for (let x = -shift; x < width; x += textWidth(msg)) {
    text(msg, x, y);
  }
}

function triggerWarningBoatLines(warningMs = 2000, boatLinesMs = 15000) {
  events.start(WARNING_BOAT_EVENT, warningMs, {
    onStart: () => {
      console.log("WARNING_BOAT_EVENT started");
      triggerWarning(warningMs);
    },
    onEnd: () => {
      triggerBoatLines(boatLinesMs);
      console.log("WARNING_BOAT_EVENT ended");
    }
  });
}

//helper

function boundsRadius(o) {
  // Circle-like
  if (o && typeof o.r === "number") return Math.max(0, o.r);

  // Rect-like
  const w = o?.w ?? o?.width ?? 0;
  const h = o?.h ?? o?.height ?? 0;
  if (w || h) {
    // half-diagonal so the circle fully covers the rect corners
    return 0.5 * Math.hypot(w, h);
  }

  // Fallback if unknown shape — small hit radius
  return 10;
}