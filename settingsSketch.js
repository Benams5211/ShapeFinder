/***
 * THIS FEATURE IS NOT COMPLETE AND THiS IS JUSt A TEMPORARY FILE THAT HOLDS RANDOM CODE
 * I AM USING TO FIGURE OUT THE ACTUAL FEATURE. 
 */

let w = 1000;
let h = 1000;
function setup() {
  
  createCanvas(w, h);

  background(200);

  describe(
    'A gray square with a black circle at its center. The circle moves when the user presses an arrow key. It leaves a trail as it moves.'
  );
}

function draw() {
  // Update x and y if an arrow key is pressed.
  if (keyIsDown(ESCAPE) === true) {
     // Style the circle.
    fill(0);
    // Draw the circle.
    square(50, 50, 500);
    fill(80,100,250);
    // Draw the circle.
    ellipse(100, 100, 80, 40);
  }
}