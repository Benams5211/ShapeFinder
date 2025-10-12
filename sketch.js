/////////////////////////////////////////////////////
//General project vars
/////////////////////////////////////////////////////

let gameOver = false;
let round = 1;
const StartTime = 60;       // length of a round in seconds (set what you want)
let Timer = StartTime;      // countdown mirror
let startMillis = 0;        // when the round started
let TimeOver = false;       // flag used in drawGame
let times = StartTime;      // display value

let sfxCorrect = null;      // sound effect for correct shape click
let sfxIncorrect = null;    // sound effect for incorrect shape click
let sfxMenu = null;         // sound effect for menu selections
let bgmHard = null;         // bgm

let stars = [];             // shapes of +1 round indicator
let circleBursts = [];      // shapes of -1 round indicator
let bossKills = [];         // for boss kill indicator

let difficulty = "medium";  // default difficulty
const MENU_SHAPE_CAP=80; 

let startBtnImg1, startBtnImg2;
const startButtonScale = 1.8;
let pauseButton, backToMenuButton;
let optionsBtnImg1, optionsBtnImg2;
const optionsButtonScale = 5.5;

// stuff for paused
let pauseStartMillis = 0;
let totalPausedTime = 0;

//combo counter
let combo = 0;

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
let pixelFont;

let localstorateScoreManager; // This manages score objects in localstorage
let finalScorePopup;  // The pop-up window that shows the score details.

let finalScorePopupShown = false; // Flag that maintain the score pop-up window visibility status.

/////////////////////////////////////////////////////
//localstorage keys
/////////////////////////////////////////////////////
const localstorageScoreObjectsKey = "scoreObjects"
const localstorageDateKey = "date"
const localstorageIDKey = "id";
const localstorageValueKey = "value";

const logoImagePath = "assets/images/gameLogo.png"

