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

  var size = getShapeSize();
  var rows = Math.floor(height / size);
  var cols = Math.floor(width / size);
  var radius = Math.floor(Math.max(width, height) / Math.max(rows, cols)) / 2;

  makeGrid(rows, cols);
  shapes = makeFlowers(radius);
  addSvgsToCells(size);
}

function getShapeSize() {
  var size;
  var isMobile = window.matchMedia("only screen and (max-width: 850px)").matches ||
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var isOtherMediaQuery = window.matchMedia("only screen and (min-width:1080px)").matches;
  if(isMobile && !isOtherMediaQuery) {
    size = 200;
  } else {
    size = 150;
  }
  return size;
}

function addSvgsToCells(size) {
  $(".cell").each(function (index, object) {
    var two = new Two({
      width: size + 20,
      height:size + 20
    }).appendTo(object);
    var shape = pickFlower(shapes);
    shape.translation.set(two.width / 2, two.height / 2);
    two.add(shape);
    two.update();
  });
}

function makeGrid(rows, cols) {
  $('body').empty();
  for (var r = 0; r < rows; r++) {
    var rowId = "row" + r;
    var row = $("<div/>").addClass("row").attr("id", rowId).appendTo('body');
    var vi = r / (rows - 1);
    for (var c = 0; c < cols; c++) {
      var cellId = "cell" + ((r * rows) + c);
      $(row).append('<div class="cell" id="' + cellId + '"></div>');
    }
  }
}

function roseMath(radius, v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}

function makeFlowers(radius) {
  var flowers = [];
  var resolution = 240; // every flower has 240 points
  for (var k = 4; k < 20; k++) {
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
  // Style the shape
  var colors = ['tomato', 'orangered', 'floralwhite',
    'gold', 'red', 'darkorange'];
  var color = colors[Math.floor(Math.random() * colors.length)];
  flower.stroke = color;
  flower.fill = color;
  flower.linewidth = 4;
  flower.cap = 'round';
  // flower.rotation = Math.floor(Math.random() * 16) * Math.PI / 8 + Math.PI / 16;
  // For animation later on
  flower.step = (Math.floor(Math.random() * 8) / 8) * Math.PI / 60;
  flower.step *= Math.random() > 0.5 ? - 1 : 1;
  return flower;
}
