var key = require('./key');
var _ = require('underscore');

var trainKeys = ['Destination', 'LineNumber', 'JourneyDirection', 'TransportMode'];

var state = undefined;

function merge(state, newState) {
    if (!state) {
        return newState;
    }

    _.each(state, function (train, i) {
        function removeOld() {
            for (var j = 0; j < train.Stops.length; j++) {
                var stop = train.Stops[j];
                if (stop.SiteId === newStop.SiteId) {
                    train.Stops.splice(j, 1);
                    return;
                }
            }
        }

        if (newState[i]) {
            var newStop = newState[i].Stops[0];
            removeOld();
            train.Stops.push(newStop);
        }
    });

    return state;
}

exports.clear = function () {
    state = undefined;
};

exports.extract = function (html) {
    var parsed = JSON.parse(html);
    var trains = parsed.DPS.Trains;

    if (trains) {
        var newState = _.map(_.filter(trains.DpsTrain, isSouthbound), createTrain);
        state = merge(state, newState);
        return state;
    } else {
        return [
            {SiteId: 9001, StopAreaName: '?'}
        ];
    }

    function isSouthbound(departure) {
        return departure.JourneyDirection === 1;
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
