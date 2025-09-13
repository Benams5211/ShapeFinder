# Features

- **Shape class** containing:
  - Velocity  
  - Target velocity  
  - State  
  - An editable list of *modifiers* affecting various Shape attributes, such as:
    - `lerpStrength (0,1)` → How “snappy” the smoothed movement on velocity switch feels.
    - `velocityLimit` → The max speed (pixels per frame).
    - `switchRate` → How often the shape switches velocity (frames).
    - `followShape` → Another Shape object to bias movement towards.
    - `followStrength (0,1)` → How closely the follower Shape follows the `followShape`.
    - `jitterRate` → Jitter rate in pixels per frame.
    - `freezeChance` → Chance per frame that a Shape pauses movement.
    - `freezeLength` → Duration (frames) of freeze.
    - `teleportChance` → Chance per frame that a Shape teleports to a random position.

Should be easily integrable with our existing classes.

---

## To implement
- `layer` parameter for Shape, allowing user choice of render layer.  
- More future-proof implementation of modifiers for easy add/remove.
