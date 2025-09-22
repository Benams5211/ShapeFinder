// colors-integration-mel.js
// Melanie W — Shape Finder colors
// I’m adding simple helpers to give shapes a base color.

function randomColor() {
  // returns a string like "rgb(123,45,200)"
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
  return "rgb(" + r + "," + g + "," + b + ")";
}

function setBaseColor(shape) {
  // if the shape doesn't have a color yet, give it one
  if (!shape) return;
  if (shape.col == null) {
    shape.col = randomColor();
  }
}

function colorizeArray(shapes) {
  // set a base color for every shape in an array
  if (!shapes || !shapes.length) return;
  for (var i = 0; i < shapes.length; i++) {
    setBaseColor(shapes[i]);
  }
}

// simple namespaces for clarity
var GameColors = {
  randomColor: randomColor,
  setBaseColor: setBaseColor,
  colorizeArray: colorizeArray
};
