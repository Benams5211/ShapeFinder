// Creates random shapes to be spawned for sound implementation (Based on Spawn Random Shape prototype).
// Parker Franklin

window.Game = window.Game || {};
Game.shapes = Game.shapes || [];

// Helper Functions for random shape generation.
function rint(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function fillBlue() { return [0, 0, 255, 160]; } // semi-transparent blue
function strokeBlue() { return [0, 0, 200, 220]; } // darker blue outline

// Spawns one random shape fully inside the canvas.
window.spawnRandomShape = function () {
  const type = ["circle", "square", "triangle"][rint(0, 2)];
  const size = rint(20, 80);
  const margin = size / 2 + 4;
  const x = rint(margin, Math.max(margin, width  - margin));
  const y = rint(margin, Math.max(margin, height - margin));
  Game.shapes.push({ type, x, y, size, fillCol: fillBlue(), strokeCol: strokeBlue() });
  return Game.shapes.length;
};

// Draws each shape from the "Game.shapes" array for every new frame.
window.renderAllShapes = function (arr) {
  if (!Array.isArray(arr)) return;
  for (const s of arr) drawShape(s);
};

// Draws one shape object based on its provided type.
function drawShape(s) {
  const [fr, fg, fb, fa] = s.fillCol || [0, 0, 255, 160];
  const [sr, sg, sb, sa] = s.strokeCol || [0, 0, 200, 220];
  stroke(sr, sg, sb, sa); strokeWeight(2); fill(fr, fg, fb, fa);

  const half = s.size / 2;
  switch (s.type) {
    case "circle": circle(s.x, s.y, s.size); break;
    case "square": rectMode(CENTER); rect(s.x, s.y, s.size, s.size); break;
    case "triangle": {
      const x1 = s.x, y1 = s.y - half;
      const x2 = s.x - half, y2 = s.y + half;
      const x3 = s.x + half, y3 = s.y + half;
      triangle(x1, y1, x2, y2, x3, y3);
      break;
    }
  }

  // "Special" Shapes (Green & Red Circles for sound testing.)
  if (s.special) {
    push();
    noStroke();
    fill(0);
    textSize(14);
    textAlign(CENTER, CENTER);
    const label =
      s.special === "correct" ? "Correct Shape" :
      s.special === "incorrect" ? "Incorrect Shape" : s.special;
    // Place shape label for Special Shape.
    text(label, s.x, s.y + half + 14);
    pop();
  }
}

// Tests if mouse click was within shape for click sound effect.
function isInsideShape(s, x, y) {
  const half = s.size / 2;
  switch (s.type) {
    case "circle": return dist(x, y, s.x, s.y) <= half;
    case "square": return x >= s.x - half && x <= s.x + half && y >= s.y - half && y <= s.y + half;
    case "triangle": 
      return x >= s.x - half && x <= s.x + half && y >= s.y - half && y <= s.y + half;
    default: return false;
  }
}

// Spawns Red & Green circles for Win/Lose sound effect testing.
function spawnSpecialShapes() {
  // Green "Correct Shape" Circle:
  Game.shapes.push({
    type: "circle",
    x: 100, // Fixes the position of the circle to the left edge of the canvas:
    y: height / 2,
    size: 80,
    fillCol: [0, 200, 0, 200], // Green Color
    strokeCol: [0, 120, 0, 255],
    special: "correct"
  });

  // Red "Incorrect Shape" Circle:
  Game.shapes.push({
    type: "circle",
    x: width - 100, // Fixes the position of the circle to the right edge of the canvas:
    y: height / 2,
    size: 80,
    fillCol: [200, 0, 0, 200], // Red Color
    strokeCol: [120, 0, 0, 255],
    special: "incorrect"
  });
}