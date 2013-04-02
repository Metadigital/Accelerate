/*! ==|== Accelerate 1.1.2 =======================================================
 *  Author: James South - MetaDigital
 *  twitter : http://twitter.com/MetadigitalUK
 *            http://twitter.com/James_M_South
 *  github : https://github.com/Metadigital/Accelerate
 *  Copyright (c) 2012,  MetaDigital.
 *  Licensed under the Apache License v2.0.
 *  ============================================================================== 
 */

/*!
* Accelerate Feature Tests v1.1.2
*/

/*global jQuery*/
(function ($) {

    "use strict";

    var el = document.createElement("accelerate"),
        testProps = function (props) {
            var type = $.isArray(props) ? "a" : "o";
            for (var i in props) {

                var prop = (type === "a" ? props[i] : i);

                if (el.style[prop] !== undefined) {
                    return prop;
                }
            }
            return false;
        };


    $.support.transition = (function () {
        // Returns a value indicating whether the browser supports css transitions.
        // Can't stick this in an immediately invoking function as tilt would affect results.

        var transitionTests = {
            "transition": "transitionend",
            "WebkitTransition": "webkitTransitionEnd",
            "MozTransition": "transitionend",
            "OTransition": "otransitionend"
        },
            support = testProps(transitionTests);

        return support && {
            end: (function () {

                return transitionTests[support];

            }())
        };

    }());

    $.support.viewport = function () {
        // Determines the viewport type based on the document width.
        // These values match the enumeration in our media queries.
        var width = $(document).width();

        if (width <= 480) {

            return "mobile";

        } else if (481 >= width || width <= 767) {

            return "portrait-tablet";
        }
        else if (768 >= width || width <= 979) {

            return "landscape-tablet";
        }
        else {

            return "desktop";
        }

    };

}(jQuery));
/*
* Accelerate Accordion v1.1.2
*/

/*global jQuery*/
(function ($) {

    "use strict";

    // General variables.
    var supportTransition = $.support.transition,

    // The Accordion object that contains our methods.
        Accordion = function (element, options) {

            this.$element = $(element);
            this.options = $.extend({}, $.fn.accordion.defaults, options);

            if (this.options.parent) {
                this.$parent = $(this.options.parent);
            }

            // Check to see if the plugin is set to toggle and trigger 
            // the correct internal method if so.
            if (this.options.toggle) {
                this.toggle();
            }

        };

    // Assign public methods via the Accordion prototype.
    Accordion.prototype = {

        constructor: Accordion,
        dimension: function () {
            // return the dimension option.
            return this.options.dimension;
        },
        show: function () {
            var dimension = this.dimension(),
            // Get the scroll height/width of the element.
                scroll = $.camelCase(["scroll", dimension].join("-")),
                actives = this.$parent && this.$parent.find(".xpnd"),
                hasData;

            if (actives && actives.length) {
                hasData = actives.data("acc");
                actives.accordion("hide");
                hasData || actives.data("acc", null);
            }

            this.$element[dimension](0);
            this.$element[dimension](this.$element[0][scroll]);
            this.transition("addClass", "show", "shown");

        },
        hide: function () {
            var dimension = this.dimension();

            this.reset(this.$element[dimension]());
            this.transition("removeClass", "hide", "hidden");
            this.$element[dimension](0);
        },
        reset: function (size) {
            var dimension = this.dimension();
            this.$element
                .removeClass("cllps")
                [dimension](size || "auto")[0]
                .offsetWidth; // force reflow 
            // http://functionsource.com/post/dont-be-trigger-happy-how-to-not-trigger-layout

            this.$element[size || size >= 0 ? "addClass" : "removeClass"]("cllps");

            return this;
        },
        transition: function (method, startEvent, completeEvent) {
            var self = this,
            complete = function () {
                // The event to expose.
                var eventToTrigger = $.Event(completeEvent + ".accordion.accelerate");

                if (startEvent === "show") {
                    self.reset();
                }
                self.$element.trigger(eventToTrigger);
            }

            this.$element.trigger(startEvent)[method]("xpnd")

            supportTransition && this.$element.hasClass("cllps") ?
                this.$element.one(supportTransition.end, complete) :
                complete();
        },
        toggle: function () {
            // Run the correct command based on the presence of the class 'xpnd'.
            this[this.$element.hasClass("xpnd") ? "hide" : "show"]();

        }

    };

    /* Plugin definition */
    $.fn.accordion = function (options) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data("acc"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("acc", (data = new Accordion(this, opts)));
            }

            // Run the appropriate function is a string is passed.
            if (typeof options === "string") {
                data[options]();
            }

        });

    };

    // Define the defaults.
    $.fn.accordion.defaults = {
        toggle: true,
        dimension: "height"
    };

    // Set the public constructor.
    $.fn.accordion.Constructor = Accordion;

    // Accordian data api initialisation.
    $(function () {
        $(document.body).on("click.accordion.accelerate", "[data-accordion]", function (event) {

            event.preventDefault();

            var $this = $(this),
                options = $this.data("accordion") || {},
                target = options.target || (options.target = $this.attr("href")),
                params = $(target).data("acc") ? "toggle" : options;

            // Run the accordion method.
            $(target).accordion(params);

        });
    });
}(jQuery));/*
* Accelerate Overlay v1.1.2
*/

