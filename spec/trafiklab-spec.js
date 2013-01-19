require('jsdom');
var fs = require('fs');
var sl = require('../trafiklab');

describe('trafiklab', function () {

    it('should return trains', function () {
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        var result = sl.extract(file);
        expect(result.length).toEqual(8);
        expect(result[0].Destination).toEqual('Södertälje centrum');
        expect(result[4].Destination).toEqual('Märsta');
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

});
