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


var petal = resolution/8;
var weird_petal = two.makeCurve(points.slice(0, petal/2 + 1).concat(points.slice(points.length - petal/2, points.length)), true, true);
//weird_petal.fill = 'rgb(200, 200, 200)';

var petals = new Array(8);
for (i = 0, j = 1; i < petals.length; i++, j++) {
    if (j == petals.length) {
        //shapes[i] = two.makeCurve(last, true, true);
    } else {
        petals[i] = two.makeCurve(points.slice(i*petal + petal/2, j*petal + petal/2), true, false);
        //petals[i].fill = 'rgb(200, 200, 200)';
    }
}
petals.push(weird_petal);
flower  = two.makeGroup(petals, weird_petal);
flower.fill = 'rgb(200, 200, 200)';
// Style the shape

flower.stroke = 'rgb(255, 255, 255)';
var circle = two.makeCircle(0,0,25);
// Center it on the screen
two.scene.translation.set(two.width / 2, two.height / 2);

two.bind('update', function(){
    k = (3 + 1) % 20;
    update();
});
// Update all points of a shape based on `k`
 function update() {
    for (var i = 0; i < resolution; i++) {
        roseMath(points[i], k, Math.PI * 2 * i / resolution);
    }
}

// The rose math function taken from
// http://en.wikipedia.org/wiki/Rose_(mathematics)
function roseMath(v, k, t) {
    v.x = radius * Math.cos(k * t) * Math.cos(t);
    v.y = radius * Math.cos(k * t) * Math.sin(t);
    return v;
}
