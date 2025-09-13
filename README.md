Features:
  A Shape class containing:
    Velocity
    Target velocity
    State
    A provided editable list of 'modifiers' affecting various Shape attributes, such as:
      // lerpStrength   : (0,1) -> How 'snappy' the smoothed movement on velocity switch feels.
      // velocityLimit  : The limit in which the shape is allowed to move (Pixels per Frame)
      // switchRate     : How often the shape switches velocity (Frames)
      // followShape    : Pass another shape object to bias movement towards
      // followStrength : (0,1) -> How closely the follower Shape follows the followShape
      // jitterRate     : Jitter rate of Shape in Pixels per Frame.
      // freezeChance   : The chance in which a Shape will pause movement (per frame)
      // freezeLength   : Length, in frames, of freeze duration.
      // teleportChance : Chance, per frame, of shape teleporting to a random position.

Should be easily integrable with our existing classes.

To implement:
  'layer' parameter of Shape class that allows user choice of which layer to render each shape on.
  A more future proof implementation of modifiers for easy add/deletion.
