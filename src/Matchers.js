/*jshint camelcase:false*/
(function(root) {
    'use strict';

    var toBeA = function(type) {
        return (typeof this.actual) === type;
    };

    var toHaveRequired = function(dep) {
        var modulePath = this.env.modulePath;
        var require = this.env.getMockFor('require');
        this.message = function() {
            return [
                'Expected "' + modulePath + '" to have required ' + jasmine.pp(dep) + '.',
                'Expected "' + modulePath + '" to not have required ' + jasmine.pp(dep) + '.'
            ];
        };
        if (typeof dep === 'string') {
            return this.env.contains_(require.argsForCall, [dep]);
        } else {
            return this.env.contains_(require.argsForCall, [dep, any(Function)]);
        }
    };

    beforeEach(function() {
        this.addMatchers({
            toBeA: toBeA,
            toBeAn: toBeA,
            toHaveRequired: toHaveRequired
        });
    });

    root.any = function(type) {
        if (!type) {
            return {
                jasmineMatches: function() {
                    return true;
                }
            };
        }
        return jasmine.any(type);
    };

    root.when = function(mock) {
        if (mock === undefined) {
            throw 'Illegal argument to "when": given function is undefined';
        }
        if (!jasmine.isSpy(mock)) {
            throw 'Illegal argument to "when": given function is not a mock.';
        }

        return {
            isCalledWith: function() {
                var origReset = mock.reset;
                if (!mock.whenMocks) {
                    mock.whenMocks = [];
                    mock.reset = function() {
                        delete mock.whenMocks;
                        origReset.call(this);
                    };
                }

                var thenFunc = function() {
                    var candidate,
                        match,
                        actualArgs = Array.prototype.slice.call(arguments);

                    for (var i = mock.whenMocks.length; i > 0; i--) {
                        candidate = mock.whenMocks[i - 1];
                        if (jasmine.getEnv().equals_(actualArgs, candidate.args)) {
                            match = candidate;
                            break;
                        }
                    }

                    if (match) {
                        return match.func.apply(null, actualArgs);
                    }
                };
                mock.andCallFake(thenFunc);

                return {
                    _args: Array.prototype.slice.call(arguments),
                    thenReturn: this.thenReturn,
                    thenCall: this.thenCall
                };
            },
            thenCall: function(func) {
                if (mock.whenMocks) {
                    mock.whenMocks.push({args: this._args, func: func});
                } else {
                    mock.andCallFake(func);
                }
            },
            thenReturn: function(value) {
                // TODO thenReturn og thenCall uten å gå via isCalledWith fungerer ikke hvis man har en miks av de
                // Eksempel:
                // when(mock).thenReturn(value); // default
                // when(mock).isCalledWith(arg).thenReturn(otherValue)
                // Dette fører til at første when aldri vil ta effekt dersom mocken blir kalt med noe annet enn 'arg'
                this.thenCall(function() {
                    return value;
                });
            }
        };
    };
})(this);
