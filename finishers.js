class FinisherSequence {
    constructor() {
        this.duration = 1500; // total ms for finisher animation
    }

    async playRandom() {
        //const types = ["SPLASH", "TEST"];
        //const chosen = random(types);
        const chosen = "SPLASH";
        switch (chosen) {   
            case "SPLASH":
                let tot_delay = 0;
                for (const it of interactors) {
                    setTimeout(() => {
                        spawnSplashEvent(it.x, it.y, 500, 50, it.fillCol)
                        it.deleteSelf();
                    }, tot_delay)
                    tot_delay += 10;
                }
            break;
        }
        setTimeout(() => {
                combinedObjectList.length = 0;
                gameEvents.Fire("showGameOverScreen");
        }, this.duration);


        //This event is NOT firing, so i (ben hehe) temporarily replaced it with the above code

        // After animation finishes, show the end screen
        //events.start("SHOW_END_SCREEN", this.duration, {
            //onEnd: () => {
                //combinedObjectList.length = 0;
                //gameEvents.Fire("showGameOverScreen");
            //}
        //});
    } 
}

function setupGameEvents() {
  // Fires in FinisherSequence after the time is played through
  gameEvents.OnEvent("showGameOverScreen", () => {
    // debounce (simple fix for double calls for now, not sure what's happening)
    if (shownGameOverScreen) return;
    shownGameOverScreen = true;
    gameState = "over";
    gameOver = true;

    finalRoundPopupShown = true;
    finalRoundPopup.render();
    gameEvents.Clear();
  })
  gameEvents.OnEvent("gameOver", (showFinisher) => {
    //delay ending screen show
    // debounce (simple fix for double calls for now, not sure what's happening)
    if (gameOverTriggered) return;
    gameOverTriggered = true;
    //interactors.length = 0;
    combinedObjectList.length = 0;
    if (showFinisher) {
      blackout = false;
      const finisher = new FinisherSequence();
      finisher.playRandom();
    }
  })
}