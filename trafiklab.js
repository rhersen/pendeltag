var key = require('./key');

var trainKeys = ['Destination', 'LineNumber', 'JourneyDirection', 'TransportMode'];

var state = undefined;

function merge(state, newState) {
    if (state) {
        for (var i = 0; i < state.length; i++) {
            var newState2 = newState[i];
            if (newState2) {
                state[i].Stops.push(newState2.Stops[0]);
            }
        }
        return state;
    } else {
        return newState;
    }
}

exports.clear = function () {
    state = undefined;
};

exports.extract = function (html) {
    var parsed = JSON.parse(html);
    var trains = parsed.DPS.Trains;

    if (trains) {
        var newState = trains.DpsTrain.map(createTrain);
        state = merge(state, newState);
        return state;
    } else {
        return [
            {SiteId: 9001, StopAreaName: '?'}
        ];
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
