module.exports = function (grunt) {
    grunt.config(['copy', 'cssFurniture'], {
        files: [{
            expand: true,
            cwd:    'source/scss/news_special/f/',
            src:    ['share_tools.png', 'bbc.png'],
            dest:   'content/<%= config.services.default %>/css/f'
        }]
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.registerTask('default', ['bump', 'css', 'js', 'html', 'copy:cssFurniture', 'clean:main', 'lang_font:default']);
};