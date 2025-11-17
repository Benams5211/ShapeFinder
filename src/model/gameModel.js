// Model of Game functions.

// 
// Namespace for Functions:
// 
const GameModel = {
  update() {
    // --- TIMER / ROUND TIME LOGIC ---

    // This is the block from drawGame() that computes "times"
    // based on startMillis, Timer, totalPausedTime, etc.
    if (gameState !== "pause" && !isBonusRound) {
      let elapsed = int((millis() - startMillis - totalPausedTime) / 1000);
      times = Timer - elapsed;
    }

    // --- GAME OVER CHECK / ROUND STORAGE ---

    // This is the block from drawGame() that checks "if (times <= 0)"
    // and calls LocalStorageRoundManager + gameEvents.Fire("gameOver", ...)
    if (times <= 0) {
      // (this is exactly the logic you already have in drawGame)
      topRoundsBeforeUpdate = localstorageRoundManager.getTopRounds();
      times = 0;

      if (!TimeOver) {
        TimeOver = true;
        localstorageRoundManager.storeRound();
        gameEvents.Fire("gameOver", true);
      }
    }

    // --- DIRECTOR / GAME OBJECT UPDATES ---

    // This came from "if (director && gameState === 'game') director.update();"
    if (director && gameState === "game") {
      director.update();
    }

    // --- MAIN PLAY MODE UPDATE ---
    // This is your original:
    //   if (!gameOver && gameState !== "pause") { playMode(); }
    if (!gameOver && gameState !== "pause") {
      playMode();
    }
  }
};
