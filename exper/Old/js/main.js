$(document).ready(function() {
	$(".goto").click(function() {
		let link = $(this).attr('ref');
		$('html,body').animate({
			scrollTop: $(link).offset().top},
			'slow');
	});
	$(".cell").click(function(){
		if ($(this).find(".front:visible")) {
			$(this).children().fadeOut();
			$(this).siblings().fadeOut();
			$(this).parent().siblings().fadeOut();
			$(this).children(":hidden").delay(500).fadeIn();
		}
		if ($(this).find(".back:visible")) {
			$(this).children(":visible").fadeOut(1);
			$(this).children(":hidden").delay(500).fadeIn();
			$(".flex-row").delay(1000).show();
			$(".cell").delay(1000).show();
		}
	});
});
