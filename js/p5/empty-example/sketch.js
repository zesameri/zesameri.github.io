function setup() {
  // put setup code here
  createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  // put drawing code here
  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  //var x = screen.width/2;
  //var y = screen.height/2;
  ellipse(mouseX, mouseY, 80, 80);
}