var jsdom = require('jsdom');
var key = require('./key');

exports.extract = function (html, script, done, res) {
    var params = {
        html: html,
        scripts: [ script ]
    };

    jsdom.env(params, function (err, window) {
        done(scrape(window), res);
    });

    function scrape(window) {
        var $ = window.jQuery;
        var trains = $('Trains');
        var update = $('LatestUpdate');

        return {
            station: trains.find('DpsTrain StopAreaName').first().text(),
            updated: getHhMm(update.text()),
            northbound: $.map(trains.find('DpsTrain:has(JourneyDirection:contains(2))'), createDeparture),
            southbound: $.map(trains.find('DpsTrain:has(JourneyDirection:contains(1))'), createDeparture)
        };

        function createDeparture(e) {
            return {
                time: getHhMm(getChildText(7, e)),
                destination: getChildText(5, e)
            };

            function getChildText(i, parent) {
                return $(parent).children(':eq(' + i + ')').text().trim();
            }
        }

        function getHhMm(timestamp) {
            var match = /T([0-9]+:[0-9]+:[0-9]+)/.exec(timestamp);
            return match[1];
        }
    }
};

exports.getUri = function (id) {
    return 'https://api.trafiklab.se/sl/realtid/GetDpsDepartures?key=' + key.getKey() + '&timeWindow=60&siteId=' + id;
};
