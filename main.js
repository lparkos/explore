$(function(){
  
    function set(key, value) { localStorage.setItem(key, value); }
    function get(key)        { return localStorage.getItem(key); }
    function increase(el)    { set(el, parseInt( get(el) ) + 1); }
    function decrease(el)    { set(el, parseInt( get(el) ) - 1); }
  
    var toTime = function(nr){
      if(nr == '-:-') return nr;
      else { var n = ' '+nr/1000+' '; return n.substr(0, n.length-1)+'s'; }
    };
  
    function updateStats(){
      $('#stats').html('<div class="padded"><h2>Figures: <span>'+
        '<b>'+get('flip_won')+'</b><i>Won</i>'+
        '<b>'+get('flip_lost')+'</b><i>Lost</i>'+
        '<b>'+get('flip_abandoned')+'</b><i>Abandoned</i></span></h2>'+
        '<ul><li><b>Best Casual:</b> <span>'+toTime( get('flip_casual') )+'</span></li>'+
        '<li><b>Best Medium:</b> <span>'+toTime( get('flip_medium') )+'</span></li>'+
        '<li><b>Best Hard:</b> <span>'+toTime( get('flip_hard') )+'</span></li></ul>'+
        '<ul><li><b>Total Flips:</b> <span>'+parseInt( ( parseInt(get('flip_matched')) + parseInt(get('flip_wrong')) ) * 2)+'</span></li>'+
        '<li><b>Matched Flips:</b> <span>'+get('flip_matched')+'</span></li>'+
        '<li><b>Wrong Flips:</b> <span>'+get('flip_wrong')+'</span></li></ul></div>');
    };
  
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex;
      while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }
      return array;
    };
  

    /* LOAD GAME ACTIONS */
  
    // Toggle start screen cards
    $('.card:not(".twist")').on('click', function(e){
      $(this).toggleClass('active').siblings().not('.twist').removeClass('active');
      if( $(e.target).is('.playnow') ) { $('.row .card').last().addClass('active'); }
    });


    // Expand Host Q
    $('.reveal').on('click', function(event){ // Added event here
      event.stopPropagation(); 
      event.preventDefault();
      $('.host-q').toggleClass('show');
  });
  
  $('.reveal-research').on('click', function(event){ // And here
      event.stopPropagation(); 
      event.preventDefault();
      $('.research-q').toggleClass('show');
  });
  
    // Start game
    $('.play').on('click', function(){
      increase('flip_abandoned');
          $('.info').fadeOut();
  
      var difficulty = '',
          timer      = 1000,
          level      = $(this).data('level');
  
      // Set game timer and difficulty   
      if     (level ==  8) { difficulty = 'casual'; timer *= level * 4; }
      else if(level == 18) { difficulty = 'medium'; timer *= level * 5; }
      else if(level == 32) { difficulty = 'hard';   timer *= level * 6; }	    
  
      $('#g').addClass(difficulty);
  
      $('.row').fadeOut(250, function(){
        var startGame  = $.now(),
            obj = [];
  
        // Create and add shuffled cards to game
        for(i = 0; i < level; i++) { obj.push(i); }
  
        var shu      = shuffle( $.merge(obj, obj) ),
            cardSize = 100/Math.sqrt(shu.length);
  
        for(i = 0; i < shu.length; i++){
          var code = shu[i];
          if(code < 10) code = "0" + code;
          if(code == 30) code = 10;
          if(code == 31) code = 21;
          $('<div class="card" style="width:'+cardSize+'%;height:'+cardSize+'%;">'+
              '<div class="flipper"><div class="f"></div><div class="b" data-f="&#xf0'+code+';"></div></div>'+
            '</div>').appendTo('#g');
        }
  
        // Set card actions
        $('#g .card').on({
          'mousedown' : function(){
            if($('#g').attr('data-paused') == 1) {return;}
            var data = $(this).addClass('active').find('.b').attr('data-f');
  
            if( $('#g').find('.card.active').length > 1){
              setTimeout(function(){
                var thisCard = $('#g .active .b[data-f='+data+']');
  
                if( thisCard.length > 1 ) {
                  thisCard.parents('.card').toggleClass('active card found').empty(); //yey
                  increase('flip_matched');
  
                  // Win game
                  if( !$('#g .card').length ){
                    var time = $.now() - startGame;
                    if( get('flip_'+difficulty) == '-:-' || get('flip_'+difficulty) > time ){
                      set('flip_'+difficulty, time); // increase best score
                    }
  
                    startScreen('nice');
                  }
                }
                else {
                  $('#g .card.active').removeClass('active'); // fail
                  increase('flip_wrong');
                }
              }, 401);
            }
          }
        });
  
        // Add timer bar
        $('<i class="timer"></i>')
          .prependTo('#g')
          .css({
            'animation' : 'timer '+timer+'ms linear'
          })
          .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
            startScreen('fail'); // fail game
          });
  
        // Set keyboard (p)ause and [esc] actions
        $(window).off().on('keyup', function(e){
          // Pause game. (p)
          if(e.keyCode == 80){
            if( $('#g').attr('data-paused') == 1 ) { //was paused, now resume
              $('#g').attr('data-paused', '0');
              $('.timer').css('animation-play-state', 'running');
              $('.pause').remove();
            }
            else {
              $('#g').attr('data-paused', '1');
              $('.timer').css('animation-play-state', 'paused');
              $('<div class="pause"></div>').appendTo('body');
            }
          }
          // Abandon game. (ESC)
          if(e.keyCode == 27){
            startScreen('flip');
            // If game was paused
            if( $('#g').attr('data-paused') == 1 ){
              $('#g').attr('data-paused', '0');
              $('.pause').remove();
            }
            $(window).off();
          }
        });
      });
    });
    
  });