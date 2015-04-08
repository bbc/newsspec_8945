define(['lib/news_special/bootstrap', 'model/eventStrs', 'data/dataset', 'data/nations_dataset'], function (news, eventStrs, dataset, nationsDataset) {

    'use strict';

    var ExternalIdMediator = function () {

        /********************************************************
            * VARIABLES
        ********************************************************/
        this.testVar = true;

        /********************************************************
            * INIT STUFF
        ********************************************************/
        this.addEventListeners();
    };

    ExternalIdMediator.prototype = {

        addEventListeners: function () {
            news.pubsub.on(eventStrs.processExternalId, this.handleExternalId.bind(this));
        },

        handleExternalId: function (data) {
            /*********************
                * LOAD REGION DATA USING THE ID PARAM
            *********************/
            if (dataset.hasOwnProperty(data.id)) {
                var councilData = dataset[data.id];
                councilData.nation = data.nation;

                this.handleRegionResponse(councilData);

            } else if (nationsDataset.hasOwnProperty(data.id)) {
                var nationsCouncilData = nationsDataset[data.id];
                nationsCouncilData.nation = data.nation;

                this.handleRegionResponse(nationsCouncilData);

            } else {
                // console.log('Data not found for id', data.id);
                throw new Error('Data not found for id: ' + data.id);
            }

        },

        handleRegionResponse: function (data) {
            if (data.nation === 'England') {
                //validate the returned data first!
                //translate the returned data into a format the app can injest!
                var usefulDataSchema = {};

                usefulDataSchema.authorityName = data.authorityName;
                usefulDataSchema.regionName = data.regionName;
                usefulDataSchema.niGroup = data.niGroup;
                
                usefulDataSchema.homeCare = {};
                usefulDataSchema.homeCare.localCost = parseFloat(data.homeLocal);

                usefulDataSchema.residentialCare = {};
                usefulDataSchema.residentialCare.localCost = parseFloat(data.residentialLocal);
                usefulDataSchema.residentialCare.regionCost = parseFloat(data.residentialRegion);
                usefulDataSchema.residentialCare.privateCost = parseFloat(data.residentialPrivate);

                news.pubsub.emit(eventStrs.displayEngland, [usefulDataSchema]);

            } else {
                news.pubsub.emit(eventStrs['display' + data.nation], [data]);
            }
            
        }

    };

    return ExternalIdMediator;

});
