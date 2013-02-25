require('jsdom');
var fs = require('fs');
var _ = require('underscore');
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

    function assertStops(expectedStops, result) {
        _.each(result, function (train) {
            var actualStops = train.Stops;
            expect(actualStops.length).toEqual(expectedStops.length);
            _.each(expectedStops, function (expectedStop, i) {
                expect(actualStops[i].SiteId).toEqual(expectedStop)
            })
        });
    }

    it('should add stops', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/ronninge.json', 'utf-8'));
        expect(result.length).toEqual(4);
        assertStops([9523], result);

        result = sl.extract(fs.readFileSync('spec/ostertalje.json', 'utf-8'));
        expect(result.length).toEqual(4);
        assertStops([9523, 9522], result);
    });

    it('should overwrite stops if SiteId is the same', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/ronninge.json', 'utf-8'));
        expect(result.length).toEqual(4);
        assertStops([9523], result);

        result = sl.extract(fs.readFileSync('spec/ostertalje.json', 'utf-8'));
        expect(result.length).toEqual(4);
        assertStops([9523, 9522], result);

        result = sl.extract(fs.readFileSync('spec/ronninge.json', 'utf-8'));
        expect(result.length).toEqual(4);
        assertStops([9522, 9523], result);
    });

});
