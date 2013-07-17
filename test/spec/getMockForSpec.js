describe('getMockFor', function () {
    it('fails if no module has been automocked', function () {
        // Arrange
        var invokeGetMockFor = function() {
            getMockFor("non/existent/dependency")
        };

        // Act & Assert
        expect(invokeGetMockFor).toThrow();
    });

    it('fails if the specified path is not a dependency of the module under test', function () {
        // Arrange
        var a = autoMock("a");
        var invokeGetMockFor = function() {
            getMockFor("non/existent/dependency")
        };

        // Act & Assert
        expect(invokeGetMockFor).toThrow('Missing or illegal dependency "non/existent/dependency"');
    });

    it('returns the mock for the given dependency', function () {
        // Arrange
        var a = autoMock("a");

        // Act
        var f1Mock = getMockFor("f1");

        // Assert
        expect(f1Mock).toBeASpyWithName("f1");
    });
});
