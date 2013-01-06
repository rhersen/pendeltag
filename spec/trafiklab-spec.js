require('jsdom');
var fs = require('fs');
var sl = require('../trafiklab');

describe('trafiklab', function () {

    it('should handle times', function () {
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        sl.extract(file, function (result) {
            expect(result.length).toEqual(8);
            expect(result[0].SiteId).toEqual(9527);
            expect(result[0].Destination).toEqual('Södertälje centrum');
            expect(result[0].ExpectedDateTime).toEqual('2013-01-02T13:17:19');
            expect(result[4].SiteId).toEqual(9527);
            expect(result[4].Destination).toEqual('Märsta');
            expect(result[4].ExpectedDateTime).toEqual('2013-01-02T13:28:00');
        });
    });

    it('should handle empty response', function () {
        var file = fs.readFileSync('spec/empty.json', 'utf-8');
        sl.extract(file, function (result) {
            expect(result.updated).toEqual('20:27:23');
            expect(result.length).toEqual(1);
        });
    });

});