/*global jQuery*/
(function ($) {

    "use strict";

    var // General elements that hold the overlay.
        $body = $(document.body),
        $blackout = $("<div/>").addClass("ovrly-blackout fade"),
        $wrapper = $("<div/>").addClass("ovrly-wrapper"),
        $overlay,
        $overlayHeader,
        $overlayClose,
        $overlayBody,
        $overlayIframe,
        $overlayFooter,
        $overlayCombined,
        supportTransition = $.support.transition,
        rhashed = /^[#\.]/,
        // Taken from jQuery.
        rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        rlocalProtocol = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
        rexternalHost = RegExp("//" + document.location.host + "($|/)"),

        // Private Methods
        calculatePosition = function ($elem) {
            // Calculates the position of the given element.
            var thisLeft = $elem.offset().left,
                thisTop = $elem.offset().top,

                parentLeft = $body.offset().left,
                parentTop = $body.offset().top;

            return {
                left: thisLeft - parentLeft,
                top: thisTop - parentTop
            };
        },
        isExternalUrl = function (url) {
            // Split the url into into it's various parts.
            var locationParts = rurl.exec(url);

            // Target is a local protocal.
            if (locationParts === null || rlocalProtocol.test(locationParts[1])) {
                return false;
            }

            // If the regex doesn't match return true . 
            return !rexternalHost.test(locationParts[2]);

        },
        create = function (callback) {

            if (this.isShown) {
                var local = !this.options.external,
                    close = this.options.close,
                    header = this.options.header,
                    footer = this.options.footer,
                    target = this.options.target,
                    iframe = this.options.iframe || !local ? isExternalUrl(target) : false;

                // Set the base overlay structure.
                $overlay = $("<div/>").addClass("ovrly fade");
                $overlayBody = $("<div/>").addClass("ovrly-body");

                // 1: Build the header
                if (header || close) {

                    // Add header text if necessary
                    $overlayHeader = $("<div/>").addClass("ovrly-header")
                                                .html(header ? "<h1>" + header + "</h1>" : "");

                    if (close) {
                        $overlayClose = $("<a/>")
                                        .attr("href", "#")
                                        .addClass("close")
                                        .html("x")
                                        .click($.proxy(function (event) {
                                            event.preventDefault();
                                            this.hide();
                                        }, this))
                                        .appendTo($overlayHeader);
                    }

                }

                // 2: Build the content
                if (local) {
                    this.$placeholder = $("<div/>")
                                        .addClass("ovrly-placeholder")
                                        .insertAfter(this.$element);

                    this.$element.detach().appendTo($overlayBody).removeClass("hidden");

                }
                else {

                    // Add the loader indicator to the overlay
                    $overlay.addClass("loader");

                    if (iframe) {

                        $overlayIframe = $("<iframe/>")
                            // Yuuuuuck! I wanted to do this with css so much!
                                        .attr({
                                            "scrolling": this.options.iframeScroll ? "yes" : "no",
                                            "allowTransparency": true,
                                            "frameborder": 0,
                                            "src": target
                                        })
                                        .load($.proxy(function () {
                                            $overlay.removeClass("loader");
                                        }, this))
                                        .appendTo($overlayBody);

                    } else {

                        // Standard ajax load.
                        $overlayBody.load(target, function () {
                            $overlay.removeClass("loader");
                        });

                    }
                }

                // 3: Build the footer
                if (footer) {

                    // Add footer text if necessary
                    $overlayFooter = $("<div/>").addClass("ovrly-footer")
                                                .html(footer ? footer : "");
                }

                // Combine and add to the dom.
                $overlayCombined = $overlayHeader.after($overlayBody)
                                                 .after($overlayFooter);

                $overlayCombined.appendTo($overlay);

                // Append the overlay and blackout elements to the dom.
                $blackout.appendTo($body);
                $overlay.appendTo($wrapper);
                $wrapper.appendTo($body);

                // Fade in.
                if (supportTransition) {
                    $blackout[0].offsetWidth; // force reflow
                }

                $blackout.addClass("opaque");

                // Bind the click events
                $blackout.click($.proxy(this.hide, this));
                $wrapper.click($.proxy(function (event) {

                    if (event.target === $wrapper[0]) {
                        this.hide();
                    }

                }, this));

                // Call the callback.
                supportTransition ? $blackout.one(supportTransition.end, callback)
                           : callback();

            }

        },

        destroy = function (callback, event) {

            if (!this.isShown) {

                if (event) { event.preventDefault(); }

                // Fade out
                $blackout.removeClass("opaque");
                $overlay.removeClass("opaque")[0].offsetWidth; // force reflow

                if (supportTransition) {

                    var self = this,
                        timeout = setTimeout(function () {
                            self.$element.off(supportTransition.end);
                            callback.call(self);
                        }, 500);

                    this.$element.one(supportTransition.end, function () {
                        clearTimeout(timeout);
                        callback.call(self);
                    });

                } else {

                    callback.call(this);

                }

            }

        },

        escape = function () {

            if (this.isShown && this.options.keyboard) {
                $body.on("keyup.dismiss.overlay.accelerate", $.proxy(function (event) {
                    if (event.which === 27) {
                        this.hide();
                    }
                }, this));
            } else if (!this.isShown) {
                $body.off("keyup.dismiss.overlay.accelerate");
            }

        },

        // The Overlay object that contains our methods.
        Overlay = function (element, options, event) {

            this.$element = $(element);
            this.options = $.extend({}, $.fn.overlay.defaults, options);
            // Fallback to the element if triggered from a string.
            this.$trigger = $(event.target || element);

            // Toggle the overlay.
            this.toggle();
        };

    Overlay.prototype = {
        constructor: Overlay,
        show: function () {

            if (this.isShown) { return; }

            var local = !this.options.external,
                self = this,
                showEvent = $.Event("show.overlay.accelerate");

            this.isShown = true;
            this.$element.trigger(showEvent);

            // Add keyboard functionality if required.
            if (this.options.keyboard) {
                escape.call(this);
            }

            // Create the overlay with the callback.
            create.call(this, function () {

                var shownEvent = $.Event("shown.overlay.accelerate"),
                    ismobileViewPort = $.support.viewport() === "mobile" || $.support.viewport() === "portrait-tablet";

                if (supportTransition) {
                    $overlay[0].offsetWidth; // force reflow
                }

                // Position the overlay absolutely for crosshair mode.
                if (self.options.crosshair || ismobileViewPort) {

                    // Get the position of the original trigger.
                    var position = calculatePosition(self.$trigger),
                        x = position.left,
                        y = position.top;

                    if (ismobileViewPort) {
                        y = y - self.$trigger.height();
                        // Recalculate to adjust for height.
                        $overlay.css({ "margin-top": y });
                    }
                    else {
                        // Recalculate to adjust for height.
                        y = y - ($overlay.innerHeight());
                        $overlay.css({ "margin-top": y, "margin-left": x });
                        $wrapper.addClass("abs");
                    }
                }

                // Fade in
                $overlay.addClass("opaque");

                // TODO: Add mobile tweak.


                // Trigger the shown event.
                supportTransition ? self.$element.one(supportTransition.end, function () { self.$element.trigger(shownEvent); })
                           : self.$element.trigger(shownEvent);

            });

        },
        hide: function (event) {

            if (!this.isShown) { return; }

            var self = this,
                hideEvent = $.Event("hide.overlay.accelerate");

            this.isShown = false;

            // Call the escape function.
            if (this.options.keyboard) {
                escape.call(this);
            }

            this.$element.trigger(hideEvent);

            // Destroy the overlay with the callback.
            destroy.call(this, function () {

                var local = !this.options.external,
                    iframe = this.options.iframe,
                    hiddenEvent = $.Event("hidden.overlay.accelerate");

                if (local) {
                    // Put that kid back where it came from or so help me..
                    this.$element.detach().insertAfter(this.$placeholder).addClass("hidden");

                    this.$placeholder.remove();
                    this.$placeholder = null;
                }

                // Remove the overlay and blackout content.
                $blackout.remove();
                $wrapper.removeClass("abs").empty().remove();

                this.$element.trigger(hiddenEvent);

            }, event);
        },
        toggle: function () {

            return this[!this.isShown ? "show" : "hide"]();

        }
    };

    /* Plugin definition */
    $.fn.overlay = function (options, event) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("ovrly"),
                opts = typeof options === "object" && options;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("ovrly", (data = new Overlay(this, opts, event)));
            }

            // Run the appropriate function is a string is passed.
            if (typeof options === "string") {
                data[options]();
            }

        });
    };

    // Define the defaults
    $.fn.overlay.defaults = {
        keyboard: true,
        close: true,
        external: false,
        iframe: false,
        crosshair: false,
        iframeScroll: false
    };

    // Set the public constructor.
    $.fn.overlay.Constructor = Overlay;

    $(function () {
        // Initialize the plugin.
        $body.on("click.overlay.accelerate", "[data-overlay]", function (event) {

            event.preventDefault();

            var $this = $(this),
                options = $this.data("overlay") || {},
                target = options.target || (options.target = $this.attr("href")),
            // Test the target param to see if we are dealing with an external target.
                isLocal = rhashed.test(target),
            // Set the options to pass.
                params = $(isLocal ? target : this).data("ovrly") ? "toggle" : $.extend({}, options, { external: !isLocal });

            // Run the overlay method.
            $(isLocal ? target : this).overlay(params, event);

        });

    });

}(jQuery));/*
* Accelerate GoogleMap v1.1.2
*/

