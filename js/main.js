
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