define(function(require) {
    'use strict';

    var _ = require('underscore'),
        factory = require('factory');

    /**
     * @param {String} modulePath the module under test which will have its dependencies mocked
     * @param {Object} [options]
     * @param {Object} [options.mocks] a map of mocks (path => instance) that autoMock should use (instead of creating
     *                               automatically)
     * @param {Array} [options.passthrough] a list of dependencies that should be passed through (i.e. not mocked)
     * @returns {*}
     */
    window.autoMock = function(modulePath, options) {
        options = options || {};
        options.mocks = options.mocks || {};
        options.passthrough = options.passthrough || [];

        var moduleInitializer = factory.get(modulePath);
        if (!moduleInitializer) {
            throw 'Module "' + modulePath + '" has not yet been defined.';
        }

        var dependencies = {};

        var requireFacade = jasmine.createSpy('require').andCallFake(function(deps, callback) {
            var realDependency,
                dependency,
                result;

            if (_.isString(deps)) {
                deps = [deps];
            }

            result = _.map(deps, function(path) {
                if (dependencies[path]) {
                    return dependencies[path];
                }

                if (options.mocks[path]) {
                    dependency = options.mocks[path];
                } else if (_.contains(options.passthrough, path)) {
                    dependency = require(path);
                } else {
                    realDependency = require(path);
                    if (_.isFunction(realDependency)) {
                        dependency = jasmine.createSpy(path);
                    } else if (_.isObject(realDependency)) {
                        dependency = {};
                        _.each(realDependency, function(value, key) {
                            if (_.isFunction(value)) {
                                dependency[key] = jasmine.createSpy(path + '.' + key);
                            } else {
                                dependency[key] = _.clone(value);
                            }
                        });
                    } else {
                        dependency = _.clone(realDependency);
                    }
                }

                dependencies[path] = dependency;

                return dependency;
            });

            if (callback) {
                callback.apply(null, result);
            } else {
                return result[0];
            }
        });

        var module = moduleInitializer(requireFacade);
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
        jasmine.getEnv().modulePath = modulePath;

        afterEach(function() {
            delete jasmine.getEnv().getMockFor;
            delete jasmine.getEnv().module;
        });

        return module;
    };

    window.getMockFor = function(dependencyPath) {
        return jasmine.getEnv().getMockFor(dependencyPath);
    };
});
