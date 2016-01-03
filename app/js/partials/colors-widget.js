var $ = require('jquery');

function selectColor() {
	$('.colors-list').on('click', function(e) {
		var elem = e.target;
		if(elem.tagName.toLowerCase() === 'li') {
			$('.colors-list__item').removeClass('colors-list__item--active');
			$(elem).addClass('colors-list__item--active');
		}

	});
}

module.exports = selectColor;