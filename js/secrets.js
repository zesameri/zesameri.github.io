var shapes;


window.addEventListener('load', () => {
  if (document.readyState === "complete") {
    setup();
  }
});


window.onresize = function() {
    setup();
}

// $(function() {
//   setup();
// });

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

  var rows = Math.floor(height / svgSize);
  var cols = Math.floor(width / svgSize);
  var radius = Math.floor(Math.max(width, height) / Math.max(rows, cols)) / 2;

  shapes = makeFlowers(radius);
  addSvgs(svgSize + padding, rows, cols);
  var divSize = $("#cell0").outerWidth();
  positionCells(cols, divSize);
}

function addSvgs(size, rows, cols) {
  $('body').empty();
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var cellId = "cell" + ((r * cols) + c);
      var cell = $("<div/>").addClass("cell").attr("id", cellId).appendTo('body');
      $(cell).css({display: "inline-block"});
    }
  }

  $(".cell").each(function (i, o) {
    var two = new Two({
      width: size,
      height: size
    }).appendTo(o);
    var shape = pickFlower(shapes);
    shape.translation.set(two.width / 2, two.height / 2);
    two.add(shape);
    two.update();

    $(o).on("click", function() {
      toggleSVG($(o), two, shape);
    });
  });
}

function positionCells(cols, size) {
  $(".cell").each(function (i, o) {
    var r = Math.floor(i / cols);
    var c = i % cols;
    var top = size * r;
    var left = size * c;
    // Offset odd rows
    if (r % 2) {
      left -= (size/2);
    }
    $(this).css({top: top, left: left, position:'absolute'});
  });
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


function toggleSVG(cell, two, shape) {
  var isEnlarged = cell.data("isEnlarged");

  if (isEnlarged) {
    // Shrink back to original size
    cell.css({
      position: "absolute",
      width: two.width,
      height: two.height,
      zIndex: 1
    });

    shape.translation.set(two.width / 2, two.height / 2);
    shape.scale = 1;
    // Remove text if it exists
    var text = shape.children.find(child => child instanceof Two.Text);
    if (text) {
      shape.remove(text);
    }
    two.update();
  } else {
    // Enlarge to cover the entire screen
    var newWidth = $(window).width();
    var newHeight = $(window).height();
    var newCenterX = newWidth / 2;
    var newCenterY = newHeight / 2;
    var scaleFactor = Math.max(newWidth / two.width, newHeight / two.height);

    cell.css({
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 9999,
      transition: "width 1s, height 1s"
    });

    two.width = newWidth;
    two.height = newHeight;
    two.update();

    

    two.bind("update", function() {
      shape.scale += (scaleFactor - shape.scale) * 0.1;
      shape.translation.set(newCenterX, newCenterY);

      if (Math.abs(shape.scale - scaleFactor) < 0.01) {
        shape.scale = scaleFactor;
        two.unbind("update");
      }
    });

    two.play();
  }

  cell.data("isEnlarged", !isEnlarged);
}
