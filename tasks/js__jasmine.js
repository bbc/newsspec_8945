module.exports = function (grunt) {
	grunt.config('jasmine', {
        allTests: {
            src: 'source/js/newsspec_<%= config.project_number %>/*.js',
            options: {
                keepRunner: true,
                specs: 'source/js/spec/*Spec.js',
                template: require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfig: {
                        baseUrl: '<%= requirejs.jquery1.options.baseUrl %>',
                        paths: '<%= requirejs.jquery1.options.paths %>'
                    }
                }
            }
        }
    });
};