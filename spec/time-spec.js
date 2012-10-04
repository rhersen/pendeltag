var time = require('../public/modules/time');

describe('time', function() {
    it('should calculate difference in seconds', function() {
        expect(time.diff(3333, 1000).toString()).toEqual('2.333');
        expect(time.diff(3133, 1000).toString()).toEqual('2.133');
//        expect(time.diff(3000, 1000).toString()).toEqual('2.0');
    });

});
