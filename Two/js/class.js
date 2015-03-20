//var elem = document.getElementById('draw-shapes').children[0];


function Effect(shape, x, y, width, height) {
  this.shape = shape;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.display = function() {
    var sq = two["make"+square.shape](x, y, width, height);
    sq.fill("rgb(255,255,255)");

  }
}

var two = new Two({ width: 800, height: 800 }).appendTo(document.body);
var background = two.makeRectangle(two.width/2, two.height/2, two.width, two.height);
background.fill= 'rgb(0, 0, 0)';
var orX = two.width/2;
var orY = two.height/2;


var square = new Effect("Rectangle", two.width/2, two.height/2, 100, 100);


two.bind('update', function(frameCount) {
  
}).play();  // Finally, start the animation loop
two.update();
