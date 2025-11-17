// View of Game functions.

// 
// Functions:
// 
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

  for (let i = bonusStars.length - 1; i >= 0; i--) {
    bonusStars[i].update();
    bonusStars[i].show();
    if (bonusStars[i].isDead()) {
      bonusStars.splice(i, 1);
    }
  }
}

function drawPauseMenu() {
  fill(0, 180);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(48);
  text("Paused", width / 2, height / 2 - 100);

  // center backToMenuButton dynamically
  const buttonScale = 1.8;
  backToMenuButton.w = menuButton0.width * buttonScale;
  backToMenuButton.h = menuButton0.height * buttonScale;
  backToMenuButton.x = width / 2 - backToMenuButton.w / 2;
  backToMenuButton.y = height / 2 + 80;

  drawButton(resumeButton);
  drawButton(backToMenuButton);
}

function renderGameView() {
  fill(0);
  if (window.FoundEffect) {
    FoundEffect.applyCameraShakeIfActive();
  }

  // --- DARKNESS / FLASHLIGHT / LAMPS OVERLAY ---
  const mx = isFinite(mouseX) ? mouseX : width / 2;
  const my = isFinite(mouseY) ? mouseY : height / 2;
  fx = lerp(fx, mx, 0.2);
  fy = lerp(fy, my, 0.2);

  const dx = fx - coverW / 2;
  const dy = fy - coverH / 2;
  // image(darkness, dx, dy);
  if (typeof threeLampsEnabled !== 'undefined' && threeLampsEnabled && typeof drawLampsOverlay === 'function') {
    drawLampsOverlay();
  } else {
    drawFlashlightOverlay();
  }

  // Any "front layer" event rendering:
  if (events && typeof events.renderFront === 'function') {
    events.renderFront();
  }

  // --- TOP UI BAR / HUD ---

  // This is the 'UILayer' part from your old drawGame:
  UILayer.clear();
  UILayer.background(255, 255, 255);
  UILayer.textSize(24);
  UILayer.textAlign(RIGHT, CENTER);
  UILayer.fill('black');
  UILayer.textFont(pixelFont);

  let blinkAlpha = 255;

  // The blinking logic based on `times`:
  if (times < 10 && times > 0) {
    let blinkSpeed = 500; // milliseconds
    blinkAlpha = (millis() % (blinkSpeed * 2) < blinkSpeed) ? 255 : 50;
  }

  UILayer.fill(0, 0, 0, blinkAlpha);
  UILayer.text("Round: " + round + " Combo: " + combo + " Time: " + times,
               UILayer.width - 20, UILayer.height / 2);

  image(UILayer, 0, 0);

  // Wanted object render:
  if (wantedObj && typeof wantedObj.render === 'function') {
    wantedObj.render();
  }

  // Pause button:
  if (typeof drawButton === 'function') {
    drawButton(pauseButton);
  }

  // Found-effect screen overlay:
  if (window.FoundEffect && typeof FoundEffect.renderFoundEffectOverlay === 'function') {
    FoundEffect.renderFoundEffectOverlay();
  }
}
