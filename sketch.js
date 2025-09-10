function setup() {
  createCanvas(400, 400);
}

points = 0;

x = 150;
y = 200;
x2 = 250;
size = 50;


function draw() {
  background(220);
  
  text(points, 190, 100);
  
  circle(x,y,size);
  circle(x2,y,size);
  
  
}

function mouseClicked(){
  if(dist(mouseX, mouseY, x, y) <= size){
    points += 1;
  }
  else if(dist(mouseX, mouseY, x2, y) <= size){
    points -= 1;
  }
}