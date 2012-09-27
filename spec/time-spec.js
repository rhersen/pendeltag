var time = require('../public/modules/time');

describe('time', function() {
    it('should calculate difference in seconds', function() {
        expect(time.diff(3333, 1000)).toEqual(2.3);
    });

});
