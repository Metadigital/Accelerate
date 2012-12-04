/*!
* Accelerate GoogleMap v1.0.0
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


