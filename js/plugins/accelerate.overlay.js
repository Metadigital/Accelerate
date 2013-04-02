/*
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

}(jQuery));