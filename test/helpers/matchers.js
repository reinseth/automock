(function() {
    jasmine.getEnv().beforeEach(function () {
        this.addMatchers({

            toBeASpy: function () {
                this.message = function () {
                    return [
                        'expected given object to be a spy',
                        'expected given object not to be a spy'
                    ];
                };
                return jasmine.isSpy(this.actual);
            },

            toBeASpyWithName: function (name) {
                var isSpy = this.actual.isSpy;
                var actualName = this.actual.identity;
                var nameMatches = actualName === name;

                this.message = function () {
                    if (!isSpy) {
                        return '"' + name + '" is not a spy';
                    }
                    if (!nameMatches) {
                        return 'expected name "' + name + '" doesn\'t match actual "' + actualName;
                    }
                    return null;
                };

                return isSpy && nameMatches;
            }
        });
    });
})();