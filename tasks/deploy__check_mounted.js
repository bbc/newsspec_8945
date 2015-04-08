module.exports = function (grunt) {
    grunt.config(['shell', 'checkMounts'], {
        command: 'ls -ls /Volumes | if grep --quiet "tmp"; then echo "Drives appear to be mounted."; else echo "WARNING"; fi',
        options: {
            stdout: true,
            callback: function (err, stdout, stderr) {

                done = this.async();

                if (stdout.match(/WARNING/)) {
                    grunt.log.warn('You need to mount your network drives before you can deploy to other environments.');
                    done(false);
                } else {
                    done();
                }
            }
        }
    });
};
