// View of Menu functions.

// 
// Functions:
// 
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
    image(logoImg, width/2, height/2 - 280);
    fill(255); // white
    textAlign(CENTER, CENTER);
    textSize(width/35);
    textFont(pixelFont);
    text("THAT TIME I GOT REINCARNATED INTO A NEW WORLD\nAND USED MY LEVEL 100 FLASHLIGHT SKILLS TO FIND THE WANTED SHAPE!", width/2, height/2 - 155);
    imageMode(CORNER);
  } else {
    fill(255); // white
    textAlign(CENTER, CENTER);
    textSize(48);
    text("Shape Finder!\nVersion 7.0", width/2, height/2 - 120);
  }

  // Draw buttons
  drawButton(startButton);
  drawButton(modesButton);
  drawButton(statsButton);
}

function spawnMenuShape() {
  const r = random(20, 40);
  const x = random(r, width - r);
  const y = random(r, height - r);
  mods = [];
  if (random() < 0.50) {
    mods.push(new FigureSkateModifier({
      director: formationDirector,
      joinChance: 0.001,
      strength: 0.20,
        types: ['circle','orbit','figure8','line','sinWave','triangle','orbitTriangle','square','orbitSquare'],
      minGapFrames: 180,
    }));
  }
  const opts = {
    movement: { enabled: true, lerpStrength: 0.2, velocityLimit: 0.3, switchRate: 60 },
    modifiers: mods,
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
  playModeMenu();

  fill(0, 180);
  noStroke();
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(40);
  fill(255);
  textFont(pixelFont);
  text("Select Difficulty", width/2, height/2 - 300);

  // Move difficulty buttons higher and align vertically
  easyButton.y = height / 2 - 220;
  mediumButton.y = height / 2 - 100;
  hardButton.y = height / 2 + 20;

  const buttonScale = 1.4; // smaller scale for start
  startGameButton.w = startBtnImg1.width * buttonScale +50;
  startGameButton.h = startBtnImg1.height * buttonScale +50;
  startGameButton.x = width / 2 - startGameButton.w / 2;
  startGameButton.y = height / 2 + 160;

  drawButton(easyButton);
  drawButton(mediumButton);
  drawButton(hardButton);

  // Selected difficulty text
  textSize(28);
  fill(255);
  const titleY = height / 2 - 300;
  text(`Current: ${difficulty.toUpperCase()}`, width / 2, titleY + 60);

  // Draw the Start button (reuse main menu art)
  drawButton(startGameButton);
  
  text("Select Modifiers", width/4, height/2 - 150);
  textFont('Arial');
  text("Flashlight Freeze", width/4-width/32, height/2+height/-(height*0.0282));
  text("Slow-Mo Enabled", width/4-width/32, height/2+height/(height*0.0169));
  text("Three Lamps Mode", width/4-width/32, height/2+height/(height*0.0062));
  text("Lightning Mode", width/4-width/32, height/4 + height * 0.57 + 8);
  textFont(pixelFont);

  if (!checkboxLight) {
    checkboxLight = createCheckbox("", flashlightFreeze);
    checkboxLight.position(width / 4 + width/10, height / 4 + height / 5);
    checkboxLight.style("transform", "scale(5)");
  }

  if (!checkboxSlow) {
    checkboxSlow = createCheckbox("", slowMoEnabled);
    checkboxSlow.position(width / 4 + width/10, height / 4 + height / 3);
    checkboxSlow.style("transform", "scale(5)");
  }

  // Three Lamps overlay checkbox
  if (!checkboxLamps) {
    checkboxLamps = createCheckbox("", threeLampsEnabled);
    checkboxLamps.position(width / 4 + width/10, height / 4 + height * 0.45);
    checkboxLamps.style("transform", "scale(5)");
  }

  // Lightning Mode overlay checkbox 
  if (!checkboxLightning) {
    checkboxLightning = createCheckbox("", lightningEnabled);
    checkboxLightning.position(width / 4 + width/10, height / 4 + height * 0.57);
    checkboxLightning.style("transform", "scale(5)");
  }

  if (checkboxSlow.checked()) {slowMoEnabled = true; } else {slowMoEnabled = false;}

  if (checkboxLight.checked()) {flashlightFreeze = true;} else {flashlightFreeze = false;}

  if (checkboxLamps.checked()) { threeLampsEnabled = true; } else { threeLampsEnabled = false; }

  if (checkboxLightning.checked()) { lightningEnabled = true; } else { lightningEnabled = false; }


  text("Select Color Scheme", width/4+width/2, height/2 - 150);
  textFont('Arial');
  drawButton(defaultColorBtn);
  drawButton(protanopiaBtn);
  drawButton(deuteranopiaBtn);
  drawButton(tritanopiaBtn);
  textFont(pixelFont);

  // place backToMenuButton in top-left for modes
  backToMenuButton.x = 20;
  backToMenuButton.y = 20;

  drawButton(backToMenuButton);
}

function drawStats() {
    background(60); 


    playModeMenu();

    fill(0, 180);
    noStroke();
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, TOP);
    textSize(48);
    text("Player Stats", width / 2, 20);

    // --- Session Stats ---
    textSize(32);
    textAlign(LEFT, TOP);
    fill(200);
    text("Last Game", 50, 100);

    if (!Stats) Stats = new StatTracker();

    textSize(24);
    fill(255);
    let y = 140; // starting y
    const lineHeight = 30;
    const correct = Stats.lifetime.get("correctClicks");
    const incorrect = Stats.lifetime.get("incorrectClicks")

    text("Final Round: " + Stats.session.get("round"), 50, y); y += lineHeight;
    text("Correct Clicks: " + Stats.session.get("correctClicks"), 50, y); y += lineHeight;
    text("Incorrect Clicks: " + Stats.session.get("incorrectClicks"), 50, y); y += lineHeight;
    text("Highest Combo: " + Stats.session.get("highestCombo"), 50, y); y += lineHeight;
    text("Time Alive: " + nf(Stats.session.get("timeAlive"), 1, 2) + "s", 50, y); y += lineHeight;
    text("Average Find Time: " + nf(Stats.session.get("averageFindTime") / 1000, 1, 2) + "s", 50, y); y += lineHeight;
    text("Difficulty: " + Stats.session.get("difficulty"), 50, y); y += lineHeight;

    // --- Lifetime Stats ---
    textSize(32);
    fill(200);
    textAlign(LEFT, TOP);
    text("Lifetime Stats", width / 2 + 50, 100);

    textSize(24);
    fill(255);
    y = 140;
    text("Total Games Played: " + Stats.lifetime.get("totalGames"), width / 2 + 50, y); y += lineHeight;
    text("Total Correct Clicks: " + correct + " (" + (correct/(correct+incorrect) * 100).toFixed(2) + "%)", width / 2 + 50, y); y += lineHeight;
    text("Total Incorrect Clicks: " + Stats.lifetime.get("incorrectClicks"), width / 2 + 50, y); y += lineHeight;
    text("Total Alive Time: " + nf(Stats.lifetime.get("totalPlayTime"), 1, 2) + "s", width / 2 + 50, y); y += lineHeight;
    text("Best Round: " + Stats.lifetime.get("bestRound"), width / 2 + 50, y); y += lineHeight;
    text("Highest Combo: " + Stats.lifetime.get("highestCombo"), width / 2 + 50, y); y += lineHeight;
    text("Average Find Time: " + nf(Stats.lifetime.get("averageFindTime"), 1, 2) + "s", width / 2 + 50, y); y += lineHeight;

    // --- Back Button ---
    drawButton(backButton);
}

function drawOverMenu() {
  // darken everything below the UI bar
  fill(0, 200); 
  noStroke();
  rect(0, UILayer.height, windowWidth, windowHeight - UILayer.height);

  // redraw UI bar so it’s visible on top
  image(UILayer, 0, 0);

  drawBackButton();
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
    mods = [];
    if (random() < 0.50) {
      mods.push(new FigureSkateModifier({
        director: formationDirector,
        joinChance: 0.001,
        strength: 0.20,
        types: ['circle','orbit','figure8','line','sinWave','triangle','orbitTriangle','square','orbitSquare'],
        minGapFrames: 180,
      }));
    }
    const opts = {
      movement: { enabled: true, lerpStrength: 0.1, velocityLimit: 2, switchRate: 60 },
      modifiers: mods,
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
