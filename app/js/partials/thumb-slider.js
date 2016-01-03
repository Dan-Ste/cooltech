var $ = require('jquery');

function initSlider() {
	$('.thumbs').on('click', function(e) {
		var elem = e.target;

		if(elem.tagName.toLowerCase() === 'img') {
			var bigImage = $(elem).data('imgBig');
			var thumbs = $(elem).parent().parent().parent();

			thumbs.find('.thumbs__item ').removeClass('thumbs__item--active');
			$(elem).parent().addClass('thumbs__item--active');
			thumbs.find('.current-slide__image').attr('src', bigImage);
		}
	})
}

module.exports = initSlider;