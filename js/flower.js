// Make an instance of two and place it on the page.
//width: window.innerWidth, height: window.innerHeight
var two = new Two({ fullscreen: true }).appendTo(document.body);
var petal = two.makeCircle(-70, 0, 50);
var circle2 = two.makeCircle(-90, 5, 10);