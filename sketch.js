// JavaScript file to control the p5 lifecycle and delegate tasks to other modules.
// Parker Franklin
// 9/6/25

window.Game = window.Game || {};
Game.shapes = Game.shapes || [];

// Called at the beginning of a p5 project to create essential elements.
function setup() {
    const holder = document.getElementById("canvas-holder"); // Grabs div from index.HTML to create p5 canvas.
    const c = createCanvas(800, 600); // Creates a canvas that's 800 pixels long x 600 pixels wide.
    if (holder) c.parent(holder); // Assings the canvas "c" as a child of "holder".
    textAlign(CENTER, CENTER);
}

// Called 60 times/second to draw each new frame of the project.
function draw() {
    background(255); // Defines a white background for the canvas.

    // Tells shapes.js to render everything:
    if (typeof window.renderAllShapes === "function") {
        window.renderAllShapes(Game.shapes);
    }

    // Simple HUD
    fill(0);
    noStroke();
    textSize(14);
}
