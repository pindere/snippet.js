(function($) {
	// Attach Touch Event Plugin
	$.fn.touch = function(callback) {
		var t = 'ontouchstart' in window;
		var m = window.navigator.msPointerEnabled;
		var ts = m ? 'MSPointerDown' : t ? 'touchstart' : 'mousedown';
		var tm = m ? 'MSPointerMove' : t ? 'touchmove' : 'mousemove';
		var te = m ? 'MSPointerUp' : t ? 'touchend' : 'mouseup';
		var sX = 0;
		var sY = 0;

		return this.each(function() {
			var startT;
			$(this).bind(ts, function (e) {
				sX = t ? event.changedTouches[0]['pageX'] : e['pageX'];
				sY = t ? event.changedTouches[0]['pageY'] : e['pageY'];
				startT = +new Date();
			}).bind(tm, function(e) {
			}).bind(te, function (e) {
				var eX = t ? event.changedTouches[0]['pageX'] : e['pageX'];
				var eY = t ? event.changedTouches[0]['pageY'] : e['pageY'];
				
				var deffX = Math.abs(sX - eX);
				var deffY = Math.abs(sY - eY);
				var deff = +new Date() - startT;
				if (deff > 25 && deff < 500 && deffX < 20 && deffY < 20) { callback.call(this); }
			}).bind('click', function (e) {
				return false;
			});
		});
	};
	
	$.fn.swipe = function(option){
		var opt = $.extend({
			//default
			type: 'normal',
			sSlideTime: 500,
			bSlideTime: 550,
			autoChangeTime: 3000,
			prevBtn: '',
			nextBtn: '',
			signalList: '',
			signalCurrentClass: '',
			friction: 3
		}, option);

		var spt = new (function () {
			this.touch = 'ontouchstart' in window;
			this.mspointer = window.navigator.msPointerEnabled;
		})();

		// Attache Touch Event
		var onTouchStart = spt.mspointer ? 'MSPointerDown' : spt.touch ? 'touchstart' : 'mousedown';
		var onTouchMove = spt.mspointer ? 'MSPointerMove' : spt.touch ? 'touchmove' : 'mousemove';
		var onTouchEnd = spt.mspointer ? 'MSPointerUp' : spt.touch ? 'touchend' : 'mouseup';
		
		var bnrList;
		var signalList;
		var prevBtn;
		var nextBtn;
		var clone;
		var originalLength;
		var distance = 0;

		var disableTouch = false;
		var directionX;
		var currentPoint = 0;
		var currentX = 0;
		var maxX;
		var maxPoint;
		var lastPoint;

		var autoTimer = null;
		var hoverFlg = false;
		var swipeFlg = false;

		// Init
		switch (opt.type) {
			case 'normal':
				noRepeatInit(this);
				setSwipeEvent();
				setTouchEvent();
				break;
			case 'loop':
				init(this);
				setSwipeEvent();
				setTouchEvent();
				break;
			case 'auto_loop':
				init(this);
				setSwipeEvent();
				setTouchEvent();
				setHoverEvent();
				autoMove();
				break;
			default:
				noRepeatInit(this);
				setSwipeEvent();
				setTouchEvent();
				break;
		}
		
		// No animating move item
		function moveToDirectPosition(elem, x, y) {
			var translate = makeTransform(x);
			elem.css({
				'-webkit-transition': '0ms',
				'-moz-transition': '0ms',
				'-ms-transition': '0ms',
				'-o-transition': '0ms',
				'transition': '0ms',
				'-webkit-transform': translate,
				'-moz-transform': translate,
				'-ms-transform': translate,
				'-o-transform': translate,
				'transform': translate
			});
		}

		// Animating move item
		function moveToAnimation(point, swipe) {

			var newX;
			lastPoint = currentPoint;
			// Fix point
			if (point < 0) {
				currentPoint = 0;
			} else if (point > maxPoint) {
				currentPoint = maxPoint;
			} else {
				currentPoint = parseInt(point, 10);
			}
			newX = -distance * currentPoint;
			if (currentX == newX) { return };
			currentX = newX;
			directionX = (lastPoint < currentPoint) ? 1 : -1;
			// Set disable touch
			disableTouch = true;
			var x = newX;

			var t = swipe ? opt.sSlideTime + 'ms' : opt.bSlideTime + 'ms'
			var complete = function () { transitionend(swipe); };
			var translate = makeTransform(x);
			bnrList.css({
				'-webkit-transition': t,
				'-moz-transition': t,
				'-ms-transition': t,
				'-o-transition': t,
				'transition': t,
				'-webkit-transform': translate,
				'-moz-transform': translate,
				'-ms-transform': translate,
				'-o-transform': translate,
				'transform': translate
			}).one('transitionend', complete).one('webkitTransitionEnd', complete)
			  .one('mozTransitionEnd', complete).one('oTransitionEnd', complete).one('msTransitionEnd', complete);
		}

		// Attache Swipe Event
		function setSwipeEvent() {
			var basePageX;

			bnrList.bind(onTouchStart, function (e) {
				if (disableTouch) { return false; }
				if (!spt.touch) { e.preventDefault(); }

				if (spt.touch && opt.type == 'auto_loop') {
					clearTimeout(autoTimer);
					autoTimer = null;
				}

				// swipe start
				swipeFlg = true;

				basePageX = getPage(e, 'pageX');
				directionX = 0;
			}).bind(onTouchMove, function (e) {
				if (!swipeFlg) { return false; }
				var pageX = getPage(e, 'pageX');
				var pageY = getPage(e, 'pageY');

				var distX;
				var newX;
				
				e.preventDefault();
				e.stopPropagation();
				distX = pageX - basePageX;
				newX = currentX + distX;

				if (newX >= 0 || newX < maxX) { newX = Math.round(currentX + distX / opt.friction); }
				currentX = newX;
				moveToDirectPosition($(this), newX);
				directionX = (Math.abs(distX) <= 0) ? directionX :
									(distX > 0) ? -1 : 1;

				basePageX = pageX;
			});

			$(document).bind(onTouchEnd, function (e) {
				if (!swipeFlg) { return false; }
				// swipe end
				swipeFlg = false;

				var newPoint = - currentX / distance;
				newPoint = (directionX > 0) ? Math.ceil(newPoint) :
						   (directionX < 0) ? Math.floor(newPoint) : Math.round(newPoint);

				moveToAnimation(newPoint, true);
			});
		}

		// Attache Touch Event
		function setTouchEvent() {
			// prev button touch event
			if (prevBtn != null){
				prevBtn.touch(function () {
					if (disableTouch) { return false; }
					moveToAnimation(currentPoint - 1, false);
				});
			}

			// next button touch event
			if (nextBtn != null) {
				nextBtn.touch(function () {
					if (disableTouch) { return false; }
					moveToAnimation(currentPoint + 1, false);
				});
			}

			// signal touch event
			if (signalList != null) {
				signalList.touch(function () {
					if (disableTouch) { return false; }
					var index = signalList.index(this);
					var now = bnrList.children().eq(currentPoint).data('no');
					var moveCount = index - now;

					if (moveCount != 0) {
						moveToAnimation(currentPoint + moveCount, false);
					}
				});
			}

			// anchor touch event
			bnrList.find('a').touch(function () {
				location.href = $(this).attr('href');
			});
		}

		// Attache Hover Event
		function setHoverEvent() {
			if (spt.touch) { return; }
			
			var selector = bnrList.selector;

			selector = selector + (prevBtn != null ? ',' + opt.prevBtn : '');
			selector = selector + (nextBtn != null ? ',' + opt.nextBtn : '');
			selector = selector + (signalList != null ? ',' + opt.signalList : '');

			$(selector).hover(function () {
				hoverFlg = true;
				// clear timer
				clearTimeout(autoTimer);
				autoTimer = null;
			}, function () {
				hoverFlg = false;
				if (!swipeFlg) { autoMove(); }
			});
		}

		// repeat
		function init(target) {
			bnrList = target;
			signalList = $(opt.signalList).length > 0 ? $(opt.signalList) : null;
			prevBtn = $(opt.prevBtn).length > 0 ? $(opt.prevBtn) : null;
			nextBtn = $(opt.nextBtn).length > 0 ? $(opt.nextBtn) : null;
			bnrList.children().each(function (i) { $(this).data('no', i); });
			originalLength = bnrList.children().length;
			distance = bnrList.children().eq(0).outerWidth(true);

			if (signalList != null && originalLength < signalList.length) {
				signalList.slice(originalLength).remove();
			}

			bnrList.width(distance * (originalLength * 2 + 3));
			clone = bnrList.children().clone(true);
			var left = bnrList.children().eq(originalLength - 1).clone(true);
			var right = bnrList.children().slice(0, 2).clone(true);
			bnrList.append(clone).append(right).prepend(left);

			maxPoint = bnrList.children().length - 1;
			maxX = distance * maxPoint;
			currentPoint = originalLength + 1;
			currentX = -distance * currentPoint;
			moveToDirectPosition(bnrList, currentX);
		}

		// no repeat
		function noRepeatInit(target) {
			bnrList = target;
			signalList = $(opt.signalList).length > 0 ? $(opt.signalList) : null;
			prevBtn = $(opt.prevBtn).length > 0 ? $(opt.prevBtn) : null;
			nextBtn = $(opt.nextBtn).length > 0 ? $(opt.nextBtn) : null;
			bnrList.children().each(function (i) { $(this).data('no', i); });
			originalLength = bnrList.children().length;
			distance = bnrList.children().eq(0).outerWidth(true);

			if (signalList != null && originalLength < signalList.length) {
				signalList.slice(originalLength).remove();
			}
			if (prevBtn != null && prevBtn != null) {
				prevBtn.hide();
				nextBtn.show();
			}

			maxPoint = bnrList.children().length - 1;
			maxX = distance * maxPoint;
			currentPoint = 0;
			currentX = -distance * currentPoint;
			moveToDirectPosition(bnrList, currentX);
		}

		// make transform param
		function makeTransform(x, y) {
			return 'translate3d(' + (x || '0') + 'px, ' + (y || '0') + 'px, 0px)';
		}

		// get page info
		function getPage(e, page) {
			return spt.touch ? event.changedTouches[0][page] : e[page];
		}
		
		// Call at transition end
		function transitionend(swipe) {
			if (swipe) {
				disableTouch = false;
				if (lastPoint == currentPoint) return;
			} else {
				setTimeout(function() { disableTouch = false; }, 300);
			}

			var length = directionX > 0 ? bnrList.children().eq(currentPoint).nextAll().length :
				                          bnrList.children().eq(currentPoint).prevAll().length;

			if (length <= 1) {
				if (clone != undefined) {
					clone = clone.clone(true);
					var first = clone.slice(2).clone(true);
					var second = clone.slice(0, 2).clone(true);
					bnrList.append(first).append(second).children().slice(0, originalLength).remove();
					currentPoint = originalLength + 1;
					currentX = -distance * currentPoint;
					moveToDirectPosition(bnrList, currentX);
				}
			}

			// change signal current
			if (signalList != null) {
				changeSignalCurrent(bnrList.children().eq(currentPoint).data('no'));
			}

			if (opt.type == 'normal' && prevBtn != null && nextBtn != null) {
				if (currentPoint == 0) {
					prevBtn.hide();
					nextBtn.show();
				} else if (currentPoint == maxPoint) {
					prevBtn.show();
					nextBtn.hide();
				} else {
					prevBtn.show();
					nextBtn.show();
				}
			}

			if (opt.type == 'auto_loop') {
				if (spt.touch) {
					autoMove();
				} else if (!hoverFlg) {
					autoMove();
				}
			}
		}

		// change signal current
		function changeSignalCurrent(no) {
			signalList.removeClass(opt.signalCurrentClass).eq(no).addClass(opt.signalCurrentClass);
		}

		// auoto loop
		function autoMove() {
			// clear timer
			clearTimeout(autoTimer);
			autoTimer = null;

			autoTimer = setTimeout(function () {
				moveToAnimation(currentPoint + 1, false);
			}, opt.autoChangeTime)
		}
	};
})(jQuery);