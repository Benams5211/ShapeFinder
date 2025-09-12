// Creates random shapes to be spawned around the p5 canvas.
// Parker Franklin

window.Game = window.Game || {}; // Ensures the global 'Game' object exists, and reuses it if true.
Game.shapes = Game.shapes || []; // Ensures the shared array 'Game.shapes' exists to hold all objects needed in shape creation.

// Returns a random int to be used in shape generation for shape attributes.
function rint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Placeholder for random color generation of shapes (Currently always returns them blue!)
function randomRGBA() {
  return [0, 0, 255, 160]; // Always spawns a blue shape for now.
}

// Placeholder for generating random stroke around a shape (Always black for now!)
function randomStrokeRGBA() {
  return [0, 0, 0, 220]; // Black stroke outline
}

// Spawns one random shape fully inside the canvas & returns total shape count.
window.spawnRandomShape = function spawnRandomShape() {
  const type = ["circle", "square", "triangle"][rint(0, 2)]; // Chooses a random type of shape based on randomly-generated int.
  const size = rint(20, 80);

  // Keeps the shape fully on screen by defining margins for it based on size.
  const margin = size / 2 + 4;
  const x = rint(margin, Math.max(margin, width - margin));
  const y = rint(margin, Math.max(margin, height - margin));

  // Generate fill & stroke colors of shapes.
  const fillCol = randomRGBA();
  const strokeCol = randomStrokeRGBA();

  Game.shapes.push({ type, x, y, size, fillCol, strokeCol }); // Adds new shape into the "Game.shapes" array.
  return Game.shapes.length; // Returns the number of shapes currently in the array (For Testing!)
};

// Draws each shape from the "Game.shapes" array for every new frame.
window.renderAllShapes = function renderAllShapes(arr) {
  if (!Array.isArray(arr)) return; // Error protection for empty array:
  for (const s of arr) {
    drawShape(s);
  }
};

// Draws one shape object based on its provided type.
function drawShape(s) {
  if (!s) return; // Returns if shape is undefined:

  // "Unpacks" the colors of a shape; Uses defaults if colors not passed.
  const [fr, fg, fb, fa] = s.fillCol || [200, 200, 200, 160];
  const [sr, sg, sb, sa] = s.strokeCol || [0, 0, 0, 220];

  // Applies the stroke & fill styles for the shape.
  stroke(sr, sg, sb, sa);
  strokeWeight(2);
  fill(fr, fg, fb, fa);

  const half = s.size / 2; // Constant halved-sized commonly used when drawing triangles.

  switch (s.type) { // Swtich statement that decides what type of shape 's' is and then draws it appropriately.
    case "circle":
      circle(s.x, s.y, s.size); // p5 circle draw function
      break;

    case "square":
      rectMode(CENTER);
      rect(s.x, s.y, s.size, s.size); // p5 retangle draw function
      break;

    case "triangle":
      // Utilizes constant "half" in triangle arithmetic!
      const x1 = s.x;
      const y1 = s.y - half;
      const x2 = s.x - half;
      const y2 = s.y + half;
      const x3 = s.x + half;
      const y3 = s.y + half;
      triangle(x1, y1, x2, y2, x3, y3); // p5 triagnle draw function
      break;

    default:
      point(s.x, s.y); // If no shape type is passed, default value of a dot.
  }
}