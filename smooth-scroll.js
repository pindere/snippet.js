(function($) {
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    var href = $(this).attr('href');
    var target = $(href === "#" || href === "" ? 'html' : href);
    var targetOffset = target.offset().top;

    $('body, html').animate({
      scrollTop: targetOffset
  }, 600);
  });
})(jQuery);