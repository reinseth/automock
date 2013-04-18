/* global require*/
define(function() {
    'use strict';

    var factories = {};
    var execCb = require.s.contexts._.execCb;
    require.s.contexts._.execCb = function(name, callback) {
        factories[name] = callback;
        return execCb.apply(this, arguments);
    };

    return {
        get: function(dependencyPath) {
            return factories[dependencyPath];
        }
    };
});