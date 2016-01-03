var $ = require('jquery');

function addDots() {
  var descriptions = $('.description__text');

  for (var i = descriptions.length - 1; i >= 0; i--) {
    $(descriptions[i]).html( $(descriptions[i]).html() + "..." )
  };
}

module.exports = addDots;
