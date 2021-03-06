(function(root) {
    'use strict';

    var require = root.require,
        jasmine = root.jasmine;

    var Objects = (function() {
        return {
            isString: function(obj) {
                return Object.prototype.toString.call(obj) === '[object String]';
            },
            isFunction: function(obj) {
                return Object.prototype.toString.call(obj) === '[object Function]';
            },
            isObject: function(obj) {
                return obj === Object(obj);
            },
            isArray: function(obj) {
                return Object.prototype.toString.call(obj) === '[object Array]';
            },
            clone: function(obj) {
                if (!this.isObject(obj)) {
                    return obj;
                }
                if (this.isArray(obj)) {
                    return obj.slice();
                }
                var shallowCopy = {};
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        shallowCopy[prop] = obj[prop];
                    }
                }
                return shallowCopy;
            }
        };
    })();

    var Arrays = (function() {
        return {
            map: function(array, f) {
                var mapped = [];
                for (var i = 0; i < array.length; i++) {
                    mapped[i] = f(array[i]);
                }
                return mapped;
            }
        };
    })();

    var Strings = (function() {
        return {
            endsWith: function(source, str) {
                return source.substr(source.length - str.length) === str;
            },
            startsWith: function(source, str) {
                return source.indexOf(str) === 0;
            }
        };
    })();

    var Modules = (function(root) {
        var require = root.require;
        var factories = {};
        var execCb = require.s.contexts._.execCb;

        require.s.contexts._.execCb = function(name, factory) {
            factories[name] = factory;
            return execCb.apply(this, arguments);
        };

        return {
            has: function(name) {
                return !!factories[name];
            },
            init: function(name, customRequire) {
                return factories[name](customRequire || require);
            }
        };
    })(root);

    var ModuleNames = (function(Strings) {
        var namePartRe = /^!?([^*]+)\*?$/;

        function isWildcard(expression) {
            return Strings.endsWith(expression, '*');
        }

        function isNegated(expression) {
            return Strings.startsWith(expression, '!');
        }

        function extractNamePart(expression) {
            return namePartRe.exec(expression)[1] || '';
        }

        function matches(expression, name) {
            var namePart = extractNamePart(expression);
            return namePart === name || (isWildcard(expression) && name.indexOf(namePart) === 0);
        }

        return {
            isIncluded: function(expressionList, name) {
                var included = false,
                    expression;

                for (var i = 0; i < expressionList.length; i++) {
                    expression = expressionList[i];
                    if (isNegated(expression) && matches(expression, name)) {
                        included = false;
                        break;
                    }
                    if (matches(expression, name)) {
                        included = true;
                    }
                }

                return included;
            }
        };
    })(Strings);

    function mock(obj, name, depth) {
        // TODO classes/prototypes
        var result;

        depth = depth || 0;

        if (Objects.isObject(obj)) {
            if (Objects.isFunction(obj)) {
                result = function() {
                    return result.__spy.apply(null, arguments);
                };
                result.__spy = jasmine.createSpy(name);
            } else {
                result = {};
            }

            if (depth > 2) return result;

            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    result[prop] = mock(obj[prop], name + '.' + prop, depth + 1);
                }
            }
        } else {
            result = Objects.clone(obj);
        }

        return result;
    }

    function autoMock(moduleName, options) {
        options = options || {};
        options.mocks = options.mocks || {};
        options.passthrough = options.passthrough || [];
        options.includes = options.includes || [];

        if (!Modules.has(moduleName)) {
            throw 'Module "' + moduleName + '" has not yet been defined.';
        }

        var dependencies = {};

        var requireFacade = jasmine.createSpy('require').andCallFake(function(deps, callback) {
            var result;

            if (Objects.isString(deps)) {
                deps = [deps];
            }

            result = Arrays.map(deps, function(dependencyName) {
                var result;

                if (dependencies[dependencyName]) {
                    return dependencies[dependencyName];
                }

                if (options.mocks[dependencyName]) {
                    result = options.mocks[dependencyName];
                } else if (ModuleNames.isIncluded(options.passthrough, dependencyName)) {
                    result = require(dependencyName);
                } else if (ModuleNames.isIncluded(options.includes, dependencyName)) {
                    result = Modules.init(dependencyName, requireFacade);
                } else {
                    result = mock(require(dependencyName), dependencyName);
                }

                dependencies[dependencyName] = result;

                return result;
            });

            if (callback) {
                callback.apply(null, result);
                return result;
            } else {
                return result[0];
            }
        });

        var module = Modules.init(moduleName, requireFacade);

        jasmine.getEnv().getMockFor = function(dependencyPath) {
            if (dependencyPath === 'require') {
                return requireFacade;
            }
            if (!dependencies.hasOwnProperty(dependencyPath)) {
                throw 'Missing or illegal dependency "' + dependencyPath + '"';
            }
            return dependencies[dependencyPath];
        };
        jasmine.getEnv().module = module;
        jasmine.getEnv().modulePath = moduleName;

        return module;
    }

    function getMockFor(dependencyPath) {
        return jasmine.getEnv().getMockFor(dependencyPath);
    }

    function when(mockOrSpy) {
        var spy = jasmine.isSpy(mockOrSpy) ? mockOrSpy : mockOrSpy.__spy;
        if (!spy) {
            throw 'Illegal argument to "when": given function is not a mock.';
        }

        return {
            isCalledWith: function() {
                var origReset = spy.reset;
                if (!spy.whenMocks) {
                    spy.whenMocks = [];
                    spy.reset = function() {
                        delete spy.whenMocks;
                        origReset.call(this);
                    };
                }

                var thenFunc = function() {
                    var candidate,
                        match,
                        actualArgs = Array.prototype.slice.call(arguments);

                    for (var i = spy.whenMocks.length; i > 0; i--) {
                        candidate = spy.whenMocks[i - 1];
                        if (jasmine.getEnv().equals_(actualArgs, candidate.args)) {
                            match = candidate;
                            break;
                        }
                    }

                    if (match) {
                        return match.func.apply(null, actualArgs);
                    }
                    return null;
                };
                spy.andCallFake(thenFunc);

                return {
                    _args: Array.prototype.slice.call(arguments),
                    thenReturn: this.thenReturn,
                    thenCall: this.thenCall,
                    thenThrow: this.thenThrow
                };
            },
            thenCall: function(func) {
                if (spy.whenMocks) {
                    spy.whenMocks.push({args: this._args, func: func});
                } else {
                    spy.andCallFake(func);
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
            },
            thenThrow: function(error) {
                this.thenCall(function () {
                    throw error;
                });
            }
        };
    }

    var toHaveBeenCalled = jasmine.Matchers.prototype.toHaveBeenCalled;
    var toHaveBeenCalledWith = jasmine.Matchers.prototype.toHaveBeenCalledWith;

    jasmine.getEnv().beforeEach(function() {
        this.addMatchers({
            toHaveRequired: function(dep) {
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
                    return this.env.contains_(require.argsForCall, [dep, jasmine.any(Function)]);
                }
            },

            toHaveBeenCalled: function () {
                var actual = this.actual;
                this.actual = actual.__spy || actual;
                return toHaveBeenCalled.apply(this);
            },

            toHaveBeenCalledWith: function () {
                var actual = this.actual;
                this.actual = actual.__spy || actual;
                return toHaveBeenCalledWith.apply(this, arguments);
            }
        });
    });

    jasmine.getEnv().afterEach(function() {
        delete jasmine.getEnv().getMockFor;
        delete jasmine.getEnv().module;
        delete jasmine.getEnv().modulePath;
    });

    root.getMockFor = getMockFor;
    root.autoMock = autoMock;
    root.when = when;

})(this);
