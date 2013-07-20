(function() {
    jasmine.getEnv().beforeEach(function () {
        this.addMatchers({

            toBeAMock: function () {
                this.message = function () {
                    return [
                        'expected given object to be a mock',
                        'expected given object not to be a mock'
                    ];
                };
                return !!this.actual.__spy;
            },

            toBeAMockWithName: function (name) {
                var isSpy = !!this.actual.__spy;
                var actualName = isSpy ? this.actual.__spy.identity : '';
                var nameMatches = actualName === name;

                this.message = function () {
                    if (!isSpy) {
                        return '"' + name + '" is not a mock';
                    }
                    if (!nameMatches) {
                        return 'expected name "' + name + '" doesn\'t match actual "' + actualName + '"';
                    }
                    return null;
                };

                return isSpy && nameMatches;
            }
        });
    });
})();