/*global jQuery google*/
(function ($) {

    "use strict";

    // The GoogleMap object that contains our methods.
    var GoogleMap = function (element, options) {

        this.$element = $(element);
        this.options = $.extend({}, $.fn.googleMap.defaults, options);

        // Show the map if given options.
        if ($.isPlainObject(options)) {
            this.show();
        }

    },

    // Private methods.
        debounce = function (func, wait, immediate) {
            var args,
                result,
                thisArg,
                timeoutId;

            function delayed() {
                timeoutId = null;
                if (!immediate) {
                    func.apply(thisArg, args);
                }
            }

            return function () {

                var isImmediate = immediate && !timeoutId;
                args = arguments;
                thisArg = this;

                clearTimeout(timeoutId);
                timeoutId = setTimeout(delayed, wait);

                if (isImmediate) {
                    result = func.apply(thisArg, args);
                }
                return result;
            };
        };

    GoogleMap.prototype = {
        constructor: GoogleMap,
        map: null,
        markers: [],
        show: function () {

            var transition = $.support.transition,
                showEvent = $.Event("show.googlemap.accelerate"),
                $element = this.$element,
                element = $element[0],
                options = this.options,
                mapTypes = {
                    roadmap: function () {
                        return google.maps.MapTypeId.ROADMAP;
                    },
                    satellite: function () {
                        return google.maps.MapTypeId.SATELLITE;
                    },
                    hybrid: function () {
                        return google.maps.MapTypeId.HYBRID;
                    },
                    terrain: function () {
                        return google.maps.MapTypeId.TERRAIN;
                    }
                },
                mapOptions = {
                    zoom: options.zoom,
                    center: new google.maps.LatLng(options.center.lat, options.center.lng),
                    disableDefaultUI: options.disableDefaultUI,
                    mapTypeId: mapTypes.hasOwnProperty(options.mapTypeId) ? mapTypes[options.mapTypeId]() : mapTypes.roadmap()
                };

            // Google maps has an offset bug when initialized on a container set to display:none.
            // To fix this we load it offscreen then reposition it.
            if (options.hidden) {
                $element.addClass("map-off");
            }

            // Create the map and bind it to the current instance.
            this.map = new google.maps.Map(element, mapOptions);

            // Create a marker
            var markerOptions = {
                position: options.marker.lat ? new google.maps.LatLng(options.marker.lat, options.marker.lng) : mapOptions.center,
                map: this.map,
                title: options.marker.title
            };

            if (options.marker.icon) {
                markerOptions.icon = options.marker.icon;
            }

            // Add the marker to the array.
            this.markers.push(new google.maps.Marker(markerOptions));

            // Trigger the show event.
            $element.trigger(showEvent);

            // Move the map back into position on the tilesLoaded event.
            google.maps.event.addListener(this.map, "tilesloaded", function () {

                window.setTimeout(function () {

                    var shownEvent = $.Event("shown.googlemap.accelerate"),
                        complete = function () {

                            $element.trigger(shownEvent);

                        };

                    // Remove the map-off class
                    if (options.hidden) {
                        $element.removeClass("map-off");
                    }

                    if (transition) {
                        $element[0].offsetWidth; // force reflow
                    }

                    $element.addClass("opaque");

                    transition ? $element.one(transition.end, complete)
                            : complete();

                }, 500);

            });

        },
        resize: function () {

            var self = this,
                center = self.map.getCenter(),
                doResize = function () {

                    var resizedEvent = $.Event("resized.googlemap.accelerate"),
                        complete = function () {

                            self.$element.trigger(resizedEvent);

                        };

                    if (self.options.hidden) {
                        self.$element.addClass("map-off");
                    }

                    google.maps.event.trigger(self.map, "resize");

                    self.map.setCenter(center);

                    window.setTimeout(function () {

                        // Remove the map-off class
                        if (self.options.hidden) {
                            self.$element.removeClass("map-off");
                        }

                        // Trigger the resize event.
                        complete();

                    }, 500);

                };

            // Debounce the resize event.
            var delay = self.options.debounce ? 50 : 0,
                debouncedResize = debounce(doResize, delay);

            debouncedResize();
        }
    };

    /* Plugin definition */
    $.fn.googleMap = function (options) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("map"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("map", (data = new GoogleMap(this, opts)));
            }

            // Run the appropriate function is a string is passed.
            if (typeof options === "string") {
                data[options]();
            }

        });

    };

    /* Namespaced callback function */
    $.googleMapsLoaded = function () {

        $("[data-googlemap]").each(function () {

            var $this = $(this),
                options = $this.data("googlemap") || {};

            $this.googleMap(options);

        });
    };

    // Define the defaults.
    $.fn.googleMap.defaults = {
        hidden: false,
        mapTypeId: "roadmap",
        zoom: 16,
        center: {
            lat: null,
            lng: null
        },
        marker: {
            lat: null,
            lng: null,
            title: null,
            icon: null
        },
        disableDefaultUI: false,
        debounce: false
    };

    // Set the public constructor.
    $.fn.googleMap.Constructor = GoogleMap;

    $(window).bind("load.googlemap.accelerate", function () {
        if ($("[data-googlemap]").length) {
            // Load the script and fire the callback.
            $.getScript("http://maps.google.com/maps/api/js?sensor=false&callback=$.googleMapsLoaded");
        }
    });

    $(window).bind("resize.googlemap.accelerate", function () {

        $("[data-googlemap]").each(function () {

            var $this = $(this),
                googleMap = $this.data("map");

            if (googleMap && googleMap.map) {

                googleMap.resize();
            }

        });
    });

}(jQuery));


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

}(jQuery));/*
* Accelerate AutoSize v1.1.2
*/

