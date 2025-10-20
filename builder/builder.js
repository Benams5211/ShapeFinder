
// GLOBALS FOR THE BUILDER
let addSquare, addTri, addCircle
let shapes = [];
let dragging = false;
let shapeBeingDragged = null;
let selectedShape = null;
let displayShape = null;


function handleConsoleCommand(cmd) {
  {  if (!selectedShape) {
    consoleMessages.push("No shape selected.");
    return;
  }

  // Split input into parts separated by any whitespace
  // Ignores excess spacing
  const parts = cmd.split(/\s+/);
  // prop (property) acts as the command/property to edit
  const prop = parts[0];
  // Join the rest of the command arguments (excluding the prop) into a string
  let value = parts.slice(1).join(' ');

  if (prop === "layer") {
      const direction = value.toLowerCase();
      const i = shapes.indexOf(selectedShape);
      if (i === -1) return;

      switch (direction) {
        case "up":
          if (i < shapes.length - 1) {
            // Swap the two elements (this is pretty clever, I didn't figure this out myself)
            [shapes[i], shapes[i + 1]] = [shapes[i + 1], shapes[i]];
            consoleMessages.push("Moved layer up");
          }
          break;
        case "down":
          if (i > 0) {
            [shapes[i], shapes[i - 1]] = [shapes[i - 1], shapes[i]];
            consoleMessages.push("Moved layer down");
          }
          break;
        case "top":
          shapes.splice(i, 1);
          shapes.push(selectedShape);
          consoleMessages.push("Moved to top layer");
          break;
        case "bottom":
          shapes.splice(i, 1);
          shapes.unshift(selectedShape);
          consoleMessages.push("Moved to bottom layer");
          break;
        default:
          consoleMessages.push("Usage: layer [up|down|top|bottom]");
      }
      return;
    }



  if (parts.length < 2) {
    consoleMessages.push("Usage: <property> <value>");
    return;
  }

  // Try to parse numbers, arrays, or booleans
  try {
    if (/^\[.*\]$/.test(value)) {
      // Parse arrays like [255,0,0]
      value = JSON.parse(value.replace(/'/g, '"'));
    } else if (!isNaN(value)) {
      value = Number(value);
    } else if (value === "true" || value === "false") {
      value = (value === "true"); // Convert value to an actual boolean from string
    }
  } catch (e) {
    consoleMessages.push(`Error parsing value: ${value}`);
    return;
  }

  // Apply to the selected shape
  if (prop in selectedShape) {
      if (prop === "angle") {
      value = value * (Math.PI / 180);
    }

    selectedShape[prop] = value;
    consoleMessages.push(`Set ${prop} = ${JSON.stringify(value)}`);
  } else {
    consoleMessages.push(`Unknown property: ${prop}`);
  }}
}


function setupBuilder() {
    consoleInput = createInput(''); // adjust as needed
    consoleInput.size(300);
    consoleInput.attribute('placeholder', 'Enter command ...');
    consoleInput.hide();
  
    consoleInput.input(onConsoleInput);
}

function onConsoleInput() {
  if (keyIsPressed && keyCode === ENTER) {
    const cmd = this.value().trim();
    this.value(''); // clear the box
    handleConsoleCommand(cmd);
  }
}


function destroyShape(shape) {
  const index = shapes.indexOf(shape);
  if (index !== -1) {
    shapes.splice(index, 1);
    if (shape.deleteSelf) shape.deleteSelf();
  }
}

function deselect() {
  if (displayShape) {
    destroyShape(displayShape);
    displayShape = null;
  }
  selectedShape = null;
}
function handleBuilderClick() {
    if (mouseInside(addSquare)) {
        const shape = new ClickRect(width/2, height/random(3,4), 30, 30, [255,255,255], 8, opsDefault);
        shapes.push(shape);
        return;
    }
    else if (mouseInside(addTri)) {
        const shape = new ClickTri(width/2, height/random(3,4), 30, [255,255,255], opsDefault);
        shapes.push(shape);
        return;
    }
    else if (mouseInside(addCircle)) {
        const shape = new ClickCircle(width/2, height/random(3,4), 30, [255,255,255], opsDefault);
        shapes.push(shape);
        return;
    }
    else if (mouseInside(deleteShape) && selectedShape) {
      destroyShape(selectedShape);
      destroyShape(displayShape);
      deselect();
      return;
    }
    else if (mouseInside(deselectButton)) {
      deselect();
      return;
    }
    else if (mouseInside(cloneButton) && selectedShape) {
      let newShape = selectedShape.clone()
      newShape.x = width/2;
      newShape.y = height/random(3,4);
      shapes.push(newShape);
      return;
    }
    else if (mouseInside(saveComposition) && shapes.length >= 1) {
      const main = shapes[0];
      const children = shapes.filter(s => s !== main).map(s => ({
        Shape: s,
        offsetX: s.x - main.x,
        offsetY: s.y - main.y
      }))
      const combo = new CombinedObjects(main, children);
      saveCombinedObject(combo);
    }
    else if (mouseInside(loadComposition)) {
      fileInput.elt.click();
    }
    // Handle click in case that it is inside a shape
    for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        if (s.enabled && s.contains(mouseX, mouseY)) {
            s.onClick(); // Will fire "select" and "dragStart", firing the OnEvents below
            return; // trigger only one per click
        }
  }
}

gameEvents.OnEvent("select", (theShape) => {
    if (theShape == displayShape) return;

    if (theShape !== selectedShape) {
        let newShape = theShape.clone();

        if (displayShape !== null) {
          destroyShape(displayShape);
        }

        displayShape = newShape;

        if (selectedShape !== null) 
            selectedShape.stroke.enabled = false;
    }
    selectedShape = theShape;
})

gameEvents.OnEvent("dragStart", (theShape) => {
    if (theShape == displayShape) return;
    dragging = true;
    shapeBeingDragged = theShape;
})

gameEvents.OnEvent("dragEnd", () => {
    dragging = false;
    shapeBeingDragged = null;
})