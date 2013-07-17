define(function(require) {

    var f1 = require('f1'),
        const1 = require('const1'),
        b = require('b'),
        u1 = require('util/u1'),
        u2 = require('util/u2');

    return {
        dependencies: {
            f1: f1,
            const1: const1,
            b: b,
            u1: u1,
            u2: u2
        }
    };
});