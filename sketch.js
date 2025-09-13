//Ok Im trying to keep this as like clean and easy to merge as i can let me know if I did that wrong. I basically tried to keep my code seperate. super sorry if i was supposed to like add the main code in. 

//if im stepping on anyones already done code with this please let me know but I think you should be able to just swap the drawGame function for the actual gamecode?

//Right now we dont have diffrent modes but im assuming we will with the amount of ideas people have, so it has a start and modes button for now. 



// tracks which part of the program we are in, right now its just  "menu", "game", or "modes"
let gameState = "menu"; 
// the two button definitions, x, y, width, height, and label
let startButton, modesButton;

// image variables
let menuBgImg;   // optional menu background
let logoImg;     // optional title/logo image
let buttonImg;   // optional button image

function preload() {
  // optionally load images here
  // menuBgImg = loadImage("menuBackground.png");
  // logoImg = loadImage("gameLogo.png");
  // buttonImg = loadImage("buttonImage.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  startButton = { x: width/2 - 100, y: height/2, w: 200, h: 60, label: "START" };
  modesButton = { x: width/2 - 100, y: height/2 + 100, w: 200, h: 60, label: "MODES" };
}

//draw loop
function draw() {
  background(30); // dark gray background for contrast

  // which screen is shown based on gameState
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "game") {
    drawGame(); // Put actual game code here
  } else if (gameState === "modes") {
    drawModes();
  }
}

function drawMenu() {
  // if menu background image exists, draw it, else default background
  if (menuBgImg) {
    image(menuBgImg, 0, 0, width, height);
  } else {
    background(200);
  }
  
  // Title text or logo image
  if (logoImg) {
    imageMode(CENTER);
    image(logoImg, width/2, height/2 - 120);
  } else {
    fill(255); // white
    textAlign(CENTER, CENTER);
    textSize(48);
    text("GAME LOGO PlaceHolder", width/2, height/2 - 120);
  }

  // Draw buttons
  drawButton(startButton);
  drawButton(modesButton);
}

// helper function to draw a button
function drawButton(btn) {
  if (buttonImg) {
    // if images are active draw button image instead of rectangle
    imageMode(CENTER);
    image(buttonImg, btn.x + btn.w/2, btn.y + btn.h/2, btn.w, btn.h);
    fill(255); // draw text over button
  } else {
    fill(80, 140, 255); // blue button
    rect(btn.x, btn.y, btn.w, btn.h, 12); // rounded rectangle
    fill(255);
  }
  textSize(24);
  textAlign(CENTER, CENTER);
  text(btn.label, btn.x + btn.w/2, btn.y + btn.h/2);
}

// GAME (placeholder)
function drawGame() {
  background(200); // light gray
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("placeholder", width/2, height/2);

  // Back button to return to menu
  drawBackButton();
}

// modes (placeholder)
function drawModes() {
  background(60); // dark gray
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("Modes Menu (Coming Soon)", width/2, height/2);

  // Back button to return to menu// just for ease of dev
  drawBackButton();
}

// back button in the corner// honestly just for me to switch back, can be removed
function drawBackButton() {
  fill(255, 80, 80); // red button
  rect(20, 20, 120, 40, 8);
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text("BACK", 80, 40);
}

//mouse input
function mousePressed() {
  if (gameState === "menu") {
    // if on menu, check buttons
    if (mouseInside(startButton)) {
      gameState = "game"; // switch to game scene
    } else if (mouseInside(modesButton)) {
      gameState = "modes"; // switch to modes scene
    }
  } else if (gameState === "game" || gameState === "modes") {
    // if on game or modes screen, check "back" button
    if (mouseX > 20 && mouseX < 140 && mouseY > 20 && mouseY < 60) {
      gameState = "menu";
    }
  }
}

// helper, checks if mouse is inside a rectangle button
function mouseInside(btn) {
  return mouseX > btn.x && mouseX < btn.x + btn.w &&
         mouseY > btn.y && mouseY < btn.y + btn.h;
}