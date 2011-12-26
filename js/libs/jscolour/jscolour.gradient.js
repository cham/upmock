
jscolour.gradientPicker = function(opts) {

  var CSS = '<style>' +
    '.colour-input { margin-top: 5px; border:1px solid black; height: 20px; width:30px; float: left; }' +
    '.gradientBox { height: 20px; border: 1px solid #000; }' +
    '.angle-picker { float: right; }' +
    '</style>';

  $(document.body).append(CSS);

  var box = $('<div>', {'class': 'gradientBox'});
  var domStops = $('<div>', {'class': 'stops'});
  var colourDiv = $('<div>', {'class': 'colour-input'});

  var wrapper = $('<div>', {style:'padding-top: 20px;'});

  var angleInput = $('<input type="number" />');
  var angle = 90;

  var colourInput = $('<input>', {
    'type': 'color',
    'style': 'position:absolute; visibility:hidden; margin-top: 20px;'
  });

  var selected = null;
  var stops = [];

  function init() {

    opts.$domStyle.css('position', 'relative');
    opts.$domStyle.append(box);
    opts.$domStyle.append(domStops);

    wrapper.append(colourDiv);
    wrapper.append(colourInput);
    wrapper.append(angleInput);

    opts.$domStyle.append(wrapper);

    if (!opts.initial) {
      stops.push({position: 0, colour: '#FFF'});
      stops.push({position: 50, colour: 'green'});
      stops.push({position: 100, colour: '#000'});
    }

    new jscolour.picker({
      $domStyle: colourDiv,
      $domValue: colourInput
    });

    var anglePicker = new jscolour.anglePicker({
      $domValue: angleInput
    });

    colourDiv.bind('mousedown', function(e) {
      colourInput.trigger('focus');
    });

    colourInput.bind('change', function(e) {
      if (selected !== null) {
        stops[selected].colour = e.target.value;
        drawBox();
        drawStops();
      }
    });

    anglePicker.input.bind('change input', function() {
      angle = this.value;
      drawBox();
    });


    opts.$domStyle.bind('mousedown', mouseDown);
    box.bind('dblclick', doubleClick);

    drawBox();
    drawStops();
  }


  function doubleClick(e) {
    stops.push({position: Math.round((e.offsetX / box.width()) * 100), colour: '#666'});
    drawBox();
    drawStops();
  }


  function mouseDown(e) {

    var orig = e.target;
    var $obj = $(e.target);

    if (!$obj.is('.color-stop')) {
      return;
    }

    e.preventDefault();

    selected = $obj.data('index');

    var colour = $obj.css('background-color');
    var width = box.width();
    var start = {left: box.offset().left};

    colourDiv.css('background', colour);

    $(document.body).bind('mousemove.moving', function(e) {

      var x = e.clientX - start.left;

      if (x > width) {
        x = width;
      } else if (x < 0) {
        x = 0;
      }

      stops[selected].position = Math.round(x / width * 100);
      $obj.css({left: x + 'px'});
      drawBox();
    });

    $(document.body).bind('mouseup.moving', function(e) {
      $(document.body).unbind('.moving');
    });

  }

  function stopColorChanged(e) {
    stops[$(e.target).data('index')].colour = e.target.value;
    drawBox();
  }

  function drawBox() {

    var stopsHtml = [];

    var tmp = stops.slice(0);
    tmp.sort(function(a, b) {
      return a.position > b.position;
    });

    $.each(tmp, function(i, x) {
      stopsHtml.push(x.colour + ' ' + x.position + '%');
    });

    var x = parseInt(angle, 10) + 90;
    if (x > 360) {
      x -= 360;
    }

    var css = '-webkit-linear-gradient(' + x + 'deg, ' + stopsHtml.join(',') + ')';
    box.css('background', '-webkit-linear-gradient(0deg, ' + stopsHtml.join(',') + ')');

    opts.$domValue.val(css).trigger('change');
  }

  function drawStops() {

    domStops.empty();

    $.each(stops, function(i, x) {

      var stopDiv = $('<div>', {
        'data-index': i,
        'class': 'color-stop',
        css: {
          'background': x.colour,
          position: 'absolute',
          left: x.position + '%'
        }
      });

      domStops.append(stopDiv);

    });
  }

  init();

};