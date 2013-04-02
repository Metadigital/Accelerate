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
