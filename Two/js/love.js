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
var petal = resolution/8;
//console.log();
var shapes = new Array(8);
for (i = 0, j = 1; i < shapes.length; i++, j++) {
    shapes[i] = two.makeCurve(points.slice(i*petal, j*petal));
    //shapes[i].center();
    shapes[i].fill = 'rgb(255, 255, 255)';
    shapes[i].stroke = 'rgb(0, 0, 0)';
    shapes[i].linewidth = 5;
}
//console.log(points.length);
//var petal = two.makecurve(points[])
// Center it on the screen
shape  = two.makeGroup(shapes);
two.scene.translation.set(two.width / 2, two.height / 2);
shape.scale = 1;
//shape.center();
// Style the shape
/*
shape.fill = 'rgb(255, 255, 255)';
shape.stroke = 'rgb(0, 0, 0)';
shape.linewidth = 5;
*/
two.bind('update', function(){
    update();
});
// Update all points of a shape based on `k`
 function update() {
    for (var i = 0; i < resolution; i++) {
        roseMath(points[i], Math.PI * 2 * i / resolution);
    }
}

// The rose math function taken from
// http://en.wikipedia.org/wiki/Rose_(mathematics)
function roseMath(v, t) {
    k = (3 + 1) % 20;
    v.x = radius * Math.cos(k * t) * Math.cos(t);
    v.y = radius * Math.cos(k * t) * Math.sin(t);
    return v;
}

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