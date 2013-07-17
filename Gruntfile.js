module.exports = function (grunt) {

    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-open");

    grunt.initConfig({
        jshint: {
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                files: {
                    src: 'src/**/*.js'
                }
            }
        },
        connect: {
            jasmine: {
                options: {
                    middleware: function (connect, options) {
                        return [
                            require('connect-livereload')(),
                            connect.static(options.base)
                        ];
                    }
                }
            }
        },
        jasmine: {
            fixtures: {
                src: 'test/fixtures/**/*.js',
                options: {
                    specs: 'test/spec/**/*Spec.js',
                    helpers: ['src/autoMock.js', 'test/helpers/**/*.js'],
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: 'test/fixtures/'
                        }
                    }
                }
            }
        },
        watch: {
            jasmine: {
                files: ['src/**/*.js', 'test/**/*.js'],
                tasks: ['jasmine:fixtures:build'],
                options: {
                    livereload: true
                }
            }
        },
        open: {
            jasmine: {
                path: 'http://localhost:8000/_SpecRunner.html'
            }
        }
    });


    grunt.registerTask('test', ['connect:jasmine', 'jasmine:fixtures:build', 'open:jasmine', 'watch:jasmine']);

    grunt.registerTask('default', ['jshint', 'jasmine']);
};