$(document).ready(function() {
	$(".goto").click(function() {
		let link = $(this).attr('ref');
		$('html,body').animate({
			scrollTop: $(link).offset().top},
			'slow');
	});
	$(".cell").click(function(){
		$(this).children(":visible").fadeOut();
		$(this).children(":hidden").delay(500).fadeIn();
	});
});
