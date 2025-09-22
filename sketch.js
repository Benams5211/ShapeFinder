let shapes = [];
let targetType;
let targetValue;
let lives = 3;
let gameOver = false;

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER, CENTER);
  textSize(24);

  // sample shapes 
  shapes = [
    { x: 150, y: 200, type: 'circle', color: [100,200,255] },
    { x: 300, y: 200, type: 'square' , color: [255,150,100] },
    { x: 450, y: 200, type: 'triangle', color: [100,255,150]  }
  ];

  pickTarget();
}


// randomly choose shape or color
function pickTarget() {
  let randomShape =  random(shapes);
  if (random() < 0.5) {
    targetType = 'shape';
    targetValue = randomShape.type;
  } else {
    targetType = 'color';
    targetValue = randomShape.color;
  }
  console.log(`Target is: ${targetType} = ${targetValue}`)
}

function draw() {
  background(220);

  // this shows the lives
  fill(0);
  text(`Lives: ${lives}`, width / 2, 30);

  // this is the gameover screen
  if (gameOver) {
    fill(255, 0, 0);
    text("Game Over", width / 2, height / 2);
    noLoop();
    return;
  }
  //show current target prompt
  if (targetType === 'shape') {
    fill(0);
    text(`Find the ${targetValue}`, width / 2, 70);
  } else if (targetType === 'color') {
    fill (targetValue);
    rectMode(CENTER);
    rect(width / 2, 70, 100, 30);
    fill (0);
    text("Click the matching color", width / 2, 110);
  }

  // drawing the shapes
  shapes.forEach(shape => {
    fill(shape.color);
    if (shape.type === 'circle') {
      ellipse(shape.x, shape.y, 80);
    } else if (shape.type === 'square') {
      rectMode(CENTER);
      rect(shape.x, shape.y, 80, 80);
    } else if (shape.type === 'triangle') {
      fill(100, 255, 150);
      triangle(shape.x, shape.y - 50, shape.x - 40, shape.y + 40, shape.x + 40, shape.y + 40);
    }
  });
}

function mousePressed() {
  if (gameOver) return;

for(let i = 0; i < shapes.length; i++) {
  if (isInside(shapes[i])) {
    let match = false;
    
    if (targetType === 'shape') {
      match = (shapes[i]. type === targetValue);
    } else if (targetType === 'color') {
      match = (shapes[i].color.toString() === targetValue.toString())
    }
    
    if (match) {
      pickTarget(); // this triggers the next round
    } else {
      lives--;
      if (lives <= 0) {
        gameOver = true;
      }
    }
    break; // to make sure we only handle one click at a time
  }
}
}

// to detect if the mouse is inside a shape
function isInside(shape) {
  let d = dist(mouseX, mouseY, shape.x, shape.y);
  if (shape.type === 'circle') {
    return d < 40;
  } else if (shape.type === 'square') {
    return mouseX > shape.x - 40 && mouseX < shape.x + 40 &&
           mouseY > shape.y - 40 && mouseY < shape.y + 40;
  } else if (shape.type === 'triangle') {
    return mouseX > shape.x - 40 && mouseX < shape.x + 40 &&
           mouseY > shape.y - 50 && mouseY < shape.y + 40;
  }
  return false;
}

function pickCorrectShape() {
  correctIndex = floor(random(shapes.length));
  console.log("Correct shape is:", shapes[correctIndex].type); // testing 
}