function preload() {
  // optionally load images here
  // menuBgImg = loadImage("menuBackground.png");
  logoImg = loadImage(logoImagePath);
  startBtnImg1 = loadImage("assets/images/startButton1.png");
  startBtnImg2 = loadImage("assets/images/startButton2.png");
  optionsBtnImg1 = loadImage("assets/images/optionsButton1.png");
  optionsBtnImg2 = loadImage("assets/images/optionsButton2.png");

  // Load font
  pixelFont = loadFont("assets/fonts/pixelFont.ttf");

   // 
  // Preload the Audio Manager:
  // 
  if (window.AudioManager && typeof AudioManager.preload === 'function') {
    // List of Audio Files to be proloaded by the Audio Manager:
    AudioManager.preload([
      { name: 'sfxCorrect', path: 'assets/audio/correct.mp3' },
      { name: 'sfxIncorrect', path: 'assets/audio/incorrect.mp3' },
      { name: 'sfxMenu', path: 'assets/audio/menuSelect.mp3' },
      { name: 'bossHit', path: 'assets/audio/bossHit.mp3' },
      { name: 'bossKill', path: 'assets/audio/bossKill.mp3' },
      { name: 'bgmHard', path: 'assets/audio/gameBGM.mp3' },
      { name: 'bgmBoss', path: 'assets/audio/bgmBoss.mp3' },
      { name: 'mainMenu', path: 'assets/audio/mainMenu.mp3' },
    ]);

    if (AudioManager.sounds['sfxCorrect']) sfxCorrect = AudioManager.sounds['sfxCorrect'].obj;
    if (AudioManager.sounds['sfxIncorrect']) sfxIncorrect = AudioManager.sounds['sfxIncorrect'].obj;
    if (AudioManager.sounds['sfxMenu']) sfxMenu = AudioManager.sounds['sfxMenu'].obj;
    if (AudioManager.sounds['bossHit']) bossHit = AudioManager.sounds['bossHit'].obj;
    if (AudioManager.sounds['bossKill']) bossHit = AudioManager.sounds['bossKill'].obj;
    if (AudioManager.sounds['bgmHard']) bgmHard = AudioManager.sounds['bgmHard'].obj;
    if (AudioManager.sounds['bgmBoss']) bgmBoss = AudioManager.sounds['bgmBoss'].obj;
    if (AudioManager.sounds['mainMenu']) bgmBoss = AudioManager.sounds['mainMenu'].obj;
  } else if (typeof loadSound === 'function') { // If the Audio Manager can't be loaded properly, then just load the sound effects like from previous iteration (with "loadSound()"):
    try {
      sfxCorrect = loadSound('assets/audio/correct.mp3');
    } catch (e) {
      sfxCorrect = null;
      console.warn('Failed to preload "correct.mp3"!', e);
    }
    try {
      sfxIncorrect = loadSound('assets/audio/incorrect.mp3');
    } catch (e) {
      sfxIncorrect = null;
      console.warn('Failed to preload "incorrect.mp3"!', e);
    }
    try {
      sfxMenu = loadSound('assets/audio/menuSelect.mp3');
    } catch (e) {
      sfxMenu = null;
      console.warn('Failed to preload "menuSelect.mp3!"' );
    }
    try {
      bgmHard = loadSound('assets/audio/gameBGM.mp3');
    } catch (e) {
      bgmHard = null;
      console.warn('Failed to preload "gameBGM.mp3!"' );
    }
    try {
      bgmHard = loadSound('assets/audio/bgmBoss.mp3');
    } catch (e) {
      bgmHard = null;
      console.warn('Failed to preload "bgmBoss.mp3!"' );
    }
    try {
      bossHit = loadSound('assets/audio/bossHit.mp3');
    } catch (e) {
      bossHit = null;
      console.warn('Failed to preload "bossHit.mp3!"' );
    }
    try {
      bossHit = loadSound('assets/audio/bossKill.mp3');
    } catch (e) {
      bossHit = null;
      console.warn('Failed to preload "bossKill.mp3!"' );
    }
    try {
      bossHit = loadSound('assets/audio/mainMenu.mp3');
    } catch (e) {
      bossHit = null;
      console.warn('Failed to preload "mainMenu.mp3!"' );
    }
  }

  // Preload correct sound effect if p5.sound/audio file is available:
  if (typeof loadSound === 'function') {
    try { // Attempt to load "correct.mp3":
      sfxCorrect = loadSound('assets/audio/correct.mp3');
    } catch (e) {
      sfxCorrect = null;
      console.warn('Failed to preload "correct.mp3"!', e);
    }
    try { // Attempt to load "incorrect.mp3":
      sfxIncorrect = loadSound('assets/audio/incorrect.mp3');
    } catch (e) {
      sfxIncorrect = null;
      console.warn('Failed to preload "incorrect.mp3"!', e);
    }
    try { // Attempt to load "menuSelect.mp3":
      sfxMenu = loadSound('assets/audio/menuSelect.mp3');
    } catch (e) {
      sfxMenu = null;
      console.warn('Failed to preload "menuSelect.mp3!"' );
    }
    try {
      bgmHard = loadSound('assets/audio/gameBGM.mp3');
    } catch (e) {
      bgmHard = null;
      console.warn('Failed to preload "gameBGM.mp3!"' );
    }
    try {
      bgmHard = loadSound('assets/audio/bgmBoss.mp3');
    } catch (e) {
      bgmHard = null;
      console.warn('Failed to preload "bgmBoss.mp3!"' );
    }
    try {
      bossHit = loadSound('assets/audio/bossHit.mp3');
    } catch (e) {
      bossHit = null;
      console.warn('Failed to preload "bossHit.mp3!"' );
    }
    try {
      bossHit = loadSound('assets/audio/bossKill.mp3');
    } catch (e) {
      bossHit = null;
      console.warn('Failed to preload "bossKill.mp3!"' );
    }
    try {
      bossHit = loadSound('assets/audio/mainMenu.mp3');
    } catch (e) {
      bossHit = null;
      console.warn('Failed to preload "mainMenu.mp3!"' );
    }
  }

  localstorateScoreManager = new LocalStorageScoreManager();
  finalScorePopup = new FinalScorePopup(localstorateScoreManager, logoImagePath);
}

