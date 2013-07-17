describe('when', function () {
    it('fails if given object is not a mock', function () {
        // Arrange
        var invokeWhen = function() {
            when({});
        };

        // Act & Assert
        expect(invokeWhen).toThrow('Illegal argument to "when": given function is not a mock.');
    });

    describe('thenReturn', function () {
        it('returns the given value when the mock is invoked', function () {
            // Arrange
            var val = {};
            var mock = jasmine.createSpy();

            // Act
            when(mock).thenReturn(val);

            // Assert
            expect(mock()).toBe(val);
        });
    });

    describe('thenCall', function () {
        it('sets up the mock to return the value from the given function', function () {
            // Arrange
            var val = {};
            var func = function() { return val; };
            var mock = jasmine.createSpy();

            // Act
            when(mock).thenCall(func);

            // Assert
            expect(mock()).toBe(val);
        });

        it('invokes the given function with the arguments to the mock', function () {
            // Arrange
            var func = jasmine.createSpy();
            var mock = jasmine.createSpy();
            var arg1 = 1;
            var arg2 = "2";

            // Act
            when(mock).thenCall(func);
            mock(arg1, arg2);

            // Assert
            expect(func).toHaveBeenCalledWith(arg1, arg2);
        });
    });

    describe('thenThrow', function () {
        it('throws the given error when the mock is invoked', function () {
            // Arrange
            var error = "Error";
            var mock = jasmine.createSpy();

            // Act
            when(mock).thenThrow(error);

            // Assert
            expect(mock).toThrow(error);
        });
    });

    describe('isCalledWith', function () {
        it('applies the given setup if the arguments match', function () {
            // Arrange
            var mock = jasmine.createSpy();
            var arg1 = "one";
            var arg2 = 2;
            var arg3 = function() {};
            var val = "three";

            // Act
            when(mock).isCalledWith(arg1, arg2, jasmine.any(Function)).thenReturn(val);

            // Assert
            expect(mock(arg1, arg2, arg3)).toEqual(val);
        });

        it('uses the default behaviour of the mock when the arguments doesn\'t match', function () {
            // Arrange
            var mock = jasmine.createSpy();
            var arg1 = "one";
            var arg2 = 2;
            var val = "three";

            // Act
            when(mock).isCalledWith(arg1, arg2, jasmine.any(Function)).thenReturn(val);

            // Assert
            expect(mock(arg1, arg2, "three")).toBeNull();
        });
    });
});