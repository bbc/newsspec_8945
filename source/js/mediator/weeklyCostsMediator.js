define(['lib/news_special/bootstrap', 'model/eventStrs', 'model/whoForModel'], function (news, eventStrs, whoForModel) {

    'use strict';

    var WeeklyCostsMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.testVar = true;
        this.el = news.$('.weeklyAvgHolder');
        this.authorityData = null;
        this.headerEl = this.el.find('.weeklyAvgHolder--header');
        this.careAtHomeEl = this.el.find('.item__at-home');
        this.residentialEl = this.el.find('.item__residential');

        /********************************************************
            * INIT ST
        ********************************************************/
        this.init();
    };

    WeeklyCostsMediator.prototype = {

        init: function () {

            /***************************
                * LISTENERS
            ***************************/
            news.pubsub.on(eventStrs.showResults, this.hide.bind(this));
            news.pubsub.on(eventStrs.hideEngland, this.hide.bind(this));

            news.pubsub.on(eventStrs.displayEngland, this.handleDisplayCosts.bind(this));

            news.pubsub.on(eventStrs.whoForSelected, this.handleWhoForSelect.bind(this));
            news.pubsub.on(eventStrs.backToQuestions, this.handleBackToQuestions.bind(this));
        },

        hide: function () {
            this.el.hide();
        },

        updateWeeklyCostHeader: function (element, amount) {
            element.siblings('.weeklyAvgHolder--item__price').html('&pound;' + parseFloat(amount).toFixed(2));
        },

        handleBackToQuestions: function () {
            this.el.fadeIn(200);
        },

        updateHeader: function () {
            if (this.authorityData !== null) {
                var dataName = (whoForModel.whoFor === 'self') ? 'self-text' : 'else-text';
                var headerText = this.headerEl.data(dataName).replace('{COUNCIL_NAME}', this.authorityData.authorityName);
                this.headerEl.text(headerText);
                
                this.updateWeeklyCostHeader(this.careAtHomeEl, this.authorityData.homeCare.localCost);
                this.updateWeeklyCostHeader(this.residentialEl, this.authorityData.residentialCare.localCost);
            }
        },

        handleDisplayCosts: function (data) {
            this.authorityData = data;
            this.updateHeader();

            //show the el
            var holder = this.el;
            holder.slideDown(400, function () {
                holder.removeClass('hiddenElement');
            });
        },

        /* Update to the correct text */
        handleWhoForSelect: function (user) {
            var self = this;
            var dataName = (user === 'self') ? 'self-text' : 'else-text';
            this.el.find('[data-self-text]').each(function () {
                $(this).html($(this).data(dataName));
            });
            this.careAtHomeEl.text(this.careAtHomeEl.data(dataName));
            this.residentialEl.text(this.residentialEl.data(dataName));

            this.updateHeader();

        }

    };

    return WeeklyCostsMediator;

});
