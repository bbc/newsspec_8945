define(['lib/news_special/bootstrap', 'lib/news_special/share_tools/model', 'lib/news_special/share_tools/view'], function (news, SharetoolsModel, SharetoolsView) {

    var model,
        view;

    var _callFaceBook = function () {
        news.pubsub.emit('ns:request:launchshare', [model.fbShareTarget()]);
    };

    var _callTwitter = function () {
        news.pubsub.emit('ns:request:launchshare', [model.twitterShareTarget()]);
    };

    var _callEmail = function () {
        news.pubsub.emit('ns:request:launchshare:samewindow', [model.emailShareTarget()]);
    };

    var _updateMessage = function (e) {
        model.setShareMessage(e);
    };

    var _updateFacebookMessage = function (e) {
        model.setFacebookShareMessage(e);
    };

    var _updateTwitterMessage = function (e) {
        model.setTwitterShareMessage(e);
    };

    var _updateEmailMessage = function (e) {
        model.setEmailShareMessage(e);
    };

    var _initialiseModule = function () {
        news.pubsub.on('ns:share:message', function (target) { _updateMessage(target); });

        news.pubsub.on('ns:share:setFacebookMessage', function (target) { _updateFacebookMessage(target); });
        news.pubsub.on('ns:share:setTwitterMessage', function (target) { _updateTwitterMessage(target); });
        news.pubsub.on('ns:share:setEmailMessage', function (target) { _updateEmailMessage(target); });

        news.pubsub.on('ns:share:call:facebook', _callFaceBook);
        news.pubsub.on('ns:share:call:twitter', _callTwitter);
        news.pubsub.on('ns:share:call:email', _callEmail);

		news.$('.share__button').on('click', function (template) {
			news.pubsub.emit('ns:overlay:toggle', template);
		});

		news.$('.share__overlay-close').on('click', function (template) {
            template.preventDefault();
			news.pubsub.emit('ns:overlay:close', template);
		});
    };

    return {
        init: function (elm, config) {
            model = new SharetoolsModel(config);
            view = new SharetoolsView(elm);
            // this gets called once...
            news.pubsub.on('ns:module:ready', _initialiseModule);
            // this builds the share HTML fragment
            news.pubsub.emit('ns:request:personalshare', [model]);
        }
    };
});
