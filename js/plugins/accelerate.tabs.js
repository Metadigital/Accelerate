/*
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

}(jQuery));