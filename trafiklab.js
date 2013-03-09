var key = require('./key');
var _ = require('underscore');

var stopKeys = ['SiteId', 'StopAreaName', 'StopAreaNumber'];
var trainKeys = ['Destination', 'LineNumber', 'JourneyDirection', 'TransportMode'];

var state = undefined;

function merge(state, newState) {
    if (!state) {
        return newState;
    }

    var newStop = newState.stops[0];
    var newSiteId = newStop.SiteId;

    function getTrains() {
        var i;
        var olds = state.trains;
        var news = newState.trains;

        for (i = 0; olds.length < news.length; i++) {
            olds.unshift(news[i]);
        }

        var r = [];

        for (i = 0; i < olds.length; i++) {
            r[i] = olds[i];
            var newTrain = news[i];
            if (r[i] && newTrain) {
                r[i][newSiteId] = newTrain[newSiteId];
            }
        }

        return r;
    }

    function hasSiteId(id) {
        return function (stop) {
            return stop.SiteId === id;
        }
    }

    function getStops() {
        var r = _.reject(state.stops, hasSiteId(newSiteId));
        r.push(newStop);
        r.sort(function less(a, b) {
            return a.SiteId < b.SiteId;
        });
        return r;
    }

    return {
        trains: getTrains(),
        stops: getStops()
    };
}

exports.clear = function () {
    state = undefined;
};

exports.extract = function (html) {
    var parsed = JSON.parse(html);
    var trains = parsed.DPS.Trains;

    function getStop(departure) {
        var stop = {LatestUpdate: parsed.DPS.LatestUpdate};
        for (var key in departure) {
            if (isStopProperty(key)) {
                stop[key] = departure[key];
            }
        }
        return stop;
    }

    if (trains) {
        var southbound = _.filter(trains.DpsTrain, isSouthbound);
        state = merge(state, {trains: _.map(southbound, createTrain), stops: [getStop(southbound[0])]});
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

        train[departure.SiteId] = stop;

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
