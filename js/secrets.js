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

function roseMath(v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}
