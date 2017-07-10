$(document).ready(function() {
	$(".goto").click(function() {
		let link = $(this).attr('ref');
		$('html,body').animate({
			scrollTop: $(link).offset().top},
			'slow');
	});
	$(".cell").click(function(){
		$(this).children(":visible").fadeOut(1);
		$(this).children(":hidden").delay(500).fadeIn();
		if ($(this).find(".back:visible")) {
			$(this).siblings().fadeOut();
			$(this).parent().siblings().fadeOut();
		}
		if ($(this).find(".front:visible")) {
			$(".flex-row").delay(1000).show();
			$(".cell").delay(1000).show();
		}
	});
});
