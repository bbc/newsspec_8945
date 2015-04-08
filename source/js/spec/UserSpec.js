define(['lib/news_special/bootstrap', 'model/User'],  function (news, User) {

    beforeEach(function () {
        news.$('body').append('<div class="main">some fixture data <div id="main">test em!</div></div>');
    });

    afterEach(function () {
        news.$('.main').remove();
    });

    describe('User', function () {

        describe('capital()', function () {
            it('Sets and retrieves capital value', function () {
                var user = new User();
                user.capital(200);
                // spyOn(user, 'capital');
                // user.capital = jasmine.createSpy('capital spy');
                // news.pubsub.emit('userinput:input:q5Form', [200]);
                // expect(user.capital).toHaveBeenCalled();
                expect(user.capital()).toEqual(200);
            });
        });

        describe('capital()', function () {
            it('Returns half the capital value if captial is shared', function () {
                var user = new User();
                user.capital(200);
                user.capitalShared(1);
                expect(user.capital()).toEqual(100);
            });
        });

        describe('property()', function () {
            it('Sets and retrieves property value', function () {
                var user = new User();
                user.property(200);
                expect(user.property()).toEqual(200);
            });
        });

        describe('property()', function () {
            it('Returns half the property value if property is jointly owned', function () {
                var user = new User();
                user.property(200).propertyJointOwnership(1);
                expect(user.property()).toEqual(100);
            });
        });

        describe('property()', function () {
            it('Should disregard property value if property is shared with someone old, young or disabled', function () {
                var user = new User();
                user.property(200).propertyShared(1);
                expect(user.property()).toEqual(0);
            });
        });

        describe('income()', function () {
            it('Should set and retrieve income value', function () {
                var user = new User();
                user.income(200);
                expect(user.income()).toEqual(200);
            });
        });

        describe('capitalShared()', function () {
            it('Should set and retrieve capital ownership value', function () {
                var user = new User();
                user.capitalShared(1);
                expect(user.capitalShared()).toBeTruthy();
            });
        });

        describe('propertyJointOwnership()', function () {
            it('Should set and retrieve joint property value', function () {
                var user = new User();
                user.propertyJointOwnership(2);
                expect(user.propertyJointOwnership()).toBeFalsy();
            });
        });

        describe('propertyShared()', function () {
            it('Should set and retrieve shared property ownership value', function () {
                var user = new User();
                user.propertyShared(2);
                expect(user.propertyShared()).toBeFalsy();
            });
        });

    });
});