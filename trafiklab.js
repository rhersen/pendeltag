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

    function hasStation(trains, id) {
        return getIndex(trains, id) !== undefined;
    }

    function getIndex(trains, id) {
        for (var i = 0; i < trains.length; i++) {
            if (trains[i][id]) {
                return i;
            }
        }

        return undefined;
    }

    function getAlignment(olds, news, id) {
        var defined;
        var prev = id + 1;
        var next = id - 1;

        if (hasStation(olds, prev)) {
            defined = getIndex(olds, prev);
            return news[defined][id].ExpectedDateTime > olds[defined][prev].ExpectedDateTime ? 0 : 1;
        }

        if (hasStation(olds, next)) {
            defined = getIndex(olds, next);
            return news[defined][id].ExpectedDateTime < olds[defined][next].ExpectedDateTime ? 0 : -1;
        }

        return 1;
    }

    function getTrains() {
        var i;
        var olds = state.trains;
        var news = newState.trains;
        var r = [];
        var alignment = getAlignment(olds, news, newSiteId);
        if (alignment === 0) {
            for (i = 0; i < olds.length; i++) {
                r.push(olds[i]);
                if (news[i]) {
                    r[i][newSiteId] = news[i][newSiteId];
                }
            }
            for (; i < news.length; i++) {
                r.push(news[i]);
            }
        } else if (alignment > 0) {
            for (i = 0; i < news.length; i++) {
                if (i < alignment) {
                    r.push(news[i]);
                } else {
                    r.push(olds[i - alignment]);
                    r[i][newSiteId] = news[i][newSiteId];
                }
            }
        } else {
            for (i = 0; i < olds.length; i++) {
                r.push(olds[i]);
                if (i >= -alignment) {
                    r[i][newSiteId] = news[i + alignment][newSiteId];
                }
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
        var key;
        var stop = {LatestUpdate: parsed.DPS.LatestUpdate};
        for (key in departure) {
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
        var key;
        var stop = { };
        var train = { };

        for (key in departure) {
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
