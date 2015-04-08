define(['lib/news_special/bootstrap', 'model/eventStrs', 'model/User', 'mediator/MeansTestInfoBox'], function (news, eventStrs, User, MeansTestInfoBox) {

    'use strict';

    var MeansTestQuestionsMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.meansTestHolder');
        this.nations = news.$('.nation');
        this.headerEl = this.el.find('.meansTestHolder-header');
        this.headerInfoEl = this.el.find('.meansTestHolder-info');
        this.questionHolderArr = this.el.find('.questionBoxHolder');
        this.q1El = this.el.find(this.questionHolderArr[0]);
        this.q2El = this.el.find(this.questionHolderArr[1]);
        this.q3El = this.el.find(this.questionHolderArr[2]);
        this.q4El = this.el.find(this.questionHolderArr[3]);
        this.q5El = this.el.find(this.questionHolderArr[4]);
        this.q6El = this.el.find(this.questionHolderArr[5]);
        this.q7El = this.el.find(this.questionHolderArr[6]);
        this.q5ElSkip = this.el.find('.mobile-help--5__skip');
        this.q5ElNoSkip = this.el.find('.mobile-help--5__no_skip');
        this.userProgressed = false; // Wether user has progress past quesiton 1
        this.resultsButton = this.el.find('.resultsBtn');
        this.showResultsBtn = news.$('#showResultsBtn');

        this.answers = [];
        this.user = new User();
        this.infoBox = new MeansTestInfoBox(this);

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    MeansTestQuestionsMediator.prototype = {

        init: function () {

			/***************************
                * LISTENERS
            ***************************/
            this.showResultsBtn.on('click', this.processMeansTest.bind(this));

            news.pubsub.on(eventStrs.dispalyMeansTestResult, this.showResults.bind(this));
            news.pubsub.on(eventStrs.displayEngland, this.handleDisplayMeansTest.bind(this));
            news.pubsub.on(eventStrs.whoForSelected, this.handleWhoForSelect.bind(this));
            news.pubsub.on(eventStrs.backToQuestions, this.handleBackToQuestions.bind(this));
            news.pubsub.on(eventStrs.hideEngland, this.hide.bind(this));

            /***************************
                * MOUSE LISTENERS
            ***************************/
            this.questionHolderArr.find('.questionBtn').on('click', this.handleQuestionBtnClick.bind(this));
            this.questionHolderArr.find('.questionsInputForm').on('submit', this.handleQuestionFormSubmit.bind(this));
        },

        /* Update to the correct text */
        handleWhoForSelect: function (user) {
            var self = this;
            var dataName = (user === 'self') ? 'self-text' : 'else-text';
            this.el.find('[data-self-text]').each(function () {
                $(this).html($(this).data(dataName));
            });

            dataName = (user === 'self') ? 'self-examples' : 'else-examples';
            this.el.find('[data-self-examples]').each(function () {
                var $elm = $(this);
                $elm.empty();
                var examples = $elm.data(dataName).split('{,}');
                news.$.each(examples, function (index, value) {
                    //HTML Special Chars
                    var textHtml = $('<div>').text(value).html();

                    $elm.append('<div class="questionExampleHolder"><p>' + textHtml + '</p></div>');
                });
            });
        },

        handleBackToQuestions: function () {
            this.el.fadeIn(200);
        },

        hide: function () {
            this.el.hide();
        },

        toggleQuestions: function (show, questions) {
            questions = ($.isArray(questions)) ? questions : [questions];

            for (var i = 0; i < questions.length; i++) {
                var question = questions[i];
                if (show) {
                    question.removeClass('hideQuestion');
                    question.next('.mobile-help').removeClass('hideQuestion');
                } else {
                    question.addClass('hideQuestion');
                    question.next('.mobile-help').addClass('hideQuestion');
                }

            }
        },

        handleDisplayMeansTest: function (data) {
            var holder = this.el;
            this.infoBox.updateProgress(0);

            this.nations.hide();

            holder.slideDown(300, function () {
                holder.removeClass('hiddenElement');
            });

            this.toggleAllElInside(this.el.find('.faddedElement'), false);
        },

        handleQuestionBtnClick: function (e) {

            //remove the selected class from the opposite answer btn!
            var idStr = e.currentTarget.id;
            var questionNum = Number(idStr.substr(1, 1));
            var btnNum = Number(idStr.substr(3, 1));
            
            var oppositeBtnNum = (btnNum === 1) ? 2 : 1;
            var oppositeBtn = this.el.find('#q' + questionNum + 'b' + oppositeBtnNum);
            oppositeBtn.removeClass('questionBtnSelectedAnswer');

            var el = news.$(e.currentTarget);
            if (!el.hasClass('questionBtnSelectedAnswer')) {
                el.addClass('questionBtnSelectedAnswer');
            }

            this.answers[questionNum] = btnNum;
            news.pubsub.emit('userinput:button:' + questionNum, [btnNum]);// property shared 1||2

            this.removeAllSelectedClasses();

            this['handleQ' + questionNum + 'Answer'](btnNum);
            // console.log(idStr);
        },

        handleQuestionFormSubmit: function (e) {
            if (e.preventDefault) {
                e.preventDefault();
            }

            var idStr = e.currentTarget.id, questionNum = Number(idStr.substr(1, 1));

            var $form = news.$(e.currentTarget),
                inputEl = $form.find('.questionsFormInputEl'),
                inputVal = inputEl[0].value.replace(/[, ]/, '');

            var validNumber = (inputVal) ? !isNaN(inputVal) : false;

            if (idStr === 'q7Form' && parseFloat(inputVal) < 100) {
                validNumber = false;
                console.log('value should be bigger than 100');
                news.$('.questions__numbererror--income-info').hide();
                news.$('.questions__numbererror--income').show();
            } else {
                news.$('.questions__numbererror--income').hide();
                news.$('.questions__numbererror--income-info').show();
            }

            if (validNumber) {
                this.removeAllSelectedClasses();
                this['handleQ' + questionNum + 'Answer'](inputVal);
                news.pubsub.emit('userinput:input:' + idStr, [inputVal]); // income
            }

            return false;
        },

        handleQ1Answer: function (btnNum) {
            /***************************
                * property questions check
            ***************************/
            var targetYPos, nextQuestionHeight,
                progressBoxHeight, qMarginTopHeight,
                nextQuestionBoxEl;

            if (btnNum === 1) {

                nextQuestionBoxEl = this.q2El;

                /* If we've already answered some questions, and gone back and changed this answer */
                if (this.userProgressed) {
                    this.infoBox.resetProgress();
                    
                    var self = this;
                    this.q2El.nextAll('.questionBoxHolder').each(function () {
                        var question = $(this);
                        self.toggleAllElInside(question, false);
                        self.toggleQuestions(true, question);
                    });
                }

                this.q5ElSkip.hide();
                this.q5ElSkip.addClass('hiddenElement');
                this.q5ElNoSkip.show();
                this.q5ElNoSkip.removeClass('hiddenElement');

                //show the rest of the property questions
                this.toggleQuestions(true, [this.q2El, this.q3El, this.q4El]);

                this.infoBox.updateProgress(1);
            }
            else {
                //hide the rest of the property questions
                if (!this.q2El.hasClass('hideQuestion')) {
                    this.toggleQuestions(false, [this.q2El, this.q3El, this.q4El]);
                }

                this.q5ElNoSkip.hide();
                this.q5ElNoSkip.addClass('hiddenElement');
                this.q5ElSkip.show();
                this.q5ElSkip.removeClass('hiddenElement');

                nextQuestionBoxEl = this.q5El;

                this.infoBox.updateProgress(4);
            }

            this.showNextQuestion(nextQuestionBoxEl);
            this.infoBox.moveToQuestion(nextQuestionBoxEl);
            this.userProgressed = true;
        },

        handleQ2Answer: function (btnNum) {
            this.infoBox.updateProgress(2);
            this.showNextQuestion(this.q3El);
            this.infoBox.moveToQuestion(this.q3El);
        },

        handleQ3Answer: function (btnNum) {
            this.infoBox.updateProgress(3);
            this.showNextQuestion(this.q4El);
            this.infoBox.moveToQuestion(this.q4El);

        },

        handleQ4Answer: function (inputVal) {
            this.infoBox.updateProgress(4);
            this.showNextQuestion(this.q5El);
            this.infoBox.moveToQuestion(this.q5El);
        },

        handleQ5Answer: function (inputVal) {
            this.infoBox.updateProgress(5);
            this.showNextQuestion(this.q6El);
            this.infoBox.moveToQuestion(this.q6El);
        },

        handleQ6Answer: function (btnNum) {
            this.infoBox.updateProgress(6);
            this.showNextQuestion(this.q7El);
            this.infoBox.moveToQuestion(this.q7El);
        },

        handleQ7Answer: function (inputVal) {
            this.infoBox.updateProgress(7);
            this.resultsButton.removeClass('faddedElement');
            this.toggleAllElInside(this.resultsButton, true);
        },

        /* Removes all the selecedQuestion classes, allowing a selected class to be added correctly */
        removeAllSelectedClasses: function () {
            this.el.find('.selectedQuestionBox').each(function () {
                $(this).removeClass('selectedQuestionBox');
                $(this).addClass('unselectedQuestionBox');
                $(this).next('.mobile-help').removeClass('mobile-help__active');
            });
        },

        highlightQuestion: function (question) {
            question.addClass('selectedQuestionBox');
            question.removeClass('unselectedQuestionBox');

            var $mobileHelp = question.next('.mobile-help');
            $mobileHelp.removeClass('faddedElement');
            this.toggleAllElInside($mobileHelp, true);
            $mobileHelp.addClass('mobile-help__active');
        },

        showNextQuestion: function (nextQuestionBoxEl) {
            this.highlightQuestion(nextQuestionBoxEl);
            nextQuestionBoxEl.removeClass('faddedElement');
            this.toggleAllElInside(nextQuestionBoxEl, true);
        },

        toggleAllElInside: function (el, enabled) {
            el.find('*').addBack().prop('disabled', !enabled);
        },

        processMeansTest: function () {
            news.pubsub.emit(eventStrs.getMeansTestResult, [this.user]);
        },

        showResults: function (meansTestResult) {
            this.scrollPageToTop();
            this.el.hide();
            news.pubsub.emit(eventStrs.showResults, [meansTestResult]);
        },

        scrollPageToTop: function () {
            news.pubsub.emit('window:scrollTo', [0, 0]);
        }

    };

    return MeansTestQuestionsMediator;

});