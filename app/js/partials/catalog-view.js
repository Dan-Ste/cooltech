var $ = require('jquery');

function changeView() {
  $('.view-switch__link').on('click', function(e) {
    e.preventDefault();

    var switchWrapper = $('#switch-view-wrapper');
    var switchLinks = $('.view-switch__link');

    switchLinks.removeClass('view-switch__link--active');
    $(this).addClass('view-switch__link--active');

    if( $(this).hasClass('view-switch__link--view1') ) {
      switchWrapper.removeClass();
    } else if( $(this).hasClass('view-switch__link--view2') ) {
      switchWrapper.removeClass();
      switchWrapper.addClass('catalog-view2');
    } else if( $(this).hasClass('view-switch__link--view3') ) {
      switchWrapper.removeClass();
      switchWrapper.addClass('catalog-view3');
    }
  });
}

module.exports = changeView;