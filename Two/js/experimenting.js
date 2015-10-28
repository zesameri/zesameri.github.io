// Setup the canvas
var two = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

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

// Create our shape
//var shape = two.makeCurve(points);
var petal = two.makeCurve(points.slice(0, resolution/8));
petal.fill = 'rgb(255, 255, 255)';
petal.stroke = 'rgb(0, 0, 0)';
petal.linewidth = 5;
var rect = petal.getBoundingClientRect();
console.log(rect);
petal.translation.set(7,9);
rect = petal.getBoundingClientRect();
console.log(rect);
two.scene.translation.set(two.width / 2, two.height / 2);
two.bind('update', function(){
    update();
});
// Update all points of a shape based on `k`
 function update() {
    for (var i = 0; i < resolution; i++) {
        t = Math.PI * 2 * i / resolution;
        k = (3 + 1) % 20;
        points[i].x = radius * Math.cos(k * t) * Math.cos(t);
        points[i].y = radius * Math.cos(k * t) * Math.sin(t);
    }
}
