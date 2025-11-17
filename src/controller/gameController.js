// Controller for Game functions.

// 
// Functions:
// 
function nextRound(){
  triggerCurtains();

  setTimeout(() => {
    clearInteractors();
    if (round%10==0){//boss fight every 10 rounds
      stopHardBGM();
      playBossBGM();
      spawnBossInteractors();
      SpawnBoss(round);
    }
    else if(!isBonusRound){
      stopBonusBGM();
      playHardBGM();
      stopBossBGM();
      spawnInteractors();
    }
  }, 750);
}

function bonusRound(){
  triggerCurtains();
  clearInteractors();

  setTimeout(() => {
  playBonusBGM();
  stopBossBGM();
  spawnBonusInteractors();
  
  }, 750);
}

function startGame() {
  setupGameEvents();
  Timer = StartTime;        // reset round length
  startMillis = millis();   // bookmark the start time ONCE
  totalPausedTime = 0;
  TimeOver = false;
  gameOverTriggered = false;
  shownGameOverScreen = false;
  blackout = true;
  gameOver = false;
  gameState = "game";
  round =1;
  combo = 0;

  Stats = new StatTracker();

  stopBossBGM();
  playHardBGM();

  clearInteractors();

  triggerCurtains();
  setTimeout(() => {
    blackout = false;
  }, 1000);
  // Reset lamp positions to default at the start of the game:
  if (typeof initLamps === 'function') initLamps();
  spawnInteractors();
  playMode();

  gameEvents.Fire("setDifficulty", difficulty);
}
