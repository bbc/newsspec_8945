module.exports = function (grunt) {

    var imageWidths = [];

    for (var i = 0; i < grunt.config.get('config').imageWidths.length; i++) {
        imageWidths.push({
            width: grunt.config.get('config').imageWidths[i]
        });
    }

    grunt.config(['copy', 'standardImages'], {
        files: [{
            expand: true,
            cwd: 'source/img',
            src: ['**/*.*', '!responsive/*.*'],
            dest: 'content/<%= config.services.default %>/img'
        }]
    });

    grunt.config('responsive_images', {
        main: {
            options: {
                sizes: imageWidths
            },
            files: [{
                expand: true,
                src: ['**.{jpg,gif,png}'],
                cwd: 'source/img/responsive',
                custom_dest: 'content/<%= config.services.default %>/img/{%= width %}/'
            }]
        }
    });

    grunt.config('imagemin', {
        dist: {
            options: {
                optimizationLevel: 3,
                progressive: true
            },
            files: [
                {
                    expand: true,
                    src: ['content/<%= config.services.default %>/img/**/*.*', '<%= config.services.default %>/css/f/**.*'],
                    dest: './'
                }
            ]
        }
    });

	grunt.registerTask('images', function () {
        grunt.task.run('copy:standardImages', 'responsive_images', 'imagemin');
    });
};