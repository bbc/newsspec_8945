module.exports = function (grunt) {

    // *************************************************************************
    // REQUIRE PATHS
    // Add any paths here you want shortened. Relative to the 'js' dir.
    // *************************************************************************

    var amdModulePaths = {
        'pubsub': './lib/vendors/jquery/pubsub',
        'data'  : './../data'
    };

    // *************************************************************************
    // GRUNT CONFIG
    // You shouldn't need to edit anything below here
    // *************************************************************************

    var _ = require('lodash-node');

    var requirePathsForJquery1build = _.merge({
            'jquery': './lib/vendors/jquery/jquery-1.9.1',
            'd3': './lib/vendors/d3.ie'
        }, amdModulePaths);

    var requirePathsForJquery2build = _.merge({
            'jquery': './lib/vendors/jquery/jquery-2.0.3',
            'd3': './lib/vendors/d3.min'
        }, amdModulePaths);
    
    grunt.config(['amdModulePaths'], amdModulePaths);

    grunt.config(['requirejs', 'jquery1'], {
        options: {
            baseUrl: './source/js',
            paths: requirePathsForJquery1build,
            optimize: 'uglify2',
            generateSourceMaps: false,
            preserveLicenseComments: false,
            name: './app',
            out: './content/<%= config.services.default %>/js/all-legacyie.js'
        }
    });
    grunt.config(['requirejs', 'jquery2'], {
        options: {
            baseUrl: './source/js',
            paths: requirePathsForJquery2build,
            optimize: 'uglify2',
            generateSourceMaps: true,
            preserveLicenseComments: false,
            name: './app',
            out: './content/<%= config.services.default %>/js/all-html5.js'
        }
    });
};