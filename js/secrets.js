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


function roseMath(radius, v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}

function makeFlowers(radius) {
  var flowers = [];
  var resolution = 240; // every flower has 240 points
  for (var k = 4; k < 24; k++) {
    var points = [];
    for (var j = 0; j < resolution; j++) {
      points[j] = new Two.Anchor();
      roseMath(radius, points[j], k, Math.PI * 2 * j / resolution);
    }
    // Create shape
    var flower = new Two.Path(points, true, true);
    flowers.push(flower);
  }
  return flowers;
}

function pickFlower(flowers) {
  var f = Math.floor(Math.random() * flowers.length);
  var flower = flowers[f].clone();
  var colors = ['tomato', 'orangered', 'floralwhite',
    'gold', 'red', 'darkorange'];
  colors = ['DARKMAGENTA', 'REBECCAPURPLE', 'SLATEBLUE', 'ROYALBLUE', '#9c27b0', '#9f9fff',
    'ALICEBLUE', 'PLUM', 'CORNFLOWERBLUE', 'DARKBLUE', 'MEDIUMBLUE', 'DARKSLATEBLUE'];
  var color = colors[Math.floor(Math.random() * colors.length)];
  flower.rotation = (Math.PI  / 2) * (Math.floor(Math.random() * 12) / 12);
  flower.stroke = color;
  flower.fill = color;
  flower.linewidth = 4;
  flower.cap = 'round';
  return flower;
}
