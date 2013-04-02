/*
* Accelerate Carousel v1.1.2
*/

/*global jQuery*/
(function ($) {

    "use strict";

    // General variables.
    var supportTransition = $.support.transition,

    // The Carousel object that contains our methods.
        Carousel = function (element, options) {

            this.$element = $(element);
            this.options = $.extend({}, $.fn.carousel.defaults, options);

            if (this.options.slide) {

                // Handle a slide instruction.
                this.slide(this.options.slide);
            }

            if (this.options.pause === "hover") {
                // Bind the mouse enter/leve events
                this.$element.on("mouseenter", $.proxy(this.pause, this))
                             .on("mouseleave", $.proxy(this.cycle, this));
            }

        };

    Carousel.prototype = {
        constructor: Carousel,
        cycle: function (event) {

            if (!event) {
                // Flag false when there's no event.
                this.paused = false;
            }

            if (this.options.interval && !this.paused) {

                // Cycle to the next item on the set interval
                (this.interval = window.setInterval($.proxy(this.next, this), this.options.interval));
            }

            // Return the carousel for chaining.
            return this;
        },
        goto: function (position) {

            var $activeItem = this.$element.find(".carousel-active"),
                $children = $activeItem.parent().children(),
                activePosition = $children.index($activeItem),
                self = this;

            // Since the index is zero based we need to subtract one.
            position = position -= 1;

            if (position > ($children.length) || position < 0) {

                return;
            }

            if (this.sliding) {

                // Fire the slid event.
                return this.$element.one("slid.carousel.accelerate", function () {
                    // Reset the position.
                    self.goto(position + 1);

                });
            }

            if (activePosition === position) {
                return this.pause().cycle();
            }

            return this.slide(position > activePosition ? "next" : "prev", $($children[position]));

        },
        pause: function (event) {

            if (!event) {
                // Mark as paused
                this.paused = true;

            }

            // Clear the interval and return the carousel for chaining.
            window.clearInterval(this.interval);
            this.interval = null;

            return this;

        },
        next: function () {

            if (this.sliding) {
                return;
            }

            return this.slide("next");
        },
        prev: function () {

            if (this.sliding) {
                return;
            }

            return this.slide("prev");
        },
        slide: function (type, next) {

            var $activeItem = this.$element.find(".carousel-active"),
                $nextItem = next || $activeItem[type](),
                isCycling = this.interval,
                isNext = type === "next",
                direction = isNext ? "left" : "right",
                fallback = isNext ? "first" : "last",
                self = this,
                slideEvent = $.Event("slide.carousel.accelerate"),
                slidEvent = $.Event("slid.carousel.accelerate"),
                slideMode = this.$element.hasClass("carousel-slide"),
                fadeMode = this.$element.hasClass("carousel-fade");

            // Mark as sliding.
            this.sliding = true;

            if (isCycling) {
                // Pause if cycling.
                this.pause();
            }

            // Work out which item to slide to.
            $nextItem = $nextItem.length ? $nextItem : this.$element.find(".carousel-item")[fallback]();

            if ($nextItem.hasClass("carousel-active")) {
                return;
            }

            if (supportTransition && (slideMode || fadeMode)) {

                // Trigger the slide event.
                this.$element.trigger(slideEvent);

                if (slideEvent.isDefaultPrevented()) {
                    return;
                }

                // Good to go? Then let's slide.
                $nextItem.addClass(type);
                $nextItem[0].offsetWidth; // Force reflow.

                // Do the slide.
                $activeItem.addClass(direction);
                $nextItem.addClass(direction);

                // Tag the thumbnails.
                var index = $nextItem.index(),
                    $thumbnails = this.$element.find("[data-carousel-slide]").parent("li").removeClass("on");

                $thumbnails.eq(index).addClass("on");

                // Callback.
                this.$element.one(supportTransition.end, function () {

                    $nextItem.removeClass([type, direction].join(" ")).addClass("carousel-active");
                    $activeItem.removeClass(["carousel-active", direction].join(" "));

                    self.sliding = false;
                    self.$element.trigger(slidEvent);

                });
            } else {

                // Trigger the slide event.
                this.$element.trigger(slideEvent);

                if (slideEvent.isDefaultPrevented()) {
                    return;
                }

                $activeItem.removeClass("carousel-active");
                $nextItem.addClass("carousel-active");

                // Tag the thumbnails.
                var index = $nextItem.index(),
                    $thumbnails = this.$element.find("[data-carousel-slide]").parent("li").removeClass("on");

                $thumbnails.eq(index).addClass("on");

                self.sliding = false;
                self.$element.trigger(slidEvent);
            }

            // Restart the cycle.
            if (isCycling) {

                this.cycle();
            }

            return this;
        }
    };

    /* Plugin definition */
    $.fn.carousel = function (options) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("crsl"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("crsl", (data = new Carousel(this, opts)));
            }

            if (typeof options === "number") {
                // Cycle to the given number.
                data.goto(options);

            } else if (typeof options === "string" || (options = opts.slide)) {

                data[options]();

            } else if (data.options.interval) {
                data.cycle();
            }

        });

    };

    // Define the defaults.
    $.fn.carousel.defaults = {
        interval: 5e3,
        pause: "hover"
    };

    // Set the public constructor.
    $.fn.carousel.Constructor = Carousel;

    $(document).bind("ready.carousel.accelerate", function () {

        $("[data-carousel]").each(function () {

            var $this = $(this),
                options = $this.data("carousel") || {};

            $this.carousel(options).on("click.carousel.accelerate", "[data-carousel-slide]", function (event) {

                event.preventDefault();

                var $this = $(this),
                    options = $this.data("carouselSlide") || {},
                    $target = $(event.delegateTarget),
                    $trigger = $this.parent("li");


                // Flag that the carousel slider has been triggered.
                $target.find("[data-carousel-slide]").parent("li").not($trigger).removeClass("on");

                $trigger.addClass("on");

                // Run the carousel method.
                $target.carousel(options);

            });

        });

    });

}(jQuery));