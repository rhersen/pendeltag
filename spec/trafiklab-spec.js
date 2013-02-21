require('jsdom');
var fs = require('fs');
var sl = require('../trafiklab');

describe('trafiklab', function () {

    it('should only return southbound trains', function () {
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        var result = sl.extract(file);
        expect(result.length).toEqual(4);
        expect(result[0].Destination).toEqual('Södertälje centrum');
    });

    it('should return train-specific fields', function () {
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        var result = sl.extract(file);
        var train = result[0];
        expect(Object.keys(train).length).toEqual(5);
        expect(train.Destination).toEqual('Södertälje centrum');
        expect(train.LineNumber).toEqual(36);
        expect(train.JourneyDirection).toEqual(1);
        expect(train.TransportMode).toEqual('TRAIN');
    });

    it('should return station-specific fields', function () {
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        var result = sl.extract(file);
        var stop = result[0].Stops[0];
        expect(Object.keys(stop).length).toEqual(6);
        expect(stop.StopAreaNumber).toEqual('0');
        expect(stop.StopAreaName).toEqual('Huddinge');
        expect(stop.TimeTabledDateTime).toEqual('2013-01-02T13:17:00');
        expect(stop.ExpectedDateTime).toEqual('2013-01-02T13:17:19');
        expect(stop.DisplayTime).toEqual('1 min');
    });

    it('should handle empty response', function () {
        var file = fs.readFileSync('spec/empty.json', 'utf-8');
        var result = sl.extract(file);
        expect(result.length).toEqual(1);
    });

    it('should add stops', function () {
        var file = fs.readFileSync('spec/ronninge.json', 'utf-8');

        sl.clear();

        var result = sl.extract(file);

        expect(result.length).toEqual(4);
        for (var i = 0; i < result.length; i++) {
            var r = result[i];
            expect(r.Stops.length).toEqual(1);
        }

        file = fs.readFileSync('spec/ostertalje.json', 'utf-8');

        result = sl.extract(file);

        expect(result.length).toEqual(4);
        for (i = 0; i < result.length; i++) {
            r = result[i];
            var stops = r.Stops;
            expect(stops.length).toEqual(2);
            expect(stops[0].SiteId).toEqual(9523);
            expect(stops[1].SiteId).toEqual(9522);
        }
    });

});
