var $ = require('jquery');
global.jQuery = require('jquery');

require('../libs/jquery.columnizer');

function splitColumns() {
	jQuery('#columns').columnize({ width: 460 });
}

module.exports = splitColumns;