

// The idea is to have an event-driven system for the player-stats
// for which we can define 'events' to listen to, separate from the
// EventManager

class EventListener {

    constructor() {
        this.listeners = {}; // { eventName : [callbacks]}
    }

    // Use this to setup an event listener
    // eventName -> name to use in the Fire() event
    // callback -> function to call when event is Fired using Fire()
    OnEvent(eventName, callback) {
        if (!this.listeners[eventName]) this.listeners[eventName] = [];
        this.listeners[eventName].push(callback); // eventName : [callbacks]
        return () => this.Disconnect(eventName, callback); // return the function used to cancel the event
    }

    // Returned in OnEvent(), used to cancel or "unlisten" to the event
    Disconnect(eventName, callback) {
        const list = this.listeners[eventName];
        if (!list) return;
        const index = list.indexOf(callback);
        if (index !== -1) list.splice(index, 1);
    }

    // Cycle through the list of callbacks attached to a single event name,
    // and call them all with the given args
    Fire(eventName, ...args) {
        const list = this.listeners[eventName];
        if (!list) return;
        for (const callback of list) callback(...args);
    }

    // Clear all events (cleanup)
    Clear(eventName)  {
        if (eventName) delete this.listeners[eventName];
        else this.listeners = {};
    }
}

const gameEvents = new EventListener();

// SessionStats Class refers to the stats tracked for one single game start-finish.
// Create this class at the start of a session, update during gameplay,
// After calling end(), save the stats to LifetimeStats 

class SessionStats {
    constructor() {
        this.refresh();
    }

    refresh() {
        this.startTime = millis();
        this.endTime = null;
        this.data = {
            difficulty: "",
            timeAlive: 0,
            totalClicks: 0,
            correctClicks: 0,
            incorrectClicks: 0,
            averageFindTime: 0,
            highestCombo: 0,
            score: 0,
            findTimes: [],
        }
    }

    update() {
        if (this.startTime && !this.endTime) {
      this.data.timeAlive = (millis() - this.startTime) / 1000; // seconds
        }
    }

    add(stat, amount = 1) {
        if (this.data[stat] !== undefined) this.data[stat] += amount;
    }

    set(stat, value) {
        if (this.data[stat] !== undefined) this.data[stat] = value;
    }

    addTimeToFind(ms) {
        this.data.findTimes.push(ms);
        const sum = this.data.findTimes.reduce((a,b) => a + b, 0);
        this.data.averageFindTime = sum / this.data.findTimes.length;
    }

    get(stat) {
        return this.data[stat] ?? 0;
    }

    end() {
        this.endTime = millis();
        this.data.timeAlive = (this.endTime - this.startTime) / 1000;
    }
}

// LifetimeStats Class refers to the stats tracked for the player over all sessions,
// until their browser cache is reset

class LifetimeStats {
    constructor() {
        // The base stat template
        // After parsing the saved data in localStorage,
        // We merge 'saved' with the template
        this.template = {
            averageFindTime: 0,
            bestScore: 0,
            correctClicks: 0,
            highestCombo: 0,
            incorrectClicks: 0,
            totalGames: 0,
            totalPlayTime: 0,
        }

        const saved = JSON.parse(localStorage.getItem("lifetimeStats") || "{}");
        this.data = this.mergeWithTemplate(saved);
    }

    mergeWithTemplate(savedData) {
        const result = { ...this.template };
        for ( let key in savedData ) {
            if (savedData[key] !== undefined) result[key] = savedData[key];
        }
        return result;
    }

    add(stat, value = 1) {
        if (!(stat in this.data)) {
            this.data[stat] = 0;
        }
        this.data[stat] += value;
    }

    // Replace stat entirely
    set(stat, value) {
        this.data[stat] = value;
    }

    get(stat) {
        return this.data[stat] ?? 0;
    }
    // Pass a session object and merge its stats to the lifetime
    saveSession(session) {
        this.add(     "totalGames", 1);  
        this.add(  "correctClicks", session.get("correctClicks"));
        this.add("incorrectClicks", session.get("incorrectClicks"));
        this.add(  "totalPlayTime", session.get("timeAlive"));

        this.set("averageFindTime", this.data.totalPlayTime / this.data.correctClicks)

        if (session.get("score") > this.data.bestScore)           { this.set("bestScore", session.get("score")) }
        if (session.get("highestCombo") > this.data.highestCombo) { this.set("highestCombo", session.get("highestCombo")) }

        this.save();
        print(this.data);
    }

    save() {
        localStorage.setItem("lifetimeStats", JSON.stringify(this.data));
    }
    reset() {
        this.data = { ...this.template };
        this.save();
    }

    static load() {
        return new LifetimeStats();
    }
}


// Combine SessionStats and LifetimeStats into one useable class
// This is where we implement the EventListener, and
// make changes based on what events are being called during gameplay 

class StatTracker {
    constructor() {
        this.lastValidClickTime = millis();

        this.session = new SessionStats();
        this.lifetime = LifetimeStats.load();
        // debug: reset every time
        //this.lifetime.reset();

        gameEvents.OnEvent("setDifficulty", (d) => { 
            this.session.data.difficulty = d; 
            console.log(this.session.data);
        });
        gameEvents.OnEvent("Clicked", (valid) => { 
            const now = millis();
            if (valid) {
                const timeToFind = now - this.lastValidClickTime;
                    this.session.addTimeToFind(timeToFind);
                this.lastValidClickTime = now;
                this.session.add("correctClicks", 1)
            } else if (valid == false) {
                 this.session.add("incorrectClicks", 1)
            }
            this.session.add("totalClicks", 1) 
        })
        gameEvents.OnEvent("newCombo", (combo) => {
            if (this.session.get("highestCombo") < combo) this.session.set("highestCombo", combo);
        })
        gameEvents.OnEvent("scoreChanged", (amount) => {
            this.session.set("score", amount);
        })
        gameEvents.OnEvent("gameOver", () => { this.onGameEnd() })

    }

    update() {
        this.session.update();
    }

    onGameEnd() {
        this.session.end();
        this.lifetime.saveSession(this.session);
    }

    debug() {
        setInterval(() => {
            console.log(this.session.data);
        }, 2000);
    }
}