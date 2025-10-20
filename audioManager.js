/*

Audio Manager setup for sound effects used in "sketch.js".

Takes in a Map of sounds by { Name of Sound, File Path } and attempts to load them as p5 SoundFile objects.
If this fails, falls back to loading them as HTMLAudio so that sound can work with native audio of any browser.

Provides functions for:
  - Preloading all sounds for use in sketch.js
  - Playing/Stopping sounds
  - Adjusting options of sounds for customization (Volume, Looping, etc.)

*/

(function (global) {
  const AudioManager = {
    sounds: {}, // Map of all project Sound Effects. (Key --> { type: 'p5'|'html', obj: SoundFile|HTMLAudioElement }).
    masterVol: 1.0, // Master volume multiplier that goes from 0-1.

    // Preload a list of sounds ({ name, path }).
    preload(list = []) {
      const loaders = list.map(item => {
        const name = item.name; // Name of sfx.
        const path = item.path; // Path to find sfx file at.

        // For each sound in the list, create a Promise that loads the sound based on if p5.sound functionality is available or not.
        return new Promise((resolve) => { // Returns a Promise that first tries to use "loadSound()", uses "_loadHTMLAudio" if fails:
          if (typeof loadSound === 'function') { // If p5 loadSound() is available to use:
            try { // Try to use "loadSound()":
              loadSound(path,
                (snd) => { // "loadSound()" was called successfully:
                  this.sounds[name] = { type: 'p5', obj: snd }; // Create a p5.SoundFile from the loaded sfx:
                  resolve(); // Marks the sound as being loaded.
                },
                (err) => { // "loadSound()" was not called successfully, fallback to HTMLAudio:
                  console.warn('AudioManager: p5.loadSound failed, falling back to HTMLAudio for', path, err);
                  this._loadHTMLAudio(path).then(a => {
                    this.sounds[name] = { type: 'html', obj: a }; // Create an HTMLAudio object for the sfx:
                    resolve();
                  });
                }
              );
            } catch (e) { // "loadSound()" itself fails, so throw error and fallback to HTMLAuido:
              this._loadHTMLAudio(path).then(a => {
                this.sounds[name] = { type: 'html', obj: a }; // Create an HTMLAudio object for the sfx:
                resolve();
              });
            }
          } else { // p5.sound isn't present in the project, so fallback to HTMLAudio:
            this._loadHTMLAudio(path).then(a => {
              this.sounds[name] = { type: 'html', obj: a };
              resolve();
            });
          }
        });
      });

      // Returns a Promise that resolves when all the individual sound Promieses are finished.
      return Promise.all(loaders);
    },

    // Helper function used with "preLoad()" that allows for HTMLAudio to be loaded in place of a p5.SoundFile.
    _loadHTMLAudio(path) {
      return new Promise((resolve) => { // Returns a Promise that tries to load the sound as an HTMLAudio object:
        try {
          const a = new Audio(path);
          const done = () => resolve(a);
          a.addEventListener('canplaythrough', done, { once: true });
          a.addEventListener('error', () => { console.warn('AudioManager: HTMLAudio failed to load', path); done(); }, { once: true });
          a.load();
        } catch (e) { // Failed to load HTMLAudio, so resolve is set to null and just this sound won't play (so the entire preload() doesn't fail!):
          console.warn('AudioManager: failed to create HTMLAudio for', path, e);
          resolve(null);
        }
      });
    },

    // Play a loaded sound by its Key (name) in the sound map.
    play(name, opts = {}) {
      const entry = this.sounds[name];
      if (!entry || !entry.obj) return; // Return if sound is not loaded:
      const vol = typeof opts.vol === 'number' ? opts.vol : 1.0; // Use volume option if present, 1.0 if not as default.
      const loop = !!opts.loop; // Use loop option of the sound.

      // p5 SoundFile loaded, so use that:
      if (entry.type === 'p5') {
        const sf = entry.obj;
        if (typeof sf.setVolume === 'function') sf.setVolume(vol * this.masterVol); // Call "setVolume()" to use sound's volume option.
        if (loop && typeof sf.loop === 'function') sf.loop(); // Call p5's "loop()" if loop option is enabled for the sound.
        else if (typeof sf.play === 'function') sf.play(); // No loop, so just play it:
      } else { // Use HTMLAudio since p5 SoundFile was not able to be used:
        const src = entry.obj;
        if (!src) return;
        const inst = src.cloneNode(true); // Clone audio nodes so that overlapping sounds can play (Ex. Clicking multiple incorrect shapes and hearing all the incorrect sounds.).
        inst.loop = loop;
        inst.volume = Math.max(0, Math.min(1, vol * this.masterVol));
        inst.playbackRate = typeof opts.rate === 'number' ? opts.rate : 1.0;
        inst.play().catch(() => {});
        entry._lastInstance = inst; // Store last instance so that "stop()" has something to control if needed.
      }
    },

    // Stops a sound from playing by its Key (Used for continuous sounds like the Background Music!).
    stop(name) {
      const entry = this.sounds[name];
      if (!entry || !entry.obj) return;
      if (entry.type === 'p5') { // If p5 SoundFile:
        if (typeof entry.obj.stop === 'function') entry.obj.stop();
      } else { // Else HTMLAudio:
        const inst = entry._lastInstance || entry.obj;
        try { inst.pause(); inst.currentTime = 0; } catch (e) { } // Sets time of looping sound back to 0 to reset it for next play.
      }
    },

    // Set a sound's volume between 0-1.
    setVolume(name, v) {
      const entry = this.sounds[name];
      if (!entry || !entry.obj) return;
      const vol = Math.max(0, Math.min(1, v)); // Clamps volume of sound between 0-1.
      if (entry.type === 'p5') {
        if (typeof entry.obj.setVolume === 'function') entry.obj.setVolume(vol * this.masterVol); // Multiplies clamped 'vol' value times 'masterVol'.
      } else {
        try { entry.obj.volume = vol * this.masterVol; if (entry._lastInstance) entry._lastInstance.volume = vol * this.masterVol; } catch (e) {} // For HTMLAudio, updates last instance so volume changes update in realtime.
      }
    },

    // Set the master volume of the project for all sounds in the map.
    setMasterVolume(v) {
      this.masterVol = Math.max(0, Math.min(1, v)); // Clamp the volume between 0-1.
      if (typeof masterVolume === 'function') { // Try to use p5's "masterVolume()":
        try { masterVolume(this.masterVol); } catch (e) { }
      } else { // "masterVolume()" not available, so iterate through HTMLAudio sounds and update them:
        Object.keys(this.sounds).forEach(k => {
          const s = this.sounds[k];
          if (s && s.type === 'html' && s.obj) {
            try { s.obj.volume = this.masterVol; } catch (e) {}
          }
        });
      }
    },

    // Stop all sounds from playing at the same time.
    stopAll() {
      Object.keys(this.sounds).forEach(k => this.stop(k));
    }
  };

  // Create a golabl API to call from "sketch.js" for all Audio Manager functionality:
  global.AudioManager = AudioManager;
})(window);