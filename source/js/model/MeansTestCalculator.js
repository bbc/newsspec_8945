define(['lib/news_special/bootstrap', 'model/eventStrs'], function (news, eventStrs) {
    var PROPERTY_EXCLUDED_THRESHOLD                         = 27000,
        PROPERTY_INCLUDED_THRESHOLD                         = 118000,
        LOWER_CAPITAL_LIMIT                                 = 17000,
        WEEKLY_HOTEL_COST                                   = 230,
        CARE_COST_LIMIT                                     = 72000,
        TARRIFED_INCOME_DIVISOR                             = 250,
        PERSONAL_EXPENSES_ALLOWANCE                         = 24.4,
        ATTENDANCE_ALLOWANCE                                = 81.3,
        REASSESSMENT_PERIOD                                 = 52;


    function MeansTestCalculator(user) {
        this.user = null;
        this._numberOfWeeksAffordableBeforeHelp = null;
        this._meansTestThreshold = null;
        this._amountPaidBeforeSeekingHelp = 0;
        this._weeklyCosts = 0;
        this._swapOverPointReached = false;
        this._cummulativeAssessmentWeeks = 0;
        this._cummulativeStateSupport = 0;
        // setup
        this.init(user);
    }

    MeansTestCalculator.prototype = {
        init: function () {
            news.pubsub.on(eventStrs.displayEngland, this.setWeeklyCosts.bind(this));
            news.pubsub.on(eventStrs.getMeansTestResult, this.meansTestResult.bind(this));
        },
        getAttendanceAllowance: function () {
            return ATTENDANCE_ALLOWANCE;
        },
        setUser: function (user) {
            this.user = user;
            this.setMeansTestThreshold();
            return this;
        },
        setWeeklyCosts: function (data) {
            var weeklyCosts = parseFloat(data.residentialCare.localCost);
            if (!isNaN(weeklyCosts)) {
                this._weeklyCosts = weeklyCosts;
                return this;
            } else {
                throw new Error('Expected weekly costs to be a number instead got ' + data.residentialCare.localCost);
            }
            
        },
        getWeeklyCosts: function () {
            return this._weeklyCosts;
        },
        timeToReachCap: function () {
            // return Math.round(CARE_COST_LIMIT / (this.getWeeklyCosts() - WEEKLY_HOTEL_COST) * 10) / 10;
            return Math.ceil(CARE_COST_LIMIT / (this.getWeeklyCosts() - WEEKLY_HOTEL_COST));
        },
        setMeansTestThreshold: function () {
            this._meansTestThreshold = (this.user.ownsProperty() && this.user.propertyShared()) ? PROPERTY_EXCLUDED_THRESHOLD: PROPERTY_INCLUDED_THRESHOLD;
            return this;
        },
        getMeansTestThreshold: function () {
            return this._meansTestThreshold;
        },
        getNetincome: function () {
            return Math.max(this.user.income() + this.getAttendanceAllowance() - this.getPersonalExpensesAllowance(), 0);
        },
        totalAssets: function () {
            return this.user.capital() + this.user.property();
        },
        accessibleTotalAssets: function () {
            return Math.max(this.totalAssets() - LOWER_CAPITAL_LIMIT, 0);
        },
        getPersonalExpensesAllowance: function () {
            return (this.user.income() < PERSONAL_EXPENSES_ALLOWANCE) ? this.user.income() : PERSONAL_EXPENSES_ALLOWANCE;
        },
        shortFallAmount: function () {
            // (C4+C2-C3-C5)
            return this.getWeeklyCosts() + this.getPersonalExpensesAllowance() - this.getAttendanceAllowance() - this.user.income();
        },
        assetsDepletionRate: function () {
            return Math.max(this.shortFallAmount(), 0);
        },
        numberOfWeeksAboveUpperCapitalLimit: function () {
            var amountAboveMTThreshold = this.totalAssets() - this.getMeansTestThreshold(),
                numberOfWeeksAffordable,
                _numberOfWeeksAboveUpperCapitalLimit = 0;

                // console.log('this.totalAssets(), this.getMeansTestThreshold(), deprate', this.totalAssets(), this.getMeansTestThreshold(), this.assetsDepletionRate());

            if (amountAboveMTThreshold > 0) {
                numberOfWeeksAffordable = Math.min(Math.ceil(amountAboveMTThreshold / this.assetsDepletionRate()), this.timeToReachCap());
                _numberOfWeeksAboveUpperCapitalLimit = (this.assetsDepletionRate() > 0) ? numberOfWeeksAffordable: this.timeToReachCap();
            }

            return _numberOfWeeksAboveUpperCapitalLimit;
        },

        assetsValueAtCrossOverPoint: function () {
            return (this.shortFallAmount() * TARRIFED_INCOME_DIVISOR) + LOWER_CAPITAL_LIMIT;
        },

        numberOfWeeksToReachCrossOverPoint: function () {
            if (this.assetsValueAtCrossOverPoint() < LOWER_CAPITAL_LIMIT) {
                return this.timeToReachCap() - this.numberOfWeeksAboveUpperCapitalLimit();
            } else {
                if (this.assetsDepletionRate() === 0) {
                    if ((this.totalAssets() - (this.assetsDepletionRate() * this.numberOfWeeksAboveUpperCapitalLimit())) > this.assetsValueAtCrossOverPoint()) {
                        return this.timeToReachCap() - this.numberOfWeeksAboveUpperCapitalLimit();
                    } else {
                        return 0;
                    }
                } else {
                    if ((this.totalAssets() - (this.assetsDepletionRate() * this.numberOfWeeksAboveUpperCapitalLimit())) > this.assetsValueAtCrossOverPoint()) {
                        return Math.min(Math.ceil((this.totalAssets() - (this.assetsDepletionRate() * this.numberOfWeeksAboveUpperCapitalLimit()) - this.assetsValueAtCrossOverPoint()) / this.assetsDepletionRate()), this.timeToReachCap() - this.numberOfWeeksAboveUpperCapitalLimit());
                    } else {
                        return 0;
                    }
                }
            }
        },

        assetsLevelAtTarrifIncomeCalculation: function () {
            var assetsValue = this.totalAssets() - (this.assetsDepletionRate() * this.numberOfWeeksAboveUpperCapitalLimit()) - (this.assetsDepletionRate() * this.numberOfWeeksToReachCrossOverPoint());
            return Math.min(assetsValue, this.getMeansTestThreshold(), this.totalAssets());
        },

        numberOfWeeksInMeansTestedSupport: function () {
            return Math.max(this.timeToReachCap() - this.numberOfWeeksAboveUpperCapitalLimit() - this.numberOfWeeksToReachCrossOverPoint(), 0);
        },

        assetsLevelAtCareCap: function (assetsAtStart) {
            var tarriffIncome,
                weeksAtRate,
                stateSupport,
                accessibleAssetsValue;

            accessibleAssetsValue = assetsAtStart - LOWER_CAPITAL_LIMIT;

            tarriffIncome = Math.floor(Math.max(accessibleAssetsValue / TARRIFED_INCOME_DIVISOR, 0));

            if ((this.numberOfWeeksInMeansTestedSupport() - this._cummulativeAssessmentWeeks)  > REASSESSMENT_PERIOD) {
                weeksAtRate = REASSESSMENT_PERIOD;
            } else {
                weeksAtRate = this.numberOfWeeksInMeansTestedSupport() - this._cummulativeAssessmentWeeks;
            }

            stateSupport = Math.max(this.getPersonalExpensesAllowance() + this.getWeeklyCosts() - tarriffIncome - this.user.income(), 0);

            accessibleAssetsValue = assetsAtStart - (weeksAtRate * tarriffIncome);
            this._cummulativeStateSupport += (weeksAtRate * stateSupport);

            this._cummulativeAssessmentWeeks += weeksAtRate;

            if (weeksAtRate < REASSESSMENT_PERIOD) {
                return accessibleAssetsValue;
            }


            return this.assetsLevelAtCareCap(accessibleAssetsValue);
        },

        averageTarriffIncome: function () {
            if (this.numberOfWeeksInMeansTestedSupport() === 0) {
                return 0;
            }
            var finalAssetsValue = this.assetsLevelAtCareCap(this.assetsLevelAtTarrifIncomeCalculation());
            // console.log('finalAssetsValue', finalAssetsValue);
            return (this.assetsLevelAtTarrifIncomeCalculation() - finalAssetsValue) / this.numberOfWeeksInMeansTestedSupport();
        },

        averageMTSupport: function () {
            this.averageTarriffIncome();
            var averageSupport = Math.min(this._cummulativeStateSupport / this._cummulativeAssessmentWeeks, this.getWeeklyCosts());
            // console.log('averageSupport', this._cummulativeStateSupport, this._cummulativeAssessmentWeeks);
            return isNaN(averageSupport) ? 0: averageSupport;
        },

        attendanceAllowancePays: function () {
            this.averageTarriffIncome();
            return this.getAttendanceAllowance() * (this.numberOfWeeksAboveUpperCapitalLimit() + this.numberOfWeeksToReachCrossOverPoint());
        },

        councilPays: function () {
            this.averageTarriffIncome();
            // console.log('numberOfWeeksInMeansTestedSupport,averageMTSupport', this.numberOfWeeksInMeansTestedSupport(), this.averageMTSupport());
            // =('MT calculation'!C24)*'MT calculation'!C22
            // console.log('numberOfWeeksInMeansTestedSupport',this.numberOfWeeksInMeansTestedSupport(), 'averageMTSupport', this.averageMTSupport());
            return this.numberOfWeeksInMeansTestedSupport() * this.averageMTSupport();
        },

        userPays: function () {
            this.averageTarriffIncome();
            var userPays = (this.timeToReachCap() * this.getWeeklyCosts()) - this.councilPays() - this.attendanceAllowancePays();
            return (userPays < 1) ? 0: userPays;
        },

        totalPaidByUser: function () {
            return this.userPays() + this.attendanceAllowancePays();
        },

        totalCostOfCare: function () {
            return this.councilPays() + this.totalPaidByUser();
        },

        timeToReachCapDisplay: function () {
            var weeks    = this.timeToReachCap(),
                yrs   = Math.floor(weeks / 52),
                mth  = Math.round(((weeks / 52) - yrs) * 12);
            if (mth === 12) {
                yrs++;
                mth = 0;
            }
            return {years: yrs, months: mth};
        },

        formatCurrencyForDisplay: function (value, roundedFigure) {
            if (roundedFigure) {
                return 100 * Math.floor((value + 50) / 100);
            }
            return Math.round(value * 100) / 100;
        },

        /* Mother function requires refactoring */
        meansTestResult: function (user) {
            // this.averageTarriffIncome();
            if (user) {
                this.setUser(user);
            }
            var that = this,
                weeksToReachCap     = this.timeToReachCap(),
                result,
                totalCareBill = this.formatCurrencyForDisplay(this.totalCostOfCare(), true),
                councilContribution = this.formatCurrencyForDisplay(this.councilPays(), true),
                userContribution = this.formatCurrencyForDisplay(this.totalPaidByUser(), true);

            result = {
                totalCareCosts: {
                    user: userContribution,
                    council: councilContribution,
                    total: totalCareBill
                },
                timeToReachCap:     that.timeToReachCapDisplay(),
                livingCosts:        WEEKLY_HOTEL_COST,
                careCosts:          that.formatCurrencyForDisplay(this.getWeeklyCosts() - WEEKLY_HOTEL_COST),

                livingCostsTotal:   that.formatCurrencyForDisplay(weeksToReachCap * WEEKLY_HOTEL_COST, true),
                propertyIncluded:   !that.user.propertyShared(),
                propertyOwned: that.user.ownsProperty()
            };

            if (news.$('.result-page').length > 0) {
                news.pubsub.emit(eventStrs.dispalyMeansTestResult, [result]);
            } else {
                return result;
            }
        }
    };

    return MeansTestCalculator;
});