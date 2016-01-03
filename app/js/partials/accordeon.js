var $ = require('jquery');

function initAccordeon() {
	$('.accordeon__trigger').on('click', function() {
		$(this).toggleClass('accordeon__trigger--close');
		$(this).siblings('.accordeon__content').slideToggle();
	});
}

module.exports = initAccordeon;