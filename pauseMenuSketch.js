// THESE NEED TO HAVE A GLOBAL SCOPE:
let pauseWidth, pauseHeight;
function pauseMenu(){
  textSize(32);
  pauseWidth = width-50;
  pauseHeight = height-40;
  fill('black');
  text('⏸️',pauseWidth,pauseHeight,100);
  if (keyIsDown(ESCAPE) === true) {
   fill(0);
   square(50, 50, 50);
  }
}

function setup() {
  createCanvas(400,400);
}

function draw() {
  background(220);
  pauseMenu();
}

function mousePressed(){
  textSize(32);
  let tW = textWidth('⏸️');
  let tH = 32;
  
  // Check if mouse click is within bounds of the text
  if (
    mouseX > pauseWidth &&
    mouseX < pauseWidth + tW &&
    mouseY > pauseHeight - tH && 
    mouseY < pauseHeight
  ) {
    console.log("Pause button clicked!");
  }
}
