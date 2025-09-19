var shapes;

// Personal poems for the secret garden
var personalPoems = [
  {
    title: "dear old lover",
    text: `I got a message from an old boyfriend, asking me to be penpals, 
and wishing me well. But dating him was like chasing the wind. 

It's wild that I chased the wind. When I felt like running after 
something, and something felt like nothing and now nothing keeps 
trying to play tag.

I know how the wind feels.
Somedays I think 
I'll meet you outside my window, 
but when I look out 
all I see is rain.`
  },
  {
    title: "tuesday night",
    text: `Hey I know it's late, but I think I left some of my stuff at your place.
I think the back of my neck maybe somewhere near your ps3. Or maybe
by your bong.
I think I may have left my favorite pair of socks and the 
small of my back. I mean what really matters is that black dress, 
I kinda need it this weekend 
Oh, and also that point when it hurt and I fought back tears. 
I can wait until the weekend, but if you're home and still up, 
could I pop in and grab my stuff?`
  },
  {
    title: "bumps",
    text: `bumps left. bumps right. big hands 

no consent. bumps. brush. coast. wrap. lope. rope. 

no words. no exchange. just bumps and bumps 

gropes and grabs 

unwrapping my presents, tearing paper`
  },
  {
    title: "young drivers",
    text: `constantly thinking. chaotic.
i'm constantly thinking. neurotic.
accelerate. foot's on the gas.
ready to brake. turn. check the mirror.
fifteen seconds ahead. flip a switch. switch a lane
turn. slow down. angle & timing. distance & angle.
turn the wheel slowly. gradual. smooth. controlled.

what does he think. time ticks. ticks of the signal.
silence.
speak. check mirrors.
fifteen seconds ahead of us.
fifteen miles of decisions in the rear view of
my psyche.`
  },
  {
    title: "Untitled Poem #4",
    text: `There is a glass that separates me from you.
I can't tell if its visable, if its clear or opaque

There is a glass that separates me from you.
I think you can see it. I think you know its there.
Stares. staring at me.
Or are they staring at the glass.

If they looked away, did they look away from the divide.
Did they look away from me.

There's a glass that separates me from you.
Its stiff. Its thick. Its Cold. Like classroom lighting.
Its enclosing. Its plastic wrap. And I
don't have enough air to breathe.`
  },
  {
    title: "sensitivity",
    text: `a blessing and a curse
imagine too much sensitivity
couldn't swallow a bite because
i could feel it too much in my throat.
place your hand on my shoulder
slap.
a rush of electricity upon contact.

like a fox on the highway, dodging
judgement, anxiety, social disturbance
speak. check mirrors.
ten over the speed limit.

wildfire kisses.
eye contact like splinters.
but he can't hide a smirk.`
  }
];

function getRandomPoem() {
  return personalPoems[Math.floor(Math.random() * personalPoems.length)];
}

window.addEventListener('load', () => {
  if (document.readyState === "complete") {
    setup();
  }
});


window.onresize = function() {
    setup();
}

// $(function() {
//   setup();
// });

function setup() {
  var height = $('body').height();
  var width = $('body').width();
  var svgSize = 120;
  var padding = 30;

  var isMobile = window.matchMedia("only screen and (max-width: 850px)").matches ||
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var isOtherMediaQuery = window.matchMedia("only screen and (min-width:1080px)").matches;
  if(isMobile && !isOtherMediaQuery) {
    svgSize = 250;
    padding = 40;
  }

  var rows = Math.floor(height / svgSize) + 1.5; // Add 1.5 rows: 1 full + 0.5 for 1/4 cutoff
  rows = Math.ceil(rows); // Round up to ensure we have enough rows
  var cols = Math.floor(width / svgSize) + 1; // Add extra column for better coverage
  var radius = Math.floor(Math.max(width, height) / Math.max(rows, cols)) / 2;

  shapes = makeFlowers(radius);
  addSvgs(svgSize + padding, rows, cols);
  var divSize = $("#cell0").outerWidth();
  positionCells(cols, divSize);
}

