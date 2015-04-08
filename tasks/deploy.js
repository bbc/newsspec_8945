module.exports = function (grunt) {

    var env = grunt.config.get('env');

    for (var property in env) {
        if (
            env[property].hasOwnProperty('mount') &&
            env[property].hasOwnProperty('domain') &&
            env[property].hasOwnProperty('domainStatic')
        ) {
            makeTask(property, env[property]);
        }
    }

    function makeTask(env, config) {
        definePrepTask(env, config['domain'], config['domainStatic']);
        defineCopyTask(env, config['mount']);
        grunt.registerTask(env, getTaskArray(env));
    }

    function definePrepTask(environment, domain, domainStatic) {
        grunt.config(['replace', 'prep' + environment + 'Deploy'], {
            src: ['tmp/*/**.*'],
            overwrite: true,
            replacements: [{
                from: '<%= env.local.domain %>',
                to:   domain
            }, {
                from: '<%= env.local.domainStatic %>',
                to:   domainStatic
            }]
        });        
    }

    function defineCopyTask(environment, mount) {
        grunt.config(['copy', environment + 'Deploy'], {
            files: [{
                expand: true,
                cwd: 'tmp',
                src: ['**'],
                dest: mount + '/news/special/<%= config.year %>/newsspec_<%= config.project_number %>/content'
            }]
        });     
    }

    function getTaskArray(env) {
        var setupTasks = [
                'shell:checkMounts',
                'deploy_checklist'
            ],
            deployTasks = [
                'prepDeploy',
                'replace:prep' + env + 'Deploy',
                'copy:' + env + 'Deploy',
                'clean:main'
            ],
            taskArray;

        if (env === 'live' || env === 'previewlive') {
            taskArray = setupTasks.concat(['checkDeployedToStage']).concat(deployTasks);
        } else {   
            taskArray = setupTasks.concat(deployTasks);
        }

        return taskArray;
    }
};