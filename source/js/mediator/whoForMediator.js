define(['lib/news_special/bootstrap', 'model/eventStrs', 'model/whoForModel'], function (news, eventStrs, whoForModel) {

    'use strict';

    var WhoForMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.$el = news.$('.whoForHolder');

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    WhoForMediator.prototype = {

        init: function () {

            /********************************************************
            * LISTENERS
            ********************************************************/
            this.$el.find('.questionsBtnsHolder--btn').on('click', this.btnClicked.bind(this));
            news.pubsub.on(eventStrs.showResults, this.handleDisplayResults.bind(this));
            news.pubsub.on(eventStrs.backToQuestions, this.handleBackToQuestions.bind(this));
        },

        handleDisplayResults: function () {
            this.$el.hide();
            news.pubsub.emit('istats', ['click-display-results', 'newsspec-interaction-display_results', true]);

        },
        handleBackToQuestions: function () {
            this.$el.fadeIn(200);
            news.pubsub.emit('istats', ['click-back-to-questions', 'newsspec-interaction-reset', true]);
        },

        btnClicked: function (e) {
            var $btn = news.$(e.currentTarget);

            this.$el.find('.questionsBtnsHolder--btn').removeClass('questionsBtnsHolder--btn__selected');
            $btn.addClass('questionsBtnsHolder--btn__selected');

            whoForModel.whoFor = $btn.data('who');
            news.pubsub.emit(eventStrs.whoForSelected, whoForModel.whoFor);
            news.pubsub.emit('istats', ['click-whofor-button', 'newsspec-interaction-start', whoForModel.whoFor]);
        }

    };

    return WhoForMediator;

});