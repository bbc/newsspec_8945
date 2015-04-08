define(['lib/news_special/bootstrap'], function (news) {
    function User() {
        var that                        = this;

        this._capital                   = 0;
        this._property                  = 0;
        this._income                    = 0;

        this.properties                 = {
            capitalShared           : false,
            propertyJointOwnership  : false,
            propertyShared          : false,
            ownsProperty            : false
        };

        // setters and getters for simple methods in properties object
        news.$.each(that.properties, function (prop) {
            User.prototype[prop] = function (arg) {
                if (!arguments.length) {
                    return that.properties[prop];
                }
                that.properties[prop] = (arg === 1);
                return that;
            };
        });

        this.init();
    }

    User.prototype.init = function () {
        news.pubsub.on('userinput:button:1', this.ownsProperty.bind(this));
        news.pubsub.on('userinput:button:2', this.propertyShared.bind(this)); // property shared 1||2
        news.pubsub.on('userinput:button:3', this.propertyJointOwnership.bind(this)); // joint ownership 1||2
        news.pubsub.on('userinput:button:6', this.capitalShared.bind(this)); // capital shareddo you own your own home 1||2
        news.pubsub.on('userinput:input:q4Form', this.property.bind(this)); // what equity to you have
        news.pubsub.on('userinput:input:q5Form', this.capital.bind(this)); // assets/capital
        news.pubsub.on('userinput:input:q7Form', this.income.bind(this)); // income 
    };

    User.prototype.income = function (amount) {

        if (!!arguments.length) {
            this._income = parseFloat(amount);
            return this;
        }
        return this._income;
    };

    User.prototype.capital = function (amount) {
        if (!!arguments.length) {
            this._capital = parseFloat(amount);
            return this;
        }
        return (this.capitalShared()) ? this._capital / 2: this._capital;//(this._capital / 2)
    };

    User.prototype.property = function (amount) {
        if (!!arguments.length) {
            this._property = parseFloat(amount);
            return this;
        }
        if (this.propertyShared()) {
            return 0;
        }

        return (this.propertyJointOwnership()) ? this._property / 2: this._property;
    };

    return User;
});