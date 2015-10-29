// Setup the canvas
var two = new Two({
    fullscreen: true,
    autostart: true
}).appendTo(document.body);

// External variables
var k = 0, radius = 200;

// Internal variables
var points = [];
var resolution = 240;    // How many points are there?
for (var i = 0; i < resolution; i++) {
    points[i] = new Two.Anchor();
}

// Variables for the Interpreter
var dimensions = 140, shapes = [], index = 0, length = 0, easing = 0.125;
var scale = two.width > two.height ? two.height / dimensions : two.width / dimensions;

// Create our shape
var shape = two.makeCurve(points);
// Center it on the screen
two.scene.translation.set(two.width / 2, two.height / 2);

shape.fill = 'rgb(255, 255, 255)';
shape.stroke = 'rgb(0, 0, 0)';
shape.linewidth = 5;

two.bind('update', function(){
    k = (3 + 1) % 20;
    update();
});
// Update all points of a shape based on `k`
// Uses cartesian parametric equation of polar rose equation
 function update() {
    for (var i = 0; i < resolution; i++) {
        var t = Math.PI * 2 * i / resolution;
	    points[i].x = radius * Math.cos(k * t) * Math.cos(t);
	    points[i].y = radius * Math.cos(k * t) * Math.sin(t);
    }
}