/*global jQuery*/
(function ($) {

    "use strict";

    // The AutoSize object that contains our methods.
    var AutoSize = function (element, options) {

        this.$element = $(element);

        // Initial setup.
        if ($.isPlainObject(options)) {
            var self = this,
                createClone = function () {

                    // Create a clone and offset it.
                    self.$clone = self.$element.clone()
                                   .css({ "position": "absolute", "top": "-9999px", "left": "-9999px" })
                                   .attr({ "tabindex": -1, "rows": 2 })
                                   .removeAttr("id name")
                                   .insertAfter(self.$element);

                };

            this.options = $.extend({}, $.fn.autoSize.defaults, options);

            $.when(createClone()).then(self.size());
        }
    };

    AutoSize.prototype = {
        constructor: AutoSize,
        size: function () {
            var transition = $.support.transition,
                $element = this.$element,
                element = this.$element[0],
                $clone = this.$clone,
                clone = $clone[0],
                height = 0,
                options = this.options,
                sizeEvent = $.Event("size.autosize.accelerate"),
                sizedEvent = $.Event("sizen.autosize.accelerate"),
                complete = function () {
                    $element.trigger(sizedEvent);
                };

            $element.trigger(sizeEvent);

            // Copy the text accross
            $clone.val($element.val());

            // Set the height so animation will work.
            $element.height($clone.height());

            // Shrink
            while (clone.rows > 1 && clone.scrollHeight < clone.offsetHeight) {
                clone.rows -= 1;
            }

            // Grow
            while (clone.scrollHeight > clone.offsetHeight && height !== clone.offsetHeight) {
                height = element.offsetHeight;
                clone.rows += 1;
            }
            clone.rows += 1;

            // Reset the height
            $element.height($clone.height());

            // Do our callback
            transition ? $element.one(transition.end, complete)
                    : complete();

        }
    };

    /* Plugin definition */
    $.fn.autoSize = function (options) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("auto"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("auto", (data = new AutoSize(this, opts)));
            }

            // Run the appropriate function is a string is passed.
            if (typeof options === "string") {
                data[options]();
            }

        });
    };

    // Define the defaults. Not really necessary just now but future proof.
    $.fn.autoSize.defaults = {

    };

    // Set the public constructor.
    $.fn.autoSize.Constructor = AutoSize;

    // Accordian data api initialisation.
    $(document).bind("ready.autosize.accelerate", function () {

        $("textarea[data-autosize]").each(function () {

            var $this = $(this),
                options = $this.data("autosize") || {};

            // Run the autosize method.
            $this.autoSize(options);

            // Add further events.
            $(document.body).on("keyup.autosize.accelerate paste.autosize.accelerate cut.autosize.accelerate", "textarea[data-autosize]", function (event) {

                var $this = $(this),
                    delay = 0

                if (event.type === "paste" || event.type === "cut") {
                    delay = 5;
                }

                window.setTimeout(function () {

                    // Run the autosize method.
                    $this.autoSize("size");

                }, delay);
            });
        });
    });

}(jQuery));/*
* Accelerate tabs v1.1.2
*/

