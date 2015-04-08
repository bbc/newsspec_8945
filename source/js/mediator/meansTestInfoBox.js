define(['lib/news_special/bootstrap', 'model/eventStrs'], function (news, eventStrs) {

    'use strict';

    var MeansTestInfoBox = function (meansTestMediator) {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.meansTestMediator = meansTestMediator;
        this.meanTestHolder = news.$('.meansTestHolder');
        this.el = this.meanTestHolder.find('.progress-box');
        this.progressHelpHeader = this.el.find('.progress-box--info__header');
        this.progressHelpText = this.el.find('.progress-box--info__text');
        this.progressBarHolder = this.meanTestHolder.find('.bar-holder');
        this.questionHolderArr = this.meanTestHolder.find('.questionBoxHolder');
        this.currentProgress = 0; //Current index of answered question

        this.helpDescriptions = this.meanTestHolder.find('.mobile-help');
        this.lastScrollPosition = 0;


        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    MeansTestInfoBox.prototype = {

        init: function () {
            this.enable();

			/***************************
                * LISTENERS
            ***************************/
            news.pubsub.on(eventStrs.displayEngland, this.enable.bind(this));
            news.pubsub.on(eventStrs.backToQuestions, this.enable.bind(this));
            news.pubsub.on(eventStrs.hideEngland, this.disable.bind(this));
        },

        handleBackToQuestions: function () {
            news.pubsub.on(eventStrs.userScroll, this.respondToScroll.bind(this));
            this.meanTestHolder.fadeIn(200);
        },

        enable: function () {
            news.pubsub.on(eventStrs.userScroll, this.respondToScroll.bind(this));

        },
        disable: function () {
            news.pubsub.off(eventStrs.userScroll);
        },

        resetProgress: function () {
            this.currentProgress = 0;
        },

        updateProgressBars: function (index) {
            /* Check the user isn't re-answering questions */
            if (index < this.currentProgress) {
                return;
            }
            this.currentProgress = index;


            var subBarsShown = index + 2; // Plus 2, to always highlight the into bars.

            var subBarsMadeComplete = 0;

            /* Loop over all sub bars and make them complete or incomplete */
            this.progressBarHolder.find('.bar-seperator--sub').each(function () {
                var $subBar = $(this);
                if (subBarsMadeComplete < subBarsShown) {
                    $subBar.addClass('bar-seperator--sub__complete');
                    subBarsMadeComplete++;
                } else {
                    $subBar.removeClass('bar-seperator--sub__complete');
                }
            });

            /* Loop over the bars and check for completed ones (all sub bars are complete) */
            this.progressBarHolder.find('.bar-seperator').each(function () {
                var $barSeperator = $(this);
                var allSubBarsComplete = true;
                /* Check each sub bar, and test if its complete */
                $barSeperator.find('.bar-seperator--sub').each(function () {
                    var $subBar = $(this);
                    allSubBarsComplete = $subBar.hasClass('bar-seperator--sub__complete');

                    /* If we find a sub bar, which isn't complete, break the loop */
                    if (!allSubBarsComplete) { return false; }
                });

                /* Make for complete / incomplete */
                if (allSubBarsComplete) {
                    $barSeperator.addClass('bar-seperator__complete');
                } else {
                    $barSeperator.removeClass('bar-seperator__complete');
                }
            });
        },

        updateProgressBarText: function (mobileHelp) {
            /* Mobile help contains the information we need within the markup */
            var helpTitle = mobileHelp.find('.mobile-help--title').html();
            var helpText = mobileHelp.find('.mobile-help--info').not('.hiddenElement').html();

            this.progressHelpHeader.html(helpTitle);
            this.progressHelpText.html(helpText);
        },

        updateProgress: function (index) {
            /* Update the progress bars */
            this.updateProgressBars(index);

            /* Mobile help contains the information we need within the markup */
            var mobileHelp = $(this.helpDescriptions[index]);

            if (this.currentProgress <= index && index < 7) {
                var scrollPosToSend = $(this.questionHolderArr[index]).offset().top;
                news.pubsub.emit('window:scrollTo', [scrollPosToSend, 400]);
            }

            this.updateProgressBarText(mobileHelp);
        },

        moveToQuestion: function (question) {
            if (!question) { return; }
            var nextQuestionHeight = question.outerHeight(),
                progressBoxHeight = this.el.outerHeight(),
                qMarginTopHeight = parseInt(question.css('margin-top'), 10);

            var targetYPos = question.position().top + (nextQuestionHeight * 0.5) - (progressBoxHeight * 0.5) + qMarginTopHeight;
            this.el.css('top', targetYPos + 'px');

            this.meansTestMediator.removeAllSelectedClasses();
            this.meansTestMediator.highlightQuestion(question);
            this.updateProgressBarText(question.next('.mobile-help'));
        },

        respondToScroll: function (scroll) {
            var sidebarOffset                = this.getProgressBarOffset(scroll),
                matchQuestionClosestToOffset = sidebarOffset + scroll.viewportHeight / 6,
                nearestQuestion              = this.getNearestQuestion(matchQuestionClosestToOffset);

            this.moveToQuestion(nearestQuestion);
        },

        getProgressBarOffset: function (scroll) {
            return scroll.parentScrollTop - scroll.iFrameOffset;
        },

        getNearestQuestion: function (offsetToMatch) {
            var bestMatch = null,
                questionContainer,
                questionOffset;

            /* 
                Check the user has actually scrolled.
            */
            if (this.lastScrollPosition === offsetToMatch) {
                return $('.selectedQuestionBox');
            }

            var isScrollingDown = (offsetToMatch > this.lastScrollPosition);
            this.lastScrollPosition = offsetToMatch;

            /* 
                Check to ensure progress hasn't already been moved down the user answering a question

                This prevents the box from scroll back up while the user scrolls down to the box
             */
            var selectedQuestionBox = $('.selectedQuestionBox'),
                selectedQuestionOffset = selectedQuestionBox.offset();
            if (isScrollingDown && selectedQuestionOffset && (offsetToMatch <  selectedQuestionOffset.top)) {
                return selectedQuestionBox;
            }

            var visibleQuestions = this.questionHolderArr.not('.faddedElement');

            /* 
                If the user has scrolled past the last question, the nearest question is the last one
            */
            var lastQuestion = visibleQuestions.last();
            var lastQuestionOffset = lastQuestion.offset();
            if (lastQuestionOffset && (lastQuestionOffset.top < offsetToMatch)) {
                return lastQuestion;
            }

            var currentBestValue = 9999999;

            /*
                Loop over each question and find the nearest one to the users scroll position
    
                *** IMPROVEMENT ** - this hit the DOM 7 times, a nice to have would be to keep
                a list of visible question indexes and their positions within an array. This would
                remove the need to hit the DOM, but would require some logic to keep a track of the 
                visible elms and their positions.
            */
            visibleQuestions.each(function (i) {
                var question = news.$(this);
                questionOffset = question.offset().top;

                var testVal = Math.abs(questionOffset - offsetToMatch);

                if (testVal < currentBestValue) {
                    currentBestValue = testVal;
                    bestMatch = question;

                }
            });


            /* If we found a best match return it, otherwise Q1 */
            return (bestMatch) ? bestMatch : this.q1El;
        }

    };

    return MeansTestInfoBox;

});