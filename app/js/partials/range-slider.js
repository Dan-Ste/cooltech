var $ = require('jquery');

require('jquery-ui/slider');

var sliderRange = $("#slider-range");
var fromVal = $("#from");
var toVal = $("#to")

function initSlider() {
	$('#slider-range').slider({
		range: true,
    min: 0,
    max: 30000,
   	values: [ 1000, 13000 ],
   	step: 100,
   	slide: function( event, ui ) {
      fromVal.val(sliderRange.slider("values", 0));
			toVal.val(sliderRange.slider("values", 1));
    }
	})

	fromVal.val(sliderRange.slider("values", 0));
	toVal.val(sliderRange.slider("values", 1));

	fromVal.on('change', function() {
		sliderRange.slider( "values", 0, fromVal.val() );
	});

	toVal.on('change', function() {
		sliderRange.slider( "values", 1, toVal.val() );
	});
};

module.exports = initSlider;