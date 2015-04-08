module.exports = function (grunt) {
    grunt.config('sass', {
        main: {
            files: {
                './content/<%= config.services.default %>/css/main.css':      './source/scss/main.scss',
                './content/<%= config.services.default %>/css/legacy-ie.css': './source/scss/legacy-ie.scss',
            }
        },
        inline: {
            files: {
                './content/<%= config.services.default %>/css/inline.css': './source/scss/news_special/inline.scss'
            }
        }
    });
};