function addSvgs(size, rows, cols) {
  $('body').empty();
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var cellId = "cell" + ((r * cols) + c);
      var cell = $("<div/>").addClass("cell").attr("id", cellId).appendTo('body');
      $(cell).css({display: "inline-block"});
    }
  }

  $(".cell").each(function (i, o) {
    var two = new Two({
      width: size,
      height: size
    }).appendTo(o);
    var shape = pickFlower(shapes);
    shape.translation.set(two.width / 2, two.height / 2);
    two.add(shape);
    two.update();

    $(o).on("click", function() {
      toggleSVG($(o), two, shape);
    });
  });
}

function positionCells(cols, size) {
  // Add offset to cut off 1/4 of top row (show 3/4)
  var verticalOffset = -size / 6;
  
  $(".cell").each(function (i, o) {
    var r = Math.floor(i / cols);
    var c = i % cols;
    var top = (size * r) + verticalOffset;
    var left = size * c;
    // Offset odd rows
    if (r % 2) {
      left -= (size/2);
    }
    $(this).css({top: top, left: left, position:'absolute'});
  });
}

function roseMath(radius, v, k, t) {
  v.x = radius * Math.cos(k * t) * Math.cos(t);
  v.y = radius * Math.cos(k * t) * Math.sin(t);
  return v;
}

function makeFlowers(radius) {
  var flowers = [];
  var resolution = 240; // every flower has 240 points
  for (var k = 4; k < 24; k++) {
    var points = [];
    for (var j = 0; j < resolution; j++) {
      points[j] = new Two.Anchor();
      roseMath(radius, points[j], k, Math.PI * 2 * j / resolution);
    }
    // Create shape
    var flower = new Two.Path(points, true, true);
    flowers.push(flower);
  }
  return flowers;
}

function pickFlower(flowers) {
  var f = Math.floor(Math.random() * flowers.length);
  var flower = flowers[f].clone();
  var colors = ['tomato', 'orangered', 'floralwhite',
    'gold', 'red', 'darkorange'];
  colors = ['DARKMAGENTA', 'REBECCAPURPLE', 'SLATEBLUE', 'ROYALBLUE', '#9c27b0', '#9f9fff',
    'ALICEBLUE', 'PLUM', 'CORNFLOWERBLUE', 'DARKBLUE', 'MEDIUMBLUE', 'DARKSLATEBLUE'];
  var color = colors[Math.floor(Math.random() * colors.length)];
  flower.rotation = (Math.PI  / 2) * (Math.floor(Math.random() * 12) / 12);
  flower.stroke = color;
  flower.fill = color;
  flower.linewidth = 4;
  flower.cap = 'round';
  return flower;
}


function toggleSVG(cell, two, shape) {
  // Check if any poem is currently open
  var existingOverlay = $('.poem-overlay');
  
  if (existingOverlay.length > 0) {
    // If poem is open, close it with fade out
    console.log('Closing existing poem via flower click');
    
    // Use CSS transition instead of jQuery fadeOut
    existingOverlay.removeClass('visible');
    
    setTimeout(() => {
      console.log('Fade out complete, removing element');
      existingOverlay.remove();
      $('.cell').data("isEnlarged", false);
      $(document).off('keydown.poem-overlay');
    }, 800);
  } else {
    // If no poem is open, show a new one
    console.log('Opening new poem via flower click');
    var poem = getRandomPoem();
    var poemOverlay = $(`
      <div class="poem-overlay">
        <div class="poem-container">
          <h3 class="poem-title">${poem.title}</h3>
          <div class="poem-text">${poem.text.replace(/\n/g, '<br>')}</div>
          <div class="poem-close">click any flower to close</div>
        </div>
      </div>
    `);
    
    $('body').append(poemOverlay);
    
    // Add ESC key handler
    $(document).on('keydown.poem-overlay', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        console.log('ESC key pressed, closing overlay');
        
        // Use CSS transition instead of jQuery fadeOut
        poemOverlay.removeClass('visible');
        
        setTimeout(() => {
          console.log('ESC fade out complete, removing element');
          poemOverlay.remove();
          $('.cell').data("isEnlarged", false);
          $(document).off('keydown.poem-overlay');
        }, 800);
      }
    });
    
    // Fade in the poem
    setTimeout(() => {
      poemOverlay.addClass('visible');
    }, 100);

    $('.cell').data("isEnlarged", true);
  }
}
