module.exports = function (grunt) {
    grunt.config(['jsonlint'], {
        default: {
            src: ['source/vocabs/*.json']
        }
    });
};