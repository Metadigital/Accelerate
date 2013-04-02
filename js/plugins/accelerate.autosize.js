/*
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

}(jQuery));