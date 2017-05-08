$(document).ready(function() {
	$(".goto").click(function() {
		let link = $(this).attr('ref');
		$('html,body').animate({
			scrollTop: $(link).offset().top},
			'slow');
	});
	
});
