(function($) {
  $('a[href^="#"]').on('click', function(e) {
    e.preventDefault();
    let href = $(this).attr('href');
    let target = $(href === "#" || href === "" ? 'html' : href);
    let targetOffset = target.offset().top;

    $('body, html').animate({
      scrollTop: targetOffset
  }, 600);
  });
})(jQuery);