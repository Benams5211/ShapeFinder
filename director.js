class Director {
  constructor(eventManager, gameEventBus) {
    this.events = eventManager;      // instance of EventManager (your "events")
    this.gameEvents = gameEventBus;  // instance of EventListener (your "gameEvents")

    this.difficultyScore = 0;        // abstract "stress" or challenge value
    this.lastDecisionTime = 0;
    this.decisionCooldown = 5000;    // how often to reevaluate (ms)
  }

  update() {
    const now = millis();

    // throttle decision frequency
    if (now - this.lastDecisionTime < this.decisionCooldown) return;
    this.lastDecisionTime = now;

    this.assessPlayer();
    this.makeDecision();
  }

  assessPlayer() {
    // base metrics (replace with your real globals)
    const scoreWeight = combo * 2;
    const timeWeight = Timer < 10 ? -20 : (Timer > 30 ? 10 : 0);
    const roundWeight = round * 0.5;

    // combine metrics into one "difficulty index"
    this.difficultyScore = constrain(scoreWeight + timeWeight + roundWeight, -50, 100);
  }

  makeDecision() {
    if (this.events.isActive('DIRECTOR_EVENT')) return; // avoid overlaps

    // harder events when doing well
    if (this.difficultyScore > 40) {
      const choice = random(['BLACKHOLE_EVENT', 'ZOMBIE_EVENT', 'BOAT_EVENT']);
      this.triggerEvent(choice);
    }
    // ease up if struggling
    else if (this.difficultyScore < -10) {
      this.spawnBonus();
    }
  }

  triggerEvent(eventType) {
    switch (eventType) {
      case 'BLACKHOLE_EVENT': triggerBlackHoleEvent(4000); break;
      case 'ZOMBIE_EVENT': triggerZombieEvent(8000, 40); break;
      case 'BOAT_EVENT': triggerBoatLines(16000); break;
    }

    // prevent event spam
    this.events.start('DIRECTOR_EVENT', 8000, { onEnd: () => {} });
  }

  spawnBonus() {
    console.log("Director: giving player a breather");
    Timer += 5;  // small bonus time
    // could also spawn bonus items, or temporarily disable ScoreDown shapes
  }
}

