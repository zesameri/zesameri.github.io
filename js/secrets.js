var shapes;

// Lyrics for the secret garden
var lyrics = [
  "the way that you smile",
  "when you talk in your sleep",
  "the way that you drool",
  "all over the sheets",
  "i think over",
  "and over",
  "and over again",
  "when will i",
  "when will i",
  "see you again",
  "<break>",
  "tell me 'bout your day",
  "give me a call",
  "you tripped me",
  "i fell",
  "i fall and i fall",
  "i fall over",
  "and over",
  "and over again",
  "the push and the pull",
  "of the dance that we're in",
  "when will i",
  "when will i",
  "when will i see you again"
];

var currentLyricIndex = 0;
var displayedLyrics = [];
var pathPositions = [];
var pathIndex = 0;
var usedPositions = [];

function getNextLyric() {
  if (currentLyricIndex >= lyrics.length) {
    // All lyrics have been shown, don't show any more
    return { text: "", isComplete: true };
  }
  
  var lyric = lyrics[currentLyricIndex];
  currentLyricIndex++;
  
  // Skip break markers
  if (lyric === "<break>") {
    return getNextLyric(); // Recursively get the next lyric
  }
  
  return { text: lyric, isComplete: false };
}

function clearAllLyrics() {
  $('.lyric-line').remove();
  displayedLyrics = [];
  pathIndex = 0;
  usedPositions = [];
}

function generateSpiralPath() {
  var width = $(window).width();
  var height = $(window).height();
  var margin = 100;
  var positions = [];
  
  // Create a spiral path that covers the screen with better spacing
  var centerX = width / 2;
  var centerY = height / 2;
  var maxRadius = Math.min(width, height) / 2 - margin;
  var angle = 0;
  var radius = 0;
  var radiusIncrement = 40; // Increased from 15 to 40 for better spacing
  var angleIncrement = 0.4; // Slightly increased for better distribution
  
  // Generate positions in a spiral pattern
  while (radius < maxRadius) {
    var x = centerX + Math.cos(angle) * radius;
    var y = centerY + Math.sin(angle) * radius;
    
    // Add some randomness to avoid perfect spiral
    var randomOffset = 20; // Reduced randomness to maintain better spacing
    x += (Math.random() - 0.5) * randomOffset;
    y += (Math.random() - 0.5) * randomOffset;
    
    // Keep within bounds
    x = Math.max(margin, Math.min(width - margin, x));
    y = Math.max(margin, Math.min(height - margin, y));
    
    positions.push({ x: x, y: y });
    
    angle += angleIncrement;
    radius += radiusIncrement;
  }
  
  // Add some additional random positions for better coverage with spacing
  for (var i = 0; i < 15; i++) {
    var attempts = 0;
    var validPosition = false;
    var x, y;
    
    while (!validPosition && attempts < 50) {
      x = Math.random() * (width - 2 * margin) + margin;
      y = Math.random() * (height - 2 * margin) + margin;
      
      // Check if this position is far enough from existing positions
      var minDistance = 80; // Minimum distance between positions
      validPosition = true;
      
      for (var j = 0; j < positions.length; j++) {
        var existingPos = positions[j];
        var distance = Math.sqrt(Math.pow(x - existingPos.x, 2) + Math.pow(y - existingPos.y, 2));
        if (distance < minDistance) {
          validPosition = false;
          break;
        }
      }
      
      attempts++;
    }
    
    if (validPosition) {
      positions.push({ x: x, y: y });
    }
  }
  
  return positions;
}

function getNextPosition() {
  if (pathPositions.length === 0) {
    pathPositions = generateSpiralPath();
  }
  
  if (pathIndex >= pathPositions.length) {
    // If we've used all positions, try to find a new position
    return findAlternativePosition();
  }
  
  var position = pathPositions[pathIndex];
  
  // Check for collision with existing lyrics
  if (hasCollision(position)) {
    // Try to find an alternative position
    return findAlternativePosition();
  }
  
  usedPositions.push({ x: position.x, y: position.y });
  pathIndex++;
  
  return position;
}

