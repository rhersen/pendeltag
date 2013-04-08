var key = require('./key');

var trainKeys = ['Destination', 'LineNumber', 'JourneyDirection', 'TransportMode'];

exports.extract = function (html) {
    var trains = getTrains(JSON.parse(html).DPS.Trains);

    return trains ? trains.map(createTrain) : [
        {SiteId: 9001, StopAreaName: '?'}
    ];

    function getTrains(trains) {
        if (trains && Array.isArray(trains.DpsTrain)) {
            return trains.DpsTrain;
        } else {
            return undefined;
        }
    }

    function createTrain(departure) {
        var stop = { };
        var train = { };

        for (var key in departure) {
            if (isTrainProperty(key)) {
                train[key] = departure[key];
            } else {
                stop[key] = departure[key];
            }
        }

        train.Stops = [ stop ];

        return train;

        function isTrainProperty(key) {
            return trainKeys.indexOf(key) !== -1;
        }
    }

};

exports.getUri = function (id) {
    return 'https://api.trafiklab.se/sl/realtid/GetDpsDepartures?key=' + key.getKey() + '&timeWindow=60&siteId=' + id;
};
