function drawBuilderButton(btn) {
  const { x, y, w, h, label } = btn;

  // Hover effect
  const hovered = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  push();
  noStroke();
  if (hovered) {
    fill(90, 180, 255); // lighter blue
  } else {
    fill(60, 120, 200); // base color
  }
  rect(x, y, w, h, 8); // rounded corners

  // subtle shadow under the button
  if (!hovered) {
    fill(0, 50);
    rect(x + 2, y + 3, w, h, 8);
  }

  // label
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(16);
  text(label, x + w / 2, y + h / 2);
  pop();
}


function drawShapeOptions() {
  const margin = 20;
  const panelW = 280;
  const panelH = 480;

  // Place panel on the right edge of the canvas
  const panelX = width - panelW - margin;
  const panelY = margin;

  // Background box
  push();
  fill(20, 20, 30, 200);   // semi-transparent dark bg
  stroke(100, 200, 255);   // light border
  strokeWeight(2);
  rect(panelX, panelY, panelW, panelH, 12); // rounded edges
  pop();

  // Title
  textAlign(LEFT, TOP);
  fill(255);
  textSize(22);
  text("Shape Properties", panelX + 20, panelY + 15);
  textSize(14);
  fill(200);

  // Display shape preview (centered in upper part of panel)
  displayShape.x = panelX + panelW / 2;
  displayShape.y = panelY + 80;

  // Property text
  const startY = panelY + 180;
  const lineH = 22;
  let y = startY;

  const showProp = (label, value) => {
    text(`${label}: ${value}`, panelX + 20, y);
    y += lineH;
  };

  showProp("Main", shapes[0] === selectedShape);
  showProp("x", nf(selectedShape.x, 1, 1));
  showProp("y", nf(selectedShape.y, 1, 1));
  showProp("fillCol", JSON.stringify(selectedShape.fillCol));
  showProp("w", selectedShape.w ?? 0);
  showProp("h", selectedShape.h ?? 0);
  showProp("r", selectedShape.r ?? 0);
  showProp("size", selectedShape.size ?? 0);
  showProp("offsetX", nf(selectedShape.x - shapes[0].x, 1, 1));
  showProp("offsetY", nf(selectedShape.y - shapes[0].y, 1, 1));
  showProp("angle", selectedShape.angle ?? 0, 1, 1);
  // Console input positioning
  consoleInput.position(panelX + 20, panelY + panelH - 40);
  consoleInput.size(panelW - 40);
  displayShape.render();
}

function drawConsoleWindow() {
  const panelW = 280;
  const panelH = 300;
  const margin = 20;
  const panelX = width - panelW - margin;
  const panelY = height/1.3 - panelH - margin;

  // background
  push();
  fill(10, 10, 20, 220);
  stroke(80, 150, 255);
  strokeWeight(2);
  rect(panelX, panelY, panelW, panelH, 10);
  pop();

  // title
  fill(255);
  textAlign(LEFT, TOP);
  textSize(16);
  text("Console", panelX + 15, panelY + 10);

  // messages
  textSize(13);
  fill(200);
  const messagesToShow = consoleMessages.slice(-10); // Only show most recent 10 messages
  let y = panelY + 35;
  for (let i = 0; i < messagesToShow.length; i++) {
    text(messagesToShow[i], panelX + 15, y);
    y += 18;
  }
}

function drawBuilder() {
    addSquare = { x: 30, y: 130, w: 100, h: 40, label: "Add Square" };
    addTri    = { x: 30, y: 180, w: 100, h: 40, label: "Add Triangle" };
    addCircle = { x: 30, y: 230, w: 100, h: 40, label: "Add Circle" };
    deleteShape = { x: width/1.5, y: 130, w: 100, h: 40, label: "DELETE" };
    deselectButton = { x: width/1.5, y: 180, w: 100, h: 40, label: "DESELECT" };
    cloneButton = { x: width/1.5, y: 240, w: 100, h: 40, label: "CLONE" };

    saveComposition = { x: 30, y: 300, w: 100, h: 40, label: "SAVE COMP" };
    loadComposition = { x: 30, y: 350, w: 100, h: 40, label: "LOAD COMP" };

    drawBuilderButton(addSquare);
    drawBuilderButton(addTri);
    drawBuilderButton(addCircle);
    drawBuilderButton(saveComposition);
    drawBuilderButton(loadComposition);
    drawButton(backButton);
    // Draw center square
    push();
    stroke(255);
    strokeWeight(4);
    noFill();
    rectMode(CENTER);
    rect(width/2, height/2, width/2.5, height/2.5);
    pop();

    consoleInput.show();

    if (dragging && shapeBeingDragged) {
        shapeBeingDragged.x = mouseX;
        shapeBeingDragged.y = mouseY;
    }

    for (const s of shapes) {
        s.update();
        s.render();
    }
    if (selectedShape) {
      drawBuilderButton(deselectButton);
      drawBuilderButton(deleteShape);
      drawBuilderButton(cloneButton);
      drawShapeOptions();
    }
    drawConsoleWindow();
}