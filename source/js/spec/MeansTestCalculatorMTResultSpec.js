define(['lib/news_special/bootstrap', 'model/User', 'model/MeansTestCalculator', 'spec/features/fixtureData_finaldata'],  function (news, User, MeansTestCalculator, fixtureData) {
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

    function toNearestHundred(str) {
        var value = asNumber(str);
        return 100 * Math.floor((value + 50) / 100);
    }

    beforeEach(function () {
        news.$('body').append('<div class="main">some fixture data <div id="main">test em!</div></div>');
        this.addMatchers(customMatchers);
    });

    afterEach(function () {
        news.$('.main').remove();
    });

    describe('MeansTestCalculatorMTResult', function () {

        describe('meansTestResult()', function () {
            it('Expects user contributions to be within 200 of the expected value', function () {
                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    var result = mtc.meansTestResult();

                    //expect(result.totalCareCosts.user).valueWithinRangeOfPercentagePoints(asNumber(o.totalPaidByUser), 0.5);
                    expect(result.totalCareCosts.user).valueWithinRangeOf(toNearestHundred(o.totalPaidByUser), 200);
                }
            });
            it('Expects council contributions to be within 2.3% of expected value', function () {
                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    var result = mtc.meansTestResult();

                    expect(result.totalCareCosts.council).valueWithinRangeOfPercentagePoints(toNearestHundred(o.councilPays), 2.3);

                }
            });
            it('Expects total costs of care to NOT be different from the expected value', function () {
                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    var result = mtc.meansTestResult();

                    expect(result.totalCareCosts.total).toBe(toNearestHundred(o.totalCost));
                }
            });
            // xit('Returns valid means test result for attendance allowance contribution to care', function () {
            //     for (var i in fixtureData) {
            //         var user = new User(),
            //             o = fixtureData[i];
                
            //         user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
            //         var mtc = new MeansTestCalculator();
            //         mtc.setUser(user);
            //         mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
            //         mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
            //         var result = mtc.meansTestResult();

            //         expect(result.totalCareCosts.attendanceAllowance).toBe(toNearestHundred(o.aaPays));
                
            //     }
            // });
            it('Expects weekly living costs to be 230', function () {
                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    var result = mtc.meansTestResult();

                    expect(result.livingCosts).toBe(230);
                
                }
            });
            it('Expects weekly care costs (weekly costs less living costs) to be difference of weekly costs and 230', function () {
                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    var result = mtc.meansTestResult();

                    expect(result.careCosts).toBeCloseTo((asNumber(o.weeklyCost) - 230), 3);
                
                }
            });
            it('Expects total living costs to be the same as expected value', function () {
                for (var i in fixtureData) {
                    var user = new User(),
                        o = fixtureData[i];
                
                    user.ownsProperty(asNumber(o.home)).property(asNumber(o.homeValue)).propertyShared(asNumber(o.homeShared)).propertyJointOwnership(asNumber(o.homeJointlyOwned)).capital(asNumber(o.capital)).capitalShared(asNumber(o.capitalJointlyOwned)).income(asNumber(o.income));
                    
                    var mtc = new MeansTestCalculator();
                    mtc.setUser(user);
                    mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(asNumber(o.weeklyCost));
                    mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                    var result = mtc.meansTestResult();
                    // expect(result.timeToReachCap).toBe(asNumber(o.weeksToCap));

                    expect(result.livingCostsTotal).toBe(toNearestHundred(asNumber(o.weeksToCapPastThePost) * 230));
                }
            });
            it('Returns correctly formated 2 years for 102.3weeks', function () {
                var user = new User();
            
                user.ownsProperty(0).property(0).propertyShared(0).propertyJointOwnership(0).capital(0).capitalShared(0).income(0);
                
                var mtc = new MeansTestCalculator();
                mtc.setUser(user);
                mtc.getWeeklyCosts = jasmine.createSpy('getWeeklyCosts spy').andReturn(3);
                mtc.getAttendanceAllowance = jasmine.createSpy('getAttendanceAllowance spy').andReturn(85);
                mtc.timeToReachCap = jasmine.createSpy('timeToReachCap spy').andReturn(102.3);
                var result = mtc.meansTestResult();
                // expect(result.timeToReachCap).toBe(asNumber(o.weeksToCap));

                expect(result.timeToReachCap.years).toBe(2);
                expect(result.timeToReachCap.months).toBe(0);
            });


        });



    });
});