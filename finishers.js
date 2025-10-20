class FinisherSequence {
    constructor() {
        this.duration = 15000; // total ms for finisher animation
    }

    async playRandom() {
        const types = ["SPLASH", "TEST"];
        //const chosen = random(types);
        const chosen = "TEST";
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
            case "TEST":
                // For some reason this doesn't work unless setTimeout() is used (IDK, this is only a test)
                for (const it of interactors) {
                    setTimeout(() => {
                        it.deleteSelf();
                    }, 0)
                }
                const alien1 = new Alien();
                const alien2 = new Alien();
                await alien1.spawn();    
                await alien2.spawn();      
                const cloud = new Cloud();
                await cloud.spawn();
                const angel = new Angel();
                await angel.spawn();
        }
        setTimeout(() => {
                combinedObjectList.length = 0;
                gameEvents.Fire("showGameOverScreen");
        }, this.duration);


        //This event is NOT firing, so i (ben hehe) temporarily replaced it with the above code

        // After animation finishes, show the end screen
        //events.start("SHOW_END_SCREEN", this.duration + 500, {
        //    onEnd: () => {
        //        combinedObjectList.length = 0;
        //        gameEvents.Fire("showGameOverScreen");
        //    }
        //});
    } 
}
