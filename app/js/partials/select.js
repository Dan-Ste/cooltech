var $ = require('jquery');

require('select2');

function changeSelect() {
  $('.custom-select').select2({
    minimumResultsForSearch: Infinity
  });
}

module.exports = changeSelect;