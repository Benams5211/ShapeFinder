// Model of Game functions.

// 
// Namespace for Functions:
// 
const GameModel = {
  update() {
    // --- TIMER / ROUND TIME LOGIC ---
    if (gameState !== "pause" && !isBonusRound) {
      let elapsed = int((millis() - startMillis - totalPausedTime) / 1000);
      times = Timer - elapsed;
    }

    // --- GAME OVER CHECK / ROUND STORAGE ---
    if (times <= 0) {
      topRoundsBeforeUpdate = localstorageRoundManager.getTopRounds();
      times = 0;

      if (!TimeOver) {
        TimeOver = true;
        localstorageRoundManager.storeRound();
        gameEvents.Fire("gameOver", true);
      }
    }

    // --- DIRECTOR / GAME OBJECT UPDATES ---
    if (director && gameState === "game") {
      director.update();
    }

    // --- MAIN PLAY MODE UPDATE ---
    if (!gameOver && gameState !== "pause") {
      playMode();
    }
  }
};
