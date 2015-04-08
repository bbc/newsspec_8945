/*jshint es3: false */
module.exports = function (grunt) {
    function getEnvData() {
        var env = {
            'local': {
                'domain':       'http://local.bbc.co.uk:1031',
                'domainStatic': 'http://static.local.bbc.co.uk:1033'
            },
            'vm': {
                'domain':       'http://10.0.2.2:1031',
                'domainStatic': 'http://10.0.2.2:1033'
            }
        };
        var environmentFilePath = '../../env.json';
        if (grunt.file.exists(environmentFilePath)) {
            env = grunt.file.readJSON(environmentFilePath);
        }
        return env;
    }

    require('time-grunt')(grunt);
    grunt.initConfig({
        env:    getEnvData(),
        pkg:    grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json')
    });
    grunt.loadTasks('tasks');
};