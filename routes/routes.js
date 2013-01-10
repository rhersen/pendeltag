const TULLINGE = 9525;
const KARLBERG = 9510;
const SODERTALJE = 9520;
const SODRA = 9530;
const CENTRALEN = 9001;

var request = require('request');

var trafiklab = require('../trafiklab');
exports.index = function (req, res) {
    res.render('index', {
        title:'SL',
        stations:[
            {name:'Tullinge', id:TULLINGE},
            {name:'Södertälje', id:SODERTALJE},
            {name:'Södra', id:SODRA},
            {name:'Karlberg', id:KARLBERG},
            {name:'Centralen', id:CENTRALEN}
        ]
    })
};

exports.station = function (req, res) {
    res.render('station', {
        title:'Station',
        id:req.params.id
    })
};

exports.clearCache = function (req, res) {
    res.render('clearCache', {
        title:'Cache cleared'
    })
};

exports.departures = function (req, res) {
    var requestTime = new Date().getTime();

    console.log('GET departures(' + req.params.id + ') @ ' + new Date());

    request(createParams(req.params.id), handleResponse);

    function createParams(stationId) {
        return {
            uri:trafiklab.getUri(stationId),
            headers:{
                "user-agent":"node.js",
                "accept":"application/json"
            }
        };
    }

    function handleResponse(error, response, body) {
        var responseTime = new Date().getTime();

        if (response) {
            console.log(response.statusCode + ' in ' + (responseTime - requestTime) + ' ms');
        } else {
            console.log('no response');
        }

        if (error) {
            console.log(error.message);
        } else {
            if (response.statusCode === 200) {
                trafiklab.extract(body, req.params.format === 'json' ? sendJson : sendHtml, res);
            } else if (response.statusCode === 401) {
                console.log('Du måste skaffa en nyckel på trafiklab.se och lägga den i key.js');
                res.send([{
                    StopAreaName:'fel=' + response.statusCode,
                    SiteId:'API-nyckel saknas.'
                }]);
            } else {
                console.log(response.statusCode);
                if (req.params.format === 'json') {
                    res.send({
                        StopAreaName:'fel=' + response.statusCode,
                        SiteId:response.statusCode + ':'
                    });
                } else {
                    res.render('departures');
                }
            }
        }
    }

    function sendHtml(result, response) {
        response.render('departures', result);
    }

    function sendJson(result, response) {
        result.predecessor = req.params.id - 1;
        result.successor = result.predecessor + 2;
        response.send(result);
    }
};
