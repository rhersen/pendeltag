var key = require('./key');
var _ = require('underscore');

var stopKeys = ['SiteId', 'StopAreaName', 'StopAreaNumber'];
var trainKeys = ['Destination', 'LineNumber', 'JourneyDirection', 'TransportMode'];

var state = undefined;

function merge(state, newState) {
    if (!state) {
        return newState;
    }

    _.each(state.trains, function (train, i) {
        var newStop = newState.trains[i] ? newState.trains[i].Stops[0] : 'not found';

        train.Stops.push(newStop);
        train.Stops.sort(function (a, b) {
            return a.SiteId < b.SiteId;
        });
    });

    (function () {
        function removeOld() {
            for (var j = 0; j < state.stops.length; j++) {
                var stop = state.stops[j];
                if (stop.SiteId === newState.stops[0].SiteId) {
                    state.stops.splice(j, 1);
                    return;
                }
            }
        }

        removeOld();
        state.stops.push(newState.stops[0]);
        state.stops.sort(function (a, b) {
            return a.SiteId < b.SiteId;
        });
    })();

    return state;
}

exports.clear = function () {
    state = undefined;
};

exports.extract = function (html) {
    var parsed = JSON.parse(html);
    var trains = parsed.DPS.Trains;

    if (trains) {
        var southbound = _.filter(trains.DpsTrain, isSouthbound);
        var stop = {};
        var departure = southbound[0];
        for (var key in departure) {
            if (isStopProperty(key)) {
                stop[key] = departure[key];
            }
        }
        var newState = {trains: _.map(southbound, createTrain), stops: [stop]};
        state = merge(state, newState);
        return state;
    } else {
        return {trains: [
            {SiteId: 9001, StopAreaName: '?'}
        ]};
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
            } else if (!isStopProperty(key)) {
                stop[key] = departure[key];
            }
        }

        train.Stops = [ stop ];

        return train;

        function isTrainProperty(key) {
            return trainKeys.indexOf(key) !== -1;
        }
    }

    function isStopProperty(key) {
        return stopKeys.indexOf(key) !== -1;
    }
};

exports.getUri = function (id) {
    return 'https://api.trafiklab.se/sl/realtid/GetDpsDepartures?key=' + key.getKey() + '&timeWindow=60&siteId=' + id;
};
