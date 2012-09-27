function diff(millis1, millis0) {
    return Math.round((millis1 - millis0) / 100) / 10;
}

exports.diff = diff;