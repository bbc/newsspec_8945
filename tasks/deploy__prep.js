module.exports = function (grunt) {
    grunt.registerTask('prepDeploy', ['Copies each service into the "tmp" directory, making it ready to be deployed'], function () {
        
        var wrench = require('wrench'),
            env    = grunt.config.get('env'),
            config = grunt.config.get('config'),
            fs     = require('fs'),
            vocabs = config.services.others.concat(config.services.default);

        fs.mkdir('tmp');
        vocabs.forEach(function (vocab) {
            try {
                vocab_dir = fs.lstatSync(env.localhost + '/news/special/' + config.year + '/newsspec_' + config.project_number + '/content/' + vocab);
                if (vocab_dir.isDirectory()) {
                    wrench.copyDirSyncRecursive('content/' + vocab, 'tmp/' + vocab);
                    grunt.log.writeln(vocab + ' is ready for deployment');
                }
            } catch (e) {
                grunt.log.warn(vocab + ' will not be deployed as it has not yet been build');
            }
        });
    });
};