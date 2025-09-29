/////////////////////////////////////////////////////
//General project vars
/////////////////////////////////////////////////////

let gameOver = false;
let score = 0;
const StartTime = 60;       // length of a round in seconds (set what you want)
let Timer = StartTime;      // countdown mirror
let startMillis = 0;        // when the round started
let TimeOver = false;       // flag used in drawGame
let times = StartTime;      // display value
let sfxCorrect = null;      // sound effect for correct shape click
let sfxIncorrect = null;    // sound effect for incorrect shape click
let stars = [];             // shapes of +1 score indicator
let circleBursts = [];      // shapes of -1 score indicator
let difficulty = "medium";  // default

//////////////////////////////////////////////////
//Classes and stuff for menu
//////////////////////////////////////////////////

// tracks which part of the program we are in, right now its just  "menu", "game", or "modes"
let gameState = "menu"; 
// the two button definitions, x, y, width, height, and label
let startButton, modesButton, againButton;

// image variables
let menuBgImg;   // optional menu background
let logoImg;     // optional title/logo image
let buttonImg;   // optional button image

function preload() {
  // optionally load images here
  // menuBgImg = loadImage("menuBackground.png");
  // logoImg = loadImage("gameLogo.png");
  // buttonImg = loadImage("buttonImage.png");

  // Preload correct sound effect if p5.sound/audio file is available:
  if (typeof loadSound === 'function') {
    try { // Attempt to load "correct.mp3":
      sfxCorrect = loadSound('assets/correct.mp3');
    } catch (e) {
      sfxCorrect = null;
      console.warn('Failed to preload "correct.mp3"!', e);
    }
    try { // Attempt to load "incorrect.mp3":
      sfxIncorrect = loadSound('assets/incorrect.mp3');
    } catch (e) {
      sfxIncorrect = null;
      console.warn('Failed to preload "incorrect.mp3"!', e);
    }
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
    text("Shape Finder!\nVersion 0.4.1", width/2, height/2 - 120);
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

// modes
function drawModes() {
    background(60); 
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    text("Select Difficulty", width/2, height/2 - 150);
  
    // difficulty buttons
    drawButton({ x: width/2 - 100, y: height/2 - 50, w: 200, h: 60, label: "EASY" });
    drawButton({ x: width/2 - 100, y: height/2 + 50, w: 200, h: 60, label: "MEDIUM" });
    drawButton({ x: width/2 - 100, y: height/2 + 150, w: 200, h: 60, label: "HARD" });
  
    drawBackButton();
}

function keyPressed() {
  if (key === 'a') triggerBoatLines(15000);
  if (key === 'b') triggerBlackHoleEvent(3000);
  if (key === 'w') triggerWarning(5000);
  if (key === 'z') triggerZombieEvent(5000);
}

function drawOverMenu() {
  // darken everything below the UI bar
  fill(0, 200); 
  noStroke();
  rect(0, UILayer.height, windowWidth, windowHeight - UILayer.height);

  // redraw UI bar so it’s visible on top
  image(UILayer, 0, 0);

  // draw "time's over" + final score
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(50);  
  text("Final Score: " + score, windowWidth / 2, windowHeight / 2); 
  text("Time's Over!", windowWidth / 2, windowHeight / 2.5);

  drawButton(againButton);
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

// helper
function handleInteractorClick() {
  for (let i = interactors.length - 1; i >= 0; i--) {
    const it = interactors[i];
    if (it.enabled && it.contains(mouseX, mouseY)) {
      it.onClick();
      return; // trigger only one per click
    }
  }
}

//mouse input
function mousePressed() {
    if (gameState === "menu") {
      if (mouseInside(startButton)) {
        startGame();
      } else if (mouseInside(modesButton)) {
        gameState = "modes";
      }
  
    } else if (gameState === "game") {
      if (mouseX > 20 && mouseX < 140 && mouseY > 20 && mouseY < 60) {
        gameState = "menu";
      } else {
        handleInteractorClick();
      }
  
    } else if (gameState === "over") {
      if (mouseInside(againButton)) {
        startGame();
      } else if (mouseX > 20 && mouseX < 140 && mouseY > 20 && mouseY < 60) {
        gameState = "menu";
      }
  
    } else if (gameState === "modes") {
        // back button
        if (mouseInside({ x: 20, y: 20, w: 120, h: 40 })) {
          gameState = "menu";
          return;
        }
      
        // difficulty buttons — set difficulty AND start game immediately
        if (mouseInside({ x: width/2 - 100, y: height/2 - 50, w: 200, h: 60 })) {
          difficulty = "easy";
          startGame();
        } else if (mouseInside({ x: width/2 - 100, y: height/2 + 50, w: 200, h: 60 })) {
          difficulty = "medium";
          startGame();
        } else if (mouseInside({ x: width/2 - 100, y: height/2 + 150, w: 200, h: 60 })) {
          difficulty = "hard";
          startGame();
        }
  }
}

// helper, checks if mouse is inside a rectangle button
function mouseInside(btn) {
  return mouseX > btn.x && mouseX < btn.x + btn.w &&
         mouseY > btn.y && mouseY < btn.y + btn.h;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  //menu business
  startButton = { x: width/2 - 100, y: height/2, w: 200, h: 60, label: "START" };
  modesButton = { x: width/2 - 100, y: height/2 + 100, w: 200, h: 60, label: "MODES" };
  againButton = { x: width/2 - 100, y: height/2 + 100, w: 200, h: 60, label: "AGAIN" };
  
  //gameplay ui business
  UILayer = createGraphics(windowWidth, windowHeight * 0.1);
  
  //flashlight business
  fx = width / 2;
  fy = height / 2;
  rebuildLayer();
}

//makes the shapes
function playMode() {
  background(50);
  for (const it of interactors) {
    it.update();  // runs movement + modifiers
    it.render();  // draws the object
  }
  events.update();
}

function nextRound(){
  blackout = true; //turn flashlight off

  //wait, spawn new shapes, turn flashlight back on
  setTimeout(() => {
    clearInteractors();
    spawnInteractors();
    blackout = false; //turn flashlight on
  }, 400); //1 sec, half second?
}

function startGame() {
  Timer = StartTime;        // reset round length
  startMillis = millis();   // bookmark the start time ONCE
  TimeOver = false;
  gameOver = false;
  gameState = "game";
  score = 0;
  clearInteractors();
  setTimeout(() => {
    blackout = false;
  }, 1000);
  spawnInteractors();
  playMode();
}

//draw loop
function draw() {
  background(30); // dark gray background for contrast

  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "game") {
    drawGame();
  } else if (gameState === "modes") {
    drawModes();
  } else if (gameState === "over") {
    drawOverMenu();
  }

  updateScoreIndicators();
}

// GAME (placeholder)
function drawGame() {
  fill(0);

  // compute time left based on the single startMillis
  let elapsed = int((millis() - startMillis) / 1000);
  times = Timer - elapsed;

  // clamp
  if (times <= 0) {
    times = 0;
    TimeOver = true;
    gameOver = true;
    gameState = "over";
  }

  // play mode only while not gameOver
  if (!gameOver) {
    playMode();
  }

  // darkness/flashlight stuff
  const mx = isFinite(mouseX) ? mouseX : width / 2;
  const my = isFinite(mouseY) ? mouseY : height / 2;
  fx = lerp(fx, mx, 0.2);
  fy = lerp(fy, my, 0.2);

  const dx = fx - coverW / 2;
  const dy = fy - coverH / 2;
  //image(darkness, dx, dy);
  drawFlashlightOverlay();

  //drawing the top UI bar
  UILayer.clear();
  UILayer.background(255,255,255);
  UILayer.textSize(24);
  UILayer.textAlign(RIGHT, CENTER);
  UILayer.fill('black');
  UILayer.text("Score: " + score + " Time: " + times, UILayer.width - 20, UILayer.height /2);
  image(UILayer, 0,0);
  wantedObj.render();

  // back button
  drawBackButton();

}

function updateScoreIndicators() {

  // handle stars
  for (let i = stars.length - 1; i >= 0; i--) {
    stars[i].update();
    stars[i].show();
    if (stars[i].isDead()) {
      stars.splice(i, 1);
    }
  }

  // handle circle bursts
  for (let i = circleBursts.length - 1; i >= 0; i--) {
    circleBursts[i].update();
    circleBursts[i].show();
    if (circleBursts[i].isDead()) {
      circleBursts.splice(i, 1);
    }
  }
}
