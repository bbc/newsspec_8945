module.exports = function (grunt) {

    grunt.config(['clean', 'sasscache'], {
        src:  ['./.sass-cache']
    });
    
    grunt.config(['clean', 'main'], {
        src:  ['tmp']
    });

    grunt.config(['clean', 'inlineCss'], {
        src:  ['content/<%= config.services.default %>/css/inline.css']
    });

    grunt.config(['clean', 'beforeTranslate'], {
        src:  ['content']
    });
};