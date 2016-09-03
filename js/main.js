$(document).ready(function() {
	
	resizeMenu();
	
	$("button").click(function() {
		$('html,body').animate({
			scrollTop: $(".menu").offset().top},
			'slow');
	});
	
	
	
});

function resizeMenu() {
	if ($(window).width() > $(window).height()) {
		$('pure-u-1-2 pure-u-lg-1-3').each(function() {
			var oneThird = 1/3;
			$(this).width(oneThird + "%");
			$(this).height("50%");
		})
	} else {
		$('pure-u-1-2 pure-u-lg-1-3').each(function() {
			$(this).width("50%");
		})
	}
}