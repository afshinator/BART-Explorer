 var stations = {
    '12TH': '12th St. / Oakland City Center',
    '16TH': '16th St. Mission',
    '19TH': '19th St. Oakland',
    '24TH': '24th St. Mission',
    'ASHB': 'Ashby',
    'BALB': 'Balboa Park',
    'BAYF': 'Bay Fair',
    'CAST': 'Castro Valley',
    'CIVC': 'Civic Center',
    'COLS': 'Coliseum / Oakland Airport',
    'COLM': 'Colma',
    'CONC': 'Concord',
    'DALY': 'Daly City',
    'DBRK': 'Downtown Berkeley',
    'DUBL': 'Dublin / Pleasanton',
    'DELN': 'El Cerrito del Norte',
    'PLZA': 'El Cerrito Plaza',
    'EMBR': 'Embarcadero',
    'FRMT': 'Fremont',
    'FTVL': 'Fruitvale',
    'GLEN': 'Glen Park',
    'HAYW': 'Hayward',
    'LAFY': 'Lafayette',
    'LAKE': 'Lake Merritt',
    'MCAR': 'MacArthur',
    'MLBR': 'Millbrae',
    'MONT': 'Montgomery St.',
    'NBRK': 'North Berkeley',
    'NCON': 'North Concord/Martinez',
    'ORIN': 'Orinda',
    'PITT': 'Pittsburg / Bay Point',
    'PHIL': 'Pleasant Hill',
    'POWL': 'Powell St.',
    'RICH': 'Richmond',
    'ROCK': 'Rockridge',
    'SBRN': 'San Bruno',
    'SANL': 'San Leandro',
    'SFIA': 'SFO Airport',
    'SHAY': 'South Hayward',
    'SSAN': 'South San Francisco',
    'UCTY': 'Union City',
    'WCRK': 'Walnut Creek',
    'WDUB': 'West Dublin / Pleasanton',
    'WOAK': 'West Oakland',
    'SPCL': 'Special'
  };

function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}


function setupBrowserResizeHandler( fx ) {
  var win$ = $( window ),
      onResize = function() {
        win$.off( 'resize' );                   // turn off handler for a bit
        fx();
        window.setTimeout( function() {
          win$.on( 'resize', onResize );
        }, 1500 );
      };

  win$.on( 'resize', onResize );
}


function popUpMessage( x, y, msg, who ) {
  $locator1.empty().css( 'top', y ).css( 'left', x ).append( '<small>' + msg + '</small>' + who);
  $locator1.fadeIn();
}


$(function() {
  var origin, 
      dest,
      savedPrefs = false,
      $origin = $('#origin'),
      $dest = $('#dest')
      $info = $('#infoArea'),
      $fare = $('#fare'),
      $arrive = $('#arrive'),
      $locator1 = $('#locator1')
      $thePic = $('#thePic');


  var popUps = function() {
    var popUpList = [],

      createAt = function( x, y, msg, who ) { 
        var aPopUp = {
            msg : msg,
            who : who,
            on : false,
            el : undefined
          },
          markup = '<div id="popUp' + popUpList.length + '" class="locator"><small>' + msg + '</small>' + who + '</div>',
          el$;

        $thePic.append( markup );       // inject popUp into Dom
        el$ = $thePic.find( '#popUp' + popUpList.length );
        el$.append( markup ).css( 'top', y ).css( 'left', x );
        el$.fadeIn();
        aPopUp.el = el$;
        popUpList.push( aPopUp );

        if ( popUpList.length === 1 ) setupBrowserResizeHandler( redrawAll );
        return (popUpList.length - 1);
      },
      redrawAll = function() { console.log('redrawAll() called.'); },
      eraseAll = function() { 
        for (var i = popUpList.length - 1; i >= 0; i-- ) {
          popUpList[i].el.remove();
          popUpList.pop();
        }
      },
      hideAll = function() { };


    return {
      createAt : createAt,
      redrawAll: redrawAll,
      hideAll : hideAll
    };

  }();



  var getOriginDest = function() {
      origin = $origin.find('option:selected').val();
      dest = $dest.find('option:selected').val();

      console.log( 'orig: ' + origin );
      console.log( 'dest: ' + dest );            
  };

  var fillSelectControl = function() {
      var str = '';
      for (var key in stations) {
          str += '<option value="' + key + '">' + stations[key] + '</options>';
      }
      $origin.empty().append( str );
      $dest.empty().append( str );
  };

  var init = function() {
      var storageData = {};

      $('img[usemap]').rwdImageMaps();        // jquery plugin call to enable responsive image maps

      fillSelectControl();
      getOriginDest();
      $('select').change( function() { getOriginDest(); } );

      if ( ! supports_html5_storage() ) console.err('No localStorage');
      else {
          if ( localStorage.bartgoer !== undefined ) {
              storageData = JSON.parse( localStorage.bartgoear );
          }
      }

      $locator1.hide();
  }();


  $('area').on('click', function(e) {
      // alert($(this).attr('alt') + ' clicked');
var msg = "Handler click called at ";
msg += e.pageX + ", " + e.pageY;
console.log(msg);
console.log( '- name: ' + $(this).attr('alt') );

      // popUpMessage( event.pageX, event.pageY, msg, $(this).attr('alt') );  
      popUps.createAt( e.pageX, e.pageY, msg, $(this).attr('alt') );
  });


  $('area').on('mouseover mouseout', function(event) {
var msg = "Handler for .mousemove() called at ";
msg += event.pageX + ", " + event.pageY;
console.log(msg);
console.log( 'name ' + $(this).attr('alt') );
      if (event.type == 'mouseover') {
          $(this).data('bgcolor', $(this).css('background-color'));
          $(this).css('background-color','rgba(255,0,0,.5)');
      } else {
          $(this).css('background-color', $(this).data('bgcolor'));
      }
      return false;
  });




  $fare.click(function(){
      var url = 'http://api.bart.gov/api/sched.aspx?cmd=fare&orig=' + origin + '&dest=' + dest,
          thisCache = $(this);

      thisCache.addClass('button-warning');
      $.get( url, function( data ) {
          var txt = '<p>fare: $' + $(data).find('fare').text() + '</p>';
          txt += '<small>From ' + origin + ' to ' + dest + '</small>';
          $info.empty().append( txt );
          console.log( 'fare : $' + $(data).find('fare').text() );
          thisCache.fadeOut(400).removeClass('button-warning').fadeIn();
      });
  });

  $arrive.click( function() {
      var url = 'http://api.bart.gov/api/sched.aspx?cmd=arrive&orig=' + origin + '&dest=' + dest,
          thisCache = $(this);

      url += '&date=now&b=2&a=2&l=1';
      thisCache.addClass('button-warning');
      $.get( url, function( data ) {

          console.log(  data );
          thisCache.fadeOut(400).removeClass('button-warning').fadeIn();
      });            

  });


});