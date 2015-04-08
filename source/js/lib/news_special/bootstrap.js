define([
    'jquery',
    'lib/news_special/iframemanager__frame',
    'lib/news_special/imager',
    'lib/news_special/imager_image_sizes',
    'pubsub'
], function ($, iframemanager__frame, Imager, imageSizes) {

    // responsive iframe
    iframemanager__frame.init();

    // responsive images
    var imager = new Imager({
        availableWidths: imageSizes,
        regex: /(\/news\/.*img\/)\d+(\/.*)$/i
    });
    $.on('resize_images', function () {
        imager.resize_images();
    });
    $.on('init_images', function () {
        imager.change_divs_to_imgs();
    });

    return {
        $: $,
        pubsub: $,
        setStaticIframeHeight: function (newStaticHeight) {
            iframemanager__frame.setStaticHeight(newStaticHeight);
        },
        hostPageSetup: function (callback) {
            iframemanager__frame.setHostPageInitialization(callback);
        },
        sendMessageToremoveLoadingImage: function () {
            iframemanager__frame.sendMessageToremoveLoadingImage();
        }
    };

});