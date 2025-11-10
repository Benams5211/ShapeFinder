//
//  BaseBoss.js
//

function drawBossUI(name, hp, maxHp, x, y) {
    push();
    const barWidth = 200;
    const barHeight = 16;
    const pct = hp / maxHp;

    fill(40, 40, 60, 180);
    noStroke();
    rectMode(CENTER);
    rect(x, y, barWidth, barHeight, 4);

    const c1 = color(80, 255, 200);
    const c2 = color(255, 80, 120);
    const barFill = lerpColor(c2, c1, pct);
    fill(barFill);
    rect(x - (barWidth * (1 - pct)) / 2, y, barWidth * pct, barHeight, 4);

    stroke(255, 255, 255, 120);
    noFill();
    rect(x, y, barWidth, barHeight, 4);

    noStroke();
    fill(255);
    textAlign(CENTER);
    textSize(18);
    text(name, x, y - 30);
    pop();
}

function clearBosses() {
    for (const boss of activeBosses) {
        boss.forceClear();
    }
    activeBosses.length = 0;
    combinedObjectList.length = 0;
}


// --------------------------------------------------------
// BaseBoss: reusable parent for all bosses
// --------------------------------------------------------
class BaseBoss {
    constructor(name, jsonPath, maxHealth = 100, UIOffset = 275, movementSpeed = 8) {
        this.object = null;
        this.name = name;
        this.jsonPath = jsonPath;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.UIOffset = UIOffset;
        this.movementSpeed = movementSpeed
        this.alive = true;
    }

    async spawn() {
        this.object = await loadCombinedObjectFromFile(this.jsonPath);
        combinedObjectList.push(this.object);
        this.object.mainObject.isCombined = true;
        this.object.mainObject.movement.velocityLimit = this.movementSpeed;
        interactors.push(this.object.mainObject);
        for (const child of this.object.objectList) {
            child.Shape.isCombined = true;
            //child.Shape.events.push("bossShapeClick");
            interactors.push(child.Shape);
        }
        activeBosses.push(this);
    }

    getPosition() {
        return createVector(this.object.mainObject.x, this.object.mainObject.y);
    }

    takeDamage(amount) {
        if (!this.alive) return;
        this.health = max(0, this.health - amount);
        if (this.health <= 0) this.onDeath();
    }

    // generic death animation, can be overridden
    onDeath() {
        this.alive = false;

        const anim = (shape) => {
            shape.isEffectStarting = true;
            shape.blastTime = random(35, 50);
            shape.blastScale = 1.5;
            shape.startBlast();
            spawnSplashEvent(shape.x, shape.y, 700, 10, randomColor());
        };

        let tot_delay = 0;
        anim(this.object.mainObject);
        for (const child of this.object.objectList) {
            setTimeout(() => anim(child.Shape), tot_delay);
            tot_delay += 10;
        }

        const pos = this.getPosition();
        FoundEffect.triggerFoundEffect(pos.x, pos.y);
        setTimeout(() => {
            const idx = activeBosses.indexOf(this);
            if (idx !== -1) activeBosses.splice(idx, 1);
        }, 2000);
    }

    drawUI() {
        if (!this.alive) return;
        const pos = this.getPosition();
        drawBossUI(this.name, this.health, this.maxHealth, pos.x, pos.y - this.UIOffset);
    }

    ownsShape(shape) {
        if (!this.object) return false;
        if (shape === this.object.mainObject) return true;
        for (const child of this.object.objectList)
            if (child.Shape === shape) return true;
        return false;
    }

    forceClear() {
        this.alive = false;

        // Remove all shapes belonging to this boss
        if (this.object) {
            const idx = combinedObjectList.indexOf(this.object);
            if (idx !== -1) combinedObjectList.splice(idx, 1);

            for (const c of this.object.objectList) {
                const i = interactors.indexOf(c.Shape);
                if (i !== -1) interactors.splice(i, 1);
            }

            const mainIdx = interactors.indexOf(this.object.mainObject);
            if (mainIdx !== -1) interactors.splice(mainIdx, 1);
        }

        const bossIdx = activeBosses.indexOf(this);
        if (bossIdx !== -1) activeBosses.splice(bossIdx, 1);
    }
}


// --------------------------------------------------------
// Golagon_P1: inherits from BaseBoss
// --------------------------------------------------------
class Golagon_P1 extends BaseBoss {
    constructor() {
        super(
            "The Rainbow Crystalline Golagon's Minion",
            "assets/combinedObjects/golagon_phase1.json",
            150, // maxHealth
        );
        gameEvents.OnEvent("bodyHit", (shape) => {
            if (!this.alive) return;
            if (!this.ownsShape(shape)) return;
            this.takeDamage(50);
        });
        
    }
}


// --------------------------------------------------------
// Golagon_P2: inherits from BaseBoss
// --------------------------------------------------------
class Golagon_P2 extends BaseBoss {
    constructor() {
        super(
            "The Rainbow Crystalline Golagon",
            "assets/combinedObjects/golagon_phase2.json",
            1000, // maxHealth
        );
        const handleHit = (event, dmg) => {
            gameEvents.OnEvent(event, (shape) => {
                if (!this.alive) return;
                if (!this.ownsShape(shape)) return;
                this.takeDamage(dmg);
                if (event === "eyeHit" || event === "mainHit") this.spawnGem();
            });
        };
        this.nextSpawnThreshold = this.maxHealth - 300; 
        this.minionHealthStep = 400;

        handleHit("spikeHit", 25);
        handleHit("bodyHit", 50);
        handleHit("mainHit", 70);
        handleHit("eyeHit", 100);
    }
    takeDamage(amount) {
        super.takeDamage(amount);

        while (this.health <= this.nextSpawnThreshold && this.nextSpawnThreshold > 0) {
            this.spawnMinion();
            this.nextSpawnThreshold -= this.minionHealthStep;
        }

        if (this.health <= 0) {
            gameEvents.Fire("bossDefeated", "golagon");
            isBonusRound=true;
            bonusRound();
            flashlightEnabled = true;
            this.onDeath();
        }
    }

    spawnMinion() {
        const minion = new Golagon_P1();
        minion.spawn();
    }

    spawnGem() {
        const gem = new RainbowGem();
        gem.spawn();
    }

}

class RainbowGem extends BaseBoss {
    constructor() {
        super(
            "Rainbow Gem",
            "assets/combinedObjects/rainbow_gem.json",
            2, // maxHealth
            100,
            6,
        );
        gameEvents.OnEvent("rainbowGem", (shape) => {
            if (!this.alive) return;
            if (!this.ownsShape(shape)) return;
            this.takeDamage(1);
        });
        setTimeout(() => {
            if (this.alive) this.onDeath(true);
        }, 10000)
    }
    onDeath(timedOut = false) {
        
        this.alive = false;
        bonusStars.push(new BonusIndicator(mouseX, mouseY));
        if (!timedOut) Timer += 1;

        super.onDeath();
    }
}