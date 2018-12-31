// We're making 20 flowers
// each is made of 240 pretty points
var resolution = 240;
var radius = 200;
var two;

for (var k = 2, i = 0; k < 41; k++) {
  $('body').append('<div class="canvas" id="twocanvas' + i + '"></div>');
  // Setup the canvas
  var two = new Two({
      autostart: true
  }).appendTo(document.getElementById('twocanvas' + i));
  i++;

  var points = [];
  for (var j = 0; j < resolution; j++) {
    points[j] = new Two.Anchor();
    roseMath(points[j], k, Math.PI * 2 * j / resolution);
  }
  // Create shape
  var shape = two.makeCurve(points);
  // Center Shape to div
  two.scene.translation.set(two.width / 2, two.height / 2);
  // Style the shape
  shape.fill = 'rgb(0, 0, 0)';
  shape.stroke = 'rgb(255, 255, 255)';
  shape.linewidth = 6;
  two.update();
}

function roseMath(v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}
