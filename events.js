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
      const timeLeft = Math.max(0, tempEvent.endAt - now);

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

  renderFront() {
    const now = millis();
    for (const name in this.active) {
      const evt = this.active[name];
      const timeLeft = Math.max(0, evt.endAt - now);
      if (typeof evt.onUpdate === "function") {
        evt.onUpdate(timeLeft, true); // true = front render pass
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

const BOAT_EVENT = "screen.BoatLine";
const WARNING_EVENT = "screen.Warning";
const WARNING_BOAT_EVENT = "screen.Warning_Boatline";
const WIN_EVENT = "game.Win";
const BLACKHOLE_EVENT = "screen.BlackHole";
const SPLASH_EVENT = "screen.Splash";
const ZOMBIE_EVENT = "screen.Zombie";
const CURTAINS_EVENT = "screen.Curtains";

// event list in case we want to make something do a random event
const EVENT_LIST = [
  /* add events that impact gameplay and are kinda standalone */
];

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
  const BlackHole = new ClickCircle(random(width), random(height), 0, [0, 10, 0], bhOpts);

  // jitter used during pull phase
  const jitter = new JitterModifier({ rate: 1.5 });
  BlackHole.modifierList.push(jitter);
  interactors.push(BlackHole);
  let isPulling = false;

  events.start(BLACKHOLE_EVENT, ms, {
    onStart: () => {
      interactors.push(BlackHole);
    },
    onUpdate: timeLeft => {
      // Calculate progress 0 -> 1 to use in the different stages of the blackhole event
      const progress = 1 - timeLeft / ms;
      const bh = BlackHole;
      
      // first 10%: grow size 0->175
      if (progress < 0.1) {
        bh.r = lerp(0, 175, progress / 0.1);
      } else if (progress < 0.5) {
        // next 40%: pull shapes inward and add jitter
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
      } else if (progress < 0.8) {
        // keep size constant
        bh.r = 175;
      } else {
        // final 20%: shrink and hide everything
        if (isPulling) {
          bh.modifierList.length = 0;
          isPulling = false;
        }
        bh.r = lerp(175, 0, (progress - 0.8) / 0.2);
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

      // Explosion animation
      spawnSplashEvent(BlackHole.x, BlackHole.y, 1000, 300, color(0, 0, 0));
    },
  });
}


function triggerZombieEvent(ms = 10000, zombieCount = 50) {
  let zombies = [];
  const ZOMBIE_COL = [0, 210, 0];

  function pickNewTargetFor(zombie) {
    // Filter out: Already infected shapes and wanted objects
    let candidates = interactors.filter(s => !zombies.includes(s) && !s.isWanted);
    if (candidates.length > 0) {
      const newTarget = random(candidates);
      const follow = zombie.modifierList.find(m => m instanceof FollowShape);
      if (follow) follow.otherShape = newTarget;
      zombie.targetShape = newTarget;
    } else {
      zombie.targetShape = null;
    }
  }

  events.start("ZOMBIE", ms, {
    onStart: () => {
      for (let i = 0; i < zombieCount; i++) {
        const movementConfig = {
          enabled: true,
          lerpStrength: 0.01,
          velocityLimit: 0,
          switchRate: random(60),
        };
        const s = random(10, 15);
        const z = new ClickRect(
          random(width),
          random(height),
          s,
          s,
          ZOMBIE_COL,
          2,
          {
            movement: movementConfig,
            modifiers: [],
            randomColor: false,
            deleteOnClick: false,
            stroke: { enabled: false },
          }
        );

        z.modifierList.push(
          new FollowShape({ otherShape: null, followStrength: random(0.005, 0.01) })
        );
        zombies.push(z);
        pickNewTargetFor(z);
      }
      interactors.push(...zombies);
    },

    onUpdate: timeLeft => {
      // Cancel event prematurely if every shape has been infected (except desired shape)
      if (zombies.length == interactors.length - 1) events.cancel("ZOMBIE", true);

      for (const z of zombies) {
        const tgt = z.targetShape;
        if (!tgt) continue;

        const d = dist(z.x, z.y, tgt.x, tgt.y);
        const rz =
          typeof z.getBoundsRadius === "function" ? z.getBoundsRadius() : 10;
        const rt =
          typeof tgt.getBoundsRadius === "function" ? tgt.getBoundsRadius() : 10;

        if (d < rz + rt) {
          if (Array.isArray(tgt.fillCol)) tgt.fillCol = [120, 0, 120];

          if (!zombies.includes(tgt)) {
            tgt.modifierList.push(
              new FollowShape({ otherShape: null, followStrength: random(0.01, 0.1) })
            );
            zombies.push(tgt);
            pickNewTargetFor(tgt);
          }

          pickNewTargetFor(z);

          for (const other of zombies) {
            if (other !== z && other.targetShape === tgt) {
              pickNewTargetFor(other);
            }
          }
        }
      }
    },

    onEnd: () => {
      // Remove all zombies from screen
      interactors = interactors.filter(s => !zombies.includes(s));
    },
  });
}

function spawnSplashEvent(atX = 0, atY = 0, ms = 500, itemCount = 100, col = color(0, 0, 0)) {
  let splashObjs = [];

  events.start("SPLASH", ms, {
    onStart: () => {
      for (let i = 0; i < itemCount; i++) {
        const movement = {
          enabled: true,
          lerpStrength: 0.1,
          velocityLimit: 30,
          switchRate: 1000,
        };
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
    },
  });
}

function triggerCurtains(ms = 1500) {
  const pauseDuration = 300;
  const halfDuration = ms / 2;
  const totalDuration = ms + pauseDuration;

  let curtainProgress = 0;
  let phase = "closing";
  let pauseStartTime = null;

  events.start(CURTAINS_EVENT, totalDuration, {
    onStart: () => console.log("Curtains start"),

    onUpdate: (timeLeft, isFrontPass) => {
      const elapsed = totalDuration - timeLeft;

      if (phase === "closing") {
        const t = constrain(elapsed / halfDuration, 0, 1);
        curtainProgress = t;
        if (t >= 1) {
          phase = "pause";
          pauseStartTime = millis();
        }
      } else if (phase === "pause") {
        if (millis() - pauseStartTime >= pauseDuration) {
          phase = "opening";
        }
      } else if (phase === "opening") {
        const t = constrain(
          (elapsed - halfDuration - pauseDuration) / halfDuration,
          0,
          1
        );
        curtainProgress = 1 - t;
      }

      if (!isFrontPass) return;

      const w = (width / 2) * curtainProgress;
      push();
      noStroke();
      fill(0, 0, 0);
      rect(0, 0, w + 10, height); // left curtain
      rect(width - w, 0, w + 10, height); // right curtain
      pop();
    },

    onEnd: () => console.log("Curtains end"),
  });
}

function triggerWarning(ms = 2000) {
  events.start(WARNING_EVENT, ms, {
    onStart: () => console.log("WARNING_EVENT started"),
    onEnd: () => console.log("WARNING_EVENT ended"),
  });
}

function triggerBoatLines(ms = 10000) {
  const laneHeights = [height * 0.17, height * 0.5, height * 0.83];
  const laneDirections = [+1, -1, +1];

  const boatSpeedPxPerSec = 260;
  const boatWidth = 250;
  const boatHeight = height / 6.5;
  const boatGap = 60;
  const boatSpacing = boatWidth + boatGap;

  const eventDurationSec = ms / 1000;
  const crossDistancePx = width + 2 * boatWidth;
  const crossingTimeSec = crossDistancePx / boatSpeedPxPerSec;
  const safetyFactor = 0.9;
  const availableTimeSec = Math.max(
    0,
    eventDurationSec * safetyFactor - crossingTimeSec
  );
  const boatsPerLane = Math.max(
    1,
    Math.floor((availableTimeSec * boatSpeedPxPerSec) / boatSpacing) + 1
  );

  let lanes = [];
  events.start(BOAT_EVENT, ms, {
    onStart: () => {
      console.log("Boat Event started");

      lanes = [];
      for (let i = 0; i < laneHeights.length; i++) {
        const y = laneHeights[i];
        const dir = laneDirections[i];
        const boats = [];

        const entryX = dir > 0 ? -boatWidth : width + boatWidth;
        let cursorX = entryX;

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
          boatH: boatHeight,
        });
      }
    },

    onUpdate: () => {
      push();
      noStroke();
      fill(255, 255, 255, 230);
      rectMode(CENTER);

      const dt = deltaTime / 1000;
      for (const lane of lanes) {
        const vx = lane.speedPxPerSec * lane.dir;
        for (const b of lane.boats) {
          b.x += vx * dt;
          rect(b.x, b.y, b.w, b.h, 6);
        }
        for (let i = lane.boats.length - 1; i >= 0; i--) {
          const b = lane.boats[i];
          const offRight = b.dir > 0 && b.x - b.w / 2 > width + 8;
          const offLeft = b.dir < 0 && b.x + b.w / 2 < -8;
          if (offRight || offLeft) lane.boats.splice(i, 1);
        }
      }
      pop();
    },

    onEnd: () => {
      console.log("Boat Event ended");
      lanes = [];
    },
  });
}

function updateAndRenderWarning() {
  const msg = " WARNING INCOMING ";
  const speed = 400;
  const y = 40;

  textSize(32);
  textAlign(LEFT, CENTER);
  fill(255, 50, 50);

  const t = millis() * 0.001;
  const shift = (t * speed) % textWidth(msg);

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
    },
  });
}

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------
function boundsRadius(o) {
  if (o && typeof o.r === "number") return Math.max(0, o.r);
  const w = o?.w ?? o?.width ?? 0;
  const h = o?.h ?? o?.height ?? 0;
  if (w || h) return 0.5 * Math.hypot(w, h);
  return 10;
}
