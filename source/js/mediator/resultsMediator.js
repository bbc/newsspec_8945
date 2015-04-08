define(['lib/news_special/bootstrap', 'model/eventStrs', 'lib/news_special/template_engine', 'd3'], function (news, eventStrs, tmpl, d3) {

    'use strict';

    var ResultsMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.el = news.$('.result-page');
        this.introDefault = news.$('.intro-message__default');
        this.introEnglandResults = news.$('.intro-message__england');
        this.backButtonBtn = this.el.find('.result-page--back-button');
        this.moreDetailsBtn = this.el.find('.more-details-btn');
        this.moreDetailsBtnBottom = this.el.find('.more-details-btn__bottom');
        this.moreDetails = this.el.find('.more-details');
        this.totalChart = this.el.find('#results-chart--chart__total');
        this.chartTmplName = 'chart_tmpl';
        this.userContributionDisplay = this.el.find('.result-total--amount');
        this.contributionTimeline = this.el.find('.result-total--timeline');
        this.totalSummary = this.el.find('.result-total--summary');
        this.whoForDataName = 'self-text';
        this.breakDownLivingEl = this.el.find('.calc-item--val__living');
        this.breakDownCareEl = this.el.find('.calc-item--val__care');
        this.breakDownTotalEl = this.el.find('.calc-item--val__total');
        this.privateAvgEL = this.el.find('.breakdown-desc__amount__private');
        this.regionAvgEl = this.el.find('.breakdown-desc__amount__region');
        this.careTotalAmountEl = this.el.find('.care-bill--amount');
        this.compareTotalValEl = this.el.find('.compare--total__val');
        this.getsHelpEl = this.el.find('.care-bill--desc__help');
        this.getsNoHelpEl = this.el.find('.care-bill--desc__no-help');
        this.houseIncEl = this.el.find('.care-bill--house-inc');
        this.houseExcEl = this.el.find('.care-bill--house-exc');
        this.dataAuthority = null; /* Holds the authority info */

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.init();
    };

    ResultsMediator.prototype = {

        init: function () {
			/***************************
                * LISTENERS
            ***************************/
            news.pubsub.on(eventStrs.showResults, this.handleDisplayResults.bind(this));
            news.pubsub.on(eventStrs.whoForSelected, this.handleWhoForSelect.bind(this));
            news.pubsub.on(eventStrs.displayEngland, this.displayRegionData.bind(this));

            this.backButtonBtn.on('click', this.handleBackBtn.bind(this));
            this.moreDetailsBtn.on('click', this.toggleMoreDetails.bind(this));
        },

        supportsSvg: function () {
            return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1');
        },

        /* Update to the correct text */
        handleWhoForSelect: function (user) {
            var self = this;
            this.whoForDataName = (user === 'self') ? 'self-text' : 'else-text';
            this.el.find('[data-self-text]').each(function () {
                var html = $(this).data(self.whoForDataName);
                $(this).html(html);
            });
        },

        /*
            All elements that contain data-updating-el="true" will be parsed by this function,
            works the same as handleWhoForSelect, but replaces common values
        */
        updateDynamicText: function () {
            var self = this;
            this.el.find('[data-updating-el="true"]').each(function () {
                var html = $(this).data(self.whoForDataName);
                html = html.replace('{REGION}', self.dataAuthority.regionName);
                $(this).html(html);
            });
        },

        handleBackBtn: function () {
            this.el.fadeOut(200, function () {
                news.pubsub.emit(eventStrs.backToQuestions);
            });

            /* REMOVE THE CASE STUDIES */
            var message = {
                toggleCaseStudies: false,
                hostPageCallback: false
            };
            window.parent.postMessage(window.location.pathname + '::' + JSON.stringify(message), '*');

            this.introDefault.show();
            this.introEnglandResults.hide();
        },

        yearMonthsStringFormat: function (val) {
            return (val === 1) ? '': 's';
        },

        handleDisplayResults: function (result) {
            this.introDefault.hide();
            this.introEnglandResults.show();

            this.el.css('display', 'block');
            // if (this.supportsSvg()) {
            this.displayTotalChart(result);
            // }

            this.userContributionDisplay.text(this.currencyFormat(result.totalCareCosts.user));
            this.contributionTimeline.html(
                'Over <span class="result-total--timeline__years">' + result.timeToReachCap.years + '</span> year' + this.yearMonthsStringFormat(result.timeToReachCap.years) + ' &amp; <span class="result-total--timeline__months">' + result.timeToReachCap.months + '</span> month' + this.yearMonthsStringFormat(result.timeToReachCap.months)
            );

            var totalAmount = this.currencyFormat(result.totalCareCosts.user + result.totalCareCosts.council);
            this.careTotalAmountEl.text(totalAmount);

            var totalSummaryHtml = this.totalSummary.data(this.whoForDataName);
            totalSummaryHtml = totalSummaryHtml.replace('{TOTAL_BILL}', totalAmount);
            
            this.totalSummary.html(totalSummaryHtml);

            this.toggleHouseAndHelpText(result);

            this.displayBreakDownValues(result);
            this.updateDynamicText();

            /* SHOW THE CASE STUDIES */
            var message = {
                toggleCaseStudies: true,
                hostPageCallback: false
            };
            window.parent.postMessage(window.location.pathname + '::' + JSON.stringify(message), '*');
        },
        toggleHouseAndHelpText: function (result) {
            if (result.totalCareCosts.council > 0) {
                this.getsHelpEl.show();
                this.getsNoHelpEl.hide();
            } else {
                this.getsHelpEl.hide();
                this.getsNoHelpEl.show();
            }

            if (result.propertyOwned) {
                if (result.propertyIncluded) {
                    this.houseIncEl.show();
                    this.houseExcEl.hide();
                } else {
                    this.houseIncEl.hide();
                    this.houseExcEl.show();
                }
            } else {
                this.houseIncEl.hide();
                this.houseExcEl.hide();
            }

            
        },
        displayBreakDownValues: function (result) {
            this.breakDownLivingEl.text(this.currencyFormat(result.livingCosts));
            this.breakDownCareEl.text(this.currencyFormat(result.careCosts));

            var total = this.currencyFormat(result.livingCosts + result.careCosts);
            this.breakDownTotalEl.text(total);
        },

        toggleMoreDetails: function () {

            if (this.moreDetails.css('display') === 'none') {
                this.moreDetails.slideDown(1000);
                this.moreDetailsBtn.text('Show less detail');
                this.moreDetailsBtnBottom.fadeIn(200);
                news.pubsub.emit('istats', ['click-show-more-detail', 'newsspec-interaction-detail', 'more']);
            } else {
                this.moreDetailsBtnBottom.fadeOut(200);
                this.moreDetails.slideUp(1000);
                this.moreDetailsBtn.text('Show more detail');
                news.pubsub.emit('istats', ['click-show-more-detail', 'newsspec-interaction-detail', 'less']);
            }

        },

        displayRegionData: function (data) {
            this.dataAuthority = data;
            this.privateAvgEL.text(this.currencyFormat(data.residentialCare.privateCost));
            this.regionAvgEl.text(this.currencyFormat(data.residentialCare.regionCost));
            this.compareTotalValEl.text(this.currencyFormat(data.homeCare.localCost));
        },

        displayTotalChart: function (result) {
            var firstText = (this.whoForDataName === 'self-text') ? 'Your contributions' : 'Individual\'s contribution';

            var chartData = {
                'firstText': firstText,
                'firstTotal': result.totalCareCosts.user,
                'chartDesc': 'Over <strong>' + result.timeToReachCap.years + '</strong> year' + this.yearMonthsStringFormat(result.timeToReachCap.years) + ' &amp; <strong>' + result.timeToReachCap.months + '</strong> month' + this.yearMonthsStringFormat(result.timeToReachCap.months),
                'lastText': 'Council contributions',
                'lastTotal': result.totalCareCosts.council,
                'colors': ['#025757', '#319593']
            };

            this.drawRadialChart(this.totalChart, chartData);
        },

        currencyFormat: function (val) {
            return '£' + Math.round(val).toString().replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },

        drawRadialChart: function ($elm, chartData) {
            chartData.firstAmount = this.currencyFormat(chartData.firstTotal);
            chartData.lastAmount = this.currencyFormat(chartData.lastTotal);
            var total = this.currencyFormat(chartData.firstTotal + chartData.lastTotal);

            $elm.closest('.results-chart').show();

            $elm.html(tmpl(this.chartTmplName, chartData));

            $elm.find('.chart--first-text .chart--amount-text').css('color', chartData.colors[0]);
            $elm.find('.chart--last-text .chart--amount-text').css('color', chartData.colors[1]);

            if (!this.supportsSvg()) {
                $elm.find('.chart--svg--alternative').show();
                $elm.find('.svg--alternative--total').text(total);
                return;
            }

            $elm.find('.chart--svg').show();

            var data = [ {name: chartData.firstText, value: chartData.firstTotal},
                        {name: chartData.lastText, value:  chartData.lastTotal}];

            var width = 152,
                height = 152;

            var d3Array = $elm.find('.chart--svg').toArray();

            var chart = d3.selectAll(d3Array)
                            .attr('width', width)
                            .attr('height', height)
                           .append('g')
                            .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');


            var radius = Math.min(width, height) / 2;

            var color = d3.scale.ordinal()
                .range(chartData.colors);

            var arc = d3.svg.arc()
                .outerRadius(radius)
                .innerRadius(radius - 20);

            var pie = d3.layout.pie()
                .sort(null)
                .startAngle(1.25 * Math.PI)
                .endAngle(3.25 * Math.PI)
                .value(function (d) { return d.value; });


            var g = chart.selectAll('.arc')
              .data(pie(data))
            .enter().append('g')
              .attr('class', 'arc');

            var chartBody = chart.append('foreignObject')
                .attr('x', -60)
                .attr('y', -25)
                .attr('width', 120)
                .attr('height', 100)
              .append('xhtml:body')
                .style('background', 'none');

            chartBody.append('xhtml:span')
               .attr('class', 'results-chart--total')
               .text('Total');

            chartBody.append('xhtml:span')
               .attr('class', 'results-chart--amount')
               .text(total);

            g.append('path')
              .style('fill', function (d) { return color(d.data.name); })
              .transition().delay(function (d, i) { return i * 470; }).duration(470)
              .attrTween('d', function (d) {
                    var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                    return function (t) {
                        d.endAngle = i(t);
                        return arc(d);
                    };
                });
        }
    };

    return ResultsMediator;

});