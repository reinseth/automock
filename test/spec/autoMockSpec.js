describe('autoMock', function () {

    it('creates a new instance of the module', function () {
        expect(autoMock('a')).not.toBe(require('a'));
    });

    it('mocks dependencies that are functions', function () {
        // Act
        var a = autoMock('a');

        // Assert
        expect(a.dependencies.f1).toBeASpyWithName('f1');
    });

    it('mocks dependencies that are objects with functions', function () {
        // Act
        var a = autoMock('a');

        // Assert
        expect(a.dependencies.b.init).toBeASpyWithName('b.init');
    });

    it('passes through values as is', function () {
        // Act
        var a = autoMock('a');

        // Assert
        expect(a.dependencies.const1).toEqual(require('const1'));
        expect(a.dependencies.b.value).toEqual(require('b').value);
    });

    it('clones arrays', function () {
        // Act
        var a = autoMock('a');

        // Assert
        expect(a.dependencies.b.arr).not.toBe(require('b').arr);
        expect(a.dependencies.b.arr).toEqual(require('b').arr);
    });

    describe('options.mocks', function () {
        it('is a map of mocks (path -> mock) that autoMock should use (instead of creating automatically)', function () {
            // Arrange
            var bMock = {};

            // Act
            var a = autoMock('a', {
                mocks: {
                    'b': bMock
                }
            });

            // Assert
            expect(a.dependencies.b).toBe(bMock);
        });
    });

    describe('options.passthrough', function () {
        it('is an array of paths that shouldn\'t be mocked', function () {
            // Act
            var a = autoMock('a', {
                passthrough: ['b']
            });

            // Assert
            expect(a.dependencies.b).toBe(require('b'));
        });

        it('supports wildcards at the end of the paths', function () {
            // Act
            var a = autoMock('a', {
                passthrough: ['util/*']
            });

            // Assert
            expect(a.dependencies.u1).toBe(require('util/u1'));
            expect(a.dependencies.u2).toBe(require('util/u2'));
        });

        it('supports exclusions from the list by prefixing a path with !', function () {
            // Act
            var a = autoMock('a', {
                passthrough: ['util/*', '!util/u1']
            });

            // Assert
            expect(a.dependencies.u1).not.toBe(require('util/u1'));
            expect(a.dependencies.u2).toBe(require('util/u2'));
        });
    });

    describe('options.includes', function () {
        it('is an array of paths to modules that should be included within the automock boundary', function () {
            // Act
            var a = autoMock('a', {
                includes: ['b']
            });

            // Assert
            expect(a.dependencies.b.init).not.toBeASpy();
        });

        it('creates new instances of the included modules', function () {
            // Act
            var a = autoMock('a', {
                includes: ['b', 'f1']
            });

            // Assert
            expect(a.dependencies.b).not.toBe(require('b'));
            expect(a.dependencies.f1).not.toBe(require('f1'));
        });

        it('supports wildcards at the end of the paths', function () {
            // Act
            var a = autoMock('a', {
                includes: ['f*']
            });

            // Assert
            expect(a.dependencies.f1).not.toBeASpy();
        });

        it('supports exclusions from the list by prefixing a path with !', function () {
            // Act
            var a = autoMock('a', {
                includes: ['util/*', '!util/u2']
            });

            // Assert
            expect(a.dependencies.u1).not.toBeASpy();
            expect(a.dependencies.u2).toBeASpy();
        });
    });

});