// purpose create timers and associate names with them
// check to see if timers are running
// implementation for callbacks when they expire
// ability to cancel them early

// title for the event - the actual name doesnt matter its just a string
const EXAMPLE_EVENT = 'example.MyEvent'

class EventManager {
  constructor() {
    this.active = {};
  }

  start(name, durationMs, { onStart = null, onEnd = null } = {}) {
    // gets current time
    const now = millis();
    // checks if event already exists
    const existed = !!this.active[name];
    // creates the event and establishes what to do when it ends
    this.active[name] = { endAt: now + durationMs, onEnd };
    // resets it if it already existed
    if (!existed && typeof onStart === "function") onStart();
  }
  
  // continuously called in draw()
  // checks to see if an events timer has run out
  // if it has it will call the events onEnd function if it has been declared
  // basically just a complicated cleaner function
  update() {
    const now = millis();
    // this.active is just a dictionary of all the events currently inside of the EventManager
    // for loop iterates through all events
    for (const name in this.active) {
      // if it finds an event it sets tempEvent equal too it to compair it
      const tempEvent = this.active[name];
      // checks if the selected event's expiration time has come
      if (now >= tempEvent.endAt) {
        // call the events onEnd function
        const cb = tempEvent.onEnd;
        delete this.active[name];
        // this is so we dont explode
        if (typeof cb === "function") cb();
      }
    }
  }

  isActive(name) {
    return !!this.active[name];
  }

  timeLeft(name) {
    // assigns tempEvent to event
    const tempEvent = this.active[name];
     // if event doesnt exist exit
    if (!tempEvent) return 0;
    // return ms till event ends via taking the time that the event ends minus the current time
    return Math.max(0, tempEvent.endAt - millis());
  }
  
  cancel(name, runOnEnd = false) {
    // assigns tempEvent to event
    const tempEvent = this.active[name];
    // if event doesnt exist exit
    if (!tempEvent) return;
    // if event does exist delete event
    delete this.active[name];
    // this is so we dont explode
    if (runOnEnd && typeof tempEvent.onEnd === "function") tempEvent.onEnd();
  }
}

// global dictionary of events
const events = new EventManager();

// pressing 'a' will start example event if you press 'a' again before the event has concluded
// the event will end prematurely, event will end naturally after set time
function keyPressed() {
  if (key === 'a') {
    // checks to see if example event is currently active
    if(events.isActive(EXAMPLE_EVENT)) {
      // if event is active and you pressed a anyway it ends the event early congrats
      console.log("You ended the event " + 
                  events.timeLeft(EXAMPLE_EVENT)/1000 + " seconds early, your the worst.")
      events.cancel(EXAMPLE_EVENT, true)
    } else {
      // otherwise just start the event
      triggerExampleEvent(10000);
    }
  }
}

function triggerExampleEvent(ms = 5000){
  events.start(EXAMPLE_EVENT, ms, {
  onStart: () => {
    console.log("Example Event started!");
    // event code
  },
  onEnd: () => {
    console.log("Example Event ended!");
    // cleanup code
  }
});
}

function draw() {
  events.update();
}
