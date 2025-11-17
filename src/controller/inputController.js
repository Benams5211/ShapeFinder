// Controller for Input functions.

// 
// Namespace for Functions:
// 
const InputController = {
  handleKeyPressed() {
    if (key === 'a') triggerBoatLines(15000);
  if (key === 'b') triggerBlackHoleEvent(3000);
  if (key === 'w') triggerWarning(5000);
  if (key === 'z') triggerZombieEvent(5000);
  if (key === 'c') triggerPartyEvent(8000);
  if (key === 'm') triggerMimicEvent(8000, 20);
  if (key === 'n') triggerN1FormationEvent();
  if (key === 'e') triggerEZFormationEvent();
  if (key === 'l') triggerLOLFormationEvent();

  if (keyCode === ENTER && consoleInput.elt === document.activeElement) {
    const cmd = consoleInput.value().trim();
    consoleInput.value('');
    handleConsoleCommand(cmd);
  }

  if (keyCode === SHIFT) {
    if(slowMoEnabled){
    slowMo = true;
    }
  }

  if (gameState === "game" && (key === 'f' || key === 'F')) {
  const col = [80, 200, 255];
  FoundEffect.onCorrectShapeChosen(mouseX, mouseY, col, () => {
    noStroke(); 
    fill(col);
    ellipse(0, 0, 90, 90);  // simple pulse so we can see it
  });
  return; // optional: stop further key handling for this press
}
  
  if (gameState === "game" && key === 'p') {
    gameState = "pause";
    triggerCurtains();
    pauseStartMillis = millis();
  } else if (gameState === "pause" && key === 'p') {
    gameState = "game";
    triggerCurtains();
    totalPausedTime += millis() - pauseStartMillis;
  }
  else if (gameState === "menu" && key === 'd'){
    gameState = "builder";
  }
  },

  handleKeyReleased() {
    if (keyCode === SHIFT) {
    slowMo = false;
  }
  },

  handleMousePressed() {
    if (gameState === "menu") {
    if (mouseInside(startButton)) {
      triggerCurtains();
      startGame();
    } else if (mouseInside(modesButton)) {
      gameState = "modes";
    } else if (mouseInside(statsButton)) {
      gameState = "stats";
    }

  } else if (gameState === "game") {
    // top-left pause button
    if (mouseInside(pauseButton)) {
      playMenuSFX();
      gameState = "pause";
      pauseStartMillis = millis();
    } else {
      handleInteractorClick();
    }

  } else if (gameState === "pause") {
    // Resume button
    if (mouseInside(resumeButton)) {
      playMenuSFX();
      gameState = "game";
      totalPausedTime += millis() - pauseStartMillis;

    // Menu button
    } else if (mouseInside(backToMenuButton)) {
      playMenuSFX();
      stopHardBGM();
      playMenuBGM();
      gameState = "menu";
      //gameEvents.Fire("gameOver", false);
    }

  } else if (gameState === "modes") {
    // Difficulty buttons
    if (mouseInside(easyButton)) {
      playMenuSFX();
      difficulty = "easy";
      updateDifficultyVisuals("easy");
    } else if (mouseInside(mediumButton)) {
      playMenuSFX();
      difficulty = "medium";
      updateDifficultyVisuals("medium");
    } else if (mouseInside(hardButton)) {
      playMenuSFX();
      difficulty = "hard";
      updateDifficultyVisuals("hard");
    }

    //colorscheme buttons
  if (mouseInside(defaultColorBtn)) {
    playMenuSFX();
    setColorScheme("default");
  } else if (mouseInside(protanopiaBtn)) {
    playMenuSFX();
    setColorScheme("protanopia");
  } else if (mouseInside(deuteranopiaBtn)) {
    playMenuSFX();
    setColorScheme("deuteranopia");
  } else if (mouseInside(tritanopiaBtn)) {
    playMenuSFX();
    setColorScheme("tritanopia");
  }

    // Start button now actually begins the game
    if (mouseInside(startGameButton)) {
      playMenuSFX();
      triggerCurtains();
      startGame();
    }

    // Back button to main menu (if you want, optional)
    if (mouseInside({ x: 20, y: 20, w: 120, h: 40 })) {
      playMenuSFX();
      gameState = "menu";
    }

  } else if (gameState === "over") {
    if (mouseInside(againButton)) {
      stopHardBGM();
      stopBossBGM();
      startGame();
    } else if (mouseInside(backToMenuButton)) {
      playMenuSFX();
      gameState = "menu";
      gameEvents.Fire("gameOver", false);
      //bug fix for pop up
      if (finalRoundPopup && typeof finalRoundPopup.close === "function") {
        finalRoundPopup.close();
      }
      finalRoundPopupShown = false;
      shownGameOverScreen = false;
      gameOver = false;

      playMenuBGM();
      gameState = "menu";
    }
  } else if (gameState === "builder") {
    if (mouseInside(backButton)) {
      consoleInput.hide();
      gameState = "menu";
      return;
    }
    handleBuilderClick();
  } else if (gameState === "stats") {
    if (mouseInside(backButton)) {
      gameState = "menu";
    }
  }
  },

  handleMouseReleased() {
    if (gameState === "builder") {
    gameEvents.Fire("dragEnd")
  }
  }
};