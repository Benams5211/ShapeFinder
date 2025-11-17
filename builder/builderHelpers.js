
const opsDefault = {
  movement: { enabled: false, lerpStrength: 0.1, velocityLimit: 2, switchRate: 60 },
  modifiers: [],
  events: ["dragStart", "select"],
  deleteOnClick: false,
  randomColor: false,
  angle: 0,
};

// Uses the new InteractiveObject's serialize() method, which translates the shape's properties
// to an Array to save into JSON
function saveCombinedObject(obj) {
  saveJSON(obj.serialize(), "combined_object.json");
}


// Given a path to a JSON file, build and return a CombinedObject
// Yield further execution until complete
async function loadCombinedObjectFromFile(path) {
  const response = await fetch(path);
  const data = await response.json(); // Parse JSON back to an Array to pass as parameter below
  return CombinedObjects.fromData(data, true);
}

function shapeFromData(data) {
  const optsCopy = JSON.parse(JSON.stringify(data.opts || {}));

  // Extract event array before constructing shape

  let shape;
  switch (data.type) {
    case 'rect':
      shape = new ClickRect(data.x, data.y, data.w, data.h, data.fillCol, data.radius, optsCopy);
      break;
    case 'circle':
      shape = new ClickCircle(data.x, data.y, data.r, data.fillCol, optsCopy);
      break;
    case 'triangle':
      shape = new ClickTri(data.x, data.y, data.size, data.fillCol, optsCopy);
      break;
    default:
      throw new Error('Unknown shape type: ' + data.type);
  }
  
  for (const key in data) {
    if (key in shape) {
      shape[key] = data[key];
    }
  }
  
  const eventList = Array.isArray(optsCopy.events)
      ? [...optsCopy.events]
      : ["dragStart", "select"];
  //shape.events = eventList;
  shape.events = eventList;

  //if (!shape.opts) shape.opts = {};
  //if (!Array.isArray(shape.opts.events)) shape.opts.events = ["dragStart", "select"];

  //shape.events = shape.opts.events;
  return shape;
}

// Input: JSON File
// Builds a CombinedObject using fromData class method
// 
function handleInputFile(file) {
  if (file.type === 'application' || file.subtype === 'json') {
    try {
      // file.data is already parsed JSON
      const combo = CombinedObjects.fromData(file.data, false);
      centerCombinedObject(combo);
      shapes = [combo.mainObject, ...combo.objectList.map(o => o.Shape)];
    } catch (err) {
      console.error("Failed to parse JSON:", err);
    }
  } else {
    alert("Please select a JSON file.");
  }
}
// Input: A CombinedObject
// Center the entire object in the canvas (used after loading from json)
function centerCombinedObject(combo) {
  if (!combo.mainObject) return;

  // Current center of the canvas
  const targetX = width / 2;
  const targetY = height / 2;

  // How far to move everything
  const dx = targetX - combo.mainObject.x;
  const dy = targetY - combo.mainObject.y;

  // Shift main shape
  combo.mainObject.x += dx;
  combo.mainObject.y += dy;

  // Shift all children (maintaining offsets)
  for (const c of combo.objectList) {
    c.Shape.x += dx;
    c.Shape.y += dy;
  }
}