function drawMenu() {
  // if menu background image exists, draw it, else default background
  if (menuBgImg) {
    image(menuBgImg, 0, 0, width, height);
  } else {
    background(200);
  }

  // draw drifting shapes in background
  playModeMenu();

  // overlay darkness
  fill(0, 180);
  noStroke();
  rect(0, 0, width, height);
  
  // Title text or logo image
  if (logoImg) {
    imageMode(CENTER);
    image(logoImg, width/2, height/2 - 200);
    fill(255); // white
    textAlign(CENTER, CENTER);
    textSize(48);
    textFont(pixelFont);
    text("That Time I Got Reincarnated into a New World\n and Used my Level 100 Flashlight Skills to Find the Wanted Shape!", width/2, height/2 - 75);
    imageMode(CORNER);
    textFont('Arial');
  } else {
    fill(255); // white
    textAlign(CENTER, CENTER);
    textSize(48);
    text("Shape Finder!\nVersion 6.0", width/2, height/2 - 120);
  }

  // Draw buttons
  drawButton(startButton);
  drawButton(modesButton);
}

function spawnMenuShape() {
  const r = random(20, 40);
  const x = random(r, width - r);
  const y = random(r, height - r);
  const opts = {
    movement: { enabled: true, lerpStrength: 0.2, velocityLimit: 0.3, switchRate: 60 },
    modifiers: [],
    deleteOnClick: false,
    randomColor: true,
    outline: true,
    stroke: { enabled: true, weight: 9, color: [255,255,255] },
  };
  const choice = random(['circle', 'rect', 'tri']);
  if (choice === 'circle') {
    interactors.push(new ClickCircle(x, y, r, randomColor(), {...opts}));
  } else if (choice === 'rect') {
    interactors.push(new ClickRect(x, y, r*1.5, r*1.5, randomColor(), 8, {...opts}));
  } else {
    interactors.push(new ClickTri(x, y, r*2, randomColor(), {...opts}));
  }
}


// helper function to draw a button
function drawButton(btn) {
  const hovering = mouseX > btn.x && mouseX < btn.x + btn.w &&
                   mouseY > btn.y && mouseY < btn.y + btn.h;

  if (btn.img) {
    imageMode(CORNER);
    noSmooth(); // ← prevent smoothing
    if (hovering && btn.hoverImg) {
      image(btn.hoverImg, btn.x, btn.y, btn.w, btn.h);
    } else {
      image(btn.img, btn.x, btn.y, btn.w, btn.h);
    }
  } else {
    fill(hovering ? color(120,180,255) : color(80,140,255));
    rect(btn.x, btn.y, btn.w, btn.h, 12);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(btn.label, btn.x + btn.w/2, btn.y + btn.h/2);
  }
}

// modes
function drawModes() {
    background(200);
    // draw drifting shapes in background
  playModeMenu();

  // overlay darkness
    fill(0, 180);
    noStroke();
    rect(0, 0, width, height);
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(255,255,255);
    textFont(pixelFont);
    text("Select Difficulty", width/2, height/2 - 150);
    textFont('Arial');
  
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
  
  if (gameState === "game" && key === 'p') {
    gameState = "pause";
    triggerCurtains();
    pauseStartMillis = millis();
  } else if (gameState === "pause" && key === 'p') {
    gameState = "game";
    triggerCurtains();
    totalPausedTime += millis() - pauseStartMillis;
  }
}

