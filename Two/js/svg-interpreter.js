
$(function() {

  var type = /(canvas|webgl)/.test(url.type) ? url.type : 'svg';
  var two = new Two({
    type: Two.Types[type],
    fullscreen: true,
    autostart: true
  }).appendTo(document.body);

  var dimensions = 140;
  var shapes = [];
  var index = 0;
  var length = 0;
  var scale = two.width > two.height ? two.height / dimensions : two.width / dimensions;
  var easing = 0.125;
  //each of the svgs
  $('#assets svg').each(function(i, el) {

    var shape = two.interpret(el).center();
    shape.fill = 'white';
    shape.visible = false;
    shape.noStroke();
    shape.translation.set(two.width / 2, two.height / 2);
    //adds shape to shapes array
    shapes.push(shape);
    _.each(shape.children, function(child) {
      _.each(child.vertices, function(v) {
        v.ox = v.x;
        v.oy = v.y;
      });
    });

  });

  length = shapes.length;

  two.bind('update', function() {

    var shape = shapes[index];
    shape.visible = true;
    shape.scale += (scale - shape.scale) * easing;

    _.each(shape.children, function(child) {
      _.each(child.vertices, function(v) {
        var x = v.ox + Math.random();
        var y = v.oy + Math.random();
        v.set(x, y);
      });
    });

    if (shape.scale >= (scale - 0.001)) {
      shape.visible = false;
      shape.scale = 0;
      index = (index + 1) % length;
    }

  });

});
