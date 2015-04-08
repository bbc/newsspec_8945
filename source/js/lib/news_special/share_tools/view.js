/**
* @fileOverview News Specials Share Module - Share View
* Implements a shared view for Responsive/Desktop sites for a Personal Share module
* @requires bootstrap
* @requires Jquery-template-engine
* @requires share_template.inc/sssi
* @todo Add share options for other sharing environments and allow developer to select which ones will be available to the user i.e. Google+
* @author BBC / Steven Atherton
* @version RC1
*/

/** @module nsshare-view */
define(['lib/news_special/bootstrap', 'lib/news_special/template_engine', 'lib/news_special/share_tools/html_template_default', 'lib/news_special/share_tools/html_template_dropdown'], function (news, templateEngine, htmlTemplateDefault, htmlTemplateDropdown) {
    /**
    Takes a request from the DOM to share and select the correct social media
    @function
    @param {object} - Event object
    @throws ValueError If the requesting object is not recognised
    */
    var requestShare = function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        news.pubsub.emit('ns:share:call');
        if (news.$(ev.currentTarget).hasClass('share__tool--email')) {
            news.pubsub.emit('ns:share:call:email');
        } else if (news.$(ev.currentTarget).hasClass('share__tool--facebook')) {
            news.pubsub.emit('ns:share:call:facebook');
        } else if (news.$(ev.currentTarget).hasClass('share__tool--twitter')) {
            news.pubsub.emit('ns:share:call:twitter');
        } else { throw new Error('ValueError: Share application not of know type i.e facebook'); }
    };
    /**
    * Represents the DOM view of the personalised share module
    * @constructor
    * @this {NSShareView}
    * @param {String} target - id of target element to embed sharetool module
    */
    var NSShareView = function (target) {
        this.elm = news.$(target);
        this.viewReady = false;
        // Personal share request
        news.pubsub.on('ns:request:personalshare',
            news.$.proxy(this.buildHtml, this));
        news.pubsub.on('ns:request:launchshare',
            news.$.proxy(function (target) {
                this.shareWindow(target, 'NSShareWindow', 500, 300, 'no');
            }, this)
        );
        news.pubsub.on('ns:request:launchshare:samewindow',
            news.$.proxy(function (target) {
                window.location.href = target;
            }, this)
        );
        news.pubsub.on('ns:overlay:toggle',
            news.$.proxy(function () {
                this.toggleOverlay();
            }, this)
        );
        news.pubsub.on('ns:overlay:close',
            news.$.proxy(function () {
                this.closeOverlay();
            }, this)
        );
    };
    /**
    * Builds the DOM elements for the share module
    * @public
    * @requires Jquery-template-engine
    * @requires share_template.inc/sssi
    * @method
    * @param {object} model - contains the template variables
    * @throws DOMError If the DOM has already been rendered.
    */
    NSShareView.prototype.buildHtml = function (model) {
        // Use JQuery simple templating...
        // This is easily extensible to allow different module for say googleplus
		// Use alternative dropdown template if present
		var template = htmlTemplateDefault;

		if (model['_template']) {
			template = this.getTemplateDependencyName(model['_template']);
		}
        if (!this.viewReady) {
            //pass in the template key module.. We could deliver more than one template here if we wished ??
            this.elm.append(
                templateEngine(template, {
                    header : model.getHeader(),
                    networks : [
                        {
                            target : 'email',
                            share : model.emailShareTarget()
                        },
                        {
                            target : 'facebook',
                            share : model.fbShareTarget()
                        },
                        {
                            target : 'twitter',
                            share : model.twitterShareTarget()
                        }
                    ]
                })
            );
            // attach events/
            this.elm.on('click', '.share__tool', requestShare);
            // inform controller
            this.viewReady = true;
            news.pubsub.emit('ns:module:ready');
        } else {
            throw new Error('DOMError: View already rendered');
        }
    };
    /**
    * Returns require.js dependency name
    * @public
    * @method
    * @param {String} template - The template name passed when initialising the module
    */
    NSShareView.prototype.getTemplateDependencyName = function (template) {
    	var relations = {
	    	"dropdown" : htmlTemplateDropdown,
            "default" : htmlTemplateDefault
    	};
		return relations[template];
    };
    /**
    * Updates the Header element of the view
    * @public
    * @method
    * @param {String} header - The Call to action, invitation to share text e.g. 'Share me'
    */
    NSShareView.prototype.updateHeader = function (header) {
        news.$('#ns_share_module .share__title').html(header);
    };
    /**
    * Launches the popup window for sharing
    * @public
    * @method
    * @param {String} url - to the appropriate share API
    * @param {number} width - Width of the popup
    * @param {number} height - Height of the popup
    * @param {String} scroll - Allow scrollbar
    */
    NSShareView.prototype.shareWindow = function (url, winName, width, height, scroll) {
        var popupWindow,
            leftPosition = (screen.width) ? (screen.width - width) / 2 : 0,
            topPosition = (screen.height) ? (screen.height - height) / 2 : 0,
            settings = 'height=' + height +
            ',width=' + width +
            ',top=' + topPosition +
            ',left=' + leftPosition +
            ',scrollbars=' + scroll +
            ',resizable';
        popupWindow = window.open(url, winName, settings);
    };
    /**
    * Opens the overlay from the dropdown template
    * @public
    * @method
    */
    NSShareView.prototype.toggleOverlay = function () {
		this.elm.find('.share__overlay').toggle();
    };
    /**
    * Closes the overlay from the dropdown template
    * @public
    * @method
    */
    NSShareView.prototype.closeOverlay = function () {
		this.elm.find('.share__overlay').toggle();
    };

    return NSShareView;

});