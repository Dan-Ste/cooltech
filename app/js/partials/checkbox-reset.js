var $ = require('jquery');

function resetCheckbox() {
	$('.input-list__reset').on('click', function(e) {
		e.preventDefault();

		$(this).parent()
					 .parent()
					 .find('input[type="checkbox"]')
					 .removeAttr('checked');
	});
}

module.exports = resetCheckbox;