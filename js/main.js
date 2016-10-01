$(document).ready(function() {
	$( ".snip1168 li" ).first().addClass('current');
	$(".goto").click(function() {
		let link = $(this).attr('ref');
		$('html,body').animate({
			scrollTop: $(link).offset().top},
			'slow');
	});
	$(".snip1168 li").click(function() {
		$(".snip1168 li").removeClass('current');
    $(this).addClass('current');
	})
});
