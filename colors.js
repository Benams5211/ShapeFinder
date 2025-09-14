// Colors
function randomColor() {
  var r = floor(random(256));
  var g = floor(random(256));
  var b = floor(random(256));
  return color(r, g, b);
}
function colorize(shapes) {
  for (var i = 0; i < shapes.length; i++) {
    shapes[i].col = randomColor();
  }
}

// Demo with 3 shapes
var shapes = [];

function setup() {
  createCanvas(600, 300);
  noStroke();
  background(30);

  // creates 3 shapes to show colors
  shapes = [
    { type: 'circle',   x: 120, y: 150, size: 80 },
    { type: 'square',   x: 300, y: 150, size: 90 },
    { type: 'triangle', x: 480, y: 150, size: 90 }
  ];

  // add random colors
  colorize(shapes);

  // draw them
  for (var i = 0; i < shapes.length; i++) {
    var s = shapes[i];
    fill(s.col);
    if (s.type === 'circle') {
      circle(s.x, s.y, s.size);
    } else if (s.type === 'square') {
      rectMode(CENTER);
      rect(s.x, s.y, s.size, s.size, 8);
    } else { // triangle
      var d = s.size, h = d * 0.9;
      triangle(s.x - d/2, s.y + h/2, s.x + d/2, s.y + h/2, s.x, s.y - h/2);
    }
  }

  noLoop(); // draw once; refresh to re-roll colors
}
