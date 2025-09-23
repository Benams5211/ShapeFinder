let fx, fy;
let darkness;
let coverW, coverH;

let intensity = 0.55;

const innerMin = 0,  innerMax = 120;
const outerMin = 200, outerMax = 480;

const minGap = 15;
const bands = 10;
const darknessAlpha = 245;

function mouseWheel(e) {
  const old = intensity;
  const delta = -e.deltaY * 0.0015;

  if ((old <= 0 && delta < 0) || (old >= 1 && delta > 0)) return false;

  const next = constrain(old + delta, 0, 1);

  // only rebuild if it actually changed by a noticeable amount
  if (Math.abs(next - old) < 0.001) return false;

  intensity = next;
  buildDarknessLayer();
  return false; // prevent page scroll
}

function rebuildLayer() {
  coverW = width * 2;
  coverH = height * 2;
  darkness = createGraphics(coverW, coverH);
  buildDarknessLayer();
}


// the darkness effect works as a large black rectangle that has circles
// erased from the center at differing alpha levels

function buildDarknessLayer() {
  
  // the darkness is a graphic buffer
  // https://p5js.org/reference/p5/p5.Graphics/
  
  const cx = coverW / 2;
  const cy = coverH / 2;
  
  // buffer setup so IT doesnt explode
  darkness.push();
  darkness.clear();
  
  darkness.noStroke();
  darkness.background(0, darknessAlpha);

  let inner = lerp(innerMin, innerMax, intensity);
  let outer = lerp(outerMax, outerMin, intensity);
  if (outer < inner + minGap) outer = inner + minGap;

  const innerCoreAlpha = lerp(60, 255, intensity);
  
  darkness.erase();

  // creates next circle for erasure color doesnt matter
  darkness.fill(255, innerCoreAlpha);
  
  darkness.circle(cx, cy, inner * 2);
  
  // ethically sourced from stackoverflow
  
  for (let i = 0; i < bands; i++) {
    
    const t0 = i / bands;
    const t1 = (i + 1) / bands;

    const e0 = easeOutQuad(t0);
    const e1 = easeOutQuad(t1);

    const r0 = lerp(inner, outer, e0);
    const r1 = lerp(inner, outer, e1);
    
    // makes the alpha fade
    // https://p5js.org/reference/p5/map/
    
    const a = map(i, 0, bands - 1, innerCoreAlpha * 0.6, 0);
    darkness.fill(255, a);
    darkness.circle(cx, cy, r1 * 2);
  }
  // contains the buffer so WE dont explode
  darkness.noErase();
  darkness.pop();
}

function easeOutQuad(x) {
  // idiom
  return 1 - (1 - x) * (1 - x);
}