function drawOverMenu() {
  // darken everything below the UI bar
  fill(0, 200); 
  noStroke();
  rect(0, UILayer.height, windowWidth, windowHeight - UILayer.height);

  // redraw UI bar so it’s visible on top
  image(UILayer, 0, 0);

  // draw "time's over" + final round
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(50);  
  text("Final Round: " + round, windowWidth / 2, windowHeight / 2); 
  text("Time's Over!", windowWidth / 2, windowHeight / 2.5);

  drawButton(againButton);
  drawBackButton();
}


////////////////////////////////////
//songs
////////////////////////////////////

let isHardBGMPlaying = false;

function playHardBGM() {
  // If already playing, do nothing
  if (isHardBGMPlaying) return;

  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bgmHard', { vol: 0.35, loop: true });
    isHardBGMPlaying = true;
  } 
  else if (typeof bgmHard !== 'undefined' && bgmHard && typeof bgmHard.play === 'function') {
    // Only play if not already playing
    if (bgmHard.paused || bgmHard.currentTime === 0) {
      bgmHard.loop = true;
      bgmHard.volume = 0.35;
      bgmHard.play();
      isHardBGMPlaying = true;
    }
  }
}

function stopHardBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.stop('bgmHard');
          isHardBGMPlaying=false;
  } else if (typeof bgmHard !== 'undefined' && bgmHard && typeof bgmHard.play === 'function') {
    bgmHard.stop('bgmHard');
    isHardBGMPlaying=false;
  }
}

function playBossBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bgmBoss', { vol: 0.35, loop:true }); // Play "bgmBoss" from the Audio Manager:
  } else if (typeof bgmBoss !== 'undefined' && bgmBoss && typeof bgmBoss.play === 'function') {
    bgmBoss.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function stopBossBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.stop('bgmBoss');
  } else if (typeof bgmBoss !== 'undefined' && bgmBoss && typeof bgmBoss.play === 'function') {
    bgmBoss.stop('bgmBoss');
  }
}

function playMenuBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('mainMenu', { vol: 0.35, loop:true }); // Play "mainMenu" from the Audio Manager:
  } else if (typeof mainMenu !== 'undefined' && mainMenu && typeof mainMenu.play === 'function') {
    mainMenu.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function stopMenuBGM(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
          AudioManager.stop('mainMenu');
  } else if (typeof mainMenu !== 'undefined' && mainMenu && typeof mainMenu.play === 'function') {
    mainMenu.stop('mainMenu');
  }
}

////////////////////////////////////
//sound effects
////////////////////////////////////

