define(['jquery'], function ($) {

    var Imager = function (opts) {
        // Available image widths
        this.widths = opts.availableWidths || [320, 640, 1024];
        // regex for replacing correct section of the img src
        this.regex = opts.regex || /^(.+\/)\d+$/i;
        // Is this.resizeImages currently running?
        this.is_resizing = false;
        // Convert divs to imgs
        this.change_divs_to_imgs();
        // Kick off image enhancement
        this.init_resize_images();
    };

    Imager.prototype = {
        change_divs_to_imgs: function () {
            var Imager = this;
            $('div.delayed-image-load').each(function (index, div) {
                div = (typeof div !== 'number') ? div : index; // get round jquery/ender differences?
                if (div.className.search('js-no_replace') > -1) {
                    return;
                }
                var additional_classes = div.className.replace('delayed-image-load', ''),
                    img = $(
                        '<img src="' +
                        Imager.calc_img_src(div.getAttribute('data-src'), div.clientWidth) +
                        '" alt="' +
                        (div.getAttribute('data-alt') || '') +
                        '" class="js-image_replace ' +
                        additional_classes +
                        '" />'
                    );
                $(div).replaceWith(img[0]);
            });
        },
        /*
            calc_img_src: returns a new URL for img which is a best fit for the supplied width
            @imgSrc Current img src
            @width  CSS width value of the image
        */
        calc_img_src: function (imgSrc, width) {
            if (imgSrc === null) {
                return false; // make sure to return false if we can't use the value
            }
            var regex = imgSrc.match(this.regex) || imgSrc;
            if (regex === null || typeof regex === 'string') {
                return false; // make sure to return false if we can't use the value
            }
            return imgSrc.replace(/img\/(\d*)/, 'img/' + this.match_closest_value(width, this.widths));
        },
        /*
            match_closest_value: returns a value closest to (but not over) from the array 'widths'
            @width Value to match against
        */
        match_closest_value: function (value, values) {
            var prev_value = values[0];
            for (var z = 0, len = values.length; z < len; z++) {
                if (value < values[z]) {
                    return prev_value;
                }
                prev_value = values[z];
            }
            return prev_value;
        },
        init_resize_images: function () {
            var Imager = this;
            window.addEventListener('resize', function () {
                Imager.resize_images();
            }, false);
        },
        resize_images: function () {
            var node_list = $('.js-image_replace'),
                Imager = this;

            if (!this.is_resizing) {
                this.is_resizing = true;

                if (node_list !== null) { // reference error occurs when the user manually resizes the browser window (this prevents it) 
                    node_list.each(function () {
                        // IE7 error here
                        if ($(this).hasClass('js-no_replace')) {
                            return;
                        }
                        // if (this.getAttribute('class').match('js-no_replace')) {
                        //     return;
                        // }

                        // Set src to value of calc_img_src if value is not false;
                        var newImgSrc = Imager.calc_img_src(
                            (this.getAttribute('datasrc') || this.src),
                            this.clientWidth
                        );
                        if (!!newImgSrc && (this.src !== newImgSrc)) {
                            this.src = newImgSrc;
                        }
                    });
                }
                this.is_resizing = false;
            }
        }
    };

    return Imager;

});