// global list of clickable objects 
let interactors = [];

// abstract clickable class definition
// -----------------------------------------------------------------------------
class ClickableObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visible = true;
    this.enabled = true;
  }
  contains(mx, my) { return false; }
  render() {}
  onClick() {}
}

// -----------------------------------------------------------------------------
// rectangle shape implementation of clickable object class
// -----------------------------------------------------------------------------
class ClickRect extends ClickableObject {
  constructor(x, y, w, h, fillCol = [220, 50, 50], radius = 0) {
    // super keyword calls parent so this is just calling the parent constructor
    super(x, y);
    this.w = w;
    this.h = h;
    this.fillCol = fillCol;
    this.radius = radius;
  }
  contains(mx, my) {
    // basic collision detection; is mouse position within square during click
    return mx >= this.x - this.w / 2 && mx <= this.x + this.w / 2 &&
           my >= this.y - this.h / 2 && my <= this.y + this.h / 2;
  }
  render() {
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
class ClickCircle extends ClickableObject {
  constructor(x, y, r, fillCol = [90, 210, 130]) {
    // super keyword calls parent so this is just calling the parent constructor
    super(x, y);
    this.r = r;
    this.fillCol = fillCol;
  }
  contains(mx, my) {
    const dx = mx - this.x, dy = my - this.y;
    // distance formula stay in school
    return dx * dx + dy * dy <= this.r * this.r;
  }
  render() {
    push();
    noStroke();
    fill(...this.fillCol);
    circle(this.x, this.y, this.r * 2);
    pop();
  }
}

class BoatCircle extends ClickCircle {
  onClick() {
    triggerWarningBoatLines(2000, 15000);
  }
}

function mousePressed() {
  // top-most first
  for (let i = interactors.length - 1; i >= 0; i--) {
    const it = interactors[i];
    if (it.enabled && it.contains(mouseX, mouseY)) {
      it.onClick(); // polymorphism moment
      // return here makes it only activate one per click
      return false;
    }
  }
}

// purpose create timers and associate names with them
// check to see if timers are running
// implementation for callbacks when they expire
// ability to cancel them early

// title for the event - the actual name doesnt matter its just a string
const EXAMPLE_EVENT = 'example.MyEvent'

class EventManager {
  constructor() {
    this.active = {};
  }

  start(name, durationMs, { onStart = null, onEnd = null } = {}) {
    // gets current time
    const now = millis();
    // checks if event already exists
    const existed = !!this.active[name];
    // creates the event and establishes what to do when it ends
    this.active[name] = { endAt: now + durationMs, onEnd };
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
// event list in case we want to make something do a random event
const EVENT_LIST = [BOAT_EVENT, WARNING_EVENT, WARNING_BOAT_EVENT];

let boatLanes = null;

// just click the circle I made it just for you
function keyPressed() {
  if (key === 'a') triggerBoatLines(15000);
  if (key === 'w') triggerWarning(5000);
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
  // eventmanager structure
  events.start(BOAT_EVENT, ms, {
    onStart: () => {
      console.log("Boat Event started");
      // lane setup
      const laneHeights    = [height * 0.17, height * 0.50, height * 0.83];
      // array of lane directions positive is left to right negative right to left
      const laneDirections = [+1, -1, +1];
      // boat and motion constants
      const boatSpeedPxPerSec = 260;
      const boatWidth = 250;
      const boatHeight = height / 6.5;
      const boatGap = 60;
      const boatSpacing = boatWidth + boatGap;
      // timing calculations
      const eventDurationSec = ms / 1000;
      const crossDistancePx  = width + 2 * boatWidth;
      const crossingTimeSec  = crossDistancePx / boatSpeedPxPerSec;
      // time buffer to allow boats to get off screen before they disapear
      const safetyFactor     = 0.9;
      // cant go negative
      const availableTimeSec = Math.max(0, eventDurationSec * safetyFactor - crossingTimeSec);
      // minimum 1 boat per lane
      const boatsPerLane     = Math.max(1, Math.floor(availableTimeSec * boatSpeedPxPerSec / boatSpacing) + 1);

      // build lanes
      boatLanes = [];
      for (let i = 0; i < laneHeights.length; i++) {
        const laneY   = laneHeights[i];
        const laneDir = laneDirections[i];
        const boats   = [];

        let entryX;
        if (laneDir > 0) {
        // lane moves left to right so start just off the left edge
          entryX = -boatWidth;
        } else {
        // lane moves right to left so start just off the right edge
            entryX = width + boatWidth;
        }
        let cursorX  = entryX;
        // creates boats in single file line at equadistance
        for (let k = 0; k < boatsPerLane; k++) {
          boats.push({ x: cursorX, y: laneY, w: boatWidth, h: boatHeight, dir: laneDir });
          cursorX -= laneDir * boatSpacing;
        }
        // boatLanes are the three groupings of boatLines
        // used for organisation :)
        boatLanes.push({
          y: laneY,
          dir: laneDir,
          boats,
          speedPxPerSec: boatSpeedPxPerSec,
          spacing: boatSpacing,
          boatW: boatWidth,
          boatH: boatHeight
        });
      }
    },

    onEnd: () => { 
      console.log("Boat Event ended");
      boatLanes = null; 
    }
  });
}

function updateAndRenderBoatLines() {
  // only draw boats if there are boats to draw - Sun Tzu
  if (!boatLanes) return;

  // elapsed time since last frame in seconds deltatime so its not fps dependent
  const deltaSeconds = deltaTime / 1000;

  // boat visuals
  noStroke();
  fill(255, 255, 255, 230);
  rectMode(CENTER);
  
  // each lane contains an array of boats
  for (const lane of boatLanes) {
    const laneVelocity = lane.speedPxPerSec * lane.dir;

    // move and draw each boat
    for (let i = 0; i < lane.boats.length; i++) {
      const boat = lane.boats[i];
      boat.x += laneVelocity * deltaSeconds;
      rect(boat.x, boat.y, boat.w, boat.h);
    }

    // remove boats that have gone completely off-screen
    for (let i = lane.boats.length - 1; i >= 0; i--) {
      const boat = lane.boats[i];
      // check if it goes off screen to the right
      const offRight = (boat.dir > 0) && (boat.x - boat.w / 2 > width + 8);
      // take a guess
      const offLeft  = (boat.dir < 0) && (boat.x + boat.w / 2 < -8);
      // if the boat goes off screen get rid of the boat from the array
      if (offRight || offLeft) lane.boats.splice(i, 1);
    }
  }
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


function setup() {
  createCanvas(windowWidth, windowHeight);
  fx = width / 2;
  fy = height / 2;
  buildInteractors();
}

function buildInteractors() {
  interactors = [];
  interactors.push(new BoatCircle(width / 2, height / 2, 80, [90, 210, 130]));
}

function draw() {
  events.update();
  background(18, 22, 30);
  for (const it of interactors) it.render();
  if (events.isActive(BOAT_EVENT)) {
    updateAndRenderBoatLines();
  }
  if (events.isActive(WARNING_EVENT)) {
    updateAndRenderWarning();
  }
}
