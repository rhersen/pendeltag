require('jsdom');
var fs = require('fs');
var sl = require('../trafiklab');

describe('trafiklab', function() {
    it('should handle times with no delay', function() {
        var file = fs.readFileSync('spec/GetDpsDepartures.xml', 'utf-8');
        sl.extract(file, '../public/modules/jquery-1.6.min.js', function (result) {
            expect(result.station).toEqual('Tullinge');
            expect(result.updated).toEqual('07:12');
            expect(result.northbound.length).toEqual(4);
            expect(result.southbound.length).toEqual(2);
            expect(result.northbound[0].time).toEqual('07:22');
            expect(result.northbound[0].destination).toEqual('Jakobsberg');
            expect(result.northbound[1].time).toEqual('07:26');
            expect(result.northbound[1].destination).toEqual('Märsta');
            expect(result.southbound[0].time).toEqual('07:18');
            expect(result.southbound[0].destination).toEqual('Södertälje hamn');
            expect(result.southbound[1].time).toEqual('07:33');
            expect(result.southbound[1].destination).toEqual('Östertälje');
            asyncSpecDone();
        });
        asyncSpecWait();
    });

});