/*global jQuery*/
(function ($) {

    "use strict";

    // General variables.
    var supportTransition = $.support.transition,

        tab = function (postion, callback) {

            var showEvent = $.Event("show.tabs.accelerate"),
                $element = this.$element,
                $childTabs = $element.find("ul.tabs li"),
                $childPanes = $element.children("div"),
                $nextTab = $childTabs.eq(postion),
                $nextPane = $childPanes.eq(postion);

            this.tabbing = true;

            $element.trigger(showEvent);

            $childTabs.removeClass("tab-active")
            $nextTab.addClass("tab-active");

            $nextPane.addClass("tab-pane-active");
            $childPanes.filter(".opaque").removeClass("tab-pane-active opaque")

            $nextPane[0].offsetWidth; // reflow

            $nextPane.addClass("opaque");

            // Do the calback
            callback.call(this);

        },

    // The Tabs object that contains our methods.
        Tabs = function (element) {

            this.$element = $(element);
        };

    Tabs.prototype = {
        constructor: Tabs,
        show: function (position) {

            var $activeItem = this.$element.find(".tab-active"),
                $children = $activeItem.parent().children(),
                activePosition = $children.index($activeItem),
                self = this;

            if (position > ($children.length - 1) || position < 0) {

                return;
            }

            if (this.tabbing) {

                // Fire the tabbed event.
                return this.$element.one("shown.tabs.accelerate", function () {
                    // Reset the position.
                    self.show(position + 1);

                });
            }

            if (activePosition === position) {
                return;
            }

            // Call the function with the callback
            return tab.call(this, position, function () {

                var shownEvent = $.Event("shown.tabs.accelerate"),
                    self = this,
                    complete = function () {

                        self.$element.trigger(shownEvent);

                    };

                self.tabbing = false;

                // Do our callback
                supportTransition ? this.$element.one(supportTransition.end, complete)
                                  : complete();

            });

        }
    };

    /* Plugin definition */
    $.fn.tabs = function (options) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("tab");

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("tab", (data = new Tabs(this)));
            }

            // Show the given number.
            if (typeof options === "number") {
                data.show(options);
            }

        });

    };

    // Set the public constructor.
    $.fn.tabs.Constructor = Tabs;

    $(document).bind("ready.tabs.accelerate", function () {

        $("[data-tabs]").tabs().on("click.tabs.accelerate", "ul.tabs > li > a", function (event) {

            event.preventDefault();

            var $this = $(this),
                $li = $this.parent(),
                index = $li.index();

            $(event.delegateTarget).tabs(index);

        });

    });

}(jQuery));/*
* Accelerate Dismiss v1.1.2
*/

