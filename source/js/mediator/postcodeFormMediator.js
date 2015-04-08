define(['lib/news_special/bootstrap', 'model/eventStrs', 'model/northernIrelandTrusts', 'lib/vendors/jquery/jQuery.XDomainRequest'], function (news, eventStrs, niTrusts) {

    'use strict';

    var PostcodeFormMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.elHolder = news.$('.postcodeFinderHolder');
        this.formEl = news.$('#postcodeForm');
        this.errorMessageHolder = news.$('.postcodeErrorHolder');
        this.errorMessageP = this.errorMessageHolder.find('p');
        this.postcodeInputEl = news.$('#postcodeInput');
        this.entityCodeSafeList = ['E06', 'E08', 'E09', 'E10', 'E11', 'W06', 'S12'];
        this.errorStrPostcodeInvalid = 'The postcode you entered did not pass validation';
        this.errorStrPostcodeNotFound = 'We couldn\'t find the postcode you entered';


        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    PostcodeFormMediator.prototype = {

        init: function () {
            /********************************************************
            * LISTENERS
            ********************************************************/
            this.formEl.on('submit', this.handleFormSubmit.bind(this));

            news.pubsub.on(eventStrs.whoForSelected, this.displayForm.bind(this));
            news.pubsub.on(eventStrs.showResults, this.handleDisplayResults.bind(this));
            news.pubsub.on(eventStrs.backToQuestions, this.handleBackToQuestions.bind(this));
        },

        displayForm: function () {
            var holder = this.elHolder;
            holder.fadeIn(200, function () {
                holder.removeClass('faddedElement');
            });
        },

        handleDisplayResults: function () {
            this.elHolder.hide();
        },
        handleBackToQuestions: function () {
            this.elHolder.fadeIn(200);
        },
        handleFormSubmit: function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }

            this.errorMessageHolder.addClass('hidePostcodeError');
            
            var postcodeEntered = this.postcodeInputEl[0].value.replace(/\s/g, ''),
                isPostcodeValid = this.isValidPostcode(postcodeEntered),
                that = this,
                postcodeURL;

            if (isPostcodeValid) {
                var isNorthernIrelandPostcode = this.isNorthernIrelandPostcode(postcodeEntered);
                if (isNorthernIrelandPostcode) {
                    //look up a postcode from northern ireland!!
                    postcodeURL = 'http://open.live.bbc.co.uk/locator/locations/' + postcodeEntered + '/details/gss-council?op=intersect&vv=2&dv=1.0&format=json';
                    $.getJSON(postcodeURL).done(function (data) {
                        that.handleNIPostcodeResponse(data);
                    }).fail(this.handlePostcodeLoadError.bind(this));

                    //var ajaxIt = news.$.getJSON(postcodeURL).done().fail(this.handlePostcodeLoadError.bind(this));  
                } else {
                    //look up the postcode!!
                    postcodeURL = 'http://open.live.bbc.co.uk/locator/locations/' + postcodeEntered + '/details/gss-council?op=intersect&vv=2&format=json';
                    $.getJSON(postcodeURL).done(function (data) {
                        that.handlePostcodeResponse(data);
                    }).fail(this.handlePostcodeLoadError.bind(this));
                }

            }
            else {
                this.showPostcodeError(this.errorStrPostcodeInvalid);
            }

            return false;
        },

        handlePostcodeResponse: function (data) {

            var dataStr = JSON.stringify(data, null, ' ');

            var detailsArr = data.response.content.details.details,
                externalId,
                nation,
                authorityName;

            if (detailsArr) {
                var a, arrLength = detailsArr.length, entityCodeSafeListLength = this.entityCodeSafeList.length;
     outerLoop: for (a = 0; a < arrLength; a++) {
                    if (detailsArr[a].data.entityCode) {

                        var b, entityCode = detailsArr[a].data.entityCode;
             innerLoop: for (b = 0; b < entityCodeSafeListLength; b++) {
                            if (entityCode === this.entityCodeSafeList[b]) {
                                //bingo! we've fund a valid region from the postcode!!
                                externalId = detailsArr[a].externalId;
                                authorityName = detailsArr[a].data.geographyName;
                                nation = detailsArr[a].data.entityCoverage;
                                break outerLoop;
                            }
                        }
                    }
                }
            }
            
            if (externalId) {
                //SUCCESS! :)
                news.pubsub.emit(eventStrs.processExternalId, {
                    id: externalId,
                    nation: nation,
                    authorityName: authorityName
                });
            }
            else {
                this.showPostcodeError(this.errorStrPostcodeNotFound);
            }
        },

        handleNIPostcodeResponse: function (data) {
            var detailsArr = data.response.content.details.details;
            var externalId, trustName;
            if (detailsArr) {
                var arrLength = detailsArr.length;
                for (var a = 0; a < arrLength; a++) {
                    var detailType = detailsArr[a].detailType;
                    if (detailType && (detailType === 'gss-council')) {

                        /* Map the counil id to a trust id */
                        var trustInfo = this.getNITrustInfo(detailsArr[a].externalId);

                        /* Check we managed to map the counil id to a trust */
                        if (trustInfo === null) {
                            break;
                        }

                        externalId = trustInfo.id;
                        trustName = trustInfo.name;

                        // console.log(trustInfo);

                        break;
                        
                    }
                }
            }
            
            if (externalId) {
                //SUCCESS! :)
                news.pubsub.emit(eventStrs.processExternalId, {
                    id: externalId,
                    nation: 'NorthernIreland',
                    authorityName: trustName
                });
            }
            else {
                this.showPostcodeError(this.errorStrPostcodeNotFound);
            }
        },

        handlePostcodeLoadError: function (e) {
            this.showPostcodeError(this.errorStrPostcodeNotFound);
        },

        getNITrustInfo: function (counilId) {
            var foundTrust = false, trust = null;
 outerLoop: for (var a = 0; a < niTrusts.length; a++) {
                trust = niTrusts[a];

                for (var b = 0; b < trust.councilIds.length; b++) {
                    if (trust.councilIds[b] === counilId) {
                        foundTrust = true;
                        break outerLoop;
                    }
                }
            }

            return (foundTrust) ? trust : null;

        },

        showPostcodeError: function (message) {
            this.errorMessageHolder.removeClass('hidePostcodeError');
            this.errorMessageP.html(message);
        },

        isValidPostcode: function (postcode) {
            postcode = postcode.replace(/\s/g, '');
            var regex = /^[A-Z]{1,2}[0-9]{1,2}([A-Z]{1,2})? ?[0-9][A-Z]{2}$/i;
            var isFullPostode = regex.test(postcode);

            if (!isFullPostode && postcode.length > 0 && postcode.length <= 4) {
                
                var firstChar = postcode.substr(0, 1), lastChar = postcode.substr(postcode.length - 1, 1);

                var firstCharAlpha = /(?![qvxQVX])[a-zA-Z]/.test(firstChar), lastCharNumeric = /[0-9]/.test(lastChar);

                // var isFirstHalfPostcode = (firstCharAlpha && lastCharNumeric) ? true : false;
                var isFirstHalfPostcode = (firstCharAlpha) ? true : false;

                return isFirstHalfPostcode;
            }

            return isFullPostode;
        },

        isNorthernIrelandPostcode: function (postcode) {
            return (postcode.substr(0, 2).toLowerCase() === 'bt');
        }

    };

    return PostcodeFormMediator;

});