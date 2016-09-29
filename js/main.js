$(document).ready(function() {
	$(".hero button").click(function() {
		$('html,body').animate({
			scrollTop: $("#about-page").offset().top},
			'slow');
	});
});
