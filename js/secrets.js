var shapes;
window.onresize = function() {
    setup();
}

$(function() {
  setup();
});

function setup() {
  var height = $('body').height();
  var width = $('body').width();
  var size = 150;
  var padding = 50;

  var isMobile = window.matchMedia("only screen and (max-width: 450px)").matches ||
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var isOtherMediaQuery = window.matchMedia("only screen and (min-width:1080px)").matches;
  if(isMobile && !isOtherMediaQuery) {
    size = 250;
    padding = 250;
  }
  var rows = Math.floor(height / size);
  var cols = Math.floor(width / size);
  var radius = Math.floor(Math.max(width, height) / Math.max(rows - 1, cols - 1)) / 2;

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
    var shape = pickFlower(shapes);
    shape.translation.set(hi * two.width, vi * two.height);
    flowers.push(shape);
    two.add(shape);
  }
}
two.update();

for (var f in flowers) {
  var flower = flowers[f];
  console.log(flower.id);
  $(flower._renderer.elem)
    .click(function(e) {
      flower.fill = "blue";
    })
}


function roseMath(v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}

function makeFlowers() {
  var flowers = [];
  var resolution = 240; // every flower has 240 points
  for (var k = 4; k < 20; k++) {
    var points = [];
    for (var j = 0; j < resolution; j++) {
      points[j] = new Two.Anchor();
      roseMath(points[j], k, Math.PI * 2 * j / resolution);
    }
    // Create shape
    var flower = new Two.Path(points, true, true);
    flowers.push(flower);
  }
  return flowers;
}
var f = 0;
function pickFlower(flowers) {
  // var f = Math.floor(Math.random() * flowers.length);
  if (f == flowers.length) {
    f = 0;
  }
  if (typeof flowers[f] === 'undefined') {
    f++;
  }
  var flower = flowers[f].clone();
  f++;
  // Style the shape
  // var colors = ['tomato', 'lightsalmon', 'floralwhite', 'orangered',
  //   'gold', 'red', 'darkorange'];
  // var color = colors[Math.floor(Math.random() * colors.length)];
  // flower.stroke = color;
  // flower.fill = color;
  flower.linewidth = 4;
  flower.cap = 'round';
  // flower.rotation = Math.floor(Math.random() * 4) * Math.PI / 2 + Math.PI / 4;
  // For animation later on
  // flower.step = (Math.floor(Math.random() * 8) / 8) * Math.PI / 60;
  // flower.step *= Math.random() > 0.5 ? - 1 : 1;
  return flower;
}
