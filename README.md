Automock for RequireJS and Jasmine
==================================

This is a support library for testing RequireJS modules with Jasmine. It is in early stages, and many things are yet to be formalised.

Current limitations:
- Require modules are expected use the implicit "require" to get dependencies (commonjs-style): 
    ```javascript
    define(function(require) {
      var dependency = require("path/to/dependency");
  
      return {
        // ...
      };
    });
    ```
- All sources must be preloaded for the tests (because of the previous limitation)
- Automocking of constructor functions (i.e. classes) and static properties on functions (e.g. $.ajax) is not implemented.
- No support for multiple contexts

There are, however, plans for all of these limitations.

For other libraries, check out:
https://github.com/tnwinc/Isolate

Example
-------

```javascript
// src/scripts/A.js
define(function() {
  return {
    // (...)
  }
});

// src/scripts/B.js
define(function(require) {
  var A = require("A");
  
  return {
    // (...)
  };
});

// test/specs/BSpec.js
describe("B", function() {
  var B;
  
  beforeEach(function() {
    B = autoMock("B");
  });
  
  it("does stuff", function() {
    when(getMockFor("A").getSomething).thenReturn("some stuff");
    
    var result = B.doStuff();
    
    expect(result).toEqual("some stuff");
  });
});

// Gruntfile.js
module.exports = function(grunt) {
  
  // NPM-deps: grunt-contrib-jasmine and grunt-template-jasmine-requirejs
  
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.initConfig({
    jasmine: {
      test: {
        src: ['src/scripts/**/*.js'],
        options: {
          template: require('grunt-template-jasmine-requirejs')
          helpers: ['test/helpers/autoMock.js'], // will be loaded before require.js when declared as a helper - this is important!
          specs: ['test/specs/**/*.js']
        }
      }
    }
  });
)};
```

