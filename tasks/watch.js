module.exports = function (grunt) {
    grunt.config('watch', {
        js: {
            files: ['Gruntfile.js', './source/js/**/*', '!./source/js/lib/news_special/iframemanager__host.js'],
            tasks: ['js'],
            options: {
                spawn: false
            }
        },
        css: {
            files: ['Gruntfile.js', './source/scss/**/*'],
            tasks: ['css'],
            options: {
                spawn: false
            }
        },
        cssImg: {
            files: ['./source/scss/news_special/f/**/*'],
            tasks: ['copy:cssFurniture'],
            options: {
                spawn: false
            }
        },
        html: {
            files: ['Gruntfile.js', './source/tmpl/**/*', './source/scss/news_special/inline.scss', './source/js/lib/news_special/iframemanager__host.js'],
            tasks: ['html'],
            options: {
                spawn: false
            }
        },
        img: {
            files: ['./source/img/**/*'],
            tasks: ['images'],
            options: {
                spawn: false
            }
        },
        options: {
            livereload: false
        }
    });
};