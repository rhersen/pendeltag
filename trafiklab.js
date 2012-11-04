var key = require('./key');

exports.extract = function (html, done, res) {
    var parsed = JSON.parse(html);
        var trains = parsed.DPS.Trains;

        var r = trains ? {
            station: trains.DpsTrain[0].StopAreaName,
            updated: getHhMm(parsed.DPS.LatestUpdate),
            northbound: trains.DpsTrain.filter(hasDirection(2)).map(createDeparture),
            southbound: trains.DpsTrain.filter(hasDirection(1)).map(createDeparture)
        }:
        {
            station: '?',
            updated: getHhMm(parsed.DPS.LatestUpdate),
            northbound: [],
            southbound: []
        };

        done(r, res);

    function hasDirection(dir) {
        return function (departure) { return departure.JourneyDirection === dir; };
    }

        function createDeparture(e) {
            return {
                time: getHhMm(e.ExpectedDateTime),
                destination:e.Destination
            };
        }

        function getHhMm(timestamp) {
            var match = /T([0-9]+:[0-9]+:[0-9]+)/.exec(timestamp);
            return match[1];
        }
};

exports.getUri = function (id) {
    return 'https://api.trafiklab.se/sl/realtid/GetDpsDepartures?key=' + key.getKey() + '&timeWindow=60&siteId=' + id;
};
