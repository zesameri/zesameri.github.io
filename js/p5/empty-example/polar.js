function setup() {
  // put setup code here
  createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  loadPixels();
  var n = (mouseX * 10.0) / width;
  var w = 16.0;
  var h = 16.0;
  var dx = w/width;
  var dy = h/height;
  var x = -w/2;
  for (var i = 0; i < width; i++) {
  	var r = Math.sqrt((x*x) + (y*y));
  	var theta = Math.atan(y, x);
  }

}