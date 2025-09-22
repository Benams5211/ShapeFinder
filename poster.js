// Poster geometry
let poster;
let posterG; // off-screen poster buffer




function drawPosterBuffer() {
  const pg = posterG;
  pg.clear();

  pg.noStroke();
  
  const centerX = poster.w / 2;
  const centerY = poster.h / 2;

  pg.imageMode(CENTER);
  pg.image(posterBackground, centerX, centerY, poster.w, poster.h);
  
  // gray box behind image
  pg.fill(60);
  pg.rectMode(CENTER);
  pg.rect(centerX, centerY - 30, 120, 120);

  // Target preview inside poster (buffer coords)
  const t = crowd[targetIdx];
  const cx = centerX;
  const cy = centerY - 30;
  drawShapePG(pg, t.type, t.col, cx, cy, 44);
}