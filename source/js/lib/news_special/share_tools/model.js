/**
* @fileOverview News Specials Share Module - Share Model
* models all the data needed to implement personal sharing for News Specials applications
* for Facebook, Twitter and Email
* @requires bootstrap
* @todo Implement other sharing environments i.e. Google+ and add them to the model.
* @author BBC / Steven Atherton
* @version RC1
*/

/** @module nsshare-model */
define(['lib/news_special/bootstrap'], function (news) {
    var FACEBOOK_URL = 'https://www.facebook.com/dialog/feed',
        BBC_FB_APP_ID = '58567469885',
        BBC_SHARE_TOOLS_URL = 'http://www.bbc.co.uk/modules/sharetools/callback',
        // TODO collect location for WorldService
        // Does worldservice have a global window object describing service??
        // LOCALE = 'en_GB', // See note in fbShareTarget
        TWITTER_URL = 'https://twitter.com/intent/tweet',
        EMAIL_URL = 'mailto:';

    /**
     Checks a variable against a desired type, throwing an error if the types don't match.
     @function
     @param {object} - The variable that needs to be checked
     @param {string} - description of type
     @returns {boolean}
     @throws TypeError
     @see typeof
    */
    var typeCheck = function (variable, type) {
        if (!typeQuery(variable, type)) {
            throw new Error('TypeError: expected type ' + type.charAt(0).toUpperCase() + type.slice(1));
        }
        return true;
    };

    /**
     Checks a variable against a desired type, but doesn't throw an error if types don't match.
     @function
     @param {object} - The variable that needs to be checked
     @param {string} - description of type
     @returns {boolean}
     @see typeof
    */
    var typeQuery = function (variable, type) {
        return typeof variable === type;
    };

    /**
    * Models all the data required to build a personalised share module
    * Arguments to be passed as an object with appropriate optional arguments if no options are set then default values are used
    * @constructor
    * @this {NSShareModel}
    * @param {Array} hashtag - Collection of hashtags that will be shared via the share model
    * @param {String} header - The Call to action, invitation to share text e.g. 'Share me'
    * @param {String} app - A description of the application using the share model - used for statistical tracking i.e. iStats
    * @param {String} desc - A longform description of the share content - maps to Open Graph Protocol
    * @param {String} image - URL location of a associated share image - maps to Open Graph Protocol
    * @param {String} message - Personalised message to share via Facebook/Twitter
    */
    var NSShareModel = function (config) {
        var opts = config || {};

        this.storyPageUrl = opts.storyPageUrl || 'http://www.bbc.co.uk';
        if (opts.hashtag) {
            if (typeQuery(opts.hashtag, 'object')) {
                for (var i = opts.hashtag.length - 1; i >= 0; i--) {
                    this.addHashTag(opts.hashtag[i]);
                }
            } else if (typeQuery(opts.hashtag, 'string')) {
                this.addHashTag(opts.hashtag);
            } else {
                throw new Error('TypeError: expected hashtag variable to be Array or String');
            }
        }
        if (opts.header) {this.setHeader(opts.header); } else { this.setHeader('Share this page'); }
        if (opts.app) {this.setAppId(opts.app); } else {this.setAppId('PersonalSharing'); }
        if (opts.desc) {this.setOGPDescription(opts.desc); } else {this.setOGPDescription('Shared via BBC News'); }
        if (opts.image) {this.setOGPImage(opts.image); } else {this.setOGPImage('http://newsimg.bbc.co.uk/media/images/67373000/jpg/_67373987_09f1654a-e583-4b5f-bfc4-f05850c6d3ce.jpg'); }
        if (opts.message) {this.setShareMessage(opts.message); } else {this.setShareMessage('BBC Interactives'); }
        if (opts.template) {this.setTemplate(opts.template); } else {this.setTemplate('default'); }
    };

    NSShareModel.prototype.storyPageUrl = window.location.href || 'www.bbc.co.uk/news';

    /**
    * Sets the Call to action, invitation to share text e.g. 'Share me'
    * @public
    * @method
    * @param {String} header - The Call to action, invitation to share text e.g. 'Share me'
    * @throws TypeError - If the argument is not of type {String}
    */
    NSShareModel.prototype.setHeader = function (header) {
        if (typeCheck(header, 'string')) {
            this._header = header;
            news.pubsub.emit('ns:update:header');
        }
    },
    /**
    * The Call to action, invitation to share text e.g. 'Share me'
    * @public
    * @method
    * @returns {String} The Call to action, invitation to share text e.g. 'Share me'
    */
    NSShareModel.prototype.getHeader = function () {
        return this._header;
    },
    /**
    * Sets the description of the application using the share model - used for statistical tracking i.e. iStats
    * @public
    * @method
    * @param {String} app description of the application using the share model - used for statistical tracking i.e. iStats
    * @throws TypeError - If the argument is not of type {String}
    */
    NSShareModel.prototype.setAppId = function (app) {
        if (typeCheck(app, 'string')) {
            this._appId = app;
        }
    },
    /**
    * Returns the description of the application using the share model - used for statistical tracking i.e. iStats
    * @public
    * @method
    * @returns {String} A description of the application using the share model - used for statistical tracking i.e. iStats
    */
    NSShareModel.prototype.getAppId = function () {
        return this._appId;
    },
    /**
    * Returns all hashtags set for this share seperated by a URI encoded space
    * @public
    * @method
    * @returns {String} Collection of hashtags set for this share seperated by a URI encoded space
    */
    NSShareModel.prototype.getHashTags = function () {
        return this._hashTags.toString().replace(/,/g, '%20');
    },
    /**
    * Adds hashtag to the hashTags collection
    * @public
    * @method
    * @param {String} tag - An individual hastag to add to the collection {hashtags}
    * @throws TypeError - If the argument is not of type {String}
    * @throws ValueError - If the hashtag already exists in the collection {hashtags}
     */
    NSShareModel.prototype.addHashTag = function (tag) {
        if (this._hashTags === undefined) {
            this._hashTags = [];
        }
        if (typeCheck(tag, 'string')) {
            if (this._hashTags.indexOf('%23' + tag) === -1) {
                this._hashTags.push('%23' + tag);
            } else {
                throw new Error('ValueError: expected unique String');
            }
        }
    },
    /**
    * Removes hashtag to the hashTags collection - If the hastag does not exists in the collection
    * The method will throw a ValueError
    * @public
    * @method
    * @param {String} tag - An individual hastag to remove from the collection {hashtags}
    * @throws ValueError - If unable to find the hashtag in the collection
    */
    NSShareModel.prototype.removeHashTag = function (tag) {
        if (typeCheck(tag, 'string')) {
            var index = this._hashTags.indexOf('%23' + tag);
            if (index !== -1) {
                this._hashTags.splice(index, 1);
            } else {
                throw new Error('ValueError: value not found');
            }
        }
    },
    /**
    * Sets the personalised message to share via social media as URI encoded String
    * @public
    * @method
    * @param {String} message - personalised message to share via social media as URI encoded String
    * @throws TypeError - If the argument is not of type {String}
    */
    NSShareModel.prototype.setShareMessage = function (message) {
        if (typeCheck(message, 'string')) {
            this._message = encodeURIComponent(message);
        }
    },
    /**
    * Personalised message to share via Facebook/Twitter
    * @public
    * @method
    * @returns {String} personalised message to share via social media as URI encoded String
    */
    NSShareModel.prototype.getShareMessage = function () {
        return this._message;
    },

    /**
    * Set facebook share message and image
    * @public
    * @method
    * @param {Object} personalised message to share via facebook media as URI encoded String
    *   options.message : String
    *   options.pic : URLString
    *   options.pageUrl : String
    */
    NSShareModel.prototype.setFacebookShareMessage = function (options) {
        if (options.pic) {
            this.setOGPImage(options.pic);
        }
        if (typeCheck(options.message, 'string')) {
            this._facebookMessage = encodeURIComponent(options.message);

            //we'll use our own hash tags in the message string
            if (this._hashTags === undefined) {
                this._hashTags = [];
            }
            this._hashTags.length = 0;
        }
        if (options.pageUrl) {
            this.facebookPageUrl = options.pageUrl;
        }
    },

    NSShareModel.prototype.getFacebookShareMessage = function () {
        return  this._facebookMessage || this._message;
    },

    /**
    * Set twitter share message and image
    * @public
    * @method
    * @param {string} personalised message to share via twitter media as URI encoded String
    */
    NSShareModel.prototype.setTwitterShareMessage = function (message) {
        if (typeCheck(message, 'string')) {
            this._twitterMessage = encodeURIComponent(message);

            //we'll use our own hash tags in the message string
            if (this._hashTags === undefined) {
                this._hashTags = [];
            }
            this._hashTags.length = 0;
        }
    },

    NSShareModel.prototype.getTwitterShareMessage = function () {
        return  this._twitterMessage || this._message;
    },

    /**
    * Set email share message and image
    * @public
    * @method
    * @param {object} personalised message to share via email as URI encoded String
    *   options.subject : String
    *   options.message : String
    */
    NSShareModel.prototype.setEmailShareMessage = function (options) {
        if (typeCheck(options.subject, 'string')) {
            this._emailSubject = encodeURIComponent(options.subject);
        }
        if (typeCheck(options.message, 'string')) {
            this._emailMessage = encodeURIComponent(options.message);

            //we'll use our own hash tags in the message string
            if (this._hashTags === undefined) {
                this._hashTags = [];
            }
            this._hashTags.length = 0;
        }
    },

    NSShareModel.prototype.getEmailShareSubject = function () {
        return  this._emailSubject || 'Shared%20from%20BBC%20News';
    },

    NSShareModel.prototype.getEmailShareMessage = function () {
        return  this._emailMessage || this._message;
    },

    /**
    * Sets URL location of a associated share image - maps to Open Graph Protocol
    * @public
    * @method
    * @param {URLString} image - URL location of image
    * @throws TypeError - If the argument is not a URLString
    */
    NSShareModel.prototype.setOGPImage = function (image) {
        var regex = new RegExp('^(https?:\\/\\/)?' + // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
          '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        if (regex.test(image)) {
            this._ogpImage = image;
        } else {
            throw new Error('TypeError: expected type URLString');
        }
    },
    /**
    * URL location of a associated share image - maps to Open Graph Protocol
    * @public
    * @method
    * @returns {URLString} URL location of a associated share image
    */
    NSShareModel.prototype.getOGPImage = function () {
        return this._ogpImage;
    },
    /**
    * Sets A longform description of the share content - maps to Open Graph Protocol
    * @public
    * @method
    * @param {String} desc - longform description of the share content
    * @throws TypeError
    */
    NSShareModel.prototype.setOGPDescription = function (desc) {
        if (typeCheck(desc, 'string')) {
            this._ogpDesc = encodeURIComponent(desc);
        }
    },
    /**
    * Returns A longform description of the share content - maps to Open Graph Protocol
    * @public
    * @method
    * @returns {String} longform description of the share content
    */
    NSShareModel.prototype.getOGPDescription = function () {
        return this._ogpDesc;
    },
    /**
    * Facebook share request URL with appropriate callback to be routed through the BBC Facebook pal share module
    * @public
    * @method
    * @returns {URLString} Facebook share request URL
    */
    NSShareModel.prototype.fbShareTarget = function () {
        return FACEBOOK_URL + // FACEBOOK URL
        '?app_id=' + BBC_FB_APP_ID + // via BBC APP id
        '&redirect_uri=' + encodeURIComponent(BBC_SHARE_TOOLS_URL) + // Sharetools locations encoded for Query string
        '%3Fst_cb%3Dfacebook%23state%3Dfeed' + // Standard callback parameters "?st_cb=facebook#state=feed"
        '&display=popup' + // Share window type
        '&link=' + this.storyPageUrl + // URL storypage
        '&name=' + this.getFacebookShareMessage() + // Custom share message
        '%20' + this.getHashTags() + // Hashtags string
        //'&locale=' + LOCALE + //location - May not be needed - Share module seems only to support en_GB which it applies by default anyway??
        '&description=' + this.getOGPDescription() + // Open Graph Protocol Description
        '&picture=' + this.getOGPImage(); // Open Graph Protocol Image
    },
    /**
    * Returns Twitter share request URL with appropriate callback
    * @public
    * @method
    * @returns {URLString} Twitter share request URL
    */
    NSShareModel.prototype.twitterShareTarget = function () {
        return TWITTER_URL + // Twitter API
        '?text=' + this.getTwitterShareMessage() + // Custom share message
        ' ' + this.getHashTags() + // Hashtags string
        ' ' + this.storyPageUrl; // URL storypage
    },
    /**
    * Returns Email share request URL with appropriate callback
    * @public
    * @method
    * @returns {URLString} Email share request URL
    */
    NSShareModel.prototype.emailShareTarget = function () {
        return EMAIL_URL + // Email
        '?subject=' + this.getEmailShareSubject() +
        '&body=' + this.getEmailShareMessage() + // Custom share message
        '%20' + this.storyPageUrl; // URL storypage
    },
    /**
    * Sets the template
    * @public
    * @method
    * @param {String} template name
    */
    NSShareModel.prototype.setTemplate = function (tmpl) {
        if (typeCheck(tmpl, 'string')) {
            this._template = tmpl;
        }
    }

    return NSShareModel;

});