/*global jQuery*/
(function ($) {

    "use strict";

    var Dismiss = function (element, target) {

        this.$element = $(element);
        this.$target = this.$element.parents(target);

    };

    Dismiss.prototype = {
        constructor: Dismiss,
        close: function () {

            var supportTransition = $.support.transition,
                closeEvent = $.Event("close.dismiss.accelerate"),
                closedEvent = $.Event("closed.dismiss.accelerate"),
                $target = this.$target,
                complete = function () {

                    $target.addClass("hidden").trigger(closedEvent);

                };

            $target.addClass("opaque");

            $target.addClass("fade");

            $target[0].offsetWidth; // reflow

            $target.removeClass("opaque");


            // Do our callback
            supportTransition ? this.$target.one(supportTransition.end, complete)
                              : complete();

        }
    };

    /* Plugin definition */
    $.fn.dismiss = function (target) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("close");

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("close", (data = new Dismiss(this, target)));
            }

            // Close the element.
            data.close();

        });
    };

    // Set the public constructor.
    $.fn.dismiss.Constructor = Dismiss;

    // Accordian data api initialisation.
    $(function () {
        $(document.body).on("click.dismiss.accelerate", "[data-dismiss]", function (event) {

            event.preventDefault();

            var $this = $(this),
                options = $this.data("dismiss") || "",
                target = options || $this.attr("href");

            // Run the dismiss method.
            $(this).dismiss(target + ":first");

        });
    });

}(jQuery));