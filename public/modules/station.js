var expiry = require('./expiry');
var names = require('./names');
var countdown = require('./countdown');

var timer = expiry.create();

function updatePending(lib) {
    if (timer.isPending()) {
        lib('body').addClass('pending');
    } else {
        lib('body').removeClass('pending');
    }
}

function setResult(lib, result, currentTimeMillis) {
    updateTimer();
    updatePending(lib);
    updateHtml();
    updateTable();
    bindEvent(typeof TouchEvent !== 'undefined');

    function updateTimer() {
        timer.setResponse(currentTimeMillis);
        timer.setUpdated(result.updated);
    }

    function updateHtml() {
        lib('#title').html(names.abbreviate(result.station));
        lib('#predecessor').html(result.predecessor);
        lib('#successor').html(result.successor);
        lib('#updated').html(result.updated);
    }

    function updateTable() {
        lib('table#northbound tr').remove();
        lib('table#southbound tr').remove();
        result.northbound.forEach(createTableRow('northbound'));
        result.southbound.forEach(createTableRow('southbound'));
    }

    function createTableRow(trClass) {
        return function (departure) {
            lib('table#' + trClass).append('<tr></tr>');
            lib('table#' + trClass + ' tr:last').addClass(trClass);
            lib('table#' + trClass + ' tr:last').append('<td></td>');
            lib('table#' + trClass + ' tr:last :first-child').html(departure.time);
            lib('table#' + trClass + ' tr:last').append('<td></td>');
            lib('table#' + trClass + ' tr:last :last-child').html(names.abbreviate(departure.destination));
            lib('table#' + trClass + ' tr:last').append('<td></td>');
            lib('table#' + trClass + ' tr:last td:last').addClass('countdown');
        }
    }

    function bindEvent(isTouch) {
        var ev = isTouch ? 'touchend' : 'mouseup';
        lib('#predecessor').bind(ev, getRequestSender(result.predecessor));
        lib('#successor').bind(ev, getRequestSender(result.successor));

        function getRequestSender(id) {
            return function () {
                sendRequest(lib, id);
            };
        }
    }
}

function init(lib, id, interval) {
    lib('span#id').text(id);

    lib('button.clear').click(function () {
        require.clearCache();
        alert('pixel ratio is ' + window.devicePixelRatio);
    });

    if (interval) {
        setInterval(tick, interval);
    }

    function tick() {
        lib('#expired').html((timer.getDebugString()));

        setCountdowns();

        if (timer.isExpired(new Date())) {
            sendRequest(lib, lib('span#id').text());
        }

        function setCountdowns() {
            var now = new Date();
            lib('table.departures tr').each(function () {
                var time = $(this).find(':first-child').html();
                $(this).find(':last-child').html(countdown.getCountdown(time, now));
            });
        }
    }
}

function sendRequest(lib, id) {
    timer.setRequest(new Date().getTime());
    updatePending(lib);
    lib('#predecessor').unbind('mouseup touchend');
    lib('#successor').unbind('mouseup touchend');
    lib('#title').html(id);
    lib('#predecessor').html(' ');
    lib('#successor').html(' ');

    lib.ajax({
        url: '/departures/' + id + '.json',
        dataType: 'json',
        cache: false,
        success: function (result) {
            setResult(lib, result, new Date().getTime());
        }
    });

    lib('span#id').text(id);
}

exports.setResult = setResult;
exports.init = init;
