/*
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