// JavaScript file to control the p5 lifecycle and delegate tasks to other modules.
// Parker Franklin
// 9/6/25

let clickSound, correctSound, incorrectSound;
let bgm;

function preload() {
  clickSound = loadSound("assets/click.mp3");
  correctSound = loadSound("assets/correct.mp3");
  incorrectSound = loadSound("assets/incorrect.mp3");
  bgm = loadSound("assets/bgm.mp3");
}

function setup() {
  const holder = document.getElementById("canvas-holder");
  const c = createCanvas(800, 600);
  if (holder) c.parent(holder);
  textAlign(CENTER, CENTER);
  spawnSpecialShapes();
}

function draw() {
  background(245);
  window.renderAllShapes(Game.shapes);
  noStroke(); fill(0); textSize(14);
  text(`Shapes: ${Game.shapes.length}`, width / 2, height - 20);
}

function mousePressed() {
  if (getAudioContext().state !== "running") {
    userStartAudio();
  }
  for (const s of Game.shapes) {
    if (isInsideShape(s, mouseX, mouseY)) {
      if (s.special === "correct") {
        if (correctSound?.isLoaded()) correctSound.play();
      } else if (s.special === "incorrect") {
        if (incorrectSound?.isLoaded()) incorrectSound.play();
      } else {
        if (clickSound?.isLoaded()) clickSound.play();
      }
      break;
    }
  }
}

// Enable/Disaply background game music.
window.playBgm = function playBgm() {
  if (getAudioContext().state !== "running") userStartAudio();
  if (bgm?.isLoaded() && !bgm.isPlaying()) { // If the music isn't already playing, begin playing:
    bgm.setLoop(true); // Loops music when enabled:
    bgm.setVolume(0.6); 
    bgm.play();
  }
};

// Turn off background music with stop button.
window.stopBgm = function stopBgm() {
  if (bgm?.isPlaying()) bgm.stop(); // If backgrond music is playing, stop it:
};