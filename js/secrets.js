// We're making 40 flowers
// each is made of 240 pretty points
var colors = [
  'tomato',
  'lightsalmon',
  'plum',
  'mediumslateblue'
];

var resolution = 240;
var radius = 200;
var shapes = [];
// Make the flowers
for (var k = 2; k < 44; k++) {
  var points = [];
  for (var j = 0; j < resolution; j++) {
    points[j] = new Two.Anchor();
    roseMath(points[j], k, Math.PI * 2 * j / resolution);
  }
  // Create shape
  var shape = new Two.Path(points, true, true);

  // Style the shape
  var color = colors[Math.floor(Math.random() * colors.length)];
  shape.stroke = color;
  shape.noFill();
  shape.rotation = Math.floor(Math.random() * 4) * Math.PI / 2 + Math.PI / 4;
  shapes.push(shape);
}
// two.add(group)

// Setup the canvas
var two = new Two({
  fullscreen: true,
    autostart: true
}).appendTo(document.body);;

var background = two.makeRectangle(two.width / 2, two.height / 2,
  two.width, two.height);
background.noStroke();
background.fill = 'black';
background.name = 'background';

var container = two.makeGroup(background);

var rows = Math.floor(two.height / 100);
var cols = Math.floor(two.width / 100);
var width = Math.round(two.height / Math.max(rows, cols));
var height = width;

for (var r = 0; r < rows; r++) {
  // even rows have an offset of 0.5
  var even = = !!(r % 2);
  var vi = r / (rows - 1);
  for (var c = 0; c < cols; c++) {
    var k = c;
    if (even) {
      k += 0.5;
      // we skip the final col on even rows to avoid overflow
      if (c  <  cols -  1) {
        var hi = k /(cols -  1);

      }
    }
  }
}

two.update();

function roseMath(v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}
