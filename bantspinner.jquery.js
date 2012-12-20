/**
 * BantSpinner
 * @author Thomas Brunström
 * Usage: $(<element>).bantSpinner( options );
 * Options :  {delay : 6000, animationLength : 600 }
 * delay : How long between transitions
 * animationLength is set in the css default 600ms
 * Thanks to Jon Raasch (http://jonraasch.com) for
 * transition support code: https://gist.github.com/373874
 */
;(function ( $, window, document, undefined ) {
	var pluginName = "bantSpinner",
		defaults = {
			animationLength : 600,
			delay : 5000
		};
	function Plugin(element, options ) {
		this.element = $(element);
		this.options = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this.internal = {
			minheight : 0,
			outerHeight : 0,
			blocks : [],
			cnt : 1,
			total : 0,
			$flipContainer : null,
			self : null
		};

		this.init();
	}

	Plugin.prototype = {
		init : function() {
			var internal = this.internal;
			this.internal.$flipContainer = this.element.wrap('<div class="flip-container"></div>').parent();
			if(this.internal.$flipContainer.find('li').length > 1) {
				this.element.children('li').each(function(ind) {
					var $spacer = $(this);
					internal.minheight = (internal.minheight < $spacer.height() ? internal.minheight = $spacer.height() : internal.minheight);
					internal.outerHeight = (internal.outerHeight < $spacer.outerHeight() ? internal.outerHeight = $spacer.outerHeight() : internal.outerHeight);
				});
				this.element.children('li').css('min-height', this.internal.minheight + 'px');
				this.element.children('li').each(function(ind) {
					internal.total++;
					var $this = $(this);
					internal.blocks.push($this.html());
					if(ind == 0) {
						$this.addClass('front');
					}
					else if(ind == 1) {
						$this.addClass('back');
					}
					else {
						$this.remove();
					}
				});
				internal.$flipContainer.css('min-height', internal.outerHeight+'px');
				if(this.support()) {
					this.doSomeFlipping(this, this.options, this.internal);
				}
				else {
					this.doSomeFading(this, this.options, this.internal);
				}
			}
		},
		doSomeFlipping : function(self, settings, internal) {
			setTimeout(function() {
				internal.$flipContainer.addClass('flipped');
				self.element.children('.front').fadeOut(settings.animationLength / 2);
				setTimeout(function() {
					internal.cnt++;
					if(internal.cnt == internal.total) {
						internal.cnt = 0;
					}
					self.element.children('.front').remove();
					var $li = $('<li />', {
						'class' : 'content front',
						'style' : 'min-height: '+self.internal.outerHeight+'px; display: none;'
					}).append(internal.blocks[internal.cnt]);
					self.element.append($li);
					setTimeout(function() {
						internal.$flipContainer.removeClass('flipped');
						internal.$flipContainer.find('.front').fadeIn(settings.animationLength / 2);
						setTimeout(function() {
							internal.cnt++;
							if(internal.cnt == internal.total) {
								internal.cnt = 0;
							}
							self.element.children('.back').remove();
							var $li = $('<li />', {
								'class' : "content back",
								'style' : "min-height: "+self.internal.outerHeight+'px;'
							}).append(internal.blocks[internal.cnt]);
							self.element.append($li);
						},settings.animationLength);
						self.doSomeFlipping(self,settings,internal);
					},settings.delay);
				}, settings.animationLength);
			},settings.delay);
		},
		doSomeFading : function(self, settings, internal) {
			setTimeout(function() {
				internal.cnt++;
				if(internal.cnt == internal.total) {
					internal.cnt = 0;
				}
				var $li = $('<li />', {
					'class' : 'content front',
					'style' : 'min-height: '+self.internal.outerHeight+'px; display: none;'
				}).append(internal.blocks[internal.cnt]);
				self.element.append($li);
				self.element.children('li:visible').fadeOut(settings.animationLength,function() {$(this).remove();});
				self.element.children('li:hidden').fadeIn(settings.animationLength);
				self.doSomeFading(self, settings,internal);
			}, settings.delay);
		},
		support : function() {
			var thisBody = document.body || document.documentElement,
			thisStyle = thisBody.style,
			support = thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
			return support;
		}
	};

	$.fn[pluginName] = function ( options ) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin( this, options ));
			}
		});
	};
})( jQuery, window, document );
