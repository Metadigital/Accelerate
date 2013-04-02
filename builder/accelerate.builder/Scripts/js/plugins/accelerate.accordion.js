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
}(jQuery));