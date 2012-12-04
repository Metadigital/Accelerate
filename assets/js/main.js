
/* Document specific script */
(function ($) {

    $(window).load(function () {

        // IE7 Doesn't support Rainbow at present.
        if (!$("html").hasClass("lt-ie8")) {
            $.getScript("assets/js/rainbow-custom.min.js");
        }
    });

}(jQuery));