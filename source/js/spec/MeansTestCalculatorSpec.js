define(['lib/news_special/bootstrap', 'model/User', 'model/MeansTestCalculator', 'spec/features/fixtureData'],  function (news, User, MeansTestCalculator, fixtureData) {
    var customMatchers = {
        valueWithinRangeOf: function (expected, absDifference) {
            this.message = function () {
                return 'Expected the difference between ' + this.actual + ' and ' + expected + ' to be less than or equal to ' + absDifference;
            };
            return (Math.abs(expected - this.actual) <= absDifference);
        },
        valueWithinRangeOfPercentagePoints: function (expected, absDifference) {
            this.message = function () {
                return 'Expected ' + this.actual + ' to be within ' + absDifference + '% points of ' + expected;
            };
            return ((Math.abs(expected - this.actual) / expected <= absDifference / 100) || (this.actual === expected));
        }
    };

    function asNumber(str) {
        return parseFloat(str);
    }

    beforeEach(function () {
        news.$('body').append('<div class="main">some fixture data <div id="main">test em!</div></div>');
        this.addMatchers(customMatchers);
    });

    afterEach(function () {
        news.$('.main').remove();
    });

    describe('MeansTestCalculator', function () {

        describe('totalAssets()', function () {
            it('Should add up capital and property values', function () {
                var user = new User();
                user.capital(27000).property(200).propertyShared(0).propertyJointOwnership(1).income(100);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                expect(mtc.totalAssets()).toEqual(27100);
            });
            it('Should halve property where property is jointly owned', function () {
                var user = new User();
                user.capital(27000).property(200).propertyShared(0).propertyJointOwnership(1).income(100);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                expect(mtc.totalAssets()).toEqual(27100);
            });
            it('Should exclude property where property is shared with someone old or disabled', function () {
                var user = new User();
                user.capital(27000).property(200).propertyShared(1).propertyJointOwnership(1).income(100);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                expect(mtc.totalAssets()).toEqual(27000);
            });
            it('Should exclude property where there is no property', function () {
                var user = new User();
                user.capital(27000).propertyJointOwnership(1).income(100);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                expect(mtc.totalAssets()).toEqual(27000);
            });
            it('Returns the correct amount with a variety of scenarios', function () {
                var i, user, o, mtc;

                for (i in fixtureData) {
                    user = new User();
                    o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));

                    expect(mtc.totalAssets()).valueWithinRangeOfPercentagePoints(asNumber(o.totalAssets), 2);
                }
            });
        });

        describe('accessibleTotalAssets()', function () {
            it('Should return the difference between 17000 and the sum of capital and property', function () {
                var dataArray = [
                    {capital: 27000, property: 200, propertyShared: 0, propertyJointOwnership: 1, income: 100, accessibleTotalAssets: 10100},
                    {capital: 127000, property: 200, propertyShared: 0, propertyJointOwnership: 1, income: 100, accessibleTotalAssets: 110100},
                    {capital: 9000, property: 2000, propertyShared: 0, propertyJointOwnership: 0, income: 100, accessibleTotalAssets: 0}
                ];

                for (var obj in dataArray) {
                    var user = new User();
                    var o = dataArray[obj];
                    user.capital(o.capital).property(o.property).propertyShared(o.propertyShared).propertyJointOwnership(o.propertyJointOwnership).income(o.income);
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    expect(mtc.accessibleTotalAssets()).toEqual(o.accessibleTotalAssets);
                }

            });
            it('Should return 0 if sum of capital and property is less than 17000', function () {
                var dataArray = [
                    {capital: 9000, property: 2000, propertyShared: 0, propertyJointOwnership: 0, income: 100, accessibleTotalAssets: 0}
                ];

                for (var obj in dataArray) {
                    var user = new User();
                    var o = dataArray[obj];
                    user.capital(o.capital).property(o.property).propertyShared(o.propertyShared).propertyJointOwnership(o.propertyJointOwnership).income(o.income);
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    expect(mtc.accessibleTotalAssets()).toEqual(o.accessibleTotalAssets);
                }

            });
        });

        describe('timeToReachCap()', function () {
            it('Should return the number of weeks for user to reach 72k care cap', function () {
                for (var i in fixtureData) {
                    var user = new User();
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(o.weeklyCost);
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    
                    expect(mtc.timeToReachCap()).toBe(asNumber(o.weeksToCapPastThePost));
                }
            });
        });

        describe('getMeansTestThreshold()', function () {
            it('Should 118000 as upper capital limit when user owns property and property is not shared', function () {
                var dataArray = [
                    {ownProperty: 1, property: 10, propertyJointOwnership: 1, propertyShared: 2, upperCapitalLimit: 118000},
                    {ownProperty: 1, property: 10, propertyJointOwnership: 2, propertyShared: 2, upperCapitalLimit: 118000}
                ];

                for (var i in dataArray) {
                    var o = dataArray[i],
                        user = new User();

                    if (o.hasOwnProperty('property')) {
                        user.ownsProperty(o.ownProperty).property(o.property);
                    }

                    user.propertyJointOwnership(o.propertyJointOwnership).propertyShared(o.propertyShared);
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                        
                    expect(mtc.getMeansTestThreshold()).toBe(o.upperCapitalLimit);
                }
                
            });
            it('Should 27000 as upper capital limit when property is owned and is shared', function () {
                var dataArray = [
                    {ownProperty: 1, property: 10, propertyJointOwnership: 1, propertyShared: 1, upperCapitalLimit: 27000},
                    {ownProperty: 1, property: 10, propertyJointOwnership: 2, propertyShared: 1, upperCapitalLimit: 27000}
                ];

                for (var i in dataArray) {
                    var o = dataArray[i],
                        user = new User();

                    if (o.hasOwnProperty('property')) {
                        user.ownsProperty(o.ownProperty).property(o.property);
                    }

                    user.propertyJointOwnership(o.propertyJointOwnership).propertyShared(o.propertyShared);
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                        
                    expect(mtc.getMeansTestThreshold()).toBe(o.upperCapitalLimit);
                }
                
            });
            it('Should 118000 as upper capital limit when there is no property', function () {
                var dataArray = [
                    {ownProperty: 2, upperCapitalLimit: 118000},
                    {ownProperty: 2, property: 10, propertyJointOwnership: 1, propertyShared: 1, upperCapitalLimit: 118000},
                    {ownProperty: 2, property: 10, propertyJointOwnership: 0, propertyShared: 1, upperCapitalLimit: 118000},
                    {propertyJointOwnership: 0, propertyShared: 1, upperCapitalLimit: 118000}
                ];

                for (var i in dataArray) {
                    var o = dataArray[i],
                        user = new User();

                    if (o.hasOwnProperty('property')) {
                        user.ownsProperty(o.ownProperty).property(o.property);
                    }

                    user.propertyJointOwnership(o.propertyJointOwnership).propertyShared(o.propertyShared);
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                        
                    expect(mtc.getMeansTestThreshold()).toBe(o.upperCapitalLimit);
                }
                
            });
        });

        describe('getSetWeeklyCosts()', function () {
            it('set and get weekly care costs for a given council', function () {
                var user = new User(),
                    mtc = new MeansTestCalculator(user),
                    data = {residentialCare: {localCost: 10}};

                mtc.setWeeklyCosts(data);
                expect(mtc.getWeeklyCosts()).toEqual(data.residentialCare.localCost);
            });
        });

        describe('getNetincome()', function () {
            it('Should return income less 24.40', function () {
                var user = new User();
                user.capital(100).income(174.40);
                var mtc = new MeansTestCalculator();
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                mtc.setUser(user);
                expect(mtc.getNetincome()).toBeCloseTo(235, 3);
            });
        });

        describe('getPersonalExpensesAllowance()', function () {
            it('Should return 24.4 for users with an income above 24.4 otherwise returns value of user\'s income is returned', function () {
                var user = new User(),
                    pea;

                for (var i in fixtureData) {
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                    if (asNumber(o.income) < 24.4) {
                        expect(mtc.getPersonalExpensesAllowance()).toBe(asNumber(o.income));
                    } else {
                        expect(mtc.getPersonalExpensesAllowance()).toBe(24.4);
                    }
                }
            });
        });

        describe('assetsDepletionRate()', function () {
            it('Should have a value greater or equal to 0', function () {
                var user = new User();
                user.capital(10).income(226.13);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(1.10);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                expect(mtc.assetsDepletionRate()).toBe(0);
            });
            it('Should have a value greater or equal to 0', function () {
                var user = new User();
                user.ownsProperty(1).property(0).propertyShared(2).propertyJointOwnership(2).capital(17000).capitalShared(2).income(0);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(777.4);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                expect(mtc.assetsDepletionRate()).toBeCloseTo(692.4, 3);
            });

            it('Should have a value greater or equal to 0', function () {
                var user = new User();
                user.capital(10).income(226.13);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(1.10);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                expect(mtc.assetsDepletionRate()).toBe(0);
            });

            it('Should return correct value for assets dep ratio', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                expect(mtc.assetsDepletionRate()).toBeCloseTo(468.07, 3);
            });

            it('Should return a valid amount by which assets depreciate by', function () {
                var user = new User();

                for (var i in fixtureData) {
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                    expect(mtc.assetsDepletionRate()).toBeCloseTo(asNumber(o.assetsDepletionRate), 3);
                }
            });
        });

        describe('numberOfWeeksAboveUpperCapitalLimit()', function () {
            it('Should return the time taken to reach cross over point', function () {
                var user = new User();
                user.ownsProperty(1).property(1500000).propertyShared(1).propertyJointOwnership(1).capital(10000).capitalShared(1).income(450);
                // user.ownsProperty(1).property(225000).propertyShared(2).propertyJointOwnership(1).capital(2500).capitalShared(2).income(250);
                // user.ownsProperty(1).property(225000).propertyShared(2).propertyJointOwnership(1).capital(2500).capitalShared(2).income(250);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(435.8);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                // mtc.setWeeklyCosts({residentialCare: {localCost: "454.10"}});
                expect(mtc.numberOfWeeksAboveUpperCapitalLimit()).valueWithinRangeOf(0, 1);
            });

            it('Should return correct value for means test tarrif income for user scenario', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                expect(mtc.numberOfWeeksAboveUpperCapitalLimit()).toBe(0);
            });

            it('Should return a valid number of weeks for a variety of scenarios', function () {
                // Should return number of weeks equal to time to reach care cap for a user with very high income
                // Should return 0 for a user who automatically gets Means Tested
                // Should return the number of weeks a user can pay for care before becoming Means Tested

                var user = new User();

                for (var i in fixtureData) {
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                    // console.log(i);
                    // console.log(mtc.numberOfWeeksAboveUpperCapitalLimit(), o.numberOfWeeksAboveMT);

                    expect(mtc.numberOfWeeksAboveUpperCapitalLimit()).toBeCloseTo(o.numberOfWeeksAboveMT, 3);
                }
            });
        });

        describe('assetsValueAtCrossOverPoint()', function () {

            it('Should return correct value for means test tarrif income for user scenario', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                expect(mtc.assetsValueAtCrossOverPoint()).toBeCloseTo(134017.50, 1);
            });

            it('Should return correct value for a variety if inputs', function () {
                var user = new User();

                for (var i in fixtureData) {
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                    expect(mtc.assetsValueAtCrossOverPoint()).toBeCloseTo(o.assetValueAtCOP, 1);
                }
            });
        });

        describe('numberOfWeeksToReachCrossOverPoint()', function () {
            it('Should return the time taken to reach cross over point', function () {
                var user = new User();
                user.ownsProperty(1).property(1500000).propertyShared(1).propertyJointOwnership(1).capital(10000).capitalShared(1).income(450);
                // user.ownsProperty(1).property(225000).propertyShared(2).propertyJointOwnership(1).capital(2500).capitalShared(2).income(250);
                // user.ownsProperty(1).property(225000).propertyShared(2).propertyJointOwnership(1).capital(2500).capitalShared(2).income(250);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(435.8);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                // mtc.setWeeklyCosts({residentialCare: {localCost: "454.10"}});
                expect(mtc.numberOfWeeksToReachCrossOverPoint()).toBeCloseTo(350, 3);
            });

            it('Should return correct value for means test tarrif income for user scenario', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                expect(mtc.numberOfWeeksToReachCrossOverPoint()).toBe(0);
            });

            it('Should return correct value for a variety if inputs', function () {
                var user = new User();

                for (var i in fixtureData) {
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                    expect(mtc.numberOfWeeksToReachCrossOverPoint()).toBeCloseTo(asNumber(o.weeksToCOP), 3);
                }
            });
        });

        describe('assetsLevelAtTarrifIncomeCalculation()', function () {

            it('Should return correct value for means test tarrif income for user scenario', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                expect(mtc.assetsLevelAtTarrifIncomeCalculation()).toBeCloseTo(6000, 1);
            });

            it('Returns the value of assets at the point when means tested support is calculated according to tarriff income', function () {
                var user = new User();

                for (var i in fixtureData) {
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                    expect(mtc.assetsLevelAtTarrifIncomeCalculation()).toBeCloseTo(asNumber(o.finalAssetValue), 1);
                }
            });
        });

        describe('numberOfWeeksInMeansTestedSupport()', function () {

            it('Should return correct value for means test tarrif income for user scenario', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                // var diff = Math.abs(mtc.averageTarriffIncome() - 549.37);

                expect(mtc.numberOfWeeksInMeansTestedSupport()).toBe(157);
            });

            it('Returns the number of weeks when means tested support is calculated according to tarriff income', function () {
                var user = new User();

                for (var i in fixtureData) {
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    
                    // mtc.setWeeklyCosts({residentialCare: {localCost: o.weeklyCost}});
                    
                    expect(mtc.numberOfWeeksInMeansTestedSupport()).toBe(asNumber(o.weeksRemaining));
                }
            });
        });

        describe('averageTarriffIncome()', function () {

            it('Should return correct value for means test tarrif income for user scenario', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                // var diff = Math.abs(mtc.averageTarriffIncome() - 549.37);

                expect(mtc.averageTarriffIncome()).toBe(0);
            });

            it('Returns the average tarriff income from a user\'s assets', function () {
                var user = new User();

                for (var i in fixtureData) {
                    var o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    // mtc.setWeeklyCosts({residentialCare: {localCost: o.weeklyCost}});
                    mtc.timeToReachCap = jasmine.createSpy('timeToReachCap spy').andReturn(asNumber(o.weeksToCap));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    
                    expect(mtc.averageTarriffIncome()).valueWithinRangeOf(o.averageTI, 1);
                }
            });
        });

        describe('averageMTSupport()', function () {
            it('Should return the time taken to reach cross over point', function () {
                var user = new User();
                user.ownsProperty(1).property(0).propertyShared(2).propertyJointOwnership(2).capital(17000).capitalShared(2).income(0);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(777.4);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                var diff = Math.abs(mtc.averageMTSupport() - 777.4);

                expect(diff).toBeLessThan(1);
                expect(mtc.averageMTSupport()).toBeCloseTo(777.4, 3);

            });

            it('Should return correct value for means test support given to user for scenario', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                var diff = Math.abs(mtc.averageMTSupport() - 549.37);

                expect(diff).toBeLessThan(1);
                expect(mtc.averageMTSupport()).toBeCloseTo(549.37, 3);
            });

            it('Returns the average means test support given to a user', function () {
                

                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    // mtc.setWeeklyCosts({residentialCare: {localCost: o.weeklyCost}});
                    // mtc.averageTarriffIncome();
                    var diff = Math.abs(mtc.averageMTSupport() - o.averageSupport);

                    expect(diff).toBeLessThan(1);

                }
            });
        });

        describe('attendanceAllowancePays()', function () {
            it('Should return the time taken to reach cross over point', function () {
                var user = new User();
                user.ownsProperty(1).property(250000).propertyShared(1).propertyJointOwnership(1).capital(63000).capitalShared(1).income(345);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(609.3);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                var diff = Math.abs(mtc.attendanceAllowancePays() - 1955);
                expect(diff / 1955).toBeLessThan(0.04);

            });

            it('Should return the time taken to reach cross over point', function () {
                var user = new User();
                user.ownsProperty(1).property(178000).propertyShared(1).propertyJointOwnership(1).capital(30000).capitalShared(2).income(159);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(432);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                var diff = Math.abs(mtc.attendanceAllowancePays() - 1275);
                expect(diff / 1275).toBeCloseTo(0.05, 0);
            });

            it('Should return the total amount contributed by AA for additional scenario', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                expect(mtc.attendanceAllowancePays()).toBe(0);
            });

            it('Returns the total amount contributed by attendance allowance', function () {
                var i, user, o, mtc;

                for (i in fixtureData) {
                    user = new User();
                    o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                    var diff = Math.abs(mtc.attendanceAllowancePays() - asNumber(o.aaPays));

                    
                    expect(mtc.attendanceAllowancePays()).toBe(asNumber(o.aaPays));

                }
            });
        });

        describe('councilPays()', function () {
            it('Should return the time taken to reach cross over point', function () {
                // Scenario_173
                var user = new User();
                user.ownsProperty(1).property(140000).propertyShared(2).propertyJointOwnership(2).capital(8000).capitalShared(2).income(190);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(515.2);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                // expect(mtc.councilPays()).toBeCloseTo(601.7648, -1);
                var diff = Math.abs(mtc.councilPays() - 601.7648);
                expect(diff).toBeLessThan(5);
                // expect(101).toBeCloseTo(103, -1);

            });
            it('Should return the time taken to reach cross over point', function () {
                // Scenario_173
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(2).propertyJointOwnership(2).capital(17340).capitalShared(2).income(136);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(417.5);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                // expect(mtc.councilPays()).toBeCloseTo(601.7648, -1);
                // var diff = Math.abs(mtc.councilPays() - 117186.7);
                // console.log('council', mtc.councilPays());
                // expect(diff).toBeLessThan(5);
                expect(mtc.councilPays()).valueWithinRangeOfPercentagePoints(117186.7, 1);
                // expect(101).toBeCloseTo(103, -1);

            });

            it('Should return correct value for assets dep ratio', function () {
                var user = new User();
                user.ownsProperty(2).property(0).propertyShared(1).propertyJointOwnership(2).capital(12000).capitalShared(1).income(165);
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(689.97);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(81.30);

                expect(mtc.councilPays()).valueWithinRangeOfPercentagePoints(86251.09, 0.8);
            });
            
            
            it('Returns the total contributions made by a council towards care', function () {

                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    // difference within 0.8% of expected value
                    expect(mtc.councilPays()).valueWithinRangeOfPercentagePoints(asNumber(o.councilPays), 0.8);
                }
            });
        });

        describe('userPays()', function () {
            it('Returns the total amount a user pays for their care', function () {
                

                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    
                    expect(mtc.userPays()).valueWithinRangeOfPercentagePoints(asNumber(o.userPays), 0.5);
                }
            });
        });

        describe('totalPaidByUser()', function () {
            it('Returns the total amount a user pays (user\'s contribution + attendance allowance contribution)', function () {

                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);

                    expect(mtc.totalPaidByUser()).valueWithinRangeOfPercentagePoints(asNumber(o.totalPaidByUser), 0.5);
                }
            });
        });

        describe('totalCostOfCare()', function () {
            it('Returns the total cost of care', function () {

                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    
                    expect(mtc.totalCostOfCare()).toBeCloseTo(asNumber(o.totalCost), 3);
                }
            });
        });

    });
});