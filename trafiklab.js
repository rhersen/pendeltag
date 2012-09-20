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
        var table = $('Trains');
        var div = $('LatestUpdate');

        function getHhMm(timestamp) {
            var match = /T([0-9]+):([0-9]+)/.exec(timestamp);
            var updatedHour = match[1];
            var updatedMinute = match[2];
            return updatedHour + ':' + updatedMinute;
        }

        var updated = getHhMm(div.text());

        var departures = [
            $.map($(table).first().find('DpsTrain:has(JourneyDirection:contains(1))'), createDeparture),
            $.map($(table).last().find('DpsTrain:has(JourneyDirection:contains(2))'), createDeparture)
        ];

        var isNorthFirst = false;

        return {
            station: table.find('DpsTrain StopAreaName').first().text(),
            updated: updated,
            northbound: departures[isNorthFirst ? 0 : 1],
            southbound: departures[isNorthFirst ? 1 : 0]
        };

        function isNorthbound(departure) {
            return /[BM].[lr]sta/.test(departure.destination);
        }

        function getMatch(regExp, parent, selector) {
            var match = regExp.exec(parent.find(selector).text());
            return match ? match[1] : undefined;
        }

        function createDeparture(e) {
            var minutes = getChildText(7, e);

            if (/Nu/.exec(minutes)) {
                minutes = '0 min';
            }

            var remaining = /([0-9:]+) min/.exec(minutes);

            return {
                time: remaining ? getDepartureTime() : getHhMm(minutes),
                destination: getChildText(5, e)
            };

            function getDepartureTime() {
                return (updatedHour + ':' + (1 + parseInt(updatedMinute, 10) + parseInt(remaining[1], 10)));
            }

            function getChildText(i, parent) {
                return $(parent).children(':eq(' + i + ')').text().trim();
            }
        }
    }
};

exports.getUri = function (id) {
    return 'https://api.trafiklab.se/sl/realtid/GetDpsDepartures?key=' + key.getKey() + '&timeWindow=60&siteId=' + id;
};
