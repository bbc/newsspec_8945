define(['jquery'], function ($) {
    var hostCommunicator = {
        postMessageAvailable: (window.postMessage ? true : false),
        init: function () {
            var externalHostCommunicator = this;
            this.setHeight();
            this.startWatching();
            if (this.postMessageAvailable) {
                this.setupPostMessage();
            }
            else {
                this.setupIframeBridge();
            }
            $.on('istats', function (actionType, actionName, viewLabel) {
                externalHostCommunicator.setHeight();
                externalHostCommunicator.registerIstatsCall(actionType, actionName, viewLabel);
            });

            $.on('window:scrollTo', this.sendScrollToHost);

        },
        height: 0,
        registerIstatsCall: function (actionType, actionName, viewLabel) {
            var istatsData = {
                'actionType': actionType,
                'actionName': actionName,
                'viewLabel':  viewLabel
            };
            if (this.postMessageAvailable) {
                this.sendDataByPostMessage(istatsData);
            }
            else {
                window.istatsQueue.push(istatsData);
            }
        },
        setupPostMessage: function () {
            var self = this;

            window.setInterval(this.sendDataByPostMessage, 32);

            window.addEventListener('message', function (message) {
                var data = self.getObjectNotationFromDataString(message.data);

                if (data) {
                    var parentScrollTop = data.parentScrollTop,
                        iFrameOffset    = data.iFrameOffset,
                        iFrameHeight    = $('.main').outerHeight(),
                        viewportHeight  = data.viewportHeight,
                        windowScrollEventData = {
                            parentScrollTop: parentScrollTop,
                            iFrameOffset:    iFrameOffset,
                            iFrameHeight:    iFrameHeight,
                            viewportHeight:  viewportHeight
                        };

                    $.emit('window:scroll', [windowScrollEventData]);
                }

            }, false);
        },
        getObjectNotationFromDataString: function (data) {
            if (data.indexOf('::') > -1) {
                return JSON.parse(data.split('::')[1]);
            }
            return false;
        },
        sendDataByPostMessage: function (istatsData) {
            var talker_uid = window.location.pathname,
                message = {
                    height:           this.height,
                    hostPageCallback: hostCommunicator.hostPageCallback
                };
            if (istatsData) {
                message.istats = istatsData;
            }
            window.parent.postMessage(talker_uid + '::' + JSON.stringify(message), '*');
        },
        setupIframeBridge: function () {
            window.setInterval(this.sendDataByIframeBridge, 100);
            window.istatsQueue = [];
        },
        sendDataByIframeBridge: function () {
            window.iframeBridge = {
                height:           this.height,
                hostPageCallback: this.hostPageCallback
            };
        },
        startWatching: function () {
            window.setInterval(this.setHeight, 32);
        },
        staticHeight: null,
        setStaticHeight: function (newStaticHeight) {
            this.staticHeight = newStaticHeight;
        },
        setHeight: function () {
            var heightValues = [this.staticHeight || 0];
            if ($('.main').length > 0) {
                heightValues.push($('.main')[0].scrollHeight);
            }
            // return Math.max.apply(Math, [height, document.body.scrollHeight, $('.main').height()]),
            this.height = Math.max.apply(Math, heightValues);
        },
        hostPageCallback: false,
        setHostPageInitialization: function (callback) {
            hostCommunicator.hostPageCallback = callback.toString();
        },
        sendMessageToremoveLoadingImage: function () {
            var message = {
                msg: 'removeLoadingSpinner'
            };

            if (this.postMessageAvailable) {
                window.parent.postMessage(window.location.pathname + '::' + JSON.stringify(message), '*');
            }
        },
        sendScrollToHost: function (scrollPosition, scrollDuration) {
            var talker_uid = window.location.pathname,
            message = {
                scrollPosition: scrollPosition,
                scrollDuration: scrollDuration,
                hostPageCallback: false
            };
            window.parent.postMessage(talker_uid + '::' + JSON.stringify(message), '*');

        }
    };
    return hostCommunicator;
});