function playBossHit(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bossHit', { vol: 1, loop:false }); // Play "bossHit" from the Audio Manager:
  } else if (typeof bossHit !== 'undefined' && bossHit && typeof bossHit.play === 'function') {
    bossHit.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function playBossKill(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('bossKill', { vol: 0.5, loop:false }); // Play "bossKill" from the Audio Manager:
  } else if (typeof bossKill !== 'undefined' && bossKill && typeof bossKill.play === 'function') {
    bossKill.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}

function playMenuSFX(){
  if (window.AudioManager && typeof AudioManager.play === 'function') {
    AudioManager.play('sfxMenu', { vol: 1.0 }); // Play "sfxMenu" from the Audio Manager:
  } else if (typeof sfxMenu !== 'undefined' && sfxMenu && typeof sfxMenu.play === 'function') {
    sfxMenu.play(); // Fallback to basic logic if sound wasn't loaded correctly with the Audio Manager:
  }
}



// passive renderer for menu (no clicks, no game logic)
function playModeMenu() {
  background(50);

  // occasionally add a shape if under cap
  if (frameCount % 60 === 0 && interactors.length < MENU_SHAPE_CAP) {
    spawnMenuShape(); // new helper
  }

  for (const it of interactors) {
    it.update();
    it.render();
  }
}

// background shapes for menu
function spawnMenuShapes() {
  //clearInteractors();
  for (let i = 0; i < 40; i++) {
    const r = random(20, 40);
    const x = random(r, width - r);
    const y = random(r, height - r);
    const opts = {
      movement: { enabled: true, lerpStrength: 0.1, velocityLimit: 2, switchRate: 60 },
      modifiers: [],
      deleteOnClick: false,
      outline: true,
      randomColor: true,
      stroke: { enabled: true, weight: 9, color: [255,255,255] },
    };
    const choice = random(['circle', 'rect', 'tri']);
    if (choice === 'circle') {
      interactors.push(new ClickCircle(x, y, r, randomColor(), opts));
    } else if (choice === 'rect') {
      interactors.push(new ClickRect(x, y, r*1.5, r*1.5, randomColor(), 8, opts));
    } else {
      interactors.push(new ClickTri(x, y, r*2, randomColor(), opts));
    }
  }
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
        triggerCurtains();
        startGame();
      } else if (mouseInside(modesButton)) {
        gameState = "modes";
      }
  
    } else if (gameState === "game") {
      if (mouseX > 20 && mouseX < 140 && mouseY > 20 && mouseY < 60) {
        playMenuSFX();
        gameState = "menu";
        playMenuBGM();
        stopHardBGM();
      } else {
        handleInteractorClick();
      }
  
    } else if (gameState === "over") {
      if (mouseInside(againButton)) {
        stopHardBGM();
        stopBossBGM();
        startGame();
      } else if (mouseX > 20 && mouseX < 140 && mouseY > 20 && mouseY < 60) {
        playMenuSFX();
        gameState = "menu";
        playMenuBGM();

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
  } else if (gameState === "pause") {
    if (mouseInside(pauseButton)) {
      gameState = "game"; // resume
    } else if (mouseInside(backToMenuButton)) {
      stopHardBGM();
      gameState = "menu"; // goes back to main menu
      playMenuBGM();
    }
  }
}

// helper, checks if mouse is inside a rectangle button
function mouseInside(btn) {
  if(mouseX > btn.x && mouseX < btn.x + btn.w && mouseY > btn.y && mouseY < btn.y + btn.h){
    playMenuSFX();
    return true;
  }
  else {return false;}
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  userStartAudio().then(() => {
    playMenuBGM();
  });

  console.log("Version 6.0");//change this each master commit to see when changes happen
  
  startButton = {
    x: width / 2 - startBtnImg1.width * startButtonScale / 2,
    y: height / 2 - startBtnImg1.height * startButtonScale / 2 + 65,
    img: startBtnImg1,
    hoverImg: startBtnImg2,
    w: startBtnImg1.width * startButtonScale,
    h: startBtnImg1.height * startButtonScale
  };

  modesButton = {
    x: width / 2 - optionsBtnImg1.width * optionsButtonScale / 2,
    y: height / 2 + 120,
    img: optionsBtnImg1,
    hoverImg: optionsBtnImg2,
    w: optionsBtnImg1.width * optionsButtonScale,
    h: optionsBtnImg1.height * optionsButtonScale
  };

  //menu business
  //startButton = { x: width/2 - 100, y: height/2, w: 200, h: 60, label: "START" };
  //modesButton = { x: width/2 - 100, y: height/2 + 100, w: 200, h: 60, label: "MODES" };
  againButton = { x: width/2 - 100, y: height/2 + 100, w: 200, h: 60, label: "AGAIN" };
  pauseButton = { x: width/2 - 100, y: height/2, w: 200, h: 60, label: "RESUME" }; // i added this
  backToMenuButton = { x: width/2 - 100, y: height/2 + 80, w: 200, h: 60, label: "MENU" }; // i added this


  //gameplay ui business
  UILayer = createGraphics(windowWidth, windowHeight * 0.1);
  
  //flashlight business
  fx = width / 2;
  fy = height / 2;
  rebuildLayer();

  // spawn drifting shapes for menu
  spawnMenuShapes();
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

//add boss fights and round events here
function nextRound(){
  blackout = true; //turn flashlight off

  //wait, spawn new shapes, turn flashlight back on
  setTimeout(() => {
    clearInteractors();
    if (round%10==0){//boss fight every 10 rounds
      stopHardBGM();
      playBossBGM();
      spawnBossInteractors();
      SpawnBoss(round);
    }
    else{
      playHardBGM();
      stopBossBGM();
      spawnInteractors();
    }
    blackout = false; //turn flashlight on
  }, 400); //1 sec, half second?
}

function startGame() {
  Timer = StartTime;        // reset round length
  startMillis = millis();   // bookmark the start time ONCE
  totalPausedTime = 0;
  TimeOver = false;
  gameOver = false;
  blackout = true;
  gameState = "game";
  round = 1;
  combo = 0;

  stopBossBGM();
  playHardBGM();

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
    stopBossBGM();
    stopHardBGM();
    drawMenu();
  } else if (gameState === "game") {
    stopMenuBGM();
    drawGame();
  } else if (gameState === "modes") {
    drawModes();
  } else if (gameState === "over") {
    drawOverMenu();
  } else if (gameState === "pause") {
    drawGame();        // shows the frozen game
    drawPauseMenu();   // overlay pause menu
  }

  console.log(isHardBGMPlaying);

  updateScoreIndicators();
}

