var key = require('./key');

exports.extract = function (html, done, res) {
    var parsed = JSON.parse(html);
    var trains = parsed.DPS.Trains;

    var r = trains ? trains.DpsTrain : [{SiteId:9001, StopAreaName:'?'}];

    done(r, res);

    function getHhMm(timestamp) {
        var match = /T([0-9]+:[0-9]+:[0-9]+)/.exec(timestamp);
        return match[1];
    }
};

exports.getUri = function (id) {
    return 'https://api.trafiklab.se/sl/realtid/GetDpsDepartures?key=' + key.getKey() + '&timeWindow=60&siteId=' + id;
};
