var countdown = require('./countdown');
var time = require('./time');

exports.create = function () {
    var responseTime;
    var requestTime;
    var updated;


    function isExpired(date) {
        return requestTime === undefined || areTimeLimitsReached(date);

        function areTimeLimitsReached(date) {
            return getTimeSinceUpdate(date) > 30 &&
                getTimeSinceRequest(date.getTime()) > 20 &&
                getTimeSinceResponse(date.getTime()) > 10
        }
    }

    function isPending() {
        return !responseTime || responseTime < requestTime;
    }

    function setUpdated(u) {
        updated = u;
    }

    function getTimeSinceUpdate(date) {
        if (updated) {
            return time.diff(countdown.getNow(date), countdown.millisSinceMidnight(updated));
        } else {
            return NaN;
        }
    }

    function getTimeSinceRequest(now) {
        return time.diff(now, requestTime);
    }

    function getTimeSinceResponse(now) {
        return time.diff(now, responseTime);
    }

    function setRequest(currentTimeMillis) {
        requestTime = currentTimeMillis;
    }

    function setResponse(currentTimeMillis) {
        responseTime = currentTimeMillis;
    }

    function getDebugString() {
        var now = new Date();
        var sinceUpdate = getTimeSinceUpdate(now);
        var sinceRequest = getTimeSinceRequest(now.getTime());
        var sinceResponse = getTimeSinceResponse(now.getTime());
        return sinceUpdate.toFixed(1) + '⊂' + sinceRequest.toFixed(1) + '⊃' + sinceResponse.toFixed(1);
    }

    return {
        setUpdated: setUpdated,
        setRequest: setRequest,
        setResponse: setResponse,
        isExpired: isExpired,
        isPending: isPending,
        getDebugString: getDebugString
    }
};
