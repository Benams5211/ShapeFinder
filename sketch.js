let outerLayer;
function setup() {
  // Creates the base canvas
  createCanvas(400, 400);
  // Creates the canvas that will cover the bottom one
  outerLayer = createGraphics(width,height);
  // This just removes the cursor so it looks like a flashlight but idk if it will screw with the ability to click the shapes later on in development
  noCursor();
}

function draw() {
  background(color(0,70,70));
  fill(255,0,0);
  // I created a shape and I tried it with text in case we want to use emojis or shapes
  square(100,150,60);
  textSize(100);
  text('🍄',200,100)
  
  // Creates a black square that covers the whole canvas. The last paramater will need to be updated to whatever size we make our canvas, I just did 400 for testing! 
  outerLayer.fill(0,0,0);
  outerLayer.square(0,0,400)
  
  // Makes a circle that erases the square. The trick to making it look like the flashlight is I used the mouseX and mouseY variables so it just makes the circle move with the mouse! I just did circle but it can be any shape prety much as long as it's in between the erase() and noErase()! -- I did try other shapes but I think circle fits best as a flashlight!
  outerLayer.erase();
  outerLayer.circle(mouseX,mouseY,90);
  outerLayer.noErase();

  // Displays the outer layer, DO NOT REMOVE OR THE SECOND LAYER WILL NOT SHOW!!!!
  image(outerLayer,0,0);
}