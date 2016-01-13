
<<<<<<< HEAD
var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
    }
}, 10);

var svgdoc = null;
var svgwin = null;
var object = document.getElementById('flower');
if (object && object.contentDocument)
	svgdoc = object.contentDocument;
else try {
	svgdoc = object.getSVGDOcument();
}
catch (exception) {
	console.log('Neither the HTMLObjectElement nor the GetSVGDocument interface are implemented');
}
if (svgdoc && svgdoc.defaultView)
	svgwin = svgdoc.defaultView;
else if (object.window)
	svgwin = object.window;
else try {
	svgwin = object.getWindow();
}
catch(exception) {
	console.log('The DocumentView interface is not supported\r\n' +
      'Non-W3C methods of obtaining "window" also failed');
}
console.log(svgdoc.getElementsByTagName("path"));

/*
for (petal in petals) {
	petal.hover(function() {
			$("#site-title").text(this.id);
		}, 
		function() {
			$("#site-title").text("MEREDITH HOO");
		});
}



Adding Animation
=======
/*var petals = $('#flower').children('svg').children('path');
petals.each(function () {
    console.log(this.id);
});
*/
var svg = $('#flower').svg({loadURL: './assets/flower.svg'});
var paths = svg.children('path');
paths.each(function () {
    console.log(this.id);
});
/*
>>>>>>> parent of fd4366f... added site icon and small animation
var rotation = 0;

jQuery.fn.rotate = function(degrees) {
    $(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
    return $(this);
};

$('.rotate').click(function() {
    rotation += 5;
    $(this).rotate(rotation);
});
*/