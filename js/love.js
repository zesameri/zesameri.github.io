// Setup the canvas
var two = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);
document.body.style.background = 'rgb(0, 0, 0)';

// External variables
var k = 0;
var radius = 200;

// Internal variables
var time = 0;
var points = [];
var resolution = 240;    // How many points are there?
for (var i = 0; i < resolution; i++) {
    points[i] = new Two.Anchor();
}

// Variables for the Interpreter
var dimensions = 140;
var shapes = [];
var index = 0;
var length = 0;
var scale = two.width > two.height ? two.height / dimensions : two.width / dimensions;
var easing = 0.125;

// Because r = cos(4*Math.PI) does not start at center
// I take the start and end of points
var petal = resolution/8;
var weirdPoints = points.slice(points.length - petal/2, points.length).concat(points.slice(0, petal/2));
var weirdPetal = two.makeCurve(weirdPoints, true, true);

var petals = new Array(8);
for (i = 0, j = 1; i < petals.length; i++, j++) {
    if (j != petals.length) {
        petals[i] = two.makeCurve(points.slice(i*petal + petal/2, j*petal + petal/2), true, false);
    }
}
petals.push(weirdPetal);
var circle = two.makeCircle(0,0,20);
flower  = two.makeGroup(petals);
flower.add(circle);
flower.fill = 'rgb(0, 0, 0)';
flower.linewidth = 4;
flower.stroke = 'rgb(255, 255, 255)';



// Center it on the screen
two.scene.translation.set(two.width / 2, two.height / 2);
//Making of the petals
for (var i = 0; i < resolution; i++) {
        var t =Math.PI * 2 * i / resolution;
        points[i].x = radius * Math.cos(4 * t) * Math.cos(t);
        points[i].y = radius * Math.cos(4 * t) * Math.sin(t);
}
var multiplier = 1;
two.bind('update', function(frameCount) {
  // This code is called everytime two.update() is called.
  // Effectively 60 times per second.
  var t = (1 - flower.rotation*multiplier) * 0.001;
  if (flower.rotation > 0.9) {
    //flower.rotation = 0;
    multiplier = -1
  }
  if (flower.rotation < -0.9) {
    //flower.rotation = 0;
    multiplier = 1;
  }
  
  flower.rotation += t * 4 * Math.PI * multiplier;
}).play();  // Finally, start the animation loop
