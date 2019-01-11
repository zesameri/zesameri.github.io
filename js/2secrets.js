document.body.style.background = 'black';

var height = $('body').height();
var width = $('body').width();
var mobileSize = 200;
var desktopSize = 150;
var radius = 0, rows  = 0, cols = 0, size;

// Define rows, colnums, and shape radius based on document size
// var isMobile = window.matchMedia("only screen and (max-width: 850px)").matches ||
//                 /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// var isOtherMediaQuery = window.matchMedia("only screen and (min-width:1080px)").matches;
size = desktopSize;
rows = Math.floor(height / size);
cols = Math.floor(width / size);
radius = Math.floor(Math.max(width, height) / Math.max(rows, cols)) / 2;

var shapes = makeFlowers();
var flowers = [];

for (var r = 0; r < rows; r++) {
  var rowId = "row" + r;
  var row = $("<div/>").addClass("row").attr("id", rowId).appendTo('body');
  // even rows have an offset of 0.5
  var even = !!(r % 2);
  var vi = r / (rows - 1);
  for (var c = 0; c < cols; c++) {
    // var cell = $("<div/>").addClass("cell").appendTo(row);
    var cellId = "cell" + ((r * rows) + c);
    $(row).append('<div class="cell" id="' + cellId + '"></div>')
    var k = c;
    if (even) {
      k += 0.5;
      // we skip the final col on even rows to avoid overflow
      if (c  >=  cols -  1) {
        continue;
      }
    } else {
      row.css("position", "relative");
      row.css("left", (size / 2 * -1 + "px"));
    }
    var hi = k /(cols -  1);
    var shape = pickFlower(shapes);
    shape.translation.set((size + 25) / 2, (size + 25) / 2);
    // shape.translation.set(hi * width, vi * height);
    // Setup the canvas
    var two = new Two({
      width: size + 25,
      height:size + 25
    }).appendTo(document.getElementById(cellId));

    // $(cellId).click(function(e) {
    //   document.getElementById(cellId)
    // }

    two.add(shape);
    two.update();
    flowers.push(shape);
  }
}

// 
// for (var f in flowers) {
//   var flower = flowers[f];
//   $(flower._renderer.elem)
//     .click(function(e) {
//       flower.fill = "blue";
//     })
// }


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

function pickFlower(flowers) {
  var f = Math.floor(Math.random() * flowers.length);
  var flower = flowers[f].clone();
  // Style the shape
  var colors = ['tomato', 'orangered',
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
