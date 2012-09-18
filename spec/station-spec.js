var target = require('../public/modules/station');

describe('station', function () {
    var fixture = {
        "station":"Femlingsberg","updated":"21:32","northbound":[
            {"time":"22:29","destination":"Märsta"}
        ], "southbound":[
            {"time":"21:45","destination":"Östertälje"}
        ]};

    function createJqueryMock() {
        var called = {};
        var mock = function (selector) {
            return {
                html:function (text) {
                    called[selector] = text;
                },
                text:function (text) {
                    if (text) {
                        called[selector] = text;
                    }
                },
                append:function () {
                },
                data:function () {
                },
                addClass:function () {
                },
                bind:function (e) {
                    called[selector] = e;
                },
            show:function () {
                    called['show'] = selector;
                },
                hide:function () {
                    called['hide'] = selector;
                },
                remove:function () {
                    called['remove'] = selector;
                }
            }
        };
        mock.ajax = function (params) {
            called[params.dataType] = true;
            called['cache'] = params.cache;
        };
        mock.getCalled = function (x) {
            return called[x];
        };

        return mock;
    }

    it('should remove all table rows', function () {
        var lib = createJqueryMock();
        target.setResult(lib, fixture);
        expect(lib.getCalled('remove')).toEqual('span.countdown');
    });

    it('should set station name', function () {
        var lib = createJqueryMock();
        target.setResult(lib, fixture);
        expect(lib.getCalled('#title')).toEqual('Femlingsberg');
    });

    it('should set update time', function () {
        var lib = createJqueryMock();
        target.setResult(lib, fixture);
        expect(lib.getCalled('#updated')).toEqual('21:32');
    });

    it('should set southbound station name', function () {
        var lib = createJqueryMock();
        target.setResult(lib, fixture);
        expect(lib.getCalled('div#southbound :last-child')).toEqual('Östertälje');
    });

    it('should set northbound station name', function () {
        var lib = createJqueryMock();
        target.setResult(lib, { "station":"Flemingsberg", "updated":"21:32",
            "northbound":[ {"time":"22:29","destination":"Märsta"} ],
            "southbound":[]
        });
        expect(lib.getCalled('div#northbound :last-child')).toEqual('Märsta');
    });

    it('should bind mouseup', function () {
        var lib = createJqueryMock();
        target.setResult(lib, fixture);
        expect(lib.getCalled('#successor')).toEqual('mouseup');
        expect(lib.getCalled('#predecessor')).toEqual('mouseup');
    });

    it('should bind touchend', function () {
        TouchEvent = 'defined';
        var lib = createJqueryMock();
        target.setResult(lib, fixture);
        expect(lib.getCalled('#successor')).toEqual('touchend');
        expect(lib.getCalled('#predecessor')).toEqual('touchend');
    });

    it('should handle 500', function () {
        var lib = createJqueryMock();
        var r500 = {station:'fel=500', updated:'500:', northbound:[], southbound:[]};
        target.setResult(lib, r500);
    });

});
