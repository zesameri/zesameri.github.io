// Setup the canvas
var two = new Two({
  fullscreen: true,
    autostart: true
}).appendTo(document.body);
document.body.style.background = 'black';


var radius = 0, rows  = 0, cols = 0;
var isMobile = window.matchMedia("only screen and (max-width: 850px)").matches ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
var isOtherMediaQuery = window.matchMedia("only screen and (min-width:1080px)").matches;
if(isMobile && !isOtherMediaQuery) {
  rows = Math.floor(two.height / 200);
  cols = Math.floor(two.width / 200);
  radius = Math.floor(two.height / rows) * .62;
} else {
  rows = Math.floor(two.height / 150);
  cols = Math.floor(two.width / 150);
  radius = Math.floor(Math.max(two.width, two.height) / Math.max(rows, cols)) / 2;
}
var shapes = makeFlowers();

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
    var shape = pickFlower();
    shape.translation.set(hi * two.width, vi * two.height);
  }
}
two.update();


function roseMath(v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}

function makeFlowers() {
  var shapes = [];
  var resolution = 240; // every flower has 240 points
  for (var k = 4; k < 20; k++) {
    var points = [];
    for (var j = 0; j < resolution; j++) {
      points[j] = new Two.Anchor();
      roseMath(points[j], k, Math.PI * 2 * j / resolution);
    }
    // Create shape
    var shape = new Two.Path(points, true, true);
    shapes.push(shape);
  }
  return shapes;
}

function pickFlower() {
  var s = Math.floor(Math.random() * shapes.length);
  var shape = shapes[s].clone();
  // Style the shape
  var colors = ['tomato', 'lightsalmon', 'floralwhite', 'orangered',
    'gold', 'red', 'darkorange'];
  var color = colors[Math.floor(Math.random() * colors.length)];
  shape.stroke = color;
  shape.fill = color;
  shape.linewidth = 4;
  shape.cap = 'round';
  shape.rotation = Math.floor(Math.random() * 4) * Math.PI / 2 + Math.PI / 4;
  // For animation later on
  shape.step = (Math.floor(Math.random() * 8) / 8) * Math.PI / 60;
  shape.step *= Math.random() > 0.5 ? - 1 : 1;
  return shape;
}
