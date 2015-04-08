module.exports = function (grunt) {

    var env        = grunt.config.get('env'),
        config     = grunt.config.get('config'),
        worksheets = env.google.translations['newsspec_' + config.project_number];
    
    grunt.registerTask('vocabs_setup', ['Creates the necessary directories for vocabs'], function () {
        if (!grunt.file.isDir('source/vocabs')) {
            grunt.file.mkdir('source/vocabs');
        }
    });

    grunt.registerTask('check_spreadsheet_ids', ['Checks if the vocabs spreadsheet information has been configured.'], function () {
        var done = this.async();
        if (worksheets === undefined) {
            done(false);
            grunt.log.warn('No worksheets defined. Edit your env.json!');
            grunt.log.writeln('You should have "spreadsheetId" and "worksheetId" properties under google.translations.newsspec_' + config.project_number);
        } else {
            done();
        }
    });

    grunt.registerTask('fetch_vocabs', ['Fetches the vocabs from Google spreadsheet(s)'], function () {

        var cloudfileToVocabTasks = [],
            cloudfileToVocabConfig = {
                'cloudfile_to_vocab': {}
            };

        for (var i = 0; i < worksheets.length; i++) {
            addToCloudfileToVocabConfig(worksheets[i]);
        }

        function addToCloudfileToVocabConfig (worksheet) {
            cloudfileToVocabConfig['cloudfile_to_vocab'][worksheet.worksheetId] = {
                options: {
                    output_directory:      'source/vocabs/' + worksheet.worksheetId,
                    google_spreadsheet_id: worksheet.spreadsheetId,
                    worksheet:             worksheet.worksheetId,
                    username:              '<%= env.google.username %>',
                    password:              '<%= env.google.password %>'
                }
            };
            cloudfileToVocabTasks.push('cloudfile_to_vocab:' + worksheet.worksheetId);
        }

        grunt.config.merge(cloudfileToVocabConfig);
        grunt.task.run(cloudfileToVocabTasks);
    });

    grunt.registerTask('merge_worksheets', ['Merges the individual language worksheets into one big JSON file for each language'], function () {
        
        var mergeJsonConfig = {
                'merge-json': {}
            },
            services = [config.services.default].concat(config.services.others);

        for (var i = 0; i < services.length; i++) {
            addToMergeJsonConfig(services[i]);
        }

        function addToMergeJsonConfig (service) {
            var sources = [];

            for (var i = 0; i < worksheets.length; i++) {
                sources.push('source/vocabs/' + worksheets[i].worksheetId + '/' + service + '.json');
            }

            mergeJsonConfig['merge-json'][service] = {
                src: [sources],
                dest: 'source/vocabs/' + service + '.json'
            };
        }

        grunt.config.merge(mergeJsonConfig);
        grunt.task.run('merge-json');
    });

    grunt.loadNpmTasks('grunt-cloudfile-to-vocab');
    grunt.loadNpmTasks('grunt-merge-json');
    grunt.registerTask('make_vocabs', ['vocabs_setup', 'check_spreadsheet_ids', 'fetch_vocabs', 'merge_worksheets']);
};