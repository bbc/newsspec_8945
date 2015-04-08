module.exports = function (grunt) {
    grunt.registerTask('overrideImagerImageSizes', function () {
        
        var config = grunt.config.get('config'),
            imageWidths,
            contents;

        imageWidths = '[';
        for (var i = 0; i < config.imageWidths.length; i++) {
            imageWidths += config.imageWidths[i];
            if (i !== (config.imageWidths.length - 1)) {
                imageWidths += ', ';
            }
        };
        imageWidths += ']';

        contents = 
            'define(function () {'  +
                'return ' + imageWidths + ';' +
            ' });';

        grunt.file.write('source/js/lib/news_special/imager_image_sizes.js', contents)
    });
};