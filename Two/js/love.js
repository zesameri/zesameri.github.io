document.body.style.background = 'rgb(0, 0, 0)';
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
var shape = two.makeCurve(points);
// Center it on the screen
two.scene.translation.set(two.width / 2, two.height / 2);

// Style the shape
shape.fill = 'rgb(0, 0, 0)';
shape.stroke = 'rgb(255, 255, 255)';
shape.linewidth = 6;
/*
// This is the animation loop
two.bind('update', function(frameCount, timeDelta) {

    if (timeDelta) {
        time += timeDelta;
    }

    // Increment `k` every 1 second to change shape.
    if (time > 1000) {
        k = (k + 1) % 20;
        time = 0;
        update();
    }

});
*/
two.bind('update', function(){
    k = (3 + 1) % 20;
    update();
});
// Update all points of a shape based on `k`
 function update() {
    for (var i = 0; i < resolution; i++) {
        if (k != 1) {
            roseMath(points[i], k, Math.PI * 2 * i / resolution);
        }
    }
}

// The rose math function taken from
// http://en.wikipedia.org/wiki/Rose_(mathematics)
function roseMath(v, k, t) {
    v.x = radius * Math.cos(k * t) * Math.cos(t);
    v.y = radius * Math.cos(k * t) * Math.sin(t);
    return v;
}