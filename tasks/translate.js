module.exports = function (grunt) {

    var services = grunt.config.get('config').services.others,
        translationsTasks = [
            'clean:beforeTranslate',
            'default',
            'images',
            'clean:inlineCss',
            'copy_source',
            'copy_language_specific_items_from_source'
        ];

    grunt.registerTask('copy_language_specific_items_from_source', function () {

        if (services !== 'false') {
            services.forEach(function (service) {

                var html = grunt.file.read('content/' + service + '/index.html'),
                    matches = html.match(/div class="masthead__logo masthead__logo--([a-z]+)/),
                    match;

                if (matches !== null) {
                    match = matches[1];

                    if (match !== 'english') {
                        grunt.file.copy('source/scss/news_special/f/bbc-' + match + '.png', 'content/' + service + '/css/f/bbc-' + match + '.png');
                        grunt.log.writeln('Copied ' + match + '.png into content/' + service + '/css/f/');
                    }
                }
            });

        } else {
            grunt.log.writeln('No services specified in config.json, so nothing will be translated.');
        }
    });

    if (services !== 'false') {
        // insert at index 3 (after 'images')
        translationsTasks.splice(3, 0, 'multi_lang_site_generator:build_all_other_sites');
    }

    grunt.registerTask('translate', translationsTasks);
};