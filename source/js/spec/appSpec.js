define(['lib/news_special/bootstrap', 'app'],  function (news, app) {

    beforeEach(function () {
        news.$('body').append('<div class="main">some fixture data <div id="main">test em!</div></div>');
    });

    afterEach(function () {
        //news.$('.main').remove();
    });

    describe('app', function () {
        app.init();
        it('', function () {
            expect(true).toBeTruthy();
        });
    });

});