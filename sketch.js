let StartTime = 5;
let Timer;
let TimeOver = false;

function setup() {
  createCanvas(400, 400);
  //font color
  fill('white');
  Timer = StartTime;
}

function draw() {
  background(0);
  //int(millis() / 1000) counts one second
  let time = Timer - int(millis() / 1000);

  if (time <= 0) {
    //Reset time when time is less than 0
    time = 0;
    textAlign(CENTER, CENTER);
    textSize(50);
    fill('white');
    text("Time's Over!", 200, 300);
    TimeOver = true;
  }
  
  textAlign(CENTER, CENTER);
  textSize(50);  
  //text(count, posx, posy)
  text(time, 200, 200);
  
}

