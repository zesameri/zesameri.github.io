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
var radius = Math.floor(Math.max(two.width, two.height) / Math.max(rows, cols)) / 2;

var resolution = 240;
var shapes = [];
// We're making 40 flowers
// each is made of 240 pretty points
var colors = ['tomato', 'lightsalmon', 'floralwhite', 'orangered',
  'gold', 'red', 'darkorange'];
// Make the flowers
for (var k = 4; k < 20; k++) {
  var points = [];
  for (var j = 0; j < resolution; j++) {
    points[j] = new Two.Anchor();
    roseMath(points[j], k, Math.PI * 2 * j / resolution);
  }
  // Create shape
  var shape = new Two.Path(points, true, true);
  // shape.step = (Math.floor(Math.random() * 8) / 8) * Math.PI / 60;
  // shape.step *= Math.random() > 0.5 ? - 1 : 1;

  shapes.push(shape);
}

for (var r = 0; r < rows; r++) {
  // even rows have an offset of 0.5
  var even = !!(r % 2);
  var vi = r / (rows - 1);
  for (var c = 0; c < cols; c++) {
    var k = c;
    if (even) {
      k += 0.5;
      // we skip the final col on even rows to avoid overflow
      if (c  >=  cols -  1) {
        continue;
      }
    }
    var hi = k /(cols -  1);
    var s = Math.floor(Math.random() * shapes.length);
    var shape = shapes[s].clone();
    // Style the shape
    var color = colors[Math.floor(Math.random() * colors.length)];
    shape.stroke = color;
    shape.fill = color;
    shape.linewidth = 4;
    shape.cap = 'round';
    shape.rotation = Math.floor(Math.random() * 4) * Math.PI / 2 + Math.PI / 4;
    shape.translation.set(hi * two.width, vi * two.height);
    container.add(shape);
  }
}

two.update();

function roseMath(v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}