// GAME (placeholder)
function drawGame() {
  fill(0);

  // compute time left based on the single startMillis
  // added totalPaused time so that it only counts time spent NOT pause
  if (gameState !== "pause") {
  let elapsed = int((millis() - startMillis - totalPausedTime) / 1000);
  times = Timer - elapsed;
  }


  // clamp
  if (times <= 0) {

    // Hopefully this won't block the main thread since we won't have that much score objects.
    // We will have to refactor this to have async/Promise if we notice a block in the future.
    localstorateScoreManager.storeScore();

    times = 0;
    TimeOver = true;
    gameOver = true;
    gameState = "over";

    if (!finalScorePopupShown) {
      finalScorePopupShown = true;
      finalScorePopup.render(); // <- show the overlay window
    }
  }

  // play mode only while not gameOver
  if (!gameOver && gameState !== "pause") {
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
  UILayer.text("Round: " + round + " Combo: "+ combo + " Time: " + times, UILayer.width - 20, UILayer.height /2);
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

  for (let i = bossKills.length - 1; i >= 0; i--) {
    bossKills[i].update();
    bossKills[i].show();
    if (bossKills[i].isDead()) {
      bossKills.splice(i, 1);
    }
  }
}

function drawPauseMenu() {
  fill(0, 180);
  rect(0, 0, width, height);

  // text
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("Paused", width / 2, height / 2 - 100);
  //drawing the buttons 
  drawButton(pauseButton);
  drawButton(backToMenuButton);

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Recalculate scaling for the start button
  if (typeof startBtnImg1 !== "undefined" && startButton) {
    const scale = 1.5; // your desired scaling factor
    const scaledW = startBtnImg1.width * scale;
    const scaledH = startBtnImg1.height * scale;

    startButton.x = width / 2 - scaledW / 2;
    startButton.y = height / 2;
    startButton.w = scaledW;
    startButton.h = scaledH;
  }

  // For all other buttons — check existence first
  if (typeof optionsBtnImg1 !== "undefined" && modesButton) {
    const scaledW = optionsBtnImg1.width * optionsButtonScale;
    const scaledH = optionsBtnImg1.height * optionsButtonScale;
    modesButton.x = width / 2 - scaledW / 2;
    modesButton.y = height / 2 + 100;
    modesButton.w = scaledW;
    modesButton.h = scaledH;
  }

  if (againButton) {
    againButton.x = width / 2 - 100;
    againButton.y = height / 2 + 100;
  }

  if (pauseButton) {
    pauseButton.x = width / 2 - 100;
    pauseButton.y = height / 2;
  }

  if (backToMenuButton) {
    backToMenuButton.x = width / 2 - 100;
    backToMenuButton.y = height / 2 + 80;
  }
}

