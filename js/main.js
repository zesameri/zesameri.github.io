
var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        
    }
}, 10);
$(changeHeader()); 
$(rotation()); 
function changeHeader() {
    var petals = $('#flower').children('a');

    petals.each(function () {
            $(this).hover(
            function() {
                $("#site-title").stop(true, true).fadeOut();
                $("#site-title").text(this.id);
                $("#site-title").fadeIn(200);
                $("body").css("background-color", this.attr("color"));
            }, 
            function() {
                $("#site-title").stop(true, true).fadeOut();
                $("#site-title").text("MEREDITH HOO");
                $("#site-title").fadeIn(200);
                $("body").css("background-color","black");
            })
    });
}
function rotation() {
    var $elie = $("#flower"), degree = 0, timer, multiplier=1;
    rotate();
    function rotate() {
        $elie.css({ WebkitTransform: 'rotate(' + degree + 'deg)'});  
        $elie.css({ '-moz-transform': 'rotate(' + degree + 'deg)'});                      
        timer = setTimeout(function() {
            if (degree > 180) {
                multiplier = -1;
            }
            if (degree < 0){
                multiplier = 1;
            }
            degree+=(multiplier * 0.25);
            rotate();
        },5);
    }
    
    $("#flower").hover(function() {
        clearTimeout(timer);
    }, function() {
        rotate();
    });
}