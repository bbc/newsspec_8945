define([
    'lib/news_special/bootstrap',
    'mediator/whoForMediator',
    'mediator/postcodeFormMediator',
    'controller/externalIdController',
    'mediator/nationsMediator',
    'mediator/weeklyCostsMediator',
    'mediator/meansTestQuestionsMediator',
    'model/MeansTestCalculator',
    'mediator/resultsMediator'
], function (
    news,
    WhoForMediator,
    PostcodeFormMediator,
    ExternalIdController,
    NationsMediator,
    WeeklyCostsMediator,
    MeansTestQuestionsMediator,
    MeansTestCalculator,
    ResultsMediator
) {

    'use strict';

    /***************************
    Additional 'polyfils'
    * bind function -- bloomin phantonjs doesn't support bind :s
    * date.now method, not supported in certain versions of ie
    ***************************/
    if (typeof Function.prototype.bind !== 'function') {
        Function.prototype.bind = function (context) {
            var slice = Array.prototype.slice;
            var fn = this;

            return function () {
                var args = slice.call(arguments, 1);

                if (args.length) {
                    return arguments.length ? fn.apply(context, args.concat(slice.call(arguments))) : fn.apply(context, args);
                } else {
                    return arguments.length ? fn.apply(context, arguments) : fn.call(context);
                }
            };
        };
    }

    /* Switches SVG's for there fallback images if a browser doesn't support SVG */
    function switchSvgsForFallbacks() {
        var allSvgsWithFallbacks = $('.main').find('[data-fallback]').filter('svg');
        allSvgsWithFallbacks.each(function () {
            var svgEl = $(this);
            svgEl.replaceWith('<img src="' + svgEl.data('fallback') +  '" class="questionsIcon" alt="icon" />');
        });
    }

    return {
        init: function (storyPageUrl) {

            /***************************
                mediator store
            ***************************/
            new PostcodeFormMediator();
            new ExternalIdController();
            new NationsMediator();
            new WhoForMediator();
            new WeeklyCostsMediator();
            new MeansTestQuestionsMediator();
            new MeansTestCalculator();
            new ResultsMediator();

            news.$('.main').show();
            news.sendMessageToremoveLoadingImage();
            if (!this.isSvgSupported()) {
                switchSvgsForFallbacks();
            }
            
        },

        isSvgSupported: function () {
            return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1');
        }
    };

});
