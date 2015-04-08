module.exports = function (grunt) {

    var defaultConfig = {
            options: {
                hostname: '127.0.0.1',
                base:     '.',
                directory: '<%= env.localhost %>',
                middleware: function (connect, options) {
                    var middlewares = [];
                    if (!Array.isArray(options.base)) {
                        options.base = [options.base];
                    }
                    var directory = options.directory || options.base[options.base.length - 1];
                    options.base.forEach(function (base) {
                        middlewares.push(connect.static(base));
                    });
                    middlewares.push(connect.static(directory));
                    middlewares.push(connect.directory(directory));
                    return middlewares;
                }
            }
        },
        _ = require('lodash-node'),
        localConfig = _.merge({
            options: {
                port: 1031
            }
        }, defaultConfig),
        localStaticConfig = _.merge({
            options: {
                port:      1033,
                keepalive: true
            }
        }, defaultConfig);

    grunt.config.merge({
        'connect': {
            'local':       localConfig,
            'localStatic': localStaticConfig
        }
    });
};