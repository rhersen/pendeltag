require('jsdom');
var fs = require('fs');
var sl = require('../trafiklab');

describe('trafiklab', function () {
    it('should handle times', function () {
        var file = fs.readFileSync('spec/GetDpsDepartures.json', 'utf-8');
        sl.extract(file, function (result) {
            expect(result.station).toEqual('Stockholms södra');
            expect(result.updated).toEqual('20:42:36');
            expect(result.northbound.length).toEqual(4);
            expect(result.southbound.length).toEqual(4);
            expect(result.northbound[0].time).toEqual('20:44:22');
            expect(result.northbound[0].destination).toEqual('Märsta');
            expect(result.northbound[1].time).toEqual('21:07:00');
            expect(result.northbound[1].destination).toEqual('Bålsta');
            expect(result.southbound[0].time).toEqual('20:45:00');
            expect(result.southbound[0].destination).toEqual('Östertälje');
            expect(result.southbound[1].time).toEqual('20:52:00');
            expect(result.southbound[1].destination).toEqual('Västerhaninge');
        });
    });

    it('should handle empty response', function () {
        var file = fs.readFileSync('spec/empty.json', 'utf-8');
        sl.extract(file, function (result) {
            expect(result.updated).toEqual('20:27:23');
            expect(result.northbound.length).toEqual(0);
            expect(result.southbound.length).toEqual(0);
        });
    });

    it('should handle null destination', function () {
        var file = fs.readFileSync('spec/name-null.json', 'utf-8');
        sl.extract(file, function (result) {
            expect(result.station).toEqual('Tullinge');
            expect(result.updated).toEqual('16:51:03');
            expect(result.northbound.length).toEqual(7);
            expect(result.southbound.length).toEqual(8);
            expect(result.northbound[0].destination).toEqual('?');
            expect(result.northbound[1].destination).toEqual('Upplands Väsby');
            expect(result.southbound[1].destination).toEqual('Södertälje centrum');
            expect(result.southbound[3].destination).toEqual('Tumba');
        });

    });

});
