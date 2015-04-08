define(['lib/news_special/bootstrap', 'model/eventStrs'], function (news, eventStrs) {

    'use strict';

    var NationsMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.nations = news.$('.nation');
        this.northernIrelandEl = news.$('.nation__ni');
        this.scotlandEl = news.$('.nation__scotland');
        this.walesEl = news.$('.nation__wales');

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    NationsMediator.prototype = {

        init: function () {

            /********************************************************
            * LISTENERS
            ********************************************************/
            news.pubsub.on(eventStrs.displayNorthernIreland, this.displayNorthernIreland.bind(this));
            news.pubsub.on(eventStrs.displayScotland, this.displayScotland.bind(this));
            news.pubsub.on(eventStrs.displayWales, this.displayWales.bind(this));
        },

        displayNorthernIreland: function (data) {
            news.pubsub.emit(eventStrs.hideEngland);
            this.nations.hide();
            this.populateValuesOrUseAlternatives(this.northernIrelandEl, data);
            this.northernIrelandEl.slideDown(300);
        },

        displayScotland: function (data) {
            news.pubsub.emit(eventStrs.hideEngland);
            this.nations.hide();
            this.populateValuesOrUseAlternatives(this.scotlandEl, data);
            this.scotlandEl.slideDown(300);
        },

        displayWales: function (data) {
            news.pubsub.emit(eventStrs.hideEngland);
            this.nations.hide();
            this.populateValuesOrUseAlternatives(this.walesEl, data);
            this.walesEl.slideDown(300);
        },

        resetNationParagraphs: function (nationEl) {
            nationEl.find('.nation--p').show();
            nationEl.find('.nation--p__alt').hide();
        },

        populateValuesOrUseAlternatives: function (nationEl, dataModel) {
            var dynamicEls = nationEl.find('[data-dynamic-text]');
            var missingValuePars = []; //Array holding all the paragraphs with out all their values

            dynamicEls.each(function () {
                var attrName = $(this).data('dynamicText'),
                    dynValue = dataModel[attrName];

                var parentParagraph = $(this).parents('.nation--p');
                
                if (dynValue && dynValue !== 'NA') {
                    if ($(this).attr('data-dynamic-text') === 'hcHourCost_14_15' && dynValue.indexOf('-') > 0) {

                        $('.hcHourCostAverageRange').text($('.hcHourCostAverageRange').attr('alt-text'));
                    }
                    $(this).text(dynValue);
                } else {
                    /* Ensure that the value cannot be left blank */
                    if ($(this).data('notNeeded') !== true) {
                        missingValuePars.push(parentParagraph);
                    } else {
                        $(this).text('');
                    }
                }
            });


            this.hideDynamicShowAlts(missingValuePars);
        },

        hideDynamicShowAlts: function (missingParagraphs) {
            for (var i = 0; i < missingParagraphs.length; i++) {
                var dynPara = missingParagraphs[i],
                    altPara = dynPara.siblings('.' + dynPara.attr('id') + '_alt');

                dynPara.hide();
                altPara.show();
            }
        }

    };

    return NationsMediator;

});