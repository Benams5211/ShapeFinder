// Central place for all core Game State.

// ---------------------------------------------------------------------------------------------
// NOT BEING USED RIGHT NOW! More refactoring would have to be done for this State file to work,
// so for right now this file is not in use anywhere!
// ---------------------------------------------------------------------------------------------

const GameState = {
  // High-level mode ("menu", "game", "pause", "modes", "over", "builder", "stats")
  mode: "menu",

  // Round & difficulty
  round: 1,
  difficulty: "medium",
  isBonusRound: false,

  // Timing for a round
  roundDurationSeconds: 60,        // how long a round should be
  timeRemainingSeconds: 60,        // counts down
  startMillis: 0,                  // when the round started
  totalPausedTime: 0,              // accumulated pause time
  timeOver: false,

  // Game flow flags
  gameOver: false,
  gameOverTriggered: false,
  shownGameOverScreen: false,
  finalRoundPopupShown: false,

  // Player performance
  combo: 0,
  stats: null,                     // StatTracker instance (set in startGame)

  // Helpers
  setMode(newMode) {
    this.mode = newMode;
  },

  resetRoundTimer() {
    this.roundDurationSeconds = 60;          // you can tweak this if needed
    this.timeRemainingSeconds = this.roundDurationSeconds;
    this.startMillis = millis();
    this.totalPausedTime = 0;
    this.timeOver = false;
  }
};