// randomEvents.js

(() => {
  
  const CONFIG = {
    // How often to try events (if nothing is active)
    minGapMs: 12000,
    maxGapMs: 20000,

    // Extra cooldown AFTER an event ends (prevents back-to-back chaos)
    postEventCooldownMs: 3000,

    // Weighted chance for each event (sum doesn't need to be 1.0)
    weights: {
      blackHole: 1.0,
      warningBoat: 1.0,
      splash:    0.6,
      zombie:    0.6
    },

    // Small toast on screen when we trigger something
    showToast: true,

    // Set true to log decisions to console
    debug: false
  };

  //  Event keys seen in codebase 
  const KEYS = {
    BLACKHOLE: 'screen.BlackHole',
    WARNING:   'screen.Warning',
    BOAT:      'screen.BoatLine',
    SPLASH:    'screen.Splash',
    ZOMBIE:    'screen.Zombie',
    RANDOM_TOAST: 'screen.RandomToast'
  };

  // Helpers to check if other functions exist
  function has(fnName) {
    return typeof window[fnName] === 'function';
  }

  const EVENT_DEFS = [
    {
      name: 'Black Hole',
      key: KEYS.BLACKHOLE,
      weightKey: 'blackHole',
      call: () => window.triggerBlackHoleEvent?.(3000) 
    },
    {
      name: 'Warning + Boats',
      key: KEYS.WARNING, //  check BOAT below in isBusy()
      weightKey: 'warningBoat',
      call: () => window.triggerWarningBoatLines?.(2000, 15000)
    },
    {
      name: 'Splash',
      key: KEYS.SPLASH,
      weightKey: 'splash',
      call: () => window.spawnSplashEvent?.(0, 0, 500, 80, window.color?.(0,0,0))
    },
    {
      name: 'Zombie',
      key: KEYS.ZOMBIE,
      weightKey: 'zombie',
      call: () => window.triggerZombieEvent?.(10000, 50)
    }
  ];

  // Only enable events that actually have a function present
  const ENABLED = EVENT_DEFS.filter(e => e.call && (
    (e.name === 'Black Hole'      && has('triggerBlackHoleEvent')) ||
    (e.name === 'Warning + Boats' && has('triggerWarningBoatLines')) ||
    (e.name === 'Splash'          && has('spawnSplashEvent')) ||
    (e.name === 'Zombie'          && has('triggerZombieEvent'))
  ));

  //  State 
  let nextTryAt = 0;
  let busyUntil = 0; // post-event cooldown
  let toastUntil = 0;
  let toastText = '';

  //  Busy check 
  function isAnyEventActive() {
    if (typeof window.events?.isActive !== 'function') return false;

    // Warning+Boats uses two keys across its phases
    return (
      window.events.isActive(KEYS.BLACKHOLE) ||
      window.events.isActive(KEYS.WARNING)  ||
      window.events.isActive(KEYS.BOAT)     ||
      window.events.isActive(KEYS.SPLASH)   ||
      window.events.isActive(KEYS.ZOMBIE)   ||
      window.events.isActive(KEYS.RANDOM_TOAST)
    );
  }

  //  Weighted random pick 
  function pickWeightedEvent() {
    // Builds simple array of [event, cumulativeWeight]
    let sum = 0;
    const bag = [];
    for (const e of ENABLED) {
      const w = CONFIG.weights[e.weightKey] ?? 0;
      if (w > 0) {
        sum += w;
        bag.push([e, sum]);
      }
    }
    if (sum === 0 || bag.length === 0) return null;

    const r = Math.random() * sum;
    for (const [e, cum] of bag) {
      if (r <= cum) return e;
    }
    return bag[bag.length - 1][0]; // fallback
  }

  //  Toast (optional & isolated) 
  function showToast(msg, ms = 900) {
    if (!CONFIG.showToast) return;
    toastText = msg;
    toastUntil = millis() + ms;

    // marks a tiny independent event so we don’t overlap with itself
    if (typeof window.events?.start === 'function') {
      window.events.start(KEYS.RANDOM_TOAST, ms);
    }
  }

  //  Public-ish API 
  const api = {
    // Call once in setup 
    init(opts = {}) {
      Object.assign(CONFIG, opts);
      const now = millis?.() ?? 0;
      nextTryAt = now + randomGap();
      busyUntil = 0;
    },

    // Call every frame (in draw)
    update() {
      // Respect a global pause if game sets it
      if (window.gamePaused) return;

      const now = millis?.() ?? 0;

      // draw the toast if active
      if (CONFIG.showToast && toastText && now < toastUntil) {
        try {
          push(); fill(0, 0, 0, 150); noStroke();
          rect(0, 0, width, 40);
          textAlign(CENTER, CENTER); fill(255); textSize(16);
          text(toastText, width / 2, 20);
          pop();
        } catch (e) { /* ignore if p5 isn't ready */ }
      }

      // wait until it's time to try again
      if (now < nextTryAt) return;

      // if still cooling down from a previous event, wait
      if (now < busyUntil) return;

      // don’t start a new one if any big event is running
      if (isAnyEventActive()) {
        // try again later
        nextTryAt = now + randomGap();
        return;
      }

      // pick a safe event to run
      const picked = pickWeightedEvent();
      if (!picked) {
        nextTryAt = now + randomGap();
        return;
      }

      // Try to run it
      try {
        picked.call();
        showToast(`Event: ${picked.name}`);

        // next attempt happens in a while
        nextTryAt = now + randomGap();

        // set the post-event cooldown
        busyUntil = now + CONFIG.postEventCooldownMs;

        if (CONFIG.debug) console.log('[randomEvents] started ->', picked.name);
      } catch (err) {
        if (CONFIG.debug) console.warn('[randomEvents] failed to start:', picked.name, err);
        // try again soon if it failed
        nextTryAt = now + 2000;
      }
    }
  };

  function randomGap() {
    const { minGapMs, maxGapMs } = CONFIG;
    return minGapMs + Math.random() * Math.max(0, maxGapMs - minGapMs);
  }

  // Expose under a single name (no globals pollution)
  window.randomEvents = api;
})();
