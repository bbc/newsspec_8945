module.exports = function (grunt) {
    grunt.registerTask('html', ['sass:inline', 'uglify', 'jsonlint', 'multi_lang_site_generator:default']);
};