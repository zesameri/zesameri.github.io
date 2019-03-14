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
  var svgSize = 150;
  var padding = 20;

  var isMobile = window.matchMedia("only screen and (max-width: 850px)").matches ||
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var isOtherMediaQuery = window.matchMedia("only screen and (min-width:1080px)").matches;
  if(isMobile && !isOtherMediaQuery) {
    svgSize = 250;
    padding = 40;
  }

  if(isMobile && !isOtherMediaQuery) {
    radius = Math.floor(height / (rows + 2));
  }
  
  makeGrid(rows, cols);
  var rows = Math.floor(height / svgSize);
  var cols = Math.floor(width / svgSize);
  var radius = Math.floor(Math.max(width, height) / Math.max(rows, cols)) / 2;

  shapes = makeFlowers(radius);
  addSvgs(svgSize + padding, rows, cols);
  var divSize = $("#cell0").outerWidth();
  positionCells(cols, divSize);
}

function addSvgs(size, rows, cols) {
  $(".cell").each(function (i, o) {
    var two = new Two({
      width: size,
      height: size
    }).appendTo(o);
    var shape = pickFlower(shapes);
    shape.translation.set(two.width / 2, two.height / 2);
    two.add(shape);
    two.update();
  });
}

function offsetEvenRows(size) {
  $(".row").each(function (index, object) {
    if (index % 2) {
      $(object).css("position", "relative");
      $(object).css("left", size / 2 * -1 + "px");
    }
  });
}

function makeGrid(rows, cols) {
  $('body').empty();
  for (var r = 0; r < rows; r++) {
    var rowId = "row" + r;
    var row = $("<div/>").addClass("row").attr("id", rowId).appendTo('body');
    for (var c = 0; c < cols + 1; c++) {
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
