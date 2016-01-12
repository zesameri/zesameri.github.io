
var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
    }
}, 10);
console.log(readyStateCheckInterval);
var petals = $('#flower').children('svg').children('path');

petals.each(
	function () {
		$(this).hover(
		function() {
			$("#site-title").text(this.id);
		}, 
		function() {
			$("#site-title").text("MEREDITH HOO");
		})
});

/*
petals.each(function () {
	$( this ).mouseenter( 
		function() {
			$("#site-title").text(this.id);
		}).mouseleave( 
		function() {
		$("#site-title").text("this.id");
		})
});


Adding Animation
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

Making the code work for an external svg
var svg = $('#flower').svg('get');
var paths = svg.children('path');
paths.each(function () {
    console.log(this.id);
});


*/