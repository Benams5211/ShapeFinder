class FormationDirector {
  constructor() {
    this.active = false;
    this.type = 'circle';
    this.center = { x: 0, y: 0 }; // center of the formation can be anywhere
    this.radius = 180;
    this.frames = 0;
    this.holdFrames = 240;       // how long to hold formation
    this.easeIn = 30;            // frames to ramp into formation
    this.easeOut = 20;           // frames to release
    this.assignments = new Map(); // shape -> index in formation
    this.order = [];              // stable list of shapes in this routine
    this.lastUpdateFrame = -1;
  }

  // Call occasionally to begin a new routine
  start(interactors, {
    type = 'circle',
    center = { x: width/2, y: height/2 },
    radius = Math.min(width, height) * 0.28,
    holdFrames = 240,
    easeIn = 30,
    easeOut = 20,
    useAll = true,
    maxCount = Infinity,
  } = {}) {
    if (!interactors?.length) return;

    this.type = type;
    this.center = center;
    this.radius = radius;
    this.holdFrames = holdFrames;
    this.easeIn = easeIn;
    this.easeOut = easeOut;
    this.frames = 0;
    this.active = true;

    const pool = useAll ? interactors.slice() : shuffle(interactors.slice()).slice(0, Math.min(maxCount, interactors.length));
    this.order = pool;
    this.assignments.clear();
    for (let i = 0; i < this.order.length; i++) {
      this.assignments.set(this.order[i], i);
      // mark them so other logic could react if you want
      this.order[i].state.inFormation = true;
    }
  }

  // advance frame counter and auto stop when done
  update() {
    if (!this.active) return;
    if (this.lastUpdateFrame == frameCount) return; // only once per frame
    this.lastUpdateFrame = frameCount;

    this.frames++;
    // auto end after hold + easeOut
    if (this.frames > this.holdFrames + this.easeIn + this.easeOut) {
      this.stop();
    }
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    for (const s of this.order) {
      if (s && s.state) s.state.inFormation = false;
    }
    this.assignments.clear();
    this.order.length = 0;
  }
  // call on round reset to stop state leak
  reset() {
    this.active = true;
    this.order.length = 0;
    this.assignments.clear();
    this.frames = 0;
  }

  targetFor(shape) {
    if (!this.active) return null;
    const shapeIndex = this.assignments.get(shape);
    if (shapeIndex == null) return null;

    const totalShapes = this.order.length || 1;
    const frame = this.frames;

    let easingFactor = 1;
    if (frame < this.easeIn) {
      easingFactor = frame / this.easeIn;
    } else if (frame > this.holdFrames + this.easeIn) {
      const fadeOutTime = frame - (this.holdFrames + this.easeIn);
      easingFactor = Math.max(0, 1 - fadeOutTime / this.easeOut);
    }

    const centerX = this.center.x;
    const centerY = this.center.y;
    const radius = this.radius;

    // calculates the angle each object will sit at relative to how many objects there are
    const baseAngle = (shapeIndex / totalShapes) * TWO_PI;
    let targetX = centerX;
    let targetY = centerY;

    switch (this.type) {
      case 'circle': {
        const angle = baseAngle;
        targetX = centerX + radius * Math.cos(angle);
        targetY = centerY + radius * Math.sin(angle);
        break;
      }

      case 'orbit': {
        const angle = baseAngle + 0.01 * frame; // tweak magic number to adjust speed
        targetX = centerX + radius * Math.cos(angle);
        targetY = centerY + radius * Math.sin(angle);
        break;
      }

      case 'figure8': {
        // https://en.wikipedia.org/wiki/Lemniscate_of_Gerono
        // parameteric lemniscate of gerono equation we used to bash rocks together now we do this
        const phase = baseAngle + 0.02 * frame; // tweak magic number to adjust speed
        targetX = centerX + radius * Math.cos(phase);
        targetY = centerY + (radius * 0.6) * Math.sin(2 * phase) / 1.2;
        break;
      }
      case 'triangle': {
        // 3-point triangle formation
        const vertices = [];
        const numPoints = 3;
        for (let k = 0; k < numPoints; k++) {
          const angle = -HALF_PI + (k * TWO_PI / numPoints); // top, bottom-left, bottom-right
          vertices.push([
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          ]);
        }
        // evenly distribute shapes along edges
        const edges = [0, 1, 2, 0];
        const positionOnPath = (shapeIndex / totalShapes) * (edges.length - 1);
        const i0 = floor(positionOnPath), i1 = i0 + 1;
        const w = positionOnPath - i0;
        const [xA, yA] = vertices[edges[i0 % edges.length]];
        const [xB, yB] = vertices[edges[i1 % edges.length]];
        targetX = lerp(xA, xB, w);
        targetY = lerp(yA, yB, w);
        break;
      }

      case 'square': {
        const vertices = [];
        const numPoints = 4;
        for (let k = 0; k < numPoints; k++) {
          const angle = -PI / 4 + (k * HALF_PI); // start top-right, go clockwise
          vertices.push([
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          ]);
        }
        // trace edges in order
        const edges = [0, 1, 2, 3, 0];
        const positionOnPath = (shapeIndex / totalShapes) * (edges.length - 1);
        const i0 = floor(positionOnPath), i1 = i0 + 1;
        const w = positionOnPath - i0;
        const [xA, yA] = vertices[edges[i0 % edges.length]];
        const [xB, yB] = vertices[edges[i1 % edges.length]];
        targetX = lerp(xA, xB, w);
        targetY = lerp(yA, yB, w);
        break;
      }

      case 'orbitTriangle': {
        const rotationSpeed = 0.01 * frame;
        const vertices = [];
        const numPoints = 3;
        for (let k = 0; k < numPoints; k++) {
          const angle = -HALF_PI + (k * TWO_PI / numPoints) + rotationSpeed;
          vertices.push([
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          ]);
        }
        const edges = [0, 1, 2, 0];
        const positionOnPath = (shapeIndex / totalShapes) * (edges.length - 1);
        const i0 = floor(positionOnPath), i1 = i0 + 1;
        const w = positionOnPath - i0;
        const [xA, yA] = vertices[edges[i0 % edges.length]];
        const [xB, yB] = vertices[edges[i1 % edges.length]];
        targetX = lerp(xA, xB, w);
        targetY = lerp(yA, yB, w);
        break;
      }

      case 'orbitSquare': {
        const rotationSpeed = 0.01 * frame;
        const vertices = [];
        const numPoints = 4;
        for (let k = 0; k < numPoints; k++) {
          const angle = -PI / 4 + (k * HALF_PI) + rotationSpeed;
          vertices.push([
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
          ]);
        }
        const edges = [0, 1, 2, 3, 0];
        const positionOnPath = (shapeIndex / totalShapes) * (edges.length - 1);
        const i0 = floor(positionOnPath), i1 = i0 + 1;
        const w = positionOnPath - i0;
        const [xA, yA] = vertices[edges[i0 % edges.length]];
        const [xB, yB] = vertices[edges[i1 % edges.length]];
        targetX = lerp(xA, xB, w);
        targetY = lerp(yA, yB, w);
        break;
      }
      case 'line': {
        const leftX = centerX - radius;
        const rightX = centerX + radius;
        const normalizedIndex = totalShapes === 1 ? 0.5 : shapeIndex / (totalShapes - 1);
        targetX = lerp(leftX, rightX, normalizedIndex);
        targetY = centerY;
        break;
      }
      case 'sinWave': {
        // horizontal spacing (like line)
        const leftX = centerX - radius;
        const rightX = centerX + radius;
        const normalizedIndex = totalShapes === 1 ? 0.5 : shapeIndex / (totalShapes - 1);
        targetX = lerp(leftX, rightX, normalizedIndex);

        // sine wave parameters
        const amplitude = radius * 0.3;     // vertical size of wave
        const wavelength = (rightX - leftX) / 2; // distance between wave peaks
        const speed = 0.05;                 // horizontal scrolling speed

        // each shape’s y-position follows a sine pattern along x
        const phase = (targetX / wavelength) * TWO_PI + frame * speed;
        targetY = centerY + Math.sin(phase) * amplitude;
        break;
      }


      default: {
        const angle = baseAngle;
        targetX = centerX + radius * Math.cos(angle);
        targetY = centerY + radius * Math.sin(angle);
      }
    }
    return { tx: targetX, ty: targetY, alpha: easingFactor };
  }
}

class FigureSkateModifier {
  /**
   *  - director: FormationDirector
   *  - joinChance: chance per frame to start a routine
   *  - strength: how strongly to pull velocities toward formation target
   *  - types: array of formation names to randomize
   *  - minGapFrames: cooldown frames between routines
   */
  constructor({
    director,
    joinChance = 0.0008,
    strength = 0.15,
    types = [],
    minGapFrames = 240,
  } = {}) {
    this.director = director;
    this.joinChance = joinChance;
    this.strength = strength;
    this.types = types;
    this.minGapFrames = minGapFrames;
    this.lastEndedAt = -Infinity;
  }

  maybeStart(interactors) {
    if (!this.director || this.director.active) return;
    if (frameCount - this.lastEndedAt < this.minGapFrames) return;
    if (random() < this.joinChance) {
      const type = random(this.types);
      const R = Math.min(width, height) * random(0.22, 0.35);
      const cx = random(0.25 * width, 0.75 * width);
      const cy = random(0.30 * height, 0.75 * height);
      const hold = floor(random(160, 300));
      const easeIn = floor(random(20, 45));
      const easeOut = floor(random(15, 35));
      this.director.start(interactors, {
        type, center: { x: cx, y: cy }, radius: R,
        holdFrames: hold, easeIn, easeOut,
        useAll: true
      });
    }
  }

  apply(shape) {
    this.maybeStart(interactors);
    const wasActive = this.director.active;
    this.director.update();
    if (wasActive && !this.director.active) {
      this.lastEndedAt = frameCount;
    }
    const active = this.director?.active;
    const target = active ? this.director.targetFor(shape) : null;

    if (active && target) {
    // find any teleport modifiers on this shape and mark disabled
    if (!shape.teleportDisabled) {
      for (const m of shape.modifierList) {
        if (m instanceof TeleportModifier) m.wasDisabled = m.chance; // store original
        if (m instanceof TeleportModifier) m.chance = 0; // disable teleport
    }
    shape.teleportDisabled = true;
    }
    } else if (shape.teleportDisabled) {
      // restore teleport chance after formation ends
      for (const m of shape.modifierList) {
        if (m instanceof TeleportModifier && m.wasDisabled !== undefined) {
          m.chance = m.wasDisabled;
        }
      }
      delete shape.teleportDisabled;
    }

    // stop here if no active formation
    if (!target) return;

    const { tx, ty, alpha } = target;
    const k = 0.12;
    const pull = this.strength * alpha;

    const dvx = (tx - shape.x) * k;
    const dvy = (ty - shape.y) * k;

    shape.targetVx = lerp(shape.targetVx ?? 0, dvx, pull);
    shape.targetVy = lerp(shape.targetVy ?? 0, dvy, pull);

    // when formation ends, restore lerpStrength
    if (!active && shape.state.lBoosted) {
      shape.movement.lerpStrength = shape.origLerp ?? shape.movement.lerpStrength;
      shape.origLerp = null;
      shape.state.lBoosted = false;
    }
  }
}

// global formation director I made just for you :)
// dont make two I dont know what will happen you might die
const formationDirector = new FormationDirector();