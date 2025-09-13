p5js editor link
https://editor.p5js.org/njohn105-afk/sketches/tER3wkK3P


# Features
- Editable *movementConfig*, a list of settings pertaining to the Shape's movement.
  - `lerpStrength (0,1)` → How “snappy” the smoothed movement on velocity switch feels.
  - `velocityLimit` → The max speed (pixels per frame).
  - `switchRate` → How often the shape switches velocity (frames).
- **Shape class** containing:
  - Velocity  
  - Target velocity  
  - State
  - Movement modifier application based on passed Modifier objects.
- **FreezeModifier class**
  - `freezeChance` → Chance per frame that a Shape pauses movement.
  - `freezeLength` → Duration (frames) of freeze.
- **FollowShape Class**
  - `followShape` → Another Shape object to bias movement towards.
  - `followStrength (0,1)` → How closely the follower Shape follows the `followShape`.
- **JitterModifier Class**
  - `jitterRate` → Jitter rate in pixels per frame.
- **TeleportModifier Class**
  - `teleportChance` → Chance per frame that a Shape teleports to a random position.

Should be easily integrable with our existing classes.
