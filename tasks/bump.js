module.exports = function (grunt) {
    
    grunt.loadNpmTasks('grunt-bump');

    grunt.config(['bump'], {
        options: {
            files:         ['package.json'],
            commit:        false,
            createTag:     false,
            push:          false
        }
    });

};