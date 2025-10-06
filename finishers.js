
class FinisherSequence {
    constructor() {
        this.duration = 1000; // total ms for finisher animation
    }

    playRandom() {
        const types = ["SPLASH"];
        const chosen = random(types);

        switch (chosen) {
            case "SPLASH":
                let tot_delay = 0
                for (const it of interactors) {
                    setTimeout(() => {
                        spawnSplashEvent(it.x, it.y, 300, 60, it.fillCol)
                        it.deleteSelf();
                    }, tot_delay)
                    tot_delay += (this.duration / interactors.length);
                }
                break;
        }
        // After animation finishes, show the end screen
        events.start("SHOW_END_SCREEN", this.duration + 500, {
            onEnd: () => {
                gameEvents.Fire("showGameOverScreen");
            }
        });
    }

    
}