function hasCollision(position) {
  var minDistance = 100; // Minimum distance between lyrics
  
  for (var i = 0; i < usedPositions.length; i++) {
    var usedPos = usedPositions[i];
    var distance = Math.sqrt(Math.pow(position.x - usedPos.x, 2) + Math.pow(position.y - usedPos.y, 2));
    if (distance < minDistance) {
      return true;
    }
  }
  
  return false;
}

function findAlternativePosition() {
  var width = $(window).width();
  var height = $(window).height();
  var margin = 100;
  var attempts = 0;
  var maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    var x = Math.random() * (width - 2 * margin) + margin;
    var y = Math.random() * (height - 2 * margin) + margin;
    var position = { x: x, y: y };
    
    if (!hasCollision(position)) {
      usedPositions.push({ x: position.x, y: position.y });
      return position;
    }
    
    attempts++;
  }
  
  // If we can't find a good position, return the original spiral position
  var fallbackPosition = pathPositions[pathIndex % pathPositions.length];
  usedPositions.push({ x: fallbackPosition.x, y: fallbackPosition.y });
  pathIndex++;
  return fallbackPosition;
}

function adjustPositionForText(position, text) {
  var width = $(window).width();
  var height = $(window).height();
  var margin = 50;
  var textWidth = estimateTextWidth(text);
  var textHeight = 30; // Approximate height for one line of text
  
  var adjustedX = position.x;
  var adjustedY = position.y;
  
  // Adjust X position to keep text within bounds
  if (adjustedX + textWidth > width - margin) {
    adjustedX = width - textWidth - margin;
  }
  if (adjustedX < margin) {
    adjustedX = margin;
  }
  
  // Adjust Y position to keep text within bounds
  if (adjustedY + textHeight > height - margin) {
    adjustedY = height - textHeight - margin;
  }
  if (adjustedY < margin) {
    adjustedY = margin;
  }
  
  return { x: adjustedX, y: adjustedY };
}

function estimateTextWidth(text) {
  // Create a temporary element to measure text width
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  context.font = '1.2em Roboto Slab, serif';
  var metrics = context.measureText(text);
  
  // Add some padding and account for max-width constraint
  var estimatedWidth = Math.min(metrics.width + 20, 250);
  return estimatedWidth;
}

window.addEventListener('load', () => {
  if (document.readyState === "complete") {
    setup();
  }
});


window.onresize = function() {
    setup();
    // Regenerate path for new screen size
    pathPositions = [];
    pathIndex = 0;
    usedPositions = [];
}

// $(function() {
//   setup();
// });

function setup() {
  var height = $('body').height();
  var width = $('body').width();
  var svgSize = 120;
  var padding = 30;

  var isMobile = window.matchMedia("only screen and (max-width: 850px)").matches ||
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var isOtherMediaQuery = window.matchMedia("only screen and (min-width:1080px)").matches;
  if(isMobile && !isOtherMediaQuery) {
    svgSize = 250;
    padding = 40;
  }

  var rows = Math.floor(height / svgSize) + 1.5; // Add 1.5 rows: 1 full + 0.5 for 1/4 cutoff
  rows = Math.ceil(rows); // Round up to ensure we have enough rows
  var cols = Math.floor(width / svgSize) + 1; // Add extra column for better coverage
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
  // Add offset to cut off 1/4 of top row (show 3/4)
  var verticalOffset = -size / 6;
  
  $(".cell").each(function (i, o) {
    var r = Math.floor(i / cols);
    var c = i % cols;
    var top = (size * r) + verticalOffset;
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
  console.log('Getting next lyric via flower click');
  var lyricData = getNextLyric();
  
  if (lyricData.isComplete) {
    // All lyrics have been shown
    console.log('All lyrics have been displayed');
    return;
  }
  
  // Add new lyric line at predefined path position
  console.log('Adding new lyric line:', lyricData.text);
  var position = getNextPosition();
  
  // Adjust position to ensure text stays within bounds
  var adjustedPosition = adjustPositionForText(position, lyricData.text);
  
  var lyricLine = $(`
    <div class="lyric-line" style="left: ${adjustedPosition.x}px; top: ${adjustedPosition.y}px;">
      ${lyricData.text}
    </div>
  `);
  
  $('body').append(lyricLine);
  
  // Fade in the lyric line
  setTimeout(() => {
    lyricLine.addClass('visible');
  }, 100);
}
