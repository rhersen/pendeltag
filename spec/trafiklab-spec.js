require('jsdom');
var fs = require('fs');
var _ = require('underscore');
var sl = require('../trafiklab');

describe('trafiklab', function () {

    it('should only return southbound trains', function () {
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        var result = sl.extract(file);
        var trains = result.trains;
        expect(trains.length).toEqual(4);
        expect(trains[0].Destination).toEqual('Södertälje centrum');
    });

    it('should return train-specific fields', function () {
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        var result = sl.extract(file);
        var train = result.trains[0];
        expect(Object.keys(train).length).toEqual(5);
        expect(train.Destination).toEqual('Södertälje centrum');
        expect(train.LineNumber).toEqual(36);
        expect(train.JourneyDirection).toEqual(1);
        expect(train.TransportMode).toEqual('TRAIN');
    });

    it('should return station-specific fields', function () {
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        var result = sl.extract(file);
        var stop = result.stops[0];
        expect(Object.keys(stop).length).toEqual(4);
        expect(stop.SiteId).toEqual(9527);
        expect(stop.StopAreaNumber).toEqual('0');
        expect(stop.StopAreaName).toEqual('Huddinge');
        expect(stop.LatestUpdate).toEqual('2013-01-02T13:15:23.5506461+01:00');
    });

    it('should return time fields', function () {
        sl.clear();
        var file = fs.readFileSync('spec/huddinge.json', 'utf-8');
        var result = sl.extract(file);
        var stop = result.trains[0][9527];
        expect(Object.keys(stop).length).toEqual(3);
        expect(stop.TimeTabledDateTime).toEqual('2013-01-02T13:17:00');
        expect(stop.ExpectedDateTime).toEqual('2013-01-02T13:17:19');
        expect(stop.DisplayTime).toEqual('1 min');
    });

    it('should handle empty response', function () {
        var file = fs.readFileSync('spec/empty.json', 'utf-8');
        var result = sl.extract(file);
        expect(result.trains.length).toEqual(1);
    });

    function assertStops(expectedStops, actualStops) {
        expect(actualStops.length).toEqual(expectedStops.length);
        _.each(expectedStops, function (expectedStop, i) {
            expect(actualStops[i].SiteId).toEqual(expectedStop)
        })
    }

    it('should add stops', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/ronninge.json', 'utf-8'));
        var trains = result.trains;
        expect(trains.length).toEqual(4);
        expect(trains[0][9523].ExpectedDateTime).toEqual('2013-02-20T07:47:00');
        assertStops([9523], result.stops);

        result = sl.extract(fs.readFileSync('spec/ostertalje.json', 'utf-8'));
        trains = result.trains;
        expect(trains.length).toEqual(4);
        expect(trains[0][9523].ExpectedDateTime).toEqual('2013-02-20T07:47:00');
        expect(trains[0][9522].ExpectedDateTime).toEqual('2013-02-20T07:52:00');
        assertStops([9523, 9522], result.stops);
    });

    it('should overwrite stops', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/ronninge.json', 'utf-8'));
        assertStops([9523], result.stops);

        result = sl.extract(fs.readFileSync('spec/ostertalje.json', 'utf-8'));
        assertStops([9523, 9522], result.stops);

        result = sl.extract(fs.readFileSync('spec/ronninge.json', 'utf-8'));
        assertStops([9523, 9522], result.stops);
    });

    it('should add next stop with fewer trains', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/curr.json', 'utf-8'));
        var trains = result.trains;
        expect(trains.length).toEqual(5);
        assertStops([9523], result.stops);
        expect(trains[0][9523].ExpectedDateTime).toEqual('2013-03-07T15:47:50');
        expect(trains[1][9523].ExpectedDateTime).toEqual('2013-03-07T16:10:26');
        expect(trains[3][9523].ExpectedDateTime).toEqual('2013-03-07T16:32:00');
        expect(trains[4][9523].ExpectedDateTime).toEqual('2013-03-07T16:47:00');

        result = sl.extract(fs.readFileSync('spec/next.json', 'utf-8'));
        trains = result.trains;
        expect(trains.length).toEqual(5);
        assertStops([9523, 9522], result.stops);

        expect(trains[0][9523].ExpectedDateTime).toEqual('2013-03-07T15:47:50');
        expect(trains[0][9522].ExpectedDateTime).toEqual('2013-03-07T15:52:00');
        expect(trains[3][9523].ExpectedDateTime).toEqual('2013-03-07T16:32:00');
        expect(trains[3][9522].ExpectedDateTime).toEqual('2013-03-07T16:37:00');
        expect(trains[4][9523].ExpectedDateTime).toEqual('2013-03-07T16:47:00');
    });

    it('should add previous stop with more trains', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/next.json', 'utf-8'));
        var trains = result.trains;
        expect(trains.length).toEqual(4);
        assertStops([9522], result.stops);

        result = sl.extract(fs.readFileSync('spec/curr.json', 'utf-8'));
        trains = result.trains;
        expect(trains.length).toEqual(5);
        assertStops([9523, 9522], result.stops);

        expect(trains[0][9523].ExpectedDateTime).toEqual('2013-03-07T15:47:50');
        expect(trains[0][9522].ExpectedDateTime).toEqual('2013-03-07T15:52:00');
        expect(trains[3][9523].ExpectedDateTime).toEqual('2013-03-07T16:32:00');
        expect(trains[3][9522].ExpectedDateTime).toEqual('2013-03-07T16:37:00');
        expect(trains[4][9523].ExpectedDateTime).toEqual('2013-03-07T16:47:00');
    });

    it('should add next stop with more trains', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/prev.json', 'utf-8'));
        var trains = result.trains;
        expect(trains.length).toEqual(4);
        assertStops([9524], result.stops);

        result = sl.extract(fs.readFileSync('spec/curr.json', 'utf-8'));
        trains = result.trains;
        expect(trains.length).toEqual(5);
        assertStops([9524, 9523], result.stops);

        expect(trains[0][9524]).toEqual(undefined);
        expect(trains[0][9523].ExpectedDateTime).toEqual('2013-03-07T15:47:50');
        expect(trains[1][9524].ExpectedDateTime).toEqual('2013-03-07T16:06:59');
        expect(trains[1][9523].ExpectedDateTime).toEqual('2013-03-07T16:10:26');
        expect(trains[3][9524].ExpectedDateTime).toEqual('2013-03-07T16:27:00');
        expect(trains[3][9523].ExpectedDateTime).toEqual('2013-03-07T16:32:00');
        expect(trains[4][9524].ExpectedDateTime).toEqual('2013-03-07T16:42:49');
        expect(trains[4][9523].ExpectedDateTime).toEqual('2013-03-07T16:47:00');
    });

    it('should add previous stop with fewer trains', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/curr.json', 'utf-8'));
        expect(result.trains.length).toEqual(5);
        assertStops([9523], result.stops);

        result = sl.extract(fs.readFileSync('spec/prev.json', 'utf-8'));
        var trains = result.trains;
        expect(trains.length).toEqual(5);
        assertStops([9524, 9523], result.stops);

        expect(trains[0][9524]).toEqual(undefined);
        expect(trains[0][9523].ExpectedDateTime).toEqual('2013-03-07T15:47:50');
        expect(trains[1][9524].ExpectedDateTime).toEqual('2013-03-07T16:06:59');
        expect(trains[1][9523].ExpectedDateTime).toEqual('2013-03-07T16:10:26');
        expect(trains[3][9524].ExpectedDateTime).toEqual('2013-03-07T16:27:00');
        expect(trains[3][9523].ExpectedDateTime).toEqual('2013-03-07T16:32:00');
        expect(trains[4][9524].ExpectedDateTime).toEqual('2013-03-07T16:42:49');
        expect(trains[4][9523].ExpectedDateTime).toEqual('2013-03-07T16:47:00');
    });

    it('should add two previous stops with fewer trains', function () {
        sl.clear();

        var result = sl.extract(fs.readFileSync('spec/curr.json', 'utf-8'));
        expect(result.trains.length).toEqual(5);
        assertStops([9523], result.stops);

        result = sl.extract(fs.readFileSync('spec/prev.json', 'utf-8'));
        expect(result.trains.length).toEqual(5);
        assertStops([9524, 9523], result.stops);

        result = sl.extract(fs.readFileSync('spec/pprev.json', 'utf-8'));
        var trains = result.trains;
        expect(trains.length).toEqual(5);
        assertStops([9525, 9524, 9523], result.stops);

        expect(trains[0][9525]).toEqual(undefined);
        expect(trains[0][9524]).toEqual(undefined);
        expect(trains[0][9523].ExpectedDateTime).toEqual('2013-03-07T15:47:50');
        expect(trains[1][9524].ExpectedDateTime).toEqual('2013-03-07T16:06:59');
        expect(trains[1][9523].ExpectedDateTime).toEqual('2013-03-07T16:10:26');
        expect(trains[3][9524].ExpectedDateTime).toEqual('2013-03-07T16:27:00');
        expect(trains[3][9523].ExpectedDateTime).toEqual('2013-03-07T16:32:00');
        expect(trains[4][9524].ExpectedDateTime).toEqual('2013-03-07T16:42:49');
        expect(trains[4][9523].ExpectedDateTime).toEqual('2013-03-07T16:47:00');
    });

});
