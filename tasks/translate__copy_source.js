module.exports = function (grunt) {
    grunt.registerTask('copy_source', ['Creates a copy of the default service output for each of the other services'], function () {

        var wrench             = require('wrench'),
            fs                 = require('fs'),
            config             = grunt.config.get('config'),
            default_vocab_dir  = config.services.default,
            rest_of_vocabs_dir = config.services.others;

        if (rest_of_vocabs_dir !== 'false') {
            rest_of_vocabs_dir.forEach(function (vocab_dir) {
                grunt.log.writeln('Copying ' + default_vocab_dir + ' source into ' + vocab_dir + '...');
                wrench.copyDirSyncRecursive('content/' + default_vocab_dir + '/js/', 'content/' + vocab_dir + '/js/');
                wrench.copyDirSyncRecursive('content/' + default_vocab_dir + '/css/', 'content/' + vocab_dir + '/css/');
                try {
                    if (fs.lstatSync('content/' + default_vocab_dir + '/img').isDirectory()) {
                        wrench.copyDirSyncRecursive('content/' + default_vocab_dir + '/img/', 'content/' + vocab_dir + '/img/');
                    }
                } catch (e) {}
            });
        }
    });